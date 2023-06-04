// Sample data for the diagram
const data = {
  nodes: [
    { name: "Global Co2 Emissions" }, //0
    { name: "Energy" }, //1
    { name: "Industry" }, //2
    { name: "Waste" }, //3
    { name: "Agriculture" }, //4

    { name: "Energy in Industry" }, //5
    { name: "Transport" }, //6
    { name: "Buildings" }, //7
    { name: "Unallocated fuel combustion" }, //8
    { name: "Fugitive emissions from energy production" }, //9
    { name: "Energy in Agriculture" }, //10

    { name: "Cement" }, //11
    { name: "Chemicals" }, //12

    { name: "Landfills" }, //13
    { name: "Wastewater" }, //14

    { name: "Grassland" }, //15
    { name: "Cropland" }, //16
    { name: "Defostation" }, //17
    { name: "Crop burning" }, //18
    { name: "Rice cultivation" }, //19
    { name: "Agricultural soils" }, //20
    { name: "Livestock & manure" }, //21
  ],
  links: [
    { source: 0, target: 1, value: 73.2 },
    { source: 0, target: 2, value: 5.2 },
    { source: 0, target: 3, value: 3.2 },
    { source: 0, target: 4, value: 18.4 },

    { source: 1, target: 5, value: 24.2 },
    { source: 1, target: 6, value: 16.2 },
    { source: 1, target: 7, value: 17.5 },
    { source: 1, target: 8, value: 7.8 },
    { source: 1, target: 9, value: 5.8 },
    { source: 1, target: 10, value: 1.7 },

    { source: 2, target: 11, value: 3 },
    { source: 2, target: 12, value: 2.2 },

    { source: 3, target: 13, value: 1.3 },
    { source: 3, target: 14, value: 1.9 },

    { source: 4, target: 15, value: 0.1 },
    { source: 4, target: 16, value: 1.4 },
    { source: 4, target: 17, value: 2.2 },
    { source: 4, target: 18, value: 3.5 },
    { source: 4, target: 19, value: 1.3 },
    { source: 4, target: 20, value: 4.1 },
    { source: 4, target: 21, value: 5.8 },
  ],
};

const colorMap = {
  "Global Co2 Emissions": "#CCCCCC",
  Energy: "red",
  Industry: "blue",
  Waste: "yellow",
  Agriculture: "green",
  // Add more mappings as needed
};

function getAncestors(node) {
  const ancestors = [];
  ancestors.push(node);
  while (node.sourceLinks.length) {
    node = node.sourceLinks[0].source;
    ancestors.unshift(node);
  }
  return ancestors;
}

function getDescendants(node) {
  const descendants = [];
  descendants.push(node);
  while (node.targetLinks.length) {
    node = node.targetLinks[0].target;
    descendants.push(node);
  }
  return descendants;
}

// Set up the SVG container
const svg = d3.select("#sankeyDiagram");

const div = d3.select("#showvalue");

// Set up the Sankey layout
const sankey = d3
  .sankey()
  .nodeSort(null)
  .linkSort(null)
  .nodeWidth(20)
  .nodePadding(15)
  .extent([
    [1, 1],
    [svg.attr("width") - 1, svg.attr("height") - 6],
  ]);

// Generate the Sankey diagram
const { nodes, links } = sankey(data);

const color = d3
  .scaleOrdinal()
  .domain(data.nodes.map((d) => d.name))
  .range(Object.values(colorMap));
// Set up the color scale
// const color = d3.scaleOrdinal(d3.schemeCategory10);

// Render the links
svg
  .append("g")
  .attr("fill", "none")
  .attr("stroke-opacity", 0.5)
  .selectAll("path")
  .data(links)
  .join("path")
  .attr("d", d3.sankeyLinkHorizontal())
  .attr("stroke", (d) => color(d.source.name))
  .attr("stroke-width", (d) => Math.max(1, d.width));

// Render the nodes
const node = svg
  .append("g")
  .selectAll("g")
  .data(nodes)
  .join("g")
  .attr("transform", (d) => `translate(${d.x0},${d.y0})`)
  .on("mouseover", handleMouseOver)
  .on("mouseout", handleMouseOut);

function handleMouseOver(d) {
  console.log(d.target.__data__.value);
  console.log(d);

  d3.select(this).select("rect").attr("fill", "red");
  div.text(
    d.target.__data__.name +
      " makes " +
      d.target.__data__.value +
      " % of global co2 emissions"
  );
}

// Function to handle mouseout event
function handleMouseOut(d) {
  d3.select(this).select("rect").attr("fill", "white");
}

node
  .append("rect")
  .attr("height", (d) => d.y1 - d.y0)
  .attr("width", sankey.nodeWidth())
  // .attr("fill", (d) => color(d.name))
  .attr("fill", "white")
  .attr("stroke", "#000");

node
  .append("text")
  .attr("x", -6)
  .attr("y", (d) => (d.y1 - d.y0) / 2)
  .attr("dy", "0.35em")
  .attr("text-anchor", "end")
  .text((d) => d.name)
  .filter((d) => d.x0 < svg.attr("width") / 2)
  .attr("x", 6 + sankey.nodeWidth())
  .attr("text-anchor", "start");
