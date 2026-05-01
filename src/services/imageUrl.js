export function normalizeExternalImageUrl(value) {
  const url = String(value || '').trim()

  if (!url) {
    return ''
  }

  if (url.startsWith('/')) {
    const baseUrl = (import.meta.env.VITE_DIRECTUS_URL || import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

    if (baseUrl) {
      return `${baseUrl}${url}`
    }

    return url
  }

  const driveFileId =
    url.match(/drive\.google\.com\/file\/d\/([^/]+)/i)?.[1] ||
    url.match(/[?&]id=([^&]+)/i)?.[1]

  if (driveFileId && /drive\.google\.com/i.test(url)) {
    return `https://drive.google.com/thumbnail?id=${encodeURIComponent(driveFileId)}&sz=w1000`
  }

  return url
}
