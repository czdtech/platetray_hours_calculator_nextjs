// @ts-nocheck
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';

let verifyTask: any;

beforeAll(async () => {
  const scriptURL = pathToFileURL(path.join(process.cwd(), 'scripts/verify-newyork.ts')).href;
  // @ts-ignore – 动态导入非 src 范围脚本
  ({ verifyTask } = await import(scriptURL));

  process.env.FORCE_RUN = '1';
  delete process.env.VERCEL_KV_REST_API_URL;
  delete process.env.VERCEL_KV_REST_API_TOKEN;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
});

// mock 对象引用
let writeFileSpy: any;
let mkdirSpy: any;
let readFileSpy: any;

// Stub fetch，返回 404 以模拟 KV 缺失
const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 404, text: () => Promise.resolve('404') });
// @ts-ignore
globalThis.fetch = fetchMock as any;

/**
 * 当 KV / 本地文件均不存在时，verifyTask 应进行补偿计算并写文件。
 */
describe('verifyTask compensation flow', () => {
  beforeAll(() => {
    // 设置文件系统 spies
    writeFileSpy = vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined as any);
    mkdirSpy = vi.spyOn(fs, 'mkdir').mockResolvedValue(undefined as any);
    readFileSpy = vi.spyOn(fs, 'readFile').mockImplementation(() => {
      const err: any = new Error('ENOENT');
      err.code = 'ENOENT';
      return Promise.reject(err);
    });
  });

  afterAll(() => {
    readFileSpy?.mockRestore();
    delete process.env.FORCE_RUN;
    vi.restoreAllMocks();
  });

  it('should perform compensation calculation and write JSON file', async () => {
    await verifyTask();

    expect(writeFileSpy).toHaveBeenCalled();
    const [filePath, data] = writeFileSpy.mock.calls[0];
    expect(filePath).toMatch(/ny-\d{4}-\d{2}-\d{2}\.json$/);
    expect(() => JSON.parse(data as string)).not.toThrow();
  });
}); 