// The svg
const svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

let strokecolor = "black";

// Map and projection
const path = d3.geoPath();
const projection = d3
  .geoMercator()
  .scale(150)
  .center([0, 20])
  .translate([width / 2, height / 2]);

// Data and color scale
const data = new Map();
const colorScale = d3
  .scaleThreshold()
  .domain([1000, 10000, 100000, 1000000, 10000000, 100000000, 100000000])
  .range([
    "#F5F6F6",
    "#ADD0C8",
    "#50C0A6",
    "#23A285",
    "#0F7B62",
    "#06604B",
    "#003E2F",
  ]);

function update(secrent) {
  // Remove previous SVG elements and event listeners
  let total = 0;
  svg.selectAll(".Country").remove();

  d3.select("#total").remove();
  d3.select("#country").remove();

  // Load external data and boot
  Promise.all([
    d3.json("/data/geojson.geojson"),
    d3.csv("/data/meat_production_world2.csv", function (d) {
      if (d.Year === "2021") {
        data.set(d.Code, +d[secrent]);
        if (d.Code === "OWID_WRL") {
          total = +d[secrent];
        }
      }
    }),
  ]).then(function (loadData) {
    let topo = loadData[0];

    d3.select("#interact").append("text").text("Welt").attr("id", "country");
    d3.select("#interact").append("text").text(total).attr("id", "total");

    let mouseOver = function (d) {
      d3.selectAll(".Country").transition().duration(200).style("opacity", 0.5);
      d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 1)
        .style("stroke", strokecolor);

      d3.select("#country").text(d.target.__data__.properties.name);
      d3.select("#total").text(d.target.__data__.total).attr("id", "total");
    };

    let mouseLeave = function (d) {
      d3.selectAll(".Country").transition().duration(200).style("opacity", 0.8);
      d3.select(this).transition().duration(200).style("stroke", "transparent");
      d3.select("#total").text(total);
      d3.select("#country").text("Welt");
    };

    // Draw the map
    svg
      .append("g")
      .selectAll("path")
      .data(topo.features)
      .enter()
      .append("path")
      // draw each country
      .attr("d", d3.geoPath().projection(projection))
      // set the color of each country with animation
      .attr("fill", function (d) {
        d.total = data.get(d.id) || 0;
        return colorScale(d.total);
      })
      .style("stroke", "transparent")
      .attr("class", function (d) {
        return "Country";
      })
      .style("opacity", 0)
      .on("mouseover", mouseOver)
      .on("mouseleave", mouseLeave)
      // animate the opacity and color changes
      .transition()
      .duration(300)
      .style("opacity", 0.8)
      .attr("fill", function (d) {
        d.total = data.get(d.id) || 0;
        return colorScale(d.total);
      });
  });
}

update("SheepAndGoat");
