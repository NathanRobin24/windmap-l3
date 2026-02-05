const width = 1280;
const height = 720;

const svg = d3.select("body")
              .append("svg")
              .attr("id", "map")  
              .attr("width", width)
              .attr("height", height);

svg.append("rect")
  .attr("width", width)
  .attr("height", height)
  .attr("fill", "#0b1020");

const projection = d3.geoNaturalEarth1()
    .center([0, 20])                        // "Regarde vers le centre du monde (Lat 20, Lon 0)"
    .scale(200)                             // "Niveau de zoom"
    .translate([width / 2, height / 2]);    // "Place le centre de la carte au centre de mon SVG";
const path = d3.geoPath(projection);

d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
  .then(world => {
  const countries = topojson.feature(world, world.objects.countries);

svg.append("g")
  .selectAll("path")
  .data(countries.features)
  .join("path")
  .attr("d", path)
  .attr("fill", "#2f3a63");

svg.append("path")
  .datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b))
  .attr("d", path)
  .attr("fill", "none")
  .attr("stroke", "#8fa1ff")
  .attr("stroke-width", 0.6)
  .attr("opacity", 0.8);
});