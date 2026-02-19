import {handleParticles} from "./particles.js"

export function attachInteractions({ svg, projection, path, incomeByCode, particleNumber, colorScale }) {

    svg.selectAll(".countries").on("click", selectCountry);
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
        }).format(monthlyIncome);
    
    handleParticles(d, yearlyIncome, svg, projection, particleNumber);    

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

}


