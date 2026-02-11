const donnee = [45, 80, 120, 60, 200];

const svg = d3.select("#exo1")
    .append("svg")
    .attr("width", 500)
    .attr("height", 200);

svg.selectAll("rect")
    .data(donnee)
    .join("rect")
    .attr("x", 0)                      // Toutes les barres partent de la gauche
    .attr("y", (d, i) => i * 35)       // Chaque barre descend de 35px (index * 35)
    
    // 4. Dimensions
    .attr("height", 30)                // Hauteur fixe pour chaque barre
    .attr("width", d => d * 2)         // Largeur proportionnelle à la donnée (*2 pour mieux voir)

    // 5. Condition de couleur
    .style("fill", d => {
        if (d > 100) { 
            return "red";   // Alerte pollution !
        } else { 
            return "green"; // Tout va bien
        }
    });

svg.selectAll("text")
    .data(donnee)
    .join("text")
    // Positionnement : à droite du rectangle
    // On prend la largeur du rectangle (d * 2) et on ajoute 10px de marge
    .attr("x", d => (d * 2) + 10) 
    
    // On centre le texte verticalement par rapport à la barre
    // (i * 35) pour la ligne, + 20 pour descendre au milieu des 30px de hauteur
    .attr("y", (d, i) => (i * 35) + 20) 
    .text(d => {
        if (d > 100) {
            return d + " : TROP !";
        } else {
            return d + " : Pas trop";
        }
    })
    
    // 3. Un peu de style
    .style("fill", d => d > 100 ? "red" : "black")
    .style("font-family", "sans-serif")
    .style("font-size", "14px");