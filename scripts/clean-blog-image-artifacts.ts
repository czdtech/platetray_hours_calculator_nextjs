import fs from "fs/promises";
import path from "path";

const IMAGES_DIR = path.resolve(__dirname, "../public/images/blog");

async function run() {
  const files = await fs.readdir(IMAGES_DIR);
  const toRemove = files.filter((file) => {
    // 删除重复的 blur.blur.* 或非 jpg 的 blur 文件
    if (file.includes(".blur.blur")) return true;
    if (file.includes(".blur.")) {
      // 保留 blur.jpg，其余删掉
      return !file.endsWith(".blur.jpg");
    }
    return false;
  });

  await Promise.all(
    toRemove.map((file) => fs.unlink(path.join(IMAGES_DIR, file)))
  );

  console.log(`🧹 Removed ${toRemove.length} redundant files.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
}); 