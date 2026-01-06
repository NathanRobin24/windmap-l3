# windmap-l3

Simple D3 world map with a canvas particle layer.

## What it does

- Renders a world map using D3 `geoNaturalEarth1` and TopoJSON land.
- Animates random particles on a separate canvas with simple drift and trails.
- Handles HiDPI correctly and resizes responsively.

## Run locally

Serve the folder over HTTP (fetch is used for `data/world-110m.json`). From the `windmap-l3` directory:

```bash
python3 -m http.server 8000
```

Then open:

```
http://localhost:8000
```

## Tuning

- `js/main.js` → `N`: number of particles (default: 12000).
- Particle color/opacity: change `particlesCtx.fillStyle`.
- Map fill: change `mapCtx.fillStyle` before `mapCtx.fill()`.

## Files

- `index.html`: two stacked canvases (`map`, `particles`), D3 + TopoJSON includes.
- `js/main.js`: map drawing, projection setup, particle seeding/animation.
- `data/world-110m.json`: TopoJSON world.
- `css/style.css`: full-viewport, layered transparent canvases.
