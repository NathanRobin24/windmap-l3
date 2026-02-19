// --- CONFIGURATION ---
const width = 1340; // Variable constante : largeur du dessin
const height = 720; // Variable constante : hauteur du dessin

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


// create a map {code => income} for all the countries by loading the csv rows
const incomeByCode = new Map();

// --- 4. CHARGEMENT DES DONNÉES (Le moment critique) ---
// d3.json va chercher le fichier des frontières sur internet
Promise.all([
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
    d3.csv("./gni_per_capita_2024_countrycode.csv")
]).then(([dataGeo, rows]) => { 
        // ".then" signifie : "ATTENDS que le fichier soit arrivé avant de continuer"
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
            .attr("class", "countries")// "Donne-leur la classe CSS 'pays' (pour qu'ils soient blancs)"
            .on("click", selectCountry);
        
        // 1. On configure le comportement de "glissement"
        const comportementDrag = d3.drag()
            .on("drag", function(event) { // "event" contient dx (déplacement X) et dy (déplacement Y)
            svg.selectAll(".incomeText").remove();

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

        svg.on('wheel', function(event) {
            let value = projection.scale();
            if (event.deltaY < 0) {
                console.log('scrolling up');
                value = value * 1.10;
                projection.scale(value);
                rafraichirAffichage()
            }
            else if (event.deltaY > 0) {
                console.log('scrolling down');
                value = value / 1.10;
                projection.scale(value);
                rafraichirAffichage()
            }
        });



        const values = Array.from(incomeByCode.values()).filter(v => Number.isFinite(v));
        const sorted = values.slice().sort(d3.ascending); // slice creates a copy and sort from lowest to highest
        const lo = d3.quantileSorted(sorted, 0.05); // the value below which 5% of the data falls
        const hi = d3.quantileSorted(sorted, 0.95); // // the value below which 95% of the data falls
        const colorScale = d3.scaleSequential()   // builds a function that maps a number → a color.
            .interpolator(d3.interpolateRdYlGn)   // he color gradient red to green
            .domain([lo, hi]);

    

        function showCountryInfo(d) {
            const code = d.id;
            const name = d.properties.name;
            const yearlyIncome = incomeByCode.get(code);

            if (!(yearlyIncome)) return;

            const monthlyIncome = yearlyIncome / 12;
            
            const formatted = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0
                }).format(monthlyIncome)
            
            svg.selectAll(".countries")
                .classed("selected", false)
                .style("fill", null); // back to CSS fill
            
            // select clicked path
            const key = d.id;
            svg.selectAll(".countries")
                .filter(dd => dd.id === key)
                .classed("selected", true)
                .style("fill", colorScale(yearlyIncome));


            const [lon, lat] = d3.geoCentroid(d);
            const coords = projection([lon, lat]);
            if (!coords) return;

            const [x, y] = coords;

            const label = svg.append("text")
             .attr("class", "incomeText")
             .attr("x", x)
             .attr("y", y)
             .attr("text-anchor", "middle");
            
            label.append("tspan")
                .attr("x", x)
                .attr("dy", 0)
                .text(name);

            label.append("tspan")
                .attr("x", x)
                .attr("dy", 12)  
                .text(formatted);           
        }
        



        // Keep angles smooth across the -180/180 boundary (shortest rotation)
        function shortestAngleDelta(a, b) {
        let d = (b - a) % 360;
        if (d > 180) d -= 360;
        if (d < -180) d += 360;
        return d;
        }



        let spinning = null; // to stop previous animation if user clicks again
        function selectCountry(event, d,) { //d contains the selected country's information as an object

            svg.selectAll(".incomeText").remove();
            
            // Get geographic centroid (lon/lat in degrees)
            const [lon, lat] = d3.geoCentroid(d);

            // Target rotation for orthographic globe
            const target = [-lon, -lat, 0];

            const start = projection.rotate();
            const startScale = projection.scale();

            const zoomTarget = 600;

            if (spinning) spinning.stop();

            const duration = 900; // in ms
            const t0 = performance.now(); // passes the number of ms passed since the load of the page
            spinning = d3.timer(() => { // it's like a while loop, like to say for every frame
                const t = (performance.now() - t0) / duration;

                if (t >= 1) { // after certain time we exceed 1, meaning the 900ms have reached
                projection.rotate(target);
                rafraichirAffichage();
                spinning.stop();
                showCountryInfo(d);
                spinning = null;
                return;
                }

                // Smooth easing
                const e = d3.easeCubicInOut(t);

                // Interpolate rotation with shortest path for longitude/latitude
                const r = [
                start[0] + shortestAngleDelta(start[0], target[0]) * e,
                start[1] + shortestAngleDelta(start[1], target[1]) * e,
                0
                ];

                // zoom in then back out to scale 500
                // zoom in during first half, zoom back out during second half
                let s;
                if (e < 0.5) {
                const u = e / 0.5; // 0→1
                s = startScale + (zoomTarget - startScale) * u;
                } else {
                const u = (e - 0.5) / 0.5; // 0→1
                s = zoomTarget + (500  - zoomTarget) * u;
                }

                projection.rotate(r);
                projection.scale(s);

                rafraichirAffichage();
            });

        }

        // fonction de mise à jour
        function rafraichirAffichage() {
            svg.select(".ocean")
                .attr("d", path);
            svg.selectAll(".countries")
                .attr("d", path);           
        }
        console.log("ça marche!"); // Affiche un message dans la console (F12) si tout marche
    })
    .catch(error => console.error("Erreur de chargement :", error)); 
    // Si internet coupe ou que l'URL est fausse, ça affiche l'erreur ici.