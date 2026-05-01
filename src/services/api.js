const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').replace(/\/$/, '')
const API_REQUEST_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS || 20000)

async function fetchWithTimeout(path, options = {}) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT_MS)

  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
    })
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.')
    }

    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function submitEnquiry(payload) {
  const body = { ...payload }
  if (Object.prototype.hasOwnProperty.call(body, 'country')) {
    body.state = body.country || ''
  }

  const response = await fetchWithTimeout('/api/enquiries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(result.message || 'Unable to send your enquiry right now.')
  }

  return result
}

export { API_BASE_URL }
