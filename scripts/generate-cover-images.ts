import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const WIDTH = 1200;
const HEIGHT = 630;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function createGradient(
  width: number,
  height: number,
  color1: [number, number, number],
  color2: [number, number, number]
): Buffer {
  const pixels = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const t = (x / width + y / height) / 2;
      const idx = (y * width + x) * 3;
      pixels[idx] = Math.round(color1[0] + (color2[0] - color1[0]) * t);
      pixels[idx + 1] = Math.round(color1[1] + (color2[1] - color1[1]) * t);
      pixels[idx + 2] = Math.round(color1[2] + (color2[2] - color1[2]) * t);
    }
  }
  return pixels;
}

interface ImageConfig {
  filename: string;
  color1: string;
  color2: string;
}

const images: ImageConfig[] = [
  { filename: 'venus-hour-guide.jpg', color1: '#ec4899', color2: '#8b5cf6' },
  { filename: 'jupiter-hour-guide.jpg', color1: '#6366f1', color2: '#3b82f6' },
  { filename: 'saturn-hour-guide.jpg', color1: '#475569', color2: '#1e293b' },
  { filename: 'mercury-hour-guide.jpg', color1: '#06b6d4', color2: '#14b8a6' },
  { filename: 'mars-hour-guide.jpg', color1: '#ef4444', color2: '#f97316' },
  { filename: 'sun-hour-guide.jpg', color1: '#f59e0b', color2: '#eab308' },
  { filename: 'moon-hour-guide.jpg', color1: '#8b5cf6', color2: '#4f46e5' },
  { filename: 'planetary-days-pillar.jpg', color1: '#9333ea', color2: '#ec4899' },
];

async function main() {
  const outDir = path.resolve(__dirname, '../public/images/blog');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  for (const img of images) {
    const c1 = hexToRgb(img.color1);
    const c2 = hexToRgb(img.color2);
    const pixels = createGradient(WIDTH, HEIGHT, c1, c2);
    const outPath = path.join(outDir, img.filename);

    await sharp(pixels, { raw: { width: WIDTH, height: HEIGHT, channels: 3 } })
      .jpeg({ quality: 85 })
      .toFile(outPath);

    console.log(`Generated: ${outPath}`);
  }

  console.log('All cover images generated successfully.');
}

main().catch((err) => {
  console.error('Error generating images:', err);
  process.exit(1);
});
