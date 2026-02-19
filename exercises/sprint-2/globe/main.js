// main.js
import { createGlobe } from "./globe.js";
import { attachInteractions } from "./interactions.js";

const globe = await createGlobe();
attachInteractions(globe);
