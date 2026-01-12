# windmap-l3

Simple D3 world map rendered to a single canvas.

## What it does

- Renders a world map using D3 `geoNaturalEarth1` and TopoJSON land.
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

- Map fill: change `mapCtx.fillStyle` before `mapCtx.fill()`.

## Files

- `index.html`: single canvas (`map`), D3 + TopoJSON includes.
- `js/main.js`: map drawing and projection setup.
- `data/world-110m.json`: TopoJSON world.
- `css/style.css`: full-viewport canvas styling.
