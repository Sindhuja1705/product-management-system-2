import { authStore } from './authStore.js'

const API_BASE = '/api/orders'

function getAuthHeaders() {
  const token = authStore.getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

async function handleResponse(res) {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || `HTTP ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export const orderApi = {
  async placeOrder(items) {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ items }),
    })
    // We don't need the response body here; just ensure it succeeded.
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.message || `HTTP ${res.status}`)
    }
    return null
  },
  async getMyOrders(page = 0, size = 10) {
    const res = await fetch(`${API_BASE}?page=${page}&size=${size}`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(res)
  },
  async getAllOrders(page = 0, size = 20) {
    const res = await fetch(`${API_BASE}/admin/all?page=${page}&size=${size}`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(res)
  },
  async getOrder(id) {
    const res = await fetch(`${API_BASE}/${id}`, { headers: getAuthHeaders() })
    return handleResponse(res)
  },
}
