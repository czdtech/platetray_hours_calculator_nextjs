export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized access") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

function getExpectedToken(envKey: string): string {
  const token = process.env[envKey];
  if (!token) {
    throw new Error('缺少环境变量 ' + envKey + '，无法验证请求');
  }
  return token;
}

export function assertBearerToken(request: Request, envKey: string) {
  const expected = getExpectedToken(envKey);
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token || token !== expected) {
    throw new UnauthorizedError();
  }
}

export function jsonUnauthorizedResponse(message = "Unauthorized") {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status: 401,
    headers: {
      "content-type": "application/json",
    },
  });
}
