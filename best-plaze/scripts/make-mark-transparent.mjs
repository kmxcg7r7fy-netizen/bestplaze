import sharp from "sharp";
import path from "node:path";

const input = path.resolve("public/brand/mark.png");
const output = path.resolve("public/brand/mark.clean.png");

// Stratégie:
// - On considère que le fond est (quasi) noir.
// - On calcule une alpha basée sur la luminance: plus c'est sombre, plus c'est transparent.
// - On garde les zones dorées et on adoucit les bords pour un rendu premium (anti-collage).
const img = sharp(input).ensureAlpha();
const meta = await img.metadata();
if (!meta.width || !meta.height) throw new Error("Image metadata missing.");

const { data, info } = await img
  .raw()
  .toBuffer({ resolveWithObject: true });

const out = Buffer.alloc(data.length);

// Réglages fins (à ajuster si besoin)
const blackCut = 34; // en dessous: transparent
const knee = 90; // zone de transition douce
const gamma = 0.9;

for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const a = data[i + 3];

  // Luminance perceptuelle
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  // Alpha: 0 sur noir, 255 sur zones lumineuses (dorées)
  let alpha = 255;
  if (y <= blackCut) alpha = 0;
  else if (y < knee) {
    const t = (y - blackCut) / (knee - blackCut);
    alpha = Math.round(255 * Math.pow(t, gamma));
  }

  out[i] = r;
  out[i + 1] = g;
  out[i + 2] = b;
  out[i + 3] = Math.min(a, alpha);
}

await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png()
  .toFile(output);

console.log("OK:", output);

