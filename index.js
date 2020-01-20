(async function ready() {
    const { data } = await fetchData();
    loadBarChart(data);
})();

async function fetchData() {
    const response = await fetch(
        "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
    );
    const json = await response.json();

    if (response.ok) {
        return json;
    } else {
        console.error(json);
    }
}

const tooltip = d3
    .select("#bar-chart-container")
    .append("div")
    .attr("id", "tooltip");

const height = 400;
const width = 800;
const padding = 60;

const svg = d3
    .select("#bar-chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("overflow", "visible");

function loadBarChart(data) {
    const gdp = data.map(d => d[1]);
    const dates = data.map(d => d[0]);

    const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(gdp)])
        .range([height - padding, 0]);

    const xScale = d3
        .scaleTime()
        .domain(d3.extent(dates, d => new Date(d)))
        .range([0, width - padding]);

    const barWidth = (width - padding) / dates.length;

    svg.selectAll("rect")
        .data(gdp)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d, i) => xScale(new Date(dates[i])) + padding)
        .attr("y", d => yScale(d))
        .attr("width", barWidth)
        .attr("height", d => height - yScale(d) - padding)
        .attr("data-gdp", d => d)
        .attr("data-date", (d, i) => dates[i])
        .on("mouseover", (d, i) => {
            tooltip
                .classed("tooltip--hidden", false)
                .style("left", d3.event.pageX + 10 + "px")
                .style("top", yScale(d) + "px")
                .attr("data-date", dates[i])
                .text(formatTooltipText(dates[i]));
        })
        .on("mouseout", () => {
            tooltip.classed("tooltip--hidden", true);
        });

    //axis
    const yAxis = d3.axisLeft(yScale);
    const xAxis = d3.axisBottom(xScale);

    svg.append("g")
        .attr("id", "y-axis")
        .attr("transform", `translate(${padding}, 0)`)
        .call(yAxis);
    svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(${padding}, ${height - padding})`)
        .call(xAxis);
}

function formatTooltipText(date) {
    const year = new Date(date).getFullYear();
    return `${year} ${getYearQuarter(date)}Q`;
}

function getYearQuarter(date) {
    const month = new Date(date).getMonth();
    let quarter;

    switch (month) {
        case 0:
            quarter = 1;
            break;
        case 3:
            quarter = 2;
            break;
        case 6:
            quarter = 3;
            break;
        case 9:
            quarter = 4;
            break;
        default:
            break;
    }

    return quarter;
}
