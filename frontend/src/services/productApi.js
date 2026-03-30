import { authStore } from './authStore.js'

const API_BASE = '/api/products'

function getAuthHeaders() {
  const token = authStore.getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

async function handleResponse(res) {
  const text = await res.text()

  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try {
      const data = JSON.parse(text)
      msg =
        data.message ||
        (data.fieldErrors &&
          data.fieldErrors.map(e => `${e.field}: ${e.message}`).join(', ')) ||
        msg
    } catch {
      // response was not JSON; keep generic msg
    }
    throw new Error(msg)
  }

  if (res.status === 204 || text.trim() === '') return null

  try {
    return JSON.parse(text)
  } catch {
    // backend returned non‑JSON on success; just return raw text
    return text
  }
}

export const productApi = {
  async getAll(params = {}) {
    const qs = new URLSearchParams(params).toString()
    const url = qs ? `${API_BASE}?${qs}` : API_BASE
    const res = await fetch(url, { headers: getAuthHeaders() })
    return handleResponse(res)
  },

  async getById(id) {
    const res = await fetch(`${API_BASE}/${id}`, { headers: getAuthHeaders() })
    return handleResponse(res)
  },

  async create(product) {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(product),
    })
    return handleResponse(res)
  },

  async update(id, product) {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(product),
    })
    return handleResponse(res)
  },

  async uploadImage(id, file) {
    const formData = new FormData()
    formData.append('file', file)
    const token = authStore.getToken()
    const headers = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(`${API_BASE}/${id}/image`, {
      method: 'POST',
      headers,
      body: formData,
    })
    return handleResponse(res)
  },

  async delete(id) {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    return handleResponse(res)
  },
}
