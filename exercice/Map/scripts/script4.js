// --- CONFIGURATION ---
const largeur = 900; // Variable constante : largeur du dessin
const hauteur = 600; // Variable constante : hauteur du dessin

// --- 1. CRÉATION DE LA ZONE DE DESSIN ---
const svg = d3.select("#ma-carte") // "Trouve la div qui a l'id 'ma-carte'"
    .append("svg")                 // "Ajoute une balise <svg> dedans"
    .attr("width", largeur)        // "Règle sa largeur à 900"
    .attr("height", hauteur);      // "Règle sa hauteur à 600"

// --- 2. LA MATHÉMATIQUE (Projection) ---
    let rotationActuelle = [-20, -10, 0]; //coordonnée de rotation quand on va cliquer plus tard
    const projection = d3.geoOrthographic() // "Utilise la formule globe 3D"               
    .rotate(rotationActuelle)
    .scale(250)                     // "Niveau de zoom"
    .translate([largeur / 2, hauteur / 2]); // "Place le centre de la carte au centre de mon SVG" (indispensable)

// --- 3. LE CRAYON (Path Generator) ---
// C'est l'outil qui va convertir les coordonnées GPS en dessin SVG
const path = d3.geoPath().projection(projection); // "Crayon, utilise la projection ci-dessus"

// --- 4. CHARGEMENT DES DEUX FICHIERS EN MÊME TEMPS ---
Promise.all([
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
    d3.json("data/Marine_Microplastic_Concentrations.geojson") 
]).then(([dataGeo, dataPlastique]) => {
    // dataGeo contient le monde
    // dataPlastique contient les points
        // A. DESSINER LES PAYS
        svg.append("g")            // "Crée un groupe <g> (calque) pour les pays"
            .selectAll("path")     // "Sélectionne les chemins (vides pour l'instant)"
            .data(dataGeo.features)// "Voici la liste des pays (features)"
            .join("path")          // "Crée un chemin pour chaque pays"
            .attr("d", path)       // "Utilise le crayon 'path' pour tracer la forme"
            .attr("class", "pays");// "Donne-leur la classe CSS 'pays' (pour qu'ils soient blancs)"
        
        // Dessiner les points (données)
        svg.append("g")
            .selectAll(".point-plastique")
            .data(dataPlastique.features) // le type de donnée en GeoJson est feature
            .join("path") //créer autant de <path> que de données
            .attr("class", "point-plastique")
            .attr("d", path) // 'path' sait lire les coordonnées du GeoJSON
            .style("fill", "red")
            .style("opacity", 0.6);

        // 1. On configure le comportement de "glissement"
        const comportementDrag = d3.drag()
            .on("drag", function(event) { // "event" contient dx (déplacement X) et dy (déplacement Y)

            // A. On récupère la rotation actuelle [Long, Lat, Roll]
            const rotate = projection.rotate(); 

            // B. On calcule la vitesse de rotation (Sensibilité)
            const k = 0.25; // 0.25 est une bonne vitesse. Si c'est trop lent, augmenter à 0.5

            // C. On met à jour la rotation
            // Note le "-" pour le dy, car monter la souris = monter la latitude
            projection.rotate([
                rotate[0] + event.dx * k,  // Rotation horizontale
                rotate[1] - event.dy * k   // Rotation verticale
            ]);

            // D. On redessine tout (Appel de ta fonction de mise à jour)
            rafraichirAffichage();
        });

        // 2. On applique ce comportement au SVG
        svg.call(comportementDrag);

        // fonction de mise à jour
        function rafraichirAffichage() {
            svg.selectAll(".pays") //On redessine les contours des pays
                .attr("d", path);
            svg.selectAll(".point-plastique") //On redessine les points de plastique
                .attr("d", path) // Cette ligne recalcule la position GPS vers les pixels !
                // On garde la logique pour masquer les points derrière l'horizon
                .style("display", d => {
                    const coordonnees = projection(d.geometry.coordinates); //d.geometry.coordinates contient [longitude, latitude] dans ton GeoJSON
                    return coordonnees ? "inline" : "none"; //Si le point passe "derrière" la courbure de la Terre, projection renvoie null
                });
        }
        console.log("ça marche!"); // Affiche un message dans la console (F12) si tout marche
    })
    .catch(error => console.error("Erreur de chargement :", error)); 
    // Si internet coupe ou que l'URL est fausse, ça affiche l'erreur ici.