const data = [
  { city: "Tokyo", value: 37 },
  { city: "Delhi", value: 32 },
  { city: "Shanghai", value: 28 },
  { city: "São Paulo", value: 22 },
  { city: "Lagos", value: 21 },
];

const threshold = 25;

const svg = d3.select("#chart");
const width = 900;
const height = 420;

svg.attr("viewBox", `0 0 ${width} ${height}`).attr("role", "img");

const padding = 60;
const gap = (width - padding * 2) / (data.length - 1);

const group = svg.append("g");

const circles = group
  .selectAll("g")
  .data(data)
  .enter()
  .append("g")
  .attr(
    "transform",
    (_, index) => `translate(${padding + index * gap}, ${height / 2})`,
  );

circles
  .append("circle")
  .attr("r", (d) => 12 + d.value)
  .attr("fill", (d) => (d.value >= threshold ? "#ef4444" : "#3b82f6"))
  .attr("opacity", 0.85);

circles
  .append("text")
  .attr("y", 6)
  .attr("text-anchor", "middle")
  .attr("fill", "#111")
  .attr("font-size", 12)
  .text((d) => `${d.city} (${d.value})`);
