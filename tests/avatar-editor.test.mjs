import assert from "node:assert/strict";
import { clampAvatarCrop, avatarDrawGeometry } from "../src/avatarEditor.js";

assert.deepEqual(clampAvatarCrop({ x: -20, y: 140, zoom: 8 }), { x: 0, y: 100, zoom: 3 });
assert.deepEqual(clampAvatarCrop({ x: 51.2, y: 48.8, zoom: 1.37 }), { x: 51.2, y: 48.8, zoom: 1.37 });

const landscape = avatarDrawGeometry({ width: 1600, height: 900 }, 1000, { x: 50, y: 50, zoom: 1 });
assert.equal(landscape.drawHeight, 1000);
assert.equal(Math.round(landscape.drawWidth), 1778);
assert.equal(Math.round(landscape.dx), -389);
assert.equal(landscape.dy, 0);

const shifted = avatarDrawGeometry({ width: 900, height: 1600 }, 1000, { x: 25, y: 75, zoom: 2 });
assert.equal(shifted.drawWidth, 2000);
assert.equal(Math.round(shifted.drawHeight), 3556);
assert.equal(shifted.dx, -250);
assert.equal(Math.round(shifted.dy), -1917);

console.log("Avatar editor geometry tests passed.");
