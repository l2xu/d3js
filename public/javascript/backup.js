// set the dimensions and margins of the graph
const margin = { top: 10, right: 30, bottom: 30, left: 60 },
  width = 460 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3
  .select("#meat")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Read the data
d3.csv("/data/meat_world.csv").then(function (data) {
  // Group the data: I want to draw one line per meat type
  const meatTypes = data.columns.slice(2); // Get the meat type columns from the header row
  const sumstat = meatTypes.map((meatType) => {
    return {
      name: meatType,
      values: data.map((d) => ({ year: +d.Year, n: +d[meatType] })),
    };
  });

  // Add X axis --> it is a linear scale
  const x = d3
    .scaleLinear()
    .domain(
      d3.extent(data, function (d) {
        return +d.Year;
      })
    )
    .range([0, width]);
  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).ticks(5));

  // Add Y axis
  const y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(data, function (d) {
        return d3.max(meatTypes, function (meatType) {
          return +d[meatType];
        });
      }),
    ])
    .range([height, 0]);
  svg.append("g").call(d3.axisLeft(y));

  // color palette
  const color = d3
    .scaleOrdinal()
    .domain(meatTypes)
    .range([
      "#e41a1c",
      "#377eb8",
      "#4daf4a",
      "#984ea3",
      "#ff7f00",
      "#ffff33",
      "#a65628",
      "#f781bf",
      "#999999",
    ]);

  // Draw the lines
  svg
    .selectAll(".line")
    .data(sumstat)
    .join("path")
    .attr("fill", "none")
    .attr("stroke", function (d) {
      return color(d.name);
    })
    .attr("stroke-width", 1.5)
    .attr("d", function (d) {
      return d3
        .line()
        .x(function (d) {
          return x(d.year);
        })
        .y(function (d) {
          return y(d.n);
        })(d.values);
    });
});
