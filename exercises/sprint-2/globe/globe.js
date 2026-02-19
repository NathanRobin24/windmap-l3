export async function createGlobe() {
const width = 1800;
const height = 750;

// --- 1. CRÉATION DE LA ZONE DE DESSIN ---
const svg = d3.select("#map") // "Trouve la div qui a l'id 'ma-carte'"
    .append("svg")                 // "Ajoute une balise <svg> dedans"
    .attr("width", width)        // "Règle sa largeur à 900"
    .attr("height", height);      // "Règle sa hauteur à 600"


// --- 2. LA MATHÉMATIQUE (Projection) ---
let rotationActuelle = [-20, -10, 0]; //coordonnée de rotation quand on va cliquer plus tard
const projection = d3.geoOrthographic() // "Utilise la formule globe 3D"               
    .rotate(rotationActuelle)
    .scale(250)                     // "Niveau de zoom"
    .translate([width / 2, height / 2]); // "Place le centre de la carte au centre de mon SVG" (indispensable)

// --- 3. LE CRAYON (Path Generator) ---
// C'est l'outil qui va convertir les coordonnées GPS en dessin SVG
const path = d3.geoPath().projection(projection); // "Crayon, utilise la projection ci-dessus"

// creates a map where country name => income
const incomeByCode = new Map();

// --- 4. CHARGEMENT DES DONNÉES (Le moment critique) ---
// d3.json va chercher le fichier des frontières sur internet
const [dataGeo, rows] = await Promise.all([
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
    d3.csv("./gni_per_capita_2024_countrycode.csv"),
  ]);

rows.forEach(r => {
    const v = +r["2024"];
    if (Number.isFinite(v)) incomeByCode.set(r["Country Code"], v);
});
// "dataGeo" est le nom qu'on donne aux données reçues

svg.append("g")
    .append("path")
    .datum({ type: "Sphere" })
    .attr("d", path)
    .attr("class", "ocean")


// A. DESSINER LES PAYS
svg.append("g")            // "Crée un groupe <g> (calque) pour les pays"
    .selectAll("path")     // "Sélectionne les chemins (vides pour l'instant)"
    .data(dataGeo.features)// "Voici la liste des pays (features)"
    .join("path")          // "Crée un chemin pour chaq ue pays"
    .attr("d", path)       // "Utilise le crayon 'path' pour tracer la forme"
    .attr("class", "countries");// "Donne-leur la classe CSS 'pays' (pour qu'ils soient blancs)"

const values = Array.from(incomeByCode.values()).filter(v => Number.isFinite(v));
const sorted = values.slice().sort(d3.ascending); // slice creates a copy and sort from lowest to highest
const lo = d3.quantileSorted(sorted, 0.05); // the value below which 5% of the data falls
const hi = d3.quantileSorted(sorted, 0.95); // // the value below which 95% of the data falls

const particleNumber = d3.scaleSqrt()
    .domain([lo, hi])
    .range([20, 200])
    .clamp(true);
const colorScale = d3.scaleSequential()   // builds a function that maps a number → a color.
    .interpolator(d3.interpolateRdYlGn)   // color gradient red to green
    .domain([lo, hi]);

return { svg, projection, path, incomeByCode,  particleNumber, colorScale };    

}

