// Données : température moyenne par mois
const data = [
  { mois: "Jan", temp: 5 },
  { mois: "Fév", temp: 6 },
  { mois: "Mar", temp: 10 },
  { mois: "Avr", temp: 13 },
  { mois: "Mai", temp: 17 },
  { mois: "Juin", temp: 21 },
  { mois: "Juil", temp: 24 },
  { mois: "Août", temp: 23 },
  { mois: "Sept", temp: 19 },
  { mois: "Oct", temp: 14 },
  { mois: "Nov", temp: 9 },
  { mois: "Déc", temp: 6 },
];

// Sélection du SVG
const svg = d3.select("#chart");
// Taille logique du dessin
const width = 900;
const height = 420;

// viewBox pour un SVG responsive
svg.attr("viewBox", `0 0 ${width} ${height}`).attr("role", "img");

// Marges pour les axes
const margin = { top: 20, right: 30, bottom: 40, left: 50 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

// Groupe principal
const g = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Échelle X : position des mois
const xScale = d3
  .scalePoint()
  .domain(data.map((d) => d.mois))
  .range([0, innerWidth])
  .padding(0.5);

// Échelle Y : température
const yScale = d3
  .scaleLinear()
  .domain([0, d3.max(data, (d) => d.temp) + 5])
  .range([innerHeight, 0]);

// Générateur de ligne
const line = d3
  .line()
  .x((d) => xScale(d.mois))
  .y((d) => yScale(d.temp))
  .curve(d3.curveMonotoneX); // Courbe lissée

// Dessiner la ligne
g.append("path")
  .datum(data)
  .attr("fill", "none")
  .attr("stroke", "#3b82f6")
  .attr("stroke-width", 2)
  .attr("d", line);

// Dessiner les points
g.selectAll("circle")
  .data(data)
  .enter()
  .append("circle")
  .attr("cx", (d) => xScale(d.mois))
  .attr("cy", (d) => yScale(d.temp))
  .attr("r", 4)
  .attr("fill", "#3b82f6");

// Axe X
g.append("g")
  .attr("transform", `translate(0, ${innerHeight})`)
  .call(d3.axisBottom(xScale));

// Axe Y
g.append("g").call(d3.axisLeft(yScale));

// Titre Y
g.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - 40)
  .attr("x", 0 - innerHeight / 2)
  .attr("fill", "#111")
  .attr("text-anchor", "middle")
  .text("Température (°C)");
