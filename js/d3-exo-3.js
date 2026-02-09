// Différents jeux de données selon le mois
const datasets = {
  janvier: [
    { ville: "Paris", temp: 5 },
    { ville: "Lyon", temp: 3 },
    { ville: "Marseille", temp: 8 },
    { ville: "Lille", temp: 2 },
    { ville: "Toulouse", temp: 6 },
  ],
  juillet: [
    { ville: "Paris", temp: 25 },
    { ville: "Lyon", temp: 28 },
    { ville: "Marseille", temp: 30 },
    { ville: "Lille", temp: 22 },
    { ville: "Toulouse", temp: 27 },
  ],
  decembre: [
    { ville: "Paris", temp: 4 },
    { ville: "Lyon", temp: 2 },
    { ville: "Marseille", temp: 9 },
    { ville: "Lille", temp: 1 },
    { ville: "Toulouse", temp: 5 },
  ],
};

// Données actuelles (par défaut janvier)
let currentData = datasets.janvier;

// Sélection du SVG
const svg = d3.select("#chart");
// Taille logique du dessin
const width = 900;
const height = 420;

// viewBox pour un SVG responsive
svg.attr("viewBox", `0 0 ${width} ${height}`).attr("role", "img");

// Marges et dimensions
const margin = { top: 20, right: 30, bottom: 40, left: 50 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

// Groupe principal
const g = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Échelles
const xScale = d3.scaleBand().range([0, innerWidth]).padding(0.2);

const yScale = d3.scaleLinear().range([innerHeight, 0]);

// Groupes pour les axes
const xAxisGroup = g
  .append("g")
  .attr("transform", `translate(0, ${innerHeight})`);

const yAxisGroup = g.append("g");

// Fonction pour mettre à jour le graphique
function updateChart(data) {
  // Mise à jour des domaines
  xScale.domain(data.map((d) => d.ville));
  yScale.domain([0, d3.max(data, (d) => d.temp) + 5]);

  // Data join pour les barres
  const bars = g.selectAll("rect").data(data, (d) => d.ville);

  // Enter : nouvelles barres
  bars
    .enter()
    .append("rect")
    .attr("x", (d) => xScale(d.ville))
    .attr("y", innerHeight)
    .attr("width", xScale.bandwidth())
    .attr("height", 0)
    .attr("fill", "#3b82f6")
    .attr("rx", 4)
    .merge(bars) // Merge avec les barres existantes
    .transition()
    .duration(600)
    .attr("x", (d) => xScale(d.ville))
    .attr("y", (d) => yScale(d.temp))
    .attr("width", xScale.bandwidth())
    .attr("height", (d) => innerHeight - yScale(d.temp));

  // Exit : supprimer les anciennes barres
  bars.exit().transition().duration(300).attr("height", 0).remove();

  // Mise à jour des axes
  xAxisGroup.transition().duration(600).call(d3.axisBottom(xScale));

  yAxisGroup.transition().duration(600).call(d3.axisLeft(yScale));
}

// Initialisation du graphique
updateChart(currentData);

// Écouteurs pour les boutons
document.getElementById("btn-jan").addEventListener("click", () => {
  currentData = datasets.janvier;
  updateChart(currentData);
});

document.getElementById("btn-jul").addEventListener("click", () => {
  currentData = datasets.juillet;
  updateChart(currentData);
});

document.getElementById("btn-dec").addEventListener("click", () => {
  currentData = datasets.decembre;
  updateChart(currentData);
});
