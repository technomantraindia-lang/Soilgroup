import http from 'node:http'
import path from 'node:path'
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { config } from './config.js'
import { authenticateAdmin, createAuthToken, readBearerToken, verifyAuthToken } from './auth.js'
import {
  createCategory,
  createEnquiry,
  createProduct,
  deleteCategory,
  deleteEnquiry,
  deleteProduct,
  getAdminStats,
  initializeCatalogStore,
  readCategories,
  readEnquiries,
  readProducts,
  updateCategory,
  updateEnquiry,
  updateProduct,
} from './store.js'

const ENQUIRY_STATUS_OPTIONS = new Set(['new', 'in-progress', 'resolved', 'archived'])
const PRODUCT_STATUS_OPTIONS = new Set(['draft', 'published', 'archived'])

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
}

function isInsideDirectory(parentPath, childPath) {
  const relativePath = path.relative(parentPath, childPath)
  return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath))
}

function setCorsHeaders(req, res) {
  const origin = req.headers.origin

  if (origin && config.frontendOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }

  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  res.setHeader('Vary', 'Origin')
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
  })

  res.end(JSON.stringify(payload))
}

function sanitizeText(value) {
  return String(value || '').trim()
}

function createSlug(value) {
  return sanitizeText(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[()]/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function sanitizeArray(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map((item) => sanitizeText(item)).filter(Boolean)
}

function sanitizeContents(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => ({
      parameter: sanitizeText(item?.parameter),
      specification: sanitizeText(item?.specification || item?.quantity),
    }))
    .filter((row) => row.parameter && row.specification)
}

function parsePositiveInteger(value, fallback = 0, maximum = 100) {
  const parsedValue = Number.parseInt(String(value || ''), 10)

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return fallback
  }

  return Math.min(parsedValue, maximum)
}

function parseEnquiryPayload(payload) {
  const enquiry = {
    fullName: sanitizeText(payload.fullName),
    businessName: sanitizeText(payload.businessName),
    phone: sanitizeText(payload.phone),
    email: sanitizeText(payload.email).toLowerCase(),
    category: sanitizeText(payload.category),
    state: sanitizeText(payload.state),
    message: sanitizeText(payload.message),
    agreed: Boolean(payload.agreed),
  }

  const errors = []

  if (!enquiry.fullName) {
    errors.push('Full name is required.')
  }

  if (!enquiry.phone || enquiry.phone.replace(/[^\d]/g, '').length < 8) {
    errors.push('Please enter a valid phone number.')
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email)) {
    errors.push('Please enter a valid email address.')
  }

  if (!enquiry.message) {
    errors.push('Message is required.')
  }

  if (!enquiry.agreed) {
    errors.push('You must accept the terms before submitting.')
  }

  return { enquiry, errors }
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''

    req.on('data', (chunk) => {
      body += chunk

      if (body.length > 1024 * 1024) {
        reject(new Error('Request body is too large.'))
      }
    })

    req.on('end', () => {
      if (!body) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(body))
      } catch {
        reject(new Error('Invalid JSON body.'))
      }
    })

    req.on('error', reject)
  })
}

function requireAdmin(req, res) {
  const token = readBearerToken(req.headers)
  const payload = verifyAuthToken(token)

  if (!payload) {
    sendJson(res, 401, { message: 'Admin authentication is required.' })
    return null
  }

  return payload
}

function enrichProducts(products, categories) {
  const categoryLookup = new Map(categories.map((category) => [category.id, category]))

  return products.map((product) => {
    const category = categoryLookup.get(product.categoryId)

    return {
      ...product,
      category: category
        ? {
            id: category.id,
            name: category.name,
            slug: category.slug,
          }
        : null,
      }
  })
}

function getPublishedProducts(products) {
  return products.filter((product) => product.status === 'published')
}

function getPublicCategories(categories, products) {
  const productCountByCategoryId = getPublishedProducts(products).reduce((lookup, product) => {
    lookup.set(product.categoryId, (lookup.get(product.categoryId) || 0) + 1)
    return lookup
  }, new Map())

  return categories.map((category) => ({
    ...category,
    productCount: productCountByCategoryId.get(category.id) || 0,
  }))
}

function matchesProductSearch(product, query) {
  const normalizedQuery = sanitizeText(query).toLowerCase()

  if (!normalizedQuery) {
    return true
  }

  const searchableFields = [
    product.name,
    product.slug,
    product.primaryUse,
    product.shortDescription,
    product.contentsNote,
    product.description,
    product.category?.name,
    product.category?.slug,
  ]

  return searchableFields.some((field) =>
    sanitizeText(field).toLowerCase().includes(normalizedQuery)
  )
}

