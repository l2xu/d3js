/**
 * Renders a line chart displaying global CO2 emissions over time.
 * Fetches data from a CSV file and adds mouse interaction functionality.
 */
import { formatNumber } from "./util.js";

// Margins and dimensions for the chart
const margin = { top: 50, right: 10, bottom: 30, left: 80 };
const width = 900 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

// Selecting the SVG element for the CO2 chart
const svgCO2 = d3
  .select("#co2")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Fetching CO2 data from a CSV file
d3.csv("/data/global-co2-fossil-plus-land-use.csv").then(function (data) {
  // Filtering the data for the "World" entity and parsing date and value fields
  const filteredData = data
    .filter((d) => d.Entity === "World")
    .map((d) => ({
      date: new Date(d.Year),
      value: +d.Annual,
    }));

  // Setting up the x-axis scale and axis
  const x = d3
    .scaleTime()
    .domain(d3.extent(filteredData, (d) => d.date))
    .range([0, width]);
  svgCO2
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  // Setting up the y-axis scale and axis
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(filteredData, (d) => d.value * 1.1)])
    .range([height, 0]);
  svgCO2.append("g").call(d3.axisLeft(y));

  // Creating the line function
  const line = d3
    .line()
    .x((d) => x(d.date))
    .y((d) => y(d.value));

  // Adding the line path to the chart
  const linePath = svgCO2
    .append("path")
    .datum(filteredData)
    .attr("fill", "none")
    .attr("stroke", "#69b3a2")
    .attr("stroke-width", 3)
    .attr("d", line)
    .on("mousemove", handleMouseMove)
    .on("mouseout", handleMouseOut);

  // Animating the line path
  linePath
    .attr("stroke-dasharray", linePath.node().getTotalLength())
    .attr("stroke-dashoffset", linePath.node().getTotalLength())
    .transition()
    .duration(2000)
    .attr("stroke-dashoffset", 0);

  // Adding a vertical line for mouse interaction
  const verticalLine = svgCO2
    .append("line")
    .attr("class", "vertical-line")
    .attr("y1", 0)
    .attr("y2", height)
    .attr("stroke", "grey")
    .attr("stroke-width", 1)
    .style("opacity", 0);

  // Adding an overlay rectangle for mouse interaction
  svgCO2
    .append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height)
    .style("opacity", 0)
    .on("mousemove", handleMouseMove)
    .on("mouseout", handleMouseOut);

  /**
   * Handles the mousemove event on the chart.
   * Displays a vertical line and information about the hovered data point.
   * @param {MouseEvent} event - The mousemove event object.
   */
  function handleMouseMove(event) {
    // Get the x-coordinate of the mouse pointer
    const mouseX = d3.pointer(event)[0];

    // Convert the x-coordinate to a date value
    const date = x.invert(mouseX);

    // Find the nearest data point to the hovered date
    const bisectDate = d3.bisector((d) => d.date).left;
    const index = bisectDate(filteredData, date, 1);
    const d0 = filteredData[index - 1];
    const d1 = filteredData[index];
    const hoveredData = date - d0.date > d1.date - date ? d1 : d0;

    // Extract the year and value of the hovered data point
    const hoveredYear = hoveredData.date.getFullYear();
    const hoveredValue = hoveredData.value;

    // Update the vertical line position and opacity
    verticalLine
      .attr("x1", x(hoveredData.date))
      .attr("x2", x(hoveredData.date))
      .style("opacity", 1);

    // Display the year and value of the hovered data point
    d3.select("#co2_stats").text(
      `Year: ${hoveredYear} | Value: ${formatNumber(hoveredValue)}t`
    );
  }

  /**
   * Handles the mouseout event on the chart.
   * Hides the vertical line.
   */
  function handleMouseOut() {
    verticalLine.style("opacity", 0);
  }
});

/**
 * Renders a line chart displaying meat consumption over time.
 * Fetches data from a CSV file and adds mouse interaction functionality.
 */

// Declare the global variable to store the selected option
let selectedOption = "Lamm";

// Selecting the SVG element for the meat chart
const svgMeat = d3
  .select("#meat")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Fetching meat consumption data from a CSV file
