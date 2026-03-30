const AUTH_BASE = '/api/auth'

async function handleResponse(res) {
  if (!res.ok) {
    let msg = `Login failed (${res.status})`
    try {
      const data = await res.json()
      msg = data.message || data.error || msg
    } catch (_) {}
    throw new Error(msg)
  }
  return res.json()
}

function getAuthHeaders() {
  const token = localStorage.getItem('jwt_token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

export const authApi = {
  async login(email, password) {
    const res = await fetch(`${AUTH_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    return handleResponse(res)
  },
  async register(email, password) {
    const res = await fetch(`${AUTH_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    return handleResponse(res)
  },
  async me() {
    const res = await fetch(`${AUTH_BASE}/me`, { headers: getAuthHeaders() })
    return handleResponse(res)
  },
}
