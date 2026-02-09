// Données simples : une ville + une valeur
const data = [
  { city: "Tokyo", value: 37 },
  { city: "Delhi", value: 32 },
  { city: "Shanghai", value: 28 },
  { city: "São Paulo", value: 22 },
  { city: "Lagos", value: 21 },
];

// Seuil qui change la couleur
const threshold = 25;

// Sélection du SVG
const svg = d3.select("#chart");
// Taille logique du dessin
const width = 900;
const height = 420;

// Définition du viewBox pour garder un SVG responsive
svg.attr("viewBox", `0 0 ${width} ${height}`).attr("role", "img");

// Marge interne
const padding = 60;
// Écart horizontal entre les cercles
const gap = (width - padding * 2) / (data.length - 1);

// Groupe principal pour tout le dessin
const group = svg.append("g");

// Création d'un groupe par ville
const circles = group
  .selectAll("g")
  .data(data)
  .enter()
  .append("g")
  .attr(
    "transform",
    (_, index) => `translate(${padding + index * gap}, ${height / 2})`,
  );

// Dessin des cercles colorés selon le seuil
circles
  .append("circle")
  .attr("r", (d) => 12 + d.value)
  .attr("fill", (d) => (d.value >= threshold ? "#ef4444" : "#3b82f6"))
  .attr("opacity", 0.85);

// Texte pour afficher la ville et la valeur
circles
  .append("text")
  .attr("y", 6)
  .attr("text-anchor", "middle")
  .attr("fill", "#111")
  .attr("font-size", 12)
  .text((d) => `${d.city} (${d.value})`);
