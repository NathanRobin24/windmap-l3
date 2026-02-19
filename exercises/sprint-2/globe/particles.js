let nextId = 0;
let gravity = 10;
let particlesTimer = null;
let particles = [] 
function spawnParticle(x, y) {

    const right = Math.random() < 0.5; // generates a number between 0 and 1, and if it's lesser than 0.5 means it's toward right
    
    // -Math.PI / 4 means -45° (down-right) and -3 * Math.PI / 4 means 135° (down-left)
    const baseAngle = right ? -Math.PI / 4 : -3 * Math.PI / 4;

    
    const spread = 0.80;
    const angle = baseAngle + (Math.random() - 0.5) * spread;
    const speed = 10 + Math.random() * (160 - 10);
    const size = 10 + Math.random() * 10;
    const drag = 0.985 + Math.random() * 0.01;
    return {
        id : nextId++,
        x : x,
        y : y,
        vx : Math.cos(angle) * speed, // negative cos goes left, positive goes up
        vy : Math.sin(angle) * speed, // negative sin goes up, positive goes down
        born : performance.now(),
        lifeSpan : 600 + Math.random() * 500,
        fontSize: size,
        drag
    }
}


export function handleParticles(d, yearlyIncome, svg, projection, particleNumber) {

    if (particlesTimer) {
    particlesTimer.stop();
    particlesTimer = null;
    }
    particles = [];
    svg.selectAll("text.p").remove();

    const [lon, lat] = d3.geoCentroid(d);   // gets longlitude and latitude of contry position
    const coords = projection([lon, lat]);  // converts them to coordinates of x and y
    const [x, y] = coords;
    let count = Math.round(particleNumber(yearlyIncome)); // gets a number between minIncome and maxIncome depending on the chosen country
    for (let i = 0; i < count; i++) {
        const p = spawnParticle(x, y);
        particles.push(p);
    }
    // Two-phase gravity:
    // Phase 1: light gravity (particles keep going up diagonally)
    // Phase 2: heavier gravity (they start falling)
    const switchMs = 800;     // when to “start falling”
    const g1 = 100;           // px/s^2 (light)
    const g2 = 300;          // px/s^2 (heavy)

    let lastNow = performance.now();
    particlesTimer = d3.timer(() => {
        let now = performance.now();
        let dt = (now - lastNow)/1000; // gives the difference of the time between current time and before the timer loop.(/1000 to convert it to second)
        lastNow = now;
        particles.forEach(p => {
            const age = now - p.born;
            const g = age < switchMs ? g1 : g2;
            // gravity affects vertical velocity
            p.vy += g * dt;
            
            // apply drag (air resistance)
            p.vx *= Math.pow(p.drag, 60 * dt);
            p.vy *= Math.pow(p.drag, 60 * dt);
            
            // move
            p.x += p.vx * dt;
            p.y += p.vy * dt;

        });

        particles = particles.filter(p => (now - p.born) < p.lifeSpan);

        svg.selectAll("text.p").data(particles, particle => particle.id).join(
            enter => enter.append("text")
                .attr("class", "p")
                .attr("x", particle => particle.x)
                .attr("y", particle => particle.y)
                .attr("fill", "#00d370ff")
                .text('$')
                .style("font-size", p => `${p.fontSize}px`),

            update => update
                .attr("x", particle => particle.x)
                .attr("y", particle => particle.y),

            exit => exit.remove());
    });

}