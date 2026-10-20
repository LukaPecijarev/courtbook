export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string }
    return body.message ?? response.statusText
  } catch {
    return response.statusText
  }
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(`/api${path}`, init)
  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response))
  }
  return response
}

function jsonInit(method: string, body: unknown, headers?: HeadersInit): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  }
}

export async function getJson<T>(path: string, signal?: AbortSignal, headers?: HeadersInit): Promise<T> {
  const response = await request(path, { signal, headers })
  return response.json() as Promise<T>
}

export async function sendJson<T>(method: 'POST' | 'PUT', path: string, body: unknown, headers?: HeadersInit): Promise<T> {
  const response = await request(path, jsonInit(method, body, headers))
  return response.json() as Promise<T>
}

export function postJson<T>(path: string, body: unknown): Promise<T> {
  return sendJson<T>('POST', path, body)
}

export async function sendWithoutBody(method: 'POST' | 'DELETE', path: string, headers?: HeadersInit): Promise<void> {
  await request(path, { method, headers })
}
