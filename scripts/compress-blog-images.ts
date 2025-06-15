import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

// 目标目录
const IMAGES_DIR = path.resolve(__dirname, "../public/images/blog");

// 支持的输入格式
const INPUT_EXTENSIONS = [".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG"];

async function compressImage(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  const baseName = path.basename(filePath, ext);
  const dir = path.dirname(filePath);

  // 读取原始 buffer
  const inputBuffer = await fs.readFile(filePath);

  // 压缩 JPG / PNG ⇒ WebP
  const webpBuffer = await sharp(inputBuffer)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 75 })
    .toBuffer();
  await fs.writeFile(path.join(dir, `${baseName}.webp`), webpBuffer);

  // 压缩 JPG / PNG ⇒ AVIF
  const avifBuffer = await sharp(inputBuffer)
    .resize({ width: 1600, withoutEnlargement: true })
    .avif({ quality: 50 })
    .toBuffer();
  await fs.writeFile(path.join(dir, `${baseName}.avif`), avifBuffer);

  // 覆盖原始文件（若需要保留原图可调整）
  const jpegBuffer = await sharp(inputBuffer)
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 75, progressive: true })
    .toBuffer();
  await fs.writeFile(filePath, jpegBuffer);

  // 生成 LQIP (BlurDataURL 触发时可使用)
  const lqipBuffer = await sharp(inputBuffer)
    .resize(20)
    .jpeg({ quality: 40 })
    .toBuffer();
  await fs.writeFile(path.join(dir, `${baseName}.blur.jpg`), lqipBuffer);

  console.log(`✅ Compressed ${baseName}${ext}`);
}

async function run() {
  const files = await fs.readdir(IMAGES_DIR);
  const tasks = files
    .filter((file) => {
      const ext = path.extname(file).toLowerCase();
      if (!INPUT_EXTENSIONS.includes(ext)) return false;
      // 忽略已经生成的占位图
      return !file.includes(".blur");
    })
    .map((file) => compressImage(path.join(IMAGES_DIR, file)));

  await Promise.all(tasks);
  console.log("🎉 All blog images compressed!");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
}); 