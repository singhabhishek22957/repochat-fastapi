const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "/api"

export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T | null
}

export class ApiError extends Error {
  code: string
  status: number

  constructor(message: string, code: string, status: number) {
    super(message)
    this.code = code
    this.status = status
  }
}

function getToken(): string | null {
  return localStorage.getItem("access_token")
}

export function setAccessToken(token: string | null) {
  if (token) {
    localStorage.setItem("access_token", token)
  } else {
    localStorage.removeItem("access_token")
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken()
  const headers = new Headers(options.headers)

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json")
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  })

  let payload: ApiResponse<T> | null = null
  try {
    payload = (await response.json()) as ApiResponse<T>
  } catch {
    if (!response.ok) {
      throw new ApiError("Request failed", "REQUEST_FAILED", response.status)
    }
    throw new ApiError("Invalid response", "INVALID_RESPONSE", response.status)
  }

  if (!response.ok || !payload.success) {
    const err = payload as ApiResponse<null> & {
      error?: { code?: string; message?: string }
    }
    throw new ApiError(
      err.error?.message || payload.message || "Request failed",
      err.error?.code || "REQUEST_FAILED",
      response.status,
    )
  }

  return payload.data as T
}
