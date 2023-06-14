const width = 1500,
  height = 800;
margin = 50;

function formatNumber(number) {
  return number.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
const radius = Math.min(width, height) / 2 - margin;

// append the svg object to the div called 'my_dataviz'
const svg = d3
  .select("#my_dataviz")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", `translate(${width / 2},${height / 2})`);

d3.json("/data/meat_production_world.json").then(function (data) {
  // set the color scale
  const color = d3
    .scaleOrdinal()
    .domain(data.map((d) => d.label))
    .range(d3.schemeDark2);

  // Compute the position of each group on the pie:
  const pie = d3
    .pie()
    .sort(null) // Do not sort group by size
    .value((d) => d.value);
  const data_ready = pie(data);

  // The arc generator
  const arc = d3
    .arc()
    .innerRadius(radius * 0.5) // This is the size of the donut hole
    .outerRadius(radius * 0.8);

  // Another arc that won't be drawn. Just for labels positioning
  const outerArc = d3
    .arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9);

  // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
  svg
    .selectAll("allSlices")
    .data(data_ready)
    .join("path")
    .attr("d", arc)
    .attr("fill", (d) => color(d.data.label))
    .attr("stroke", "white")
    .style("stroke-width", "2px")
    .style("opacity", 0) // Set initial opacity to 0
    .on("mouseover", mouseOverFunction)
    .on("mouseout", function () {
      d3.select(this).classed("hovered", false);
      getWorldData();
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

  // Add the polylines between chart and labels:
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

  // Add the polylines between chart and labels:
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

  d3.select("#interact-h2").text("Welt");

  function mouseOverFunction(d) {
    // Remove the "hovered" class from all elements
    svg.selectAll("path").classed("hovered", false);

    // Add the "hovered" class to the hovered element
    d3.select(this).classed("hovered", true);
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
    const foodSector =
      ((d.target.__data__.data.kg * d.target.__data__.data.value) /
        41639840000) *
      100;
    d3.select("#food_sector").text(formatNumber(foodSector) + "%");
  }

  getWorldData();

  function getWorldData() {
    d3.select("#interact-h2").text("Welt");

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
  }
});