async function parseCategoryPayload(payload, options = {}) {
  const name = sanitizeText(payload.name)
  const slug = createSlug(payload.slug || payload.name)
  const description = sanitizeText(payload.description)
  const categories = await readCategories()
  const errors = []
  const existingCategoryId = options.existingCategoryId || null

  if (!name) {
    errors.push('Category name is required.')
  }

  if (!slug) {
    errors.push('Category slug is required.')
  }

  if (categories.some((category) => category.slug === slug && category.id !== existingCategoryId)) {
    errors.push('This category slug already exists.')
  }

  return {
    category: {
      name,
      slug,
      description,
    },
    errors,
  }
}

async function parseProductPayload(payload, options = {}) {
  const categories = await readCategories()
  const categoryId = sanitizeText(payload.categoryId)
  const category = categories.find((item) => item.id === categoryId)
  const name = sanitizeText(payload.name)
  const slug = createSlug(payload.slug || payload.name)
  const primaryUse = sanitizeText(payload.primaryUse || payload.shortDescription)
  const contents = sanitizeContents(payload.contents)
  const contentsNote = sanitizeText(payload.contentsNote || payload.description)
  const availableSizes = sanitizeArray(payload.availableSizes || payload.available_sizes)
  const imageUrl = sanitizeText(payload.imageUrl)
  const status = sanitizeText(payload.status || 'draft').toLowerCase()
  const products = await readProducts()
  const errors = []
  const existingProductId = options.existingProductId || null

  if (!name) {
    errors.push('Product name is required.')
  }

  if (!slug) {
    errors.push('Product slug is required.')
  }

  if (!category) {
    errors.push('Please select a valid category.')
  }

  if (!primaryUse) {
    errors.push('Primary use is required.')
  }

  if (contents.length === 0) {
    errors.push('Add at least one contents row with parameter and specification.')
  }

  if (!PRODUCT_STATUS_OPTIONS.has(status)) {
    errors.push('Please select a valid product status.')
  }

  if (products.some((product) => product.slug === slug && product.id !== existingProductId)) {
    errors.push('This product slug already exists.')
  }

  return {
    product: {
      name,
      slug,
      categoryId,
      primaryUse,
      shortDescription: primaryUse,
      contents,
      contentsNote,
      description: contentsNote,
      availableSizes,
      available_sizes: availableSizes,
      imageUrl,
      status,
      categorySlug: category?.slug || '',
    },
    errors,
  }
}

async function serveAdminFile(res, fileName) {
  const requestedPath = path.resolve(config.adminDir, fileName)

  if (!isInsideDirectory(config.adminDir, requestedPath) || !existsSync(requestedPath)) {
    sendJson(res, 404, { message: 'File not found.' })
    return
  }

  const extension = path.extname(requestedPath)
  const mimeType = MIME_TYPES[extension] || 'application/octet-stream'
  const fileContent = await fs.readFile(requestedPath)

  res.writeHead(200, {
    'Content-Type': mimeType,
    'X-Content-Type-Options': 'nosniff',
  })

  res.end(fileContent)
}

