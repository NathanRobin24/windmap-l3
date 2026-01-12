const mapCanvas = document.getElementById("map");
const mapCtx = mapCanvas.getContext("2d");

// particles overlay canvas (for trails)
const particlesCanvas = document.getElementById("particles");
const particlesCtx = particlesCanvas.getContext("2d");

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const px = Math.floor(window.innerWidth * dpr);
  const py = Math.floor(window.innerHeight * dpr);

  // size map canvas
  mapCanvas.width = px;
  mapCanvas.height = py;
  mapCanvas.style.width = window.innerWidth + "px";
  mapCanvas.style.height = window.innerHeight + "px";

  // size particles overlay
  particlesCanvas.width = px;
  particlesCanvas.height = py;
  particlesCanvas.style.width = window.innerWidth + "px";
  particlesCanvas.style.height = window.innerHeight + "px";

  mapCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  particlesCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", () => {
  resize();
  if (landFeature) {
    projection = d3
      .geoNaturalEarth1()
      .fitSize([window.innerWidth, window.innerHeight], landFeature);
    path = d3.geoPath(projection, mapCtx);
  }
  drawMap();
  startParticles();
});

resize();

let projection, path;
let landFeature = null;

async function loadWorld() {
  const world = await fetch("data/world-110m.json").then((r) => r.json());
  const land = topojson.feature(world, world.objects.land);
  landFeature = land;

  projection = d3
    .geoNaturalEarth1()
    .fitSize([window.innerWidth, window.innerHeight], landFeature);

  path = d3.geoPath(projection, mapCtx);

  drawMap();
  startParticles();
}

function drawMap() {
  if (!landFeature || !path) return;

  // background
  mapCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  mapCtx.fillStyle = "#000";
  mapCtx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  // land
  mapCtx.beginPath();
  path(landFeature);
  mapCtx.fillStyle = "#726d6dff";
  mapCtx.fill();

  // subtle stroke
  mapCtx.strokeStyle = "rgba(84, 36, 36, 0.15)";
  mapCtx.lineWidth = 0.5;
  mapCtx.stroke();
}

loadWorld();

// ------------------ PARTICLES ------------------
const PARTICLE_COUNT = 2000;
const particles = [];
let animId = null;

function randomLonLat() {
  return [-180 + Math.random() * 360, -85 + Math.random() * 170];
}

function seedParticles() {
  particles.length = 0;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const [lon, lat] = randomLonLat();
    particles.push({
      lon,
      lat,
      age: Math.random() * 100,
    });
  }
}

function getWind(lon, lat, t) {
  // placeholder field (replace with your dataset later)
  const u = 10; // east
  const v = Math.sin((lon + t * 20) * 0.05) * 5;
  return [u, v];
}

function stepParticles() {
  const dt = 0.016;
  const t = performance.now() * 0.001;

  for (const p of particles) {
    const [u, v] = getWind(p.lon, p.lat, t);

    p.lon += u * dt * 0.05;
    p.lat += v * dt * 0.05;

    p.age += 1;

    if (p.lon > 180) p.lon = -180;
    if (p.lon < -180) p.lon = 180;
    if (p.lat > 85) p.lat = 85;
    if (p.lat < -85) p.lat = -85;

    if (p.age > 140) {
      const [lon, lat] = randomLonLat();
      p.lon = lon;
      p.lat = lat;
      p.age = 0;
    }
  }
}

function drawFrame() {
  // fade previous particles slightly to create trails
  particlesCtx.save();
  particlesCtx.globalCompositeOperation = "destination-in";
  particlesCtx.fillStyle = "rgba(0,0,0,0.92)"; // higher alpha = faster fade
  particlesCtx.fillRect(0, 0, particlesCanvas.width, particlesCanvas.height);
  particlesCtx.restore();

  // draw current particles on the overlay canvas
  particlesCtx.beginPath();
  for (const p of particles) {
    const xy = projection([p.lon, p.lat]);
    if (!xy) continue;
    const [x, y] = xy;
    particlesCtx.moveTo(x + 1, y);
    particlesCtx.arc(x, y, 0.8, 0, Math.PI * 2);
  }
  particlesCtx.fillStyle = "rgba(255,255,255,0.9)";
  particlesCtx.fill();

  stepParticles();
  animId = requestAnimationFrame(drawFrame);
}

function startParticles() {
  if (!projection) return;
  seedParticles();
  if (animId) cancelAnimationFrame(animId);
  drawFrame();
}
