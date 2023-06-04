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

// Parse the Data
d3.csv("/data/food-footprints_total_2010.csv").then(function (data) {
  data.sort(function (b, a) {
    return a.Emissions - b.Emissions;
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
    .attr("width", (d) => x(d.Emissions));

  // Add hover effect
  bars
    .on("mouseenter", function () {
      d3.select(this).attr("fill", "red");
    })
    .on("mouseleave", function () {
      d3.select(this).attr("fill", "#69b3a2");
    });

  // Add X axis label:
  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + margin.top + 20)
    .text("CO2 Emissions / kg");
});







---------------------

// set the dimensions and margins of the graph
const margin = { top: 10, right: 30, bottom: 20, left: 50 },
  width = 1500 - margin.left - margin.right,
  height = 800 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3
  .select("#d3")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Parse the Data
d3.csv("/data/food_products.csv").then(function (data) {
  // List of subgroups = header of the csv files = soil condition here
  const subgroups = data.columns.slice(1);

  data = data.map((d) => {
    d.total = subgroups.map((key) => +d[key]).reduce((a, b) => a + b, 0);
    return d;
  });

  data.sort(function (b, a) {
    return a.total - b.total;
  });

  data = data.slice(0, 20);

  // List of groups = species here = value of the first column called group -> I show them on the X axis
  const groups = data.map((d) => d.Entity);

  //stack the data? --> stack per subgroup
  const stackedData = d3.stack().keys(subgroups)(
    data.map((d) => ({ Entity: d.Entity, ...d }))
  );

  // Add X axis
  const x = d3.scaleBand().domain(groups).range([0, width]).padding([0.2]);
  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickSizeOuter(0));

  // Add Y axis
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.total) + 10])
    .range([height, 0]);
  svg.append("g").call(d3.axisLeft(y));

  // color palette = one color per subgroup
  const color = d3.scaleOrdinal().domain(subgroups).range(d3.schemeSet2);

  // ----------------
  // Highlight a specific subgroup when hovered
  // ----------------

  // Show the bars
  svg
    .append("g")
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(stackedData)
    .join("g")
    .attr("fill", (d) => color(d.key))
    .attr("class", (d) => "myRect " + d.key) // Add a class to each subgroup: their name
    .selectAll("rect")
    // enter a second time = loop subgroup per subgroup to add all rectangles
    .data((d) => d)
    .join("rect")
    .attr("x", (d) => x(d.data.Entity))
    .attr("y", (d) => y(d[1]))
    .attr("height", (d) => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth())
    .attr("stroke", "grey")
    .on("mouseover", function (event, d) {
      // What happens when user hover a bar

      // what subgroup are we hovering?
      const subGroupName = d3.select(this.parentNode).datum().key;

      console.log(d);

      // Reduce opacity of all rect to 0.2
      d3.selectAll(".myRect").style("opacity", 0.2);

      // Highlight all rects of this subgroup with opacity 1. It is possible to select them since they have a specific class = their name.
      d3.selectAll(`.${subGroupName}`).style("opacity", 1);
    })
    .on("mouseleave", function (event, d) {
      // When user do not hover anymore

      // Back to normal opacity: 1
      d3.selectAll(".myRect").style("opacity", 1);
    });
});



---

