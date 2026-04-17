import { getCategoryConfig, getCatalogProductBySlug, resolveCategorySlug } from '../data/catalog'
import { API_BASE_URL } from './api'

function toStringArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean)
  }

  if (!value) {
    return []
  }

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizeContents(contents) {
  if (!Array.isArray(contents)) {
    return []
  }

  return contents
    .map((item) => ({
      parameter: String(item?.parameter || '').trim(),
      specification: String(item?.specification || item?.quantity || '').trim(),
    }))
    .filter((item) => item.parameter && item.specification)
}

async function fetchApiData(path, fallbackMessage) {
  const response = await fetch(`${API_BASE_URL}${path}`)
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.message || fallbackMessage)
  }

  return payload.data
}

function mapCategoryRecord(category) {
  const categorySlug = resolveCategorySlug(category.slug || category.name || '')
  const localCategory = getCategoryConfig(categorySlug)

  return {
    ...category,
    slug: categorySlug,
    title: category.name || localCategory?.title || '',
    banner: localCategory?.banner || null,
    bannerLabel: localCategory?.bannerLabel || category.name || '',
    productCount: Number(category.productCount || 0),
  }
}

function mapProductRecord(product) {
  const categorySlug = resolveCategorySlug(product.category?.slug || product.categorySlug || '')
  const localCategory = getCategoryConfig(categorySlug)
  const localCatalogProduct = getCatalogProductBySlug(product.slug || product.name)
  const shortDescription = product.shortDescription || product.primaryUse || product.short_description || ''
  const availableSizes = toStringArray(product.availableSizes || product.available_sizes)
  const imageUrl = product.imageUrl || product.image || ''

  return {
    ...product,
    shortDescription,
    short_description: shortDescription,
    primaryUse: product.primaryUse || shortDescription,
    imageUrl,
    image: imageUrl || localCatalogProduct?.image || null,
    availableSizes,
    available_sizes: availableSizes,
    contents: normalizeContents(product.contents),
    categorySlug,
    categoryTitle: product.category?.name || localCategory?.title || '',
    category: product.category || {
      id: product.categoryId || '',
      slug: categorySlug,
      name: localCategory?.title || '',
    },
  }
}

export async function fetchPublicCategories() {
  const data = await fetchApiData('/api/categories', 'Unable to load categories.')
  return Array.isArray(data) ? data.map(mapCategoryRecord) : []
}

export async function fetchPublicProductsByCategory(categorySlug) {
  const data = await fetchApiData(
    `/api/categories/${encodeURIComponent(categorySlug)}/products`,
    'Unable to load category products.'
  )

  return Array.isArray(data) ? data.map(mapProductRecord) : []
}

export async function fetchPublicProducts(options = {}) {
  const params = new URLSearchParams()

  if (options.category) {
    params.set('category', options.category)
  }

  if (options.search) {
    params.set('search', options.search)
  }

  if (options.exclude) {
    params.set('exclude', options.exclude)
  }

  if (options.limit) {
    params.set('limit', String(options.limit))
  }

  const queryString = params.toString()
  const path = queryString ? `/api/products?${queryString}` : '/api/products'
  const data = await fetchApiData(path, 'Unable to load products.')

  return Array.isArray(data) ? data.map(mapProductRecord) : []
}

export async function searchPublicProducts(search, limit = 0) {
  return fetchPublicProducts({
    search,
    limit,
  })
}

export async function fetchPublicRelatedProducts(categorySlug, excludeSlug, limit = 4) {
  return fetchPublicProducts({
    category: categorySlug,
    exclude: excludeSlug,
    limit,
  })
}

export async function fetchPublicProductBySlug(slug) {
  const data = await fetchApiData(`/api/products/${encodeURIComponent(slug)}`, 'Unable to load product.')
  return data ? mapProductRecord(data) : null
}