d3.csv("/data/meat_world.csv").then(function (data) {
  // Parsing the data values as numbers
  data.forEach(function (d) {
    d.Jahr = +d.Jahr;
    d.Lamm = +d.Lamm;
    d.Rind = +d.Rind;
    d.Schwein = +d.Schwein;
    d.Geflügel = +d.Geflügel;
    d.Total = +d.Total;
  });

  // Creating an array of all meat group options
  const allGroup = ["Lamm", "Rind", "Schwein", "Geflügel"];

  // Adding options to the select button
  d3.select("#selectButton")
    .selectAll("myOptions")
    .data(allGroup)
    .enter()
    .append("option")
    .text(function (d) {
      return d;
    })
    .attr("value", function (d) {
      return d;
    });

  // Setting up the color scale for different meat groups
  const myColor = d3.scaleOrdinal().domain(allGroup).range(d3.schemeSet2);

  // Setting up the x-axis scale and axis
  const x = d3.scaleLinear().domain([1961, 2018]).range([0, width]);
  const xAxis = d3.axisBottom(x).tickFormat(d3.format("d"));
  svgMeat.append("g").attr("transform", `translate(0, ${height})`).call(xAxis);

  // Setting up the y-axis scale and axis
  const y = d3.scaleLinear().domain([0, 147979970]).range([height, 0]);
  svgMeat.append("g").call(d3.axisLeft(y));

  // Creating an initial line path with zero values
  const line = svgMeat
    .append("g")
    .append("path")
    .datum(data)
    .attr(
      "d",
      d3
        .line()
        .x(function (d) {
          return x(d.Year);
        })
        .y(function (d) {
          return y(0);
        })
    )
    .attr("stroke", function () {
      return myColor("Lamm");
    })
    .style("stroke-width", 3)
    .style("fill", "none");

  // Adding a vertical line for mouse interaction
  const verticalLine = svgMeat
    .append("line")
    .attr("class", "vertical-line")
    .attr("y1", 0)
    .attr("y2", height)
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .style("opacity", 0);

  // Adding an overlay rectangle for mouse interaction
  // Adding mouse interaction functionality
  svgMeat
    .append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .on("mousemove", handleMouseMove);

  /**
   * Handles the mouseover event on the chart.
   * Shows the vertical line.
   */
  function handleMouseOver() {
    verticalLine.style("opacity", 1);
  }

  /**
   * Handles the mouseout event on the chart.
   * Hides the vertical line.
   */
  function handleMouseOut() {
    verticalLine.style("opacity", 0);
  }

  /**
   * Handles the mousemove event on the chart.
   * Displays the value for the selected year and meat group.
   * @param {MouseEvent} event - The mousemove event object.
   */
  function handleMouseMove(event) {
    const xPos = d3.pointer(event)[0];
    const year = Math.round(x.invert(xPos));

    const bisect = d3.bisector(function (d) {
      return d.Year;
    }).left;
    const index = bisect(data, year);
    const d = data[index];
    const value = d[selectedOption];

    verticalLine.attr("x1", xPos).attr("x2", xPos);
    d3.select("#meat_stats").text(
      `Jahr: ${year} | Wert: ${formatNumber(value)}t`
    );
  }

  /**
   * Updates the line chart with the selected meat group.
   * @param {string} selectedGroup - The selected meat group.
   */
  function update(selectedGroup) {
    const dataFilter = data.map(function (d) {
      return { Year: d.Year, value: d[selectedGroup] };
    });

    line
      .datum(dataFilter)
      .transition()
      .duration(1000)
      .attr(
        "d",
        d3
          .line()
          .x(function (d) {
            return x(d.Year);
          })
          .y(function (d) {
            return y(d.value);
          })
      )
      .attr("stroke", function () {
        return myColor(selectedGroup);
      });
  }

  // Event listener for the select button
  d3.select("#selectButton").on("change", function () {
    // Update the selected option
    selectedOption = d3.select(this).property("value");
    // Update the line chart with the selected option
    update(selectedOption);
  });

  // Update the line chart with the initial selected option
  update("Lamm");
});