async function handleRequest(req, res) {
  setCorsHeaders(req, res)

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const requestUrl = new URL(req.url, `http://${req.headers.host}`)
  const pathname = decodeURIComponent(requestUrl.pathname)

  if (req.method === 'GET' && pathname === '/') {
    sendJson(res, 200, {
      name: 'Soilgroup Backend',
      adminUrl: '/admin',
      healthcheck: '/api/health',
    })
    return
  }

  if (req.method === 'GET' && pathname === '/api/health') {
    sendJson(res, 200, {
      status: 'ok',
      service: 'soilgroup-backend',
      catalogStorage: 'mongodb',
      enquiryStorage: 'json-file',
      timestamp: new Date().toISOString(),
    })
    return
  }

  if (req.method === 'POST' && pathname === '/api/enquiries') {
    const payload = await parseJsonBody(req)
    const { enquiry, errors } = parseEnquiryPayload(payload)

    if (errors.length > 0) {
      sendJson(res, 422, {
        message: errors[0],
        errors,
      })
      return
    }

    const createdEnquiry = await createEnquiry(enquiry)

    sendJson(res, 201, {
      message: 'Enquiry submitted successfully.',
      data: createdEnquiry,
    })
    return
  }

  if (req.method === 'POST' && pathname === '/api/admin/login') {
    const payload = await parseJsonBody(req)
    const username = sanitizeText(payload.username)
    const password = sanitizeText(payload.password)

    if (!authenticateAdmin(username, password)) {
      sendJson(res, 401, {
        message: 'Invalid username or password.',
      })
      return
    }

    sendJson(res, 200, {
      message: 'Login successful.',
      data: {
        token: createAuthToken(username),
        username,
      },
    })
    return
  }

  if (req.method === 'GET' && pathname === '/api/categories') {
    const [categories, products] = await Promise.all([readCategories(), readProducts()])

    sendJson(res, 200, {
      data: getPublicCategories(categories, products),
    })
    return
  }

  const publicCategoryProductsMatch = pathname.match(/^\/api\/categories\/([^/]+)\/products$/)

  if (publicCategoryProductsMatch && req.method === 'GET') {
    const requestedCategorySlug = createSlug(publicCategoryProductsMatch[1])
    const [products, categories] = await Promise.all([readProducts(), readCategories()])
    const publishedProducts = enrichProducts(getPublishedProducts(products), categories).filter(
      (product) => product.category?.slug === requestedCategorySlug
    )

    sendJson(res, 200, {
      data: publishedProducts,
    })
    return
  }

  if (req.method === 'GET' && pathname === '/api/products') {
    const [products, categories] = await Promise.all([readProducts(), readCategories()])
    const requestedCategorySlug = createSlug(requestUrl.searchParams.get('category'))
    const searchQuery = sanitizeText(requestUrl.searchParams.get('search'))
    const excludeSlug = sanitizeText(requestUrl.searchParams.get('exclude'))
    const limit = parsePositiveInteger(requestUrl.searchParams.get('limit'))

    let visibleProducts = enrichProducts(getPublishedProducts(products), categories)

    if (requestedCategorySlug) {
      visibleProducts = visibleProducts.filter(
        (product) => product.category?.slug === requestedCategorySlug
      )
    }

    if (searchQuery) {
      visibleProducts = visibleProducts.filter((product) =>
        matchesProductSearch(product, searchQuery)
      )
    }

    if (excludeSlug) {
      visibleProducts = visibleProducts.filter((product) => product.slug !== excludeSlug)
    }

    if (limit > 0) {
      visibleProducts = visibleProducts.slice(0, limit)
    }

    sendJson(res, 200, {
      data: visibleProducts,
    })
    return
  }

  const publicProductMatch = pathname.match(/^\/api\/products\/([^/]+)$/)

  if (publicProductMatch && req.method === 'GET') {
    const [products, categories] = await Promise.all([readProducts(), readCategories()])
    const requestedSlug = sanitizeText(publicProductMatch[1])
    const product = enrichProducts(getPublishedProducts(products), categories).find(
      (item) => item.slug === requestedSlug
    )

    if (!product) {
      sendJson(res, 404, {
        message: 'Product not found.',
      })
      return
    }

    sendJson(res, 200, {
      data: product,
    })
    return
  }

  if (pathname.startsWith('/api/admin/')) {
    const admin = requireAdmin(req, res)

    if (!admin) {
      return
    }
  }

  if (req.method === 'GET' && pathname === '/api/admin/stats') {
    sendJson(res, 200, {
      data: await getAdminStats(),
    })
    return
  }

  if (req.method === 'GET' && pathname === '/api/admin/categories') {
    sendJson(res, 200, {
      data: await readCategories(),
    })
    return
  }

  if (req.method === 'POST' && pathname === '/api/admin/categories') {
    const payload = await parseJsonBody(req)
    const { category, errors } = await parseCategoryPayload(payload)

    if (errors.length > 0) {
      sendJson(res, 422, {
        message: errors[0],
        errors,
      })
      return
    }

    const createdCategory = await createCategory(category)

    sendJson(res, 201, {
      message: 'Category added successfully.',
      data: createdCategory,
    })
    return
  }

  const adminCategoryMatch = pathname.match(/^\/api\/admin\/categories\/([^/]+)$/)

  if (adminCategoryMatch && req.method === 'PATCH') {
    const payload = await parseJsonBody(req)
    const categoryId = adminCategoryMatch[1]
    const { category, errors } = await parseCategoryPayload(payload, {
      existingCategoryId: categoryId,
    })

    if (errors.length > 0) {
      sendJson(res, 422, {
        message: errors[0],
        errors,
      })
      return
    }

    const updatedCategory = await updateCategory(categoryId, category)

    if (!updatedCategory) {
      sendJson(res, 404, {
        message: 'Category not found.',
      })
      return
    }

    sendJson(res, 200, {
      message: 'Category updated successfully.',
      data: updatedCategory,
    })
    return
  }

  if (adminCategoryMatch && req.method === 'DELETE') {
    const result = await deleteCategory(adminCategoryMatch[1])

    if (!result.ok && result.reason === 'CATEGORY_HAS_PRODUCTS') {
      sendJson(res, 409, {
        message: 'Delete products in this category before removing the category.',
      })
      return
    }

    if (!result.ok) {
      sendJson(res, 404, {
        message: 'Category not found.',
      })
      return
    }

    sendJson(res, 200, {
      message: 'Category deleted successfully.',
    })
    return
  }

  if (req.method === 'GET' && pathname === '/api/admin/products') {
    const [products, categories] = await Promise.all([readProducts(), readCategories()])

    sendJson(res, 200, {
      data: enrichProducts(products, categories),
    })
    return
  }

  if (req.method === 'POST' && pathname === '/api/admin/products') {
    const payload = await parseJsonBody(req)
    const { product, errors } = await parseProductPayload(payload)

    if (errors.length > 0) {
      sendJson(res, 422, {
        message: errors[0],
        errors,
      })
      return
    }

    const createdProduct = await createProduct(product)
    const categories = await readCategories()

    sendJson(res, 201, {
      message: 'Product added successfully.',
      data: enrichProducts([createdProduct], categories)[0],
    })
    return
  }

  const adminProductMatch = pathname.match(/^\/api\/admin\/products\/([^/]+)$/)

  if (adminProductMatch && req.method === 'PATCH') {
    const payload = await parseJsonBody(req)
    const productId = adminProductMatch[1]
    const { product, errors } = await parseProductPayload(payload, {
      existingProductId: productId,
    })

    if (errors.length > 0) {
      sendJson(res, 422, {
        message: errors[0],
        errors,
      })
      return
    }

    const updatedProduct = await updateProduct(productId, product)

    if (!updatedProduct) {
      sendJson(res, 404, {
        message: 'Product not found.',
      })
      return
    }

    const categories = await readCategories()

    sendJson(res, 200, {
      message: 'Product updated successfully.',
      data: enrichProducts([updatedProduct], categories)[0],
    })
    return
  }

  if (adminProductMatch && req.method === 'DELETE') {
    const removed = await deleteProduct(adminProductMatch[1])

    if (!removed) {
      sendJson(res, 404, {
        message: 'Product not found.',
      })
      return
    }

    sendJson(res, 200, {
      message: 'Product deleted successfully.',
    })
    return
  }

  if (req.method === 'GET' && pathname === '/api/admin/enquiries') {
    sendJson(res, 200, {
      data: await readEnquiries(),
    })
    return
  }

  const adminEnquiryMatch = pathname.match(/^\/api\/admin\/enquiries\/([^/]+)$/)

  if (adminEnquiryMatch && req.method === 'PATCH') {
    const payload = await parseJsonBody(req)
    const nextStatus = sanitizeText(payload.status)

    if (!ENQUIRY_STATUS_OPTIONS.has(nextStatus)) {
      sendJson(res, 422, {
        message: 'Invalid status value.',
      })
      return
    }

    const updatedEnquiry = await updateEnquiry(adminEnquiryMatch[1], { status: nextStatus })

    if (!updatedEnquiry) {
      sendJson(res, 404, {
        message: 'Enquiry not found.',
      })
      return
    }

    sendJson(res, 200, {
      message: 'Enquiry updated successfully.',
      data: updatedEnquiry,
    })
    return
  }

  if (adminEnquiryMatch && req.method === 'DELETE') {
    const removed = await deleteEnquiry(adminEnquiryMatch[1])

    if (!removed) {
      sendJson(res, 404, {
        message: 'Enquiry not found.',
      })
      return
    }

    sendJson(res, 200, {
      message: 'Enquiry removed successfully.',
    })
    return
  }

  if (req.method === 'GET' && (pathname === '/admin' || pathname === '/admin/')) {
    await serveAdminFile(res, 'index.html')
    return
  }

  if (req.method === 'GET' && pathname.startsWith('/admin/')) {
    await serveAdminFile(res, pathname.replace('/admin/', ''))
    return
  }

  sendJson(res, 404, {
    message: 'Route not found.',
  })
}

export async function startServer() {
  await initializeCatalogStore()

  const server = http.createServer(async (req, res) => {
    try {
      await handleRequest(req, res)
    } catch (error) {
      sendJson(res, 500, {
        message: error.message || 'Internal server error.',
      })
    }
  })

  await new Promise((resolve, reject) => {
    const handleError = (error) => {
      server.off('listening', handleListening)
      reject(error)
    }

    const handleListening = () => {
      server.off('error', handleError)
      resolve()
    }

    server.once('error', handleError)
    server.once('listening', handleListening)
    server.listen(config.port)
  })

  console.log(`Soilgroup backend is running on http://localhost:${config.port}`)
  console.log(`Admin panel: http://localhost:${config.port}/admin`)

  return server
}

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href

if (isDirectRun) {
  startServer().catch((error) => {
    console.error(`Unable to start Soilgroup backend: ${error.message || error}`)
    process.exitCode = 1
  })
}
