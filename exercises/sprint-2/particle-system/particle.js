const width = 900;
const height = 450;

const svg = d3.select("#zone-1")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

svg.append("circle")
    .attr("class", "emitter")
    .attr("cx", 450)
    .attr("cy", 210)
    .attr("r", 40)
    .attr("fill", "#e68e0b")
    .on("click", handleclick);


let nextId = 0; 
function spawnParticle(x, y) {

    const angle = Math.random() * (2 * Math.PI);
    const speed = 20 + Math.random() * (180 - 20);
    
    return {
        id : nextId++,
        x : x,
        y : y,
        vx : Math.cos(angle) * speed,
        vy : Math.sin(angle) * speed,
        born : performance.now(),
        lifeSpan : 800 + Math.random() * (1300 - 800),
        r : 2 + Math.random() * (5 - 2)
    }
}


let timer = null;
let particles = []
function handleclick(event) {
  
    const [x, y] = d3.pointer(event, svg.node()); //set cordinates of where we clcked on svg
    for (let i = 0; i < 500; i++) {
        const p = spawnParticle(x, y);
        particles.push(p);
    }

    let lastNow = performance.now();
    particlesTimer = d3.timer(() => {
        let now = performance.now();
        let dt = (now - lastNow)/500; 
        lastNow = now;
        particles.forEach(p => {
            const age = now - p.born;
            p.x += p.vx * dt;
            p.y += p.vy * dt;    
        });

        particles = particles.filter(p => (now - p.born) < p.lifeSpan);
        svg.selectAll("circle.p").data(particles, d => d.id).join(
            enter => enter.append("circle")
                .attr("class", "p")
                .attr("r", d => d.r)
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .attr("fill", "#d3ac00ff"),

            update => update
                .attr("cx", d => d.x)
                .attr("cy", d => d.y),

            exit => exit.remove());
    });

    const duration = 500;
    const t0 = performance.now();
    const startScale = 40;
    const smallScale = 30;

    timer = d3.timer(() => {
        const t = (performance.now() - t0) / duration
        
        if (t >= 1) {
            timer.stop();
            timer = null;
        }

        const e = d3.easeCubicInOut(t);

        let s;
        if (e < 0.5) {
            const u = e / 0.5; // 0→1
            s = startScale + (smallScale - startScale) * u;
        } else {
            const u = (e - 0.5) / 0.5; // 0→1
            s = smallScale + (startScale  - smallScale) * u;
        }

        svg.select("circle.emitter")
            .attr("r", s);

    });
}