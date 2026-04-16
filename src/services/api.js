const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').replace(/\/$/, '')

export async function submitEnquiry(payload) {
  const response = await fetch(`${API_BASE_URL}/api/enquiries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(result.message || 'Unable to send your enquiry right now.')
  }

  return result
}

export { API_BASE_URL }
