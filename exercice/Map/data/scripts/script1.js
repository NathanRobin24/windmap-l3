// --- CONFIGURATION ---
const largeur = 900; // Variable constante : largeur du dessin
const hauteur = 600; // Variable constante : hauteur du dessin

// --- 1. CRÉATION DE LA ZONE DE DESSIN ---
const svg = d3.select("#ma-carte") // "Trouve la div qui a l'id 'ma-carte'"
    .append("svg")                 // "Ajoute une balise <svg> dedans"
    .attr("width", largeur)        // "Règle sa largeur à 900"
    .attr("height", hauteur);      // "Règle sa hauteur à 600"

// --- 2. LA MATHÉMATIQUE (Projection) ---
const projection = d3.geoMercator() // "Utilise la formule de Mercator (carte classique)"
    .center([0, 20])                // "Regarde vers le centre du monde (Lat 20, Lon 0)"
    .scale(120)                     // "Niveau de zoom"
    .translate([largeur / 2, hauteur / 2]); // "Place le centre de la carte au centre de mon SVG"

// --- 3. LE CRAYON (Path Generator) ---
// C'est l'outil qui va convertir les coordonnées GPS en dessin SVG
const path = d3.geoPath().projection(projection); // "Crayon, utilise la projection ci-dessus"  Ce path est un générateur. Son seul travail est de lire les coordonnées GPS d'un pays (dans le fichier JSON) et de les traduire en cette langue (M 10 10 L 20 20...) que le d attend.

// --- 4. CHARGEMENT DES DONNÉES (Le moment critique) ---
// d3.json va chercher le fichier des frontières sur internet
d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    .then(dataGeo => { 
        // ".then" signifie : "ATTENDS que le fichier soit arrivé avant de continuer"
        // "dataGeo" est le nom qu'on donne aux données reçues

        // A. DESSINER LES PAYS
        svg.append("g")            // "Crée un groupe <g> (calque) pour les pays"
            .selectAll("path")     // "Sélectionne les chemins (vides pour l'instant)"
            .data(dataGeo.features)// "Voici la liste des pays (features)"
            .join("path")          // "Crée un chemin pour chaque pays"
            .attr("d", path)       // "Utilise le crayon 'path' pour tracer la forme". d = draw 
        // B. SIMULATION DE DONNÉES (Fake Data)
        // On crée un tableau d'objets pour tester les points rouges
        const dataPlastique = [
            { long: -15, lat: 30, qte: 100 }, 
            { long: 140, lat: 35, qte: 150 }, 
            { long: -140, lat: 35, qte: 200 } 
        ];

        // C. DESSINER LES POINTS
        svg.append("g")            // "Crée un nouveau calque par-dessus les pays"
            .selectAll("circle")   // "Prépare des cercles"
            .data(dataPlastique)   // "Utilise mes données de plastique"
            .join("circle")        // "Crée un cercle par donnée"
            // Le placement magique :
            .attr("cx", d => projection([d.long, d.lat])[0]) // "Calcule la position X sur l'écran"
            .attr("cy", d => projection([d.long, d.lat])[1]) // "Calcule la position Y sur l'écran"
            .attr("r", d => d.qte / 10)                      // "Rayon = Quantité divisée par 10"
            .attr("class", "point-plastique");               // "Applique le style rouge du CSS"

        console.log("ça marche!"); // Affiche un message dans la console (F12) si tout marche
    })
    .catch(error => console.error("Erreur de chargement :", error)); 
    // Si internet coupe ou que l'URL est fausse, ça affiche l'erreur ici.