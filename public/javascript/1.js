function formatNumber(number) {
  return number.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// set the dimensions and margins of the graph
const margin = { top: 50, right: 10, bottom: 30, left: 80 },
  width = 900 - margin.left - margin.right,
  height = 800 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3
  .select("#co2")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Read the data
d3.csv("/data/global-co2-fossil-plus-land-use.csv", (d) => {
  if (d.Entity === "World") {
    return {
      date: new Date(d.Year),
      value: +d.Annual,
    };
  }
}).then(function (data) {
  // Add X axis --> it is a date format
  const x = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.date))
    .range([0, width]);
  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  // Add Y axis
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.value) * 1.1])
    .range([height, 0]);
  svg.append("g").call(d3.axisLeft(y));

  // Define the line function
  const line = d3
    .line()
    .x((d) => x(d.date))
    .y((d) => y(0));

  // Add the line path
  const linePath = svg
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#69b3a2")
    .attr("stroke-width", 3)
    .attr("d", line)
    .on("mousemove", handleMouseMove) // Add mousemove event handler
    .on("mouseout", handleMouseOut); // Add mouseout event handler

  // Transition the line path to the actual values
  linePath
    .transition()
    .duration(2000)
    .attr(
      "d",
      d3
        .line()
        .x((d) => x(d.date))
        .y((d) => y(d.value))
    );

  const verticalLine = svg
    .append("line")
    .attr("class", "vertical-line")
    .attr("y1", 0)
    .attr("y2", height)
    .attr("stroke", "grey")
    .attr("stroke-width", 1)
    .style("opacity", 0);

  svg
    .append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height)
    .style("opacity", 0)
    .on("mousemove", handleMouseMove) // Add mousemove event handler
    .on("mouseout", handleMouseOut); // Add mouseout event handler

  function handleMouseMove(event) {
    // Calculate the corresponding date and value based on the mouse position
    const mouseX = d3.pointer(event)[0];
    const date = x.invert(mouseX);
    const bisectDate = d3.bisector((d) => d.date).left;
    const index = bisectDate(data, date, 1);
    const d0 = data[index - 1];
    const d1 = data[index];
    const hoveredData = date - d0.date > d1.date - date ? d1 : d0;

    // Update the hovered year and value
    hoveredYear = hoveredData.date.getFullYear();
    hoveredValue = hoveredData.value;

    // Update the position and visibility of the vertical line
    verticalLine
      .attr("x1", x(hoveredData.date))
      .attr("x2", x(hoveredData.date))
      .style("opacity", 1);

    d3.select("#co2_stats").text(
      `Year: ${hoveredYear} | Value: ${formatNumber(hoveredValue)}`
    );
  }

  // Function to handle mouseout event
  function handleMouseOut() {
    // Clear the hovered year and value
    hoveredYear = null;
    hoveredValue = null;

    // Hide the vertical line
    verticalLine.style("opacity", 0);
  }
});

// Second graph
// append the svg object to the body of the page
const meatSVG = d3
  .select("#meat")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Read the data
d3.csv("/data/meat_world.csv").then(function (data) {
  // Convert numerical values to numbers
  data.forEach(function (d) {
    d.Year = +d.Year;
    d.SheepAndGoat = +d.SheepAndGoat;
    d.BeefAndBuffalo = +d.BeefAndBuffalo;
    d.Pig = +d.Pig;
    d.Poultry = +d.Poultry;
    d.Total = +d.Total;
  });

  // List of groups (here I have one group per column)
  const allGroup = [
    "SheepAndGoat",
    "BeefAndBuffalo",
    "Pig",
    "Poultry",
    // "Total",
  ];

  // add the options to the button
  d3.select("#selectButton")
    .selectAll("myOptions")
    .data(allGroup)
    .enter()
    .append("option")
    .text(function (d) {
      return d;
    }) // text showed in the menu
    .attr("value", function (d) {
      return d;
    }); // corresponding value returned by the button

  // A color scale: one color for each group
  const myColor = d3.scaleOrdinal().domain(allGroup).range(d3.schemeSet2);

  // Add X axis --> it is a date format
  const x = d3.scaleLinear().domain([1961, 2023]).range([0, width]);
  const xAxis = d3.axisBottom(x).tickFormat(d3.format("d"));

  meatSVG.append("g").attr("transform", `translate(0, ${height})`).call(xAxis);

  // Add Y axis
  const y = d3.scaleLinear().domain([0, 147979970]).range([height, 0]);
  meatSVG.append("g").call(d3.axisLeft(y));

  // Initialize line with group a
  const line = meatSVG
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
          return y(d.SheepAndGoat);
        })
    )
    .attr("stroke", function () {
      return myColor("SheepAndGoat");
    })
    .style("stroke-width", 3)
    .style("fill", "none");

  const verticalLine = meatSVG
    .append("line")
    .attr("class", "vertical-line")
    .attr("y1", 0)
    .attr("y2", height)
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .style("opacity", 0);

  // Add the hover effect
  meatSVG
    .append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .on("mousemove", handleMouseMove);

  function handleMouseOver() {
    verticalLine.style("opacity", 1);
  }

  function handleMouseOut() {
    verticalLine.style("opacity", 0);
    // d3.select("#meat_stats").html("");
  }

  function handleMouseMove(event) {
    const xPos = d3.pointer(event)[0];
    const year = Math.round(x.invert(xPos));
    const value = Math.round(y.invert(d3.pointer(event)[1]));

    verticalLine.attr("x1", xPos).attr("x2", xPos);
    d3.select("#meat_stats").text(
      `Year: ${year} | Value: ${formatNumber(value)}`
    );
  }

  // A function that updates the chart
  function update(selectedGroup) {
    // Create new data with the selection
    const dataFilter = data.map(function (d) {
      return { Year: d.Year, value: d[selectedGroup] };
    });

    // Give this new data to update the line
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

  // When the button is changed, run the updateChart function
  d3.select("#selectButton").on("change", function () {
    // recover the option that has been chosen
    const selectedOption = d3.select(this).property("value");
    // run the updateChart function with this selected option
    update(selectedOption);
  });
});
