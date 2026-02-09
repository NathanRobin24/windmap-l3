// Données : plages de notes et le nombre d'étudiants
const data = [
  { range: "0-10", count: 5 },
  { range: "10-20", count: 12 },
  { range: "20-30", count: 28 },
  { range: "30-40", count: 35 },
  { range: "40-50", count: 20 },
];

// Sélection du SVG
const svg = d3.select("#chart");
// Taille logique du dessin
const width = 900;
const height = 420;

// Définition du viewBox pour un SVG responsive
svg.attr("viewBox", `0 0 ${width} ${height}`).attr("role", "img");

// Marges (comme les axes)
const margin = { top: 20, right: 30, bottom: 40, left: 50 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

// Groupe principal pour tout le dessin
const g = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Échelles
const xScale = d3
  .scaleBand()
  .domain(data.map((d) => d.range))
  .range([0, innerWidth])
  .padding(0.1);

const yScale = d3
  .scaleLinear()
  .domain([0, d3.max(data, (d) => d.count)])
  .range([innerHeight, 0]);

// Dessiner les barres
g.selectAll("rect")
  .data(data)
  .enter()
  .append("rect")
  .attr("x", (d) => xScale(d.range))
  .attr("y", (d) => yScale(d.count))
  .attr("width", xScale.bandwidth())
  .attr("height", (d) => innerHeight - yScale(d.count))
  .attr("fill", "#3b82f6")
  .attr("rx", 4);

// Texte au-dessus des barres
g.selectAll("text")
  .data(data)
  .enter()
  .append("text")
  .attr("x", (d) => xScale(d.range) + xScale.bandwidth() / 2)
  .attr("y", (d) => yScale(d.count) - 5)
  .attr("text-anchor", "middle")
  .attr("fill", "#111")
  .attr("font-size", 12)
  .text((d) => d.count);

// Axe X
g.append("g")
  .attr("transform", `translate(0, ${innerHeight})`)
  .call(d3.axisBottom(xScale))
  .append("text")
  .attr("x", innerWidth / 2)
  .attr("y", 30)
  .attr("fill", "#111")
  .attr("text-anchor", "middle")
  .text("Notes");

// Axe Y
g.append("g")
  .call(d3.axisLeft(yScale))
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - 40)
  .attr("x", 0 - innerHeight / 2)
  .attr("fill", "#111")
  .attr("text-anchor", "middle")
  .text("Nombre d'étudiants");
