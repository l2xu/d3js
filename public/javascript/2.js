function formatNumber(number) {
  return number.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

console.log("====================================");
console.log(formatNumber(99.21383123));
console.log("====================================");

const margin = { top: 20, right: 30, bottom: 40, left: 90 },
  width = 1500 - margin.left - margin.right,
  height = 800 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3
  .select("#d3")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

const valueBox = d3.select("#showvalue");

// Parse the Data
d3.csv("/data/food_products.csv").then(function (data) {
  data.sort(function (b, a) {
    return a.total - b.total;
  });

  data = data.slice(0, 25);

  // Add X axis
  const x = d3.scaleLinear().domain([0, 100]).range([0, width]);
  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

  // Y axis
  const y = d3
    .scaleBand()
    .range([0, height])
    .domain(data.map((d) => d.Entity))
    .padding(0.1);
  svg.append("g").call(d3.axisLeft(y));

  // Bars
  const bars = svg
    .selectAll("myRect")
    .data(data)
    .join("rect")
    .attr("x", x(0))
    .attr("y", (d) => y(d.Entity))
    .attr("width", 0) // start with width 0 for animation
    .attr("height", y.bandwidth())
    .attr("fill", "#69b3a2")
    .transition() // apply transition animation
    .duration(1000) // set the duration of the animation in milliseconds
    .attr("width", (d) => x(d.total))
    .on("end", function () {
      // Attach event listeners after the transition is complete
      d3.select(this)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);
    });
  // Add X axis label:

  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + margin.top + 20)
    .text("CO2 Emissions / kg");

  function handleMouseOver(d) {
    const data = d.target.__data__;

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 400 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Create the SVG container
    const stackedSvg = d3
      .select("#showvalue")
      .append("svg")
      .attr("id", "stacked-svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Prepare the data for stacking
    const keys = Object.keys(data).filter(
      (key) => key !== "Entity" && key !== "total"
    );
    const stackData = d3.stack().keys(keys)([data]);

    // Set up scales and axes
    const x = d3
      .scaleBand()
      .domain(stackData[0].map((d) => d.data.Entity))
      .range([0, width])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(stackData[stackData.length - 1], (d) => d[1])])
      .range([height, 0]);

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    // Render the stacked bars
    const colorScale = d3
      .scaleOrdinal()
      .domain(keys)
      .range([
        "rgb(87, 129, 69)",
        "rgb(188, 142, 90)",
        "rgb(243, 113, 4)",
        "rgb(0, 77, 132)",
        "rgb(196, 82, 103)",
        "rgb(241, 220, 25)",
        "rgb(147, 149, 151)",
        "rgb(196, 180, 182)",
      ]);

    // Render the stacked bars with different colors
    stackedSvg
      .selectAll(".bar")
      .data(stackData)
      .join("g")
      .attr("class", "bar")
      .attr("id", "stacked-bar") // Unique identifier for the stacked bar
      .attr("fill", (d, i) => colorScale(i)) // Assign different colors based on index
      .selectAll("rect")
      .data((d) => d)
      .join("rect")
      .attr("x", (d) => x(d.data.Entity))
      .attr("y", (d) => y(d[1]))
      // .attr("height", (d) => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth())
      .attr("height", 0) // start with width 0 for animation
      .transition() // apply transition animation
      .duration(1000) // set the duration of the animation in milliseconds
      .attr("height", (d) => y(d[0]) - y(d[1]));

    // Append the axes to the chart
    stackedSvg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    stackedSvg.append("g").attr("class", "y-axis").call(yAxis);

    //trun d.target.__data__.total into a number
    const formatNumber = d3.format(".2f");

    d3.select("#total").text(
      formatNumber(d.target.__data__.total) + " CO2 Emissionen / kg"
    );

    d3.select("#name").text(d.target.__data__.Entity);

    const legendSvg = d3
      .select("#legend")
      .append("svg")
      .attr("width", width)
      .attr("height", keys.length * 20);

    const legendItems = legendSvg
      .selectAll("legendItem")
      .data(keys)
      .enter()
      .append("g")
      .attr("class", "legendItem")
      .attr("transform", (d, i) => `translate(160, ${i * 20})`);

    legendItems
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", (d, i) => colorScale(i)); // Use the same color scale as in the stacked bars

    legendItems
      .append("text")
      .attr("x", 20)
      .attr("y", 10)
      .text((d) => d);
  }
  function handleMouseOut(d) {
    // Remove the entire bar group element
    d3.select("#stacked-svg").remove();
    d3.select("#total").text("");
    d3.select("#legend").text("");
  }
});
