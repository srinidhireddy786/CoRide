import { api, setToken } from './api'

export async function signup({ name, email, phone, password }) {
  const data = await api.post('/api/auth/signup', { name, email, phone, password })
  setToken(data.token)
  return data.user
}

export async function login({ email, password }) {
  const data = await api.post('/api/auth/login', { email, password })
  setToken(data.token)
  return data.user
}

export function logout() {
  setToken(null)
  localStorage.removeItem('coride_user')
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem('coride_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    localStorage.removeItem('coride_user')
    return null
  }
}

export function saveUser(user) {
  localStorage.setItem('coride_user', JSON.stringify(user))
}

export async function fetchMe() {
  const user = await api.get('/api/auth/me')
  return user
}
