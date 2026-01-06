const mapCanvas = document.getElementById("map");
const mapCtx = mapCanvas.getContext("2d");

const particlesCanvas = document.getElementById("particles");
const particlesCtx = particlesCanvas.getContext("2d");

function resize() {
  const dpr = window.devicePixelRatio || 1;

  for (const c of [mapCanvas, particlesCanvas]) {
    c.width = Math.floor(window.innerWidth * dpr);
    c.height = Math.floor(window.innerHeight * dpr);
    c.style.width = window.innerWidth + "px";
    c.style.height = window.innerHeight + "px";
  }

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
  drawMap(); // redessiner la carte après avoir recalculé la projection
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

  seedParticles();

  requestAnimationFrame(animateParticles);
}

function drawMap() {
  if (!landFeature || !path) return;

  // fond
  mapCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  mapCtx.fillStyle = "#000";
  mapCtx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  // terre
  mapCtx.beginPath();
  path(landFeature);
  mapCtx.fillStyle = "#726d6dff";
  mapCtx.fill();

  // contour léger
  mapCtx.strokeStyle = "rgba(84, 36, 36, 0.15)";
  mapCtx.lineWidth = 0.5;
  mapCtx.stroke();
}

loadWorld();

// --------------------
// Étape 2 : Particules (mouvement simple, pas encore le vent)
// --------------------
const N = 12000;
const particles = [];

function randLon() {
  return -180 + Math.random() * 360;
}
function randLat() {
  return -60 + Math.random() * 120;
} // évite les pôles au début

function seedParticles() {
  particles.length = 0;
  for (let i = 0; i < N; i++) {
    particles.push({
      lon: randLon(),
      lat: randLat(),
    });
  }
}

function animateParticles(t) {
  // fade pour traînées sans noircir le canvas (préserve la transparence)
  particlesCtx.save();
  particlesCtx.globalCompositeOperation = "destination-in";
  // Multiplie l'alpha existante: <1 = disparition progressive des anciens pixels
  particlesCtx.fillStyle = "rgba(0,0,0,0.96)"; // 0.96 = lente disparition
  particlesCtx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  particlesCtx.restore();

  // dessiner des points
  particlesCtx.fillStyle = "rgba(255,255,255,0.7)";

  for (const p of particles) {
    // Mouvement SIMPLE (temporaire) : dérive vers l’est + petite oscillation
    p.lon += 0.08;
    p.lat += 0.02 * Math.sin(t * 0.001 + p.lon * 0.05);

    // wrap longitude
    if (p.lon > 180) p.lon -= 360;
    if (p.lon < -180) p.lon += 360;

    // clamp latitude
    if (p.lat > 85) p.lat = 85;
    if (p.lat < -85) p.lat = -85;

    // projeter (lon/lat -> pixels)
    const xy = projection([p.lon, p.lat]);
    if (!xy) continue;

    const x = xy[0],
      y = xy[1];
    particlesCtx.fillRect(x, y, 1, 1);
  }

  requestAnimationFrame(animateParticles);
}
