const mapCanvas = document.getElementById("map");
const mapCtx = mapCanvas.getContext("2d");

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const px = Math.floor(window.innerWidth * dpr);
  const py = Math.floor(window.innerHeight * dpr);

  mapCanvas.width = px;
  mapCanvas.height = py;
  mapCanvas.style.width = window.innerWidth + "px";
  mapCanvas.style.height = window.innerHeight + "px";

  mapCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
