const data = [
  { city: "Paris", temp: 22 },
  { city: "Lyon", temp: 18 },
  { city: "Marseille", temp: 27 },
  { city: "Lille", temp: 15 },
  { city: "Toulouse", temp: 24 },
];

const threshold = 20;

const svg = d3.select("#chart");
const width = 900;
const height = 420;

svg.attr("viewBox", `0 0 ${width} ${height}`).attr("role", "img");

const padding = 40;
const rectHeight = 50;
const gap = 18;

const rows = svg
  .selectAll("g")
  .data(data)
  .enter()
  .append("g")
  .attr(
    "transform",
    (_, index) =>
      `translate(${padding}, ${padding + index * (rectHeight + gap)})`,
  );

rows
  .append("rect")
  .attr("width", width - padding * 2)
  .attr("height", rectHeight)
  .attr("rx", 12)
  .attr("fill", (d) => (d.temp > threshold ? "#ef4444" : "#3b82f6"));

rows
  .append("text")
  .attr("x", 16)
  .attr("y", rectHeight / 2 + 6)
  .attr("fill", "#ffffff")
  .attr("font-size", 16)
  .attr("font-weight", 600)
  .text((d) => `${d.city} — ${d.temp}°C`);
