import { CONTACT_COUNTRY_OPTIONS } from '../data/contactCountries'

/** Digits-only, international format without + (e.g. 917506177573) */
const DEFAULT_WHATSAPP_PHONE =
  String(import.meta.env.VITE_WHATSAPP_PHONE || '917506177573').replace(/\D/g, '') || '917506177573'

/** Max length WhatsApp reliably accepts in web `text=` param (~2k varies by client) */
const SAFE_MESSAGE_MAX_LENGTH = 1800

const PRODUCT_CATEGORY_LABELS = {
  'bio-fertilizers': 'Bio Fertilizers',
  'bio-stimulants': 'Bio Stimulants',
  'organic-fertilizers': 'Organic Fertilizers',
  'organic-manure': 'Organic Manure',
  'soil-conditioners': 'Soil Conditioners',
  'chelated-micronutrients': 'Chelated Micronutrients',
  'water-soluble-fertilizers': 'Water Soluble Fertilizers (WSF)',
  'growing-media': 'Growing Media',
}

function labelForCountry(value) {
  if (!value) return '—'
  const found = CONTACT_COUNTRY_OPTIONS.find((o) => o.value === value)
  return found ? found.label : value
}

function labelForCategory(slug) {
  if (!slug) return '—'
  return PRODUCT_CATEGORY_LABELS[slug] || slug
}

export function formatEnquiryForWhatsApp(data, extras = {}) {
  const categoryLine = labelForCategory(data.category)
  const countryLine = labelForCountry(data.country)
  const productLine =
    extras.productName && String(extras.productName).trim()
      ? String(extras.productName).trim()
      : ''

  const lines = [
    '*New enquiry — Soil+ Organics*',
    '',
    `*Full name:* ${data.fullName || '—'}`,
    `*Business:* ${data.businessName?.trim() || '—'}`,
    `*Phone:* ${data.phone || '—'}`,
    `*Email:* ${data.email || '—'}`,
    `*Category:* ${categoryLine}`,
    `*Country:* ${countryLine}`,
  ]

  if (productLine) {
    lines.push(`*Product:* ${productLine}`)
  }

  lines.push('', '*Message:*', data.message?.trim() || '—')

  let text = lines.join('\n')
  if (text.length > SAFE_MESSAGE_MAX_LENGTH) {
    text = `${text.slice(0, SAFE_MESSAGE_MAX_LENGTH - 24)}\n\n_(truncated)_`
  }

  return text
}

/** Opens WhatsApp (web/app) with prefilled message. Returns false if popup was blocked. */
export function sendEnquiryViaWhatsApp(data, extras = {}) {
  const phone = DEFAULT_WHATSAPP_PHONE.replace(/\D/g, '')
  if (!phone) {
    return false
  }

  const text = formatEnquiryForWhatsApp(data, extras)
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
  const win = typeof window !== 'undefined' ? window.open(url, '_blank', 'noopener,noreferrer') : null
  return Boolean(win)
}
