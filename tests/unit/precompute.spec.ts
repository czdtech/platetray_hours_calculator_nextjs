import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';

let precomputeTask: any;

beforeAll(async () => {
  const scriptURL = pathToFileURL(path.join(process.cwd(), 'scripts/precompute-newyork.ts')).href;
  // @ts-ignore – 动态导入非 src 范围脚本
  ({ precomputeTask } = await import(scriptURL));

  // 跳过 22:00 时间窗口限制
  process.env.FORCE_RUN = '1';
  // 确认所有 KV 相关环境变量不存在 => 走本地分支
  delete process.env.VERCEL_KV_REST_API_URL;
  delete process.env.VERCEL_KV_REST_API_TOKEN;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
});

// 使用 spyOn 避免真实文件写入
const writeSpy = vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined as any);
const mkdirSpy = vi.spyOn(fs, 'mkdir').mockResolvedValue(undefined as any);

/**
 * 单元测试：确保在本地模式下，脚本会写入正确的 JSON 文件。
 */
describe('precomputeTask (local mode)', () => {
  afterAll(() => {
    writeSpy.mockRestore();
    mkdirSpy.mockRestore();
    delete process.env.FORCE_RUN;
    vi.restoreAllMocks();
  });

  it('should create ny-YYYY-MM-DD.json with valid JSON content', async () => {
    await precomputeTask();

    expect(writeSpy).toHaveBeenCalled();
    const [filePath, data] = writeSpy.mock.calls[0];

    // 路径格式断言
    expect(filePath).toMatch(/ny-\d{4}-\d{2}-\d{2}\.json$/);
    // JSON 内容合法
    expect(() => JSON.parse(data as string)).not.toThrow();
  });
}); 