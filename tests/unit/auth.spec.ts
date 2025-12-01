import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { assertBearerToken, UnauthorizedError } from '@/utils/server/auth'

const ENV_KEY = 'TEST_INTERNAL_TOKEN'

describe('assertBearerToken', () => {
  beforeEach(() => {
    process.env[ENV_KEY] = 'super-secret'
  })

  afterEach(() => {
    delete process.env[ENV_KEY]
  })

  it('allows requests携带正确的 Bearer token', () => {
    const request = new Request('http://localhost/internal', {
      headers: { Authorization: 'Bearer super-secret' }
    })

    expect(() => assertBearerToken(request, ENV_KEY)).not.toThrow()
  })

  it('throws UnauthorizedError when token mismatch', () => {
    const request = new Request('http://localhost/internal', {
      headers: { Authorization: 'Bearer wrong-token' }
    })

    expect(() => assertBearerToken(request, ENV_KEY)).toThrow(UnauthorizedError)
  })

  it('throws when token missing entirely', () => {
    const request = new Request('http://localhost/internal')

    expect(() => assertBearerToken(request, ENV_KEY)).toThrow(UnauthorizedError)
  })

  it('fails fast when环境变量缺失', () => {
    delete process.env[ENV_KEY]
    const request = new Request('http://localhost/internal', {
      headers: { Authorization: 'Bearer anything' }
    })

    expect(() => assertBearerToken(request, ENV_KEY)).toThrow(/缺少环境变量/)
  })
})
