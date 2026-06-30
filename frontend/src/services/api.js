/**
 * Stay Sense — API client
 * All fetch calls go through `request()` so errors are
 * handled consistently and the base URL is set in one place.
 *
 * Usage:
 *   import { roomsApi, enquiriesApi, reviewsApi, analysisApi } from '../services/api'
 *
 *   const rooms = await roomsApi.list()
 *   const enquiry = await enquiriesApi.create({ ... })
 *   const result  = await analysisApi.analyse('Review text…', 'Google')
 */

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

/* ─────────────────────────────────────────────
   Core fetch wrapper
   - Parses JSON automatically
   - On non-2xx: throws an Error with backend's
     `detail` message so callers can toast it
   - On 204 No Content: returns null
───────────────────────────────────────────── */
async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  // 204 No Content (DELETE success)
  if (res.status === 204) return null

  const data = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }))

  if (!res.ok) {
    // Prefer the backend's detail message, fall back to generic
    const msg =
      typeof data.detail === 'string'
        ? data.detail
        : Array.isArray(data.detail)
        ? data.detail.map((e) => `${e.field}: ${e.message}`).join(' · ')
        : `Request failed (${res.status})`
    throw new Error(msg)
  }

  return data
}

/* ─────────────────────────────────────────────
   Rooms
───────────────────────────────────────────── */
export const roomsApi = {
  /** GET /api/rooms  — optionally filter by status */
  list: (status) =>
    request(`/api/rooms${status ? `?status=${encodeURIComponent(status)}` : ''}`),

  /** GET /api/rooms/:id */
  get: (roomId) => request(`/api/rooms/${encodeURIComponent(roomId)}`),
}

/* ─────────────────────────────────────────────
   Enquiries
───────────────────────────────────────────── */
export const enquiriesApi = {
  /**
   * POST /api/enquiries  (201)
   * @param {Object} data — matches Enquiry.jsx form state keys exactly
   *   checkIn, checkOut, adults, children, room, name, phone, email, requests
   */
  create: (data) =>
    request('/api/enquiries', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** GET /api/enquiries  — staff only */
  list: (status) =>
    request(`/api/enquiries${status ? `?status=${encodeURIComponent(status)}` : ''}`),

  /** GET /api/enquiries/:id */
  get: (id) => request(`/api/enquiries/${encodeURIComponent(id)}`),

  /** PATCH /api/enquiries/:id/status */
  updateStatus: (id, status) =>
    request(`/api/enquiries/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
}

/* ─────────────────────────────────────────────
   Reviews
───────────────────────────────────────────── */
export const reviewsApi = {
  /**
   * GET /api/reviews  — optionally filter by theme
   * theme: food | host | location | cleanliness | value | experience
   */
  list: (theme) =>
    request(`/api/reviews${theme && theme !== 'all' ? `?theme=${encodeURIComponent(theme)}` : ''}`),

  /**
   * POST /api/reviews  (201)
   * Shape: { guest, location, source, rating, verified, themes, text }
   */
  add: (review) =>
    request('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(review),
    }),

  /** DELETE /api/reviews/:id  (204) */
  remove: (id) =>
    request(`/api/reviews/${encodeURIComponent(id)}`, { method: 'DELETE' }),
}

/* ─────────────────────────────────────────────
   Analysis
───────────────────────────────────────────── */
export const analysisApi = {
  /**
   * POST /api/analyse
   * @param {string} text   — review text (min 10 chars)
   * @param {string} source — optional platform name
   * @returns {{ sentiment, confidence, primary_theme, secondary_themes, suggested_response }}
   */
  analyse: (text, source) =>
    request('/api/analyse', {
      method: 'POST',
      body: JSON.stringify({ text, source: source || null }),
    }),

  /**
   * POST /api/analyse/batch
   * @param {Array<{text:string, source?:string}>} reviews
   * @returns {{ results, total, failed, sentiment_breakdown, top_themes,
   *             summary, insights, top_praise, top_concern, llm_used }}
   */
  analyseBatch: (reviews) =>
    request('/api/analyse/batch', {
      method: 'POST',
      body: JSON.stringify({ reviews }),
    }),
}
