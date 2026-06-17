const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

let token = localStorage.getItem('coride_token')

export function setToken(t) {
  token = t
  if (t) localStorage.setItem('coride_token', t)
  else localStorage.removeItem('coride_token')
}

export function getToken() {
  return token
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    if (res.status === 401) {
      setToken(null)
      window.location.href = '/login'
    }
    throw new Error(err.detail || 'Request failed')
  }

  return res.json()
}

export const api = {
  get: (path, params) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request('GET', `${path}${qs}`)
  },
  post: (path, body) => request('POST', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
}
