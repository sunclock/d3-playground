import * as d3 from "d3";

export function createHeatmap() {
	const container = document.createElement('div');
	container.setAttribute('id', 'container');
	document.body.appendChild(container);

	const heatmap = document.createElement('div');
	heatmap.setAttribute('id', 'heatmap');
	container.appendChild(heatmap);

	drawLegend();
	drawHeatmap();
}

function drawHeatmap() {
	const margin = { top: 30, right: 30, bottom: 30, left: 30 },
		width = 960 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;

	// append the svg object to the body of the page
	const svg = d3.select("#heatmap")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", `translate(${margin.left}, ${margin.top})`);

	// Read the data
	d3.csv(process.env.EXAMPLE_CSV).then(function (data) {

		// Labels of row and columns -> column: group, row: variable
		const myGroups = d3.map(data, function (d) { return d.group; }).values();
		const myVars = d3.map(data, function (d) { return d.variable; }).values();

		// Build X scales and aixs
		const x = d3.scaleBand()
			.range([0, width])
			.domain(myGroups)
		svg.append("g")
			.attr("transform", `translate(0, ${height})`)
			.call(d3.axisBottom(x))
			.selectAll("line")
			.attr("x1", x.bandwidth() / 2)
			.attr("x2", x.bandwidth() / 2)

		// Build Y scales and aixs
		const y = d3.scaleBand()
			.range([height, 0])
			.domain(myVars)
		svg.append("g")
			.call(d3.axisLeft(y))
			.selectAll("line")
			.attr("y1", y.bandwidth() / 2)
			.attr("y2", y.bandwidth() / 2)

		// Build color scale
		const myColor = d3.scaleLinear()
			.range(["white", "SteelBlue"])
			.domain([1, 100]);

		// create a tooltip
		const tooltip = d3.select("#heatmap")
			.append("div")
			.style("opacity", 0)
			.attr("id", "tooltip")

		// Three function that change the tooltip when user hover / move / leave a cell
		const mouseover = function () {
			tooltip
				.style("opacity", 1)
		}
		const mousemove = function (event, d) {
			const rect = event.currentTarget.getBoundingClientRect();
			const toolRect = document.querySelector('#tooltip').getBoundingClientRect();
			const left = rect.x - (rect.width / 1.75); // 130 = tooltip width
			const top = rect.y - toolRect.height// 70 = tooltip height
			tooltip
				.html("Retention: " + d.value + "<br/>"
					+ "Cohort User Count: " + d.value + "<br/>"
					+ "User Count: " + d.value + "<br/>"
					+ "Relative Rentention: " + d.value + "<br/>"
					+ "Sales: " + d.value)
				.style("left", left + "px")
				.style("top", top + "px")
				.style("opacity", 1)
			event.target.classList.add('shadow')
		}
		const mouseleave = function (event, d) {
			tooltip
				.style("opacity", 0)
			event.target.classList.remove('shadow')
		}

		// add the squares
		const squares = svg.selectAll()
			.data(data, function (d) { return d.group + ':' + d.variable; })
			.enter()
		squares.append("rect")
			.attr("x", function (d) { return x(d.group) })
			.attr("y", function (d) { return y(d.variable) })
			.attr("width", x.bandwidth())
			.attr("height", y.bandwidth())
			.style("fill", function (d) { return myColor(d.value) })
			.on("mouseover", mouseover)
			.on("mousemove", mousemove)
			.on("mouseleave", mouseleave)

		squares
			.append("text")
			.attr("class", "value")
			.attr("x", function (d) { return x(d.group) + x.bandwidth() / 2.5 })
			.attr("y", function (d) { return y(d.variable) + y.bandwidth() / 1.75 })
			.text(function (d) { return d.value })
			.on("mouseover", mouseover)
			.on("mousemove", mousemove)
			.on("mouseleave", mouseleave)
	})
}

function drawLegend() {
	const legend = d3.select("#heatmap")
		.append("svg")
		.attr("id", "legend")

	const linearGradient =
		legend
			.append("defs")
			.append("linearGradient")
			.attr("id", "linear-gradient")

	linearGradient
		.append("stop")
		.attr("offset", "1%")
		.attr("stop-color", "white")

	linearGradient
		.append("stop")
		.attr("offset", "99%")
		.attr("stop-color", "SteelBlue")

	legend
		.append("rect")
		.attr("y", 2)
		.attr("width", 120)
		.attr("height", 20)
		.attr("fill", "url(#linear-gradient)")

	legend
		.append("text")
		.text("0")
		.attr("x", 0)
		.attr("y", 40)
		.attr("font-size", "12px")

	legend
		.append("text")
		.text('maxVal') // ??
		.attr("x", 100)
		.attr("y", 40)
		.attr("font-size", "12px")

	legend
		.append("rect")
		.attr("width", 5)
		.attr("height", 24)
		.attr("x", 120)
		.attr("y", 0)
		.attr("fill", "SteelBlue")
		.attr("stroke", "white")
		.attr("stroke-width", 1)
		.attr("rx", 2)
		.attr("ry", 2)
}