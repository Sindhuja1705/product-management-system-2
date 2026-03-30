import { authStore } from './authStore.js'

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
      msg = data.message || msg
    } catch (_) {
      // ignore JSON parse error, fall back to status text
    }
    throw new Error(msg)
  }
  try {
    return JSON.parse(text)
  } catch (_) {
    // If backend ever returns non‑JSON, fail silently for rating
    return { averageRating: 0, ratingCount: 0 }
  }
}

export const ratingApi = {
  async getRating(productId) {
    const res = await fetch(`/api/products/${productId}/rating`)
    return handleResponse(res)
  },
  async rate(productId, rating) {
    const res = await fetch(`/api/products/${productId}/rate?rating=${rating}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    })
    return handleResponse(res)
  },
}
