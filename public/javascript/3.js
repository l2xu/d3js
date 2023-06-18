/**
 * Represents a pie chart visualization.
 * The code generates a pie chart using D3.js library to visualize meat production data.
 * The chart includes slices, labels, and interactive elements.
 *
 */
const width = 1500; // The width of the SVG container
const height = 800; // The height of the SVG container
const margin = 50; // The margin around the chart

import { formatNumber } from "./util.js"; // Import the formatNumber function from util.js

// The radius of the pie plot is half the width or half the height (whichever is smaller), subtracted by the margin.
const radius = Math.min(width, height) / 2 - margin;

// Append the SVG object to the div with the ID 'my_dataviz'
const svg = d3
  .select("#my_dataviz")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", `translate(${width / 2},${height / 2})`);

d3.json("/data/meat_production_world.json").then(function (data) {
  // Set up a color scale for the pie slices
  const color = d3
    .scaleOrdinal()
    .domain(data.map((d) => d.label))
    .range(d3.schemeDark2);

  // Compute the position of each group on the pie
  const pie = d3
    .pie()
    .sort(null) // Do not sort the groups by size
    .value((d) => d.value);
  const data_ready = pie(data);

  // Set up an arc generator for the pie slices
  const arc = d3
    .arc()
    .innerRadius(radius * 0.5) // The size of the donut hole
    .outerRadius(radius * 0.8);

  // Set up an outer arc generator for labels positioning
  const outerArc = d3
    .arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9);

  // Build the pie chart: Each slice of the pie is represented by a path element
  svg
    .selectAll("allSlices")
    .data(data_ready)
    .join("path")
    .attr("d", arc)
    .attr("fill", (d) => color(d.data.label))
    .attr("stroke", "white")
    .style("stroke-width", "2px")
    .style("opacity", 0) // Set initial opacity to 0
    .on("mouseover", mouseOverFunction) // Add mouseover event listener
    .on("mouseout", function () {
      d3.select(this).classed("hovered", false); // Remove the 'hovered' class
      getWorldData(); // Update the world data
    });

  svg
    .selectAll("path")
    .transition()
    .duration(1000) // Set the duration of the animation (in milliseconds)
    .delay((_, i) => i * 100) // Add a delay for each slice to create a staggered effect
    .style("opacity", 0.7) // Animate the opacity to make the slices visible
    .attrTween("d", function (d) {
      // Animate the "d" attribute to make the slices grow
      const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
      return function (t) {
        return arc(i(t));
      };
    });

  // Add polylines between the chart and labels
  svg
    .selectAll("allPolylines")
    .data(data_ready)
    .join("polyline")
    .attr("stroke", "black")
    .style("fill", "none")
    .attr("stroke-width", 0) // Set initial stroke-width to 0
    .attr("points", function (d) {
      const posA = arc.centroid(d);
      const posB = outerArc.centroid(d);
      const posC = outerArc.centroid(d);
      const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
      posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1);
      return [posA, posB, posC];
    });

  svg
    .selectAll("polyline")
    .transition()
    .duration(1000) // Set the duration of the animation (in milliseconds)
    .delay((_, i) => i * 100) // Add a delay for each polyline to create a staggered effect
    .attr("stroke-width", 1); // Animate the stroke width to make the polylines visible

  // Add labels to the chart
  svg
    .selectAll("allLabels")
    .data(data_ready)
    .join("text")
    .text((d) => d.data.label + " (" + formatNumber(d.data.value) + "t)")

    .attr("transform", function (d) {
      const pos = outerArc.centroid(d);
      const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
      pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
      return `translate(${pos})`;
    })
    .style("text-anchor", function (d) {
      const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
      return midangle < Math.PI ? "start" : "end";
    })
    .style("opacity", 0) // Set initial opacity to 0
    .style("font-size", 15);

  svg
    .selectAll("text")
    .transition()
    .duration(1000) // Set the duration of the animation (in milliseconds)
    .delay((_, i) => i * 100) // Add a delay for each label to create a staggered effect
    .style("opacity", 1); // Animate the opacity to make the labels visible

  d3.select("#interact-h2").text("Alle 4 Fleischsorten"); // Set the initial text

  /**
   * Event handler for mouseover event on pie slices.
   * Updates the displayed data and styling when a slice is hovered over.
   *
   */
  function mouseOverFunction(d) {
    // Remove the "hovered" class from all elements
    svg.selectAll("path").classed("hovered", false);

    // Add the "hovered" class to the hovered element
    d3.select(this).classed("hovered", true);

    // Update the displayed data
    d3.select("#interact-h2").text(d.target.__data__.data.label);
    d3.select("#interact-total").text(
      formatNumber(d.target.__data__.data.value) + "t"
    );
    d3.select("#interact-kg").text(
      formatNumber(d.target.__data__.data.kg) + "t"
    );
    d3.select("#interact-sum").text(
      formatNumber(d.target.__data__.data.kg * d.target.__data__.data.value) +
        "t"
    );

    // Calculate and display the food sector percentage
    const foodSector =
      ((d.target.__data__.data.kg * d.target.__data__.data.value) /
        41639840000) *
      100;
    d3.select("#food_sector").text(formatNumber(foodSector) + "%");
  }

  getWorldData(); // Get and display the initial world data

  /**
   * Updates and displays the world data.
   * Calculates and shows the total meat production and emissions.
   */
  function getWorldData() {
    d3.select("#interact-h2").text("Alle 4 Fleischsorten");

    let total = 0;
    data.forEach((d) => {
      total += d.value;
    });
    d3.select("#interact-total").text(formatNumber(total) + "t");

    let emission = 0;
    data.forEach((d) => {
      emission += d.kg * d.value;
    });
    d3.select("#interact-sum").text(formatNumber(emission) + "t");

    d3.select("#food_sector").text(
      formatNumber((emission / 41639840000) * 100) + "%"
    );

    d3.select("#interact-kg").text("");
  }
});
