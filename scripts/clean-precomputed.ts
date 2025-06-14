#!/usr/bin/env ts-node
/**
 * 清理本地预计算 JSON 文件（public/precomputed）。
 *
 * 用法：
 *   yarn clean:precomputed
 *
 * 说明：
 *   1. 仅删除本地开发模式下生成的 JSON 文件，安全无副作用。
 *   2. 若未来接入 Vercel KV，可在此脚本中读取环境变量并调用 REST API 清理。
 */
import fs from "fs/promises";
import path from "path";
import { createInterface } from "readline";

async function confirm(message: string): Promise<boolean> {
  if (process.env.CI) return true; // 在 CI 环境自动确认
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(/^y(es)?$/i.test(answer.trim()));
    });
  });
}

async function main() {
  const precomputedDir = path.resolve(process.cwd(), "public", "precomputed");

  try {
    await fs.access(precomputedDir);
  } catch {
    console.log("✅ 未找到 precomputed 目录，无需清理。");
    return;
  }

  const yes = await confirm(
    `⚠️  即将删除 ${precomputedDir} 内所有 .json 文件，确认继续吗？`
  );
  if (!yes) {
    console.log("❌ 已取消清理。");
    return;
  }

  const entries = await fs.readdir(precomputedDir);
  let deleted = 0;
  for (const entry of entries) {
    if (entry.endsWith(".json")) {
      await fs.unlink(path.join(precomputedDir, entry));
      console.log(`🗑️  Deleted ${entry}`);
      deleted++;
    }
  }

  if (deleted === 0) {
    console.log("ℹ️  未找到需要删除的 JSON 文件。");
  } else {
    console.log(`✅ 已删除 ${deleted} 个预计算文件。`);
  }

  // TODO: 清理远程 KV，可根据环境变量决定是否执行
}

main().catch((err) => {
  console.error("❌ 清理过程中发生错误:", err);
  process.exit(1);
});
