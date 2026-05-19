async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}

export const api = {
  get: <T>(url: string) => apiRequest<T>(url, { method: "GET" }),
  post: <T>(url: string, data: any) =>
    apiRequest<T>(url, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  put: <T>(url: string, data: any) =>
    apiRequest<T>(url, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  patch: <T>(url: string, data: any) =>
    apiRequest<T>(url, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: <T>(url: string) =>
    apiRequest<T>(url, { method: "DELETE" }),
}
