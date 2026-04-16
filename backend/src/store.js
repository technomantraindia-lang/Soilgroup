import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { config } from './config.js'
import { DEFAULT_CATEGORY_SEED, DEFAULT_PRODUCT_SEED } from './defaultCatalog.js'

let writeQueue = Promise.resolve()
let seedQueue = null

function sortByNewest(items) {
  return [...items].sort((left, right) => {
    return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime()
  })
}

async function ensureStorageFile(filePath) {
  await fs.mkdir(config.dataDir, { recursive: true })

  if (!existsSync(filePath)) {
    await fs.writeFile(filePath, '[]\n', 'utf8')
  }
}

async function readCollection(filePath) {
  await ensureStorageFile(filePath)

  try {
    const content = await fs.readFile(filePath, 'utf8')
    const parsed = JSON.parse(content)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function writeCollection(filePath, records) {
  await ensureStorageFile(filePath)

  writeQueue = writeQueue.then(() =>
    fs.writeFile(filePath, `${JSON.stringify(records, null, 2)}\n`, 'utf8')
  )

  return writeQueue
}

async function ensureDefaultCatalogSeed() {
  if (seedQueue) {
    return seedQueue
  }

  seedQueue = (async () => {
    const [categories, products] = await Promise.all([
      readCollection(config.categoriesFile),
      readCollection(config.productsFile),
    ])

    if (categories.length > 0 || products.length > 0) {
      return
    }

    const timestamp = new Date().toISOString()
    const seededCategories = DEFAULT_CATEGORY_SEED.map((category) => ({
      id: crypto.randomUUID(),
      createdAt: timestamp,
      updatedAt: timestamp,
      ...category,
    }))

    const categoryIdBySlug = new Map(
      seededCategories.map((category) => [category.slug, category.id])
    )

    const seededProducts = DEFAULT_PRODUCT_SEED
      .map((product) => {
        const categoryId = categoryIdBySlug.get(product.categorySlug)

        if (!categoryId) {
          return null
        }

        return {
          id: crypto.randomUUID(),
          createdAt: timestamp,
          updatedAt: timestamp,
          ...product,
          categoryId,
        }
      })
      .filter(Boolean)

    await Promise.all([
      writeCollection(config.categoriesFile, seededCategories),
      writeCollection(config.productsFile, seededProducts),
    ])
  })()

  return seedQueue
}

function createTimestampedRecord(payload, extra = {}) {
  const timestamp = new Date().toISOString()

  return {
    id: crypto.randomUUID(),
    createdAt: timestamp,
    updatedAt: timestamp,
    ...extra,
    ...payload,
  }
}

export async function readEnquiries() {
  return sortByNewest(await readCollection(config.enquiriesFile))
}

export async function createEnquiry(payload) {
  const enquiries = await readEnquiries()
  const enquiry = createTimestampedRecord(payload, { status: 'new' })

  enquiries.unshift(enquiry)
  await writeCollection(config.enquiriesFile, enquiries)

  return enquiry
}

export async function updateEnquiry(id, updates) {
  const enquiries = await readCollection(config.enquiriesFile)
  const enquiry = enquiries.find((item) => item.id === id)

  if (!enquiry) {
    return null
  }

  Object.assign(enquiry, updates, { updatedAt: new Date().toISOString() })
  await writeCollection(config.enquiriesFile, enquiries)

  return enquiry
}

export async function deleteEnquiry(id) {
  const enquiries = await readCollection(config.enquiriesFile)
  const nextEnquiries = enquiries.filter((item) => item.id !== id)

  if (nextEnquiries.length === enquiries.length) {
    return false
  }

  await writeCollection(config.enquiriesFile, nextEnquiries)
  return true
}

export async function readCategories() {
  await ensureDefaultCatalogSeed()
  return sortByNewest(await readCollection(config.categoriesFile))
}

export async function createCategory(payload) {
  const categories = await readCategories()
  const category = createTimestampedRecord(payload)

  categories.unshift(category)
  await writeCollection(config.categoriesFile, categories)

  return category
}

export async function deleteCategory(id) {
  const categories = await readCollection(config.categoriesFile)
  const products = await readCollection(config.productsFile)

  if (products.some((product) => product.categoryId === id)) {
    return {
      ok: false,
      reason: 'CATEGORY_HAS_PRODUCTS',
    }
  }

  const nextCategories = categories.filter((item) => item.id !== id)

  if (nextCategories.length === categories.length) {
    return {
      ok: false,
      reason: 'CATEGORY_NOT_FOUND',
    }
  }

  await writeCollection(config.categoriesFile, nextCategories)
  return { ok: true }
}

export async function updateCategory(id, payload) {
  const categories = await readCollection(config.categoriesFile)
  const category = categories.find((item) => item.id === id)

  if (!category) {
    return null
  }

  Object.assign(category, payload, { updatedAt: new Date().toISOString() })
  await writeCollection(config.categoriesFile, categories)

  return category
}

export async function readProducts() {
  await ensureDefaultCatalogSeed()
  return sortByNewest(await readCollection(config.productsFile))
}

export async function createProduct(payload) {
  const products = await readProducts()
  const product = createTimestampedRecord(payload)

  products.unshift(product)
  await writeCollection(config.productsFile, products)

  return product
}

export async function deleteProduct(id) {
  const products = await readCollection(config.productsFile)
  const nextProducts = products.filter((item) => item.id !== id)

  if (nextProducts.length === products.length) {
    return false
  }

  await writeCollection(config.productsFile, nextProducts)
  return true
}

export async function updateProduct(id, payload) {
  const products = await readCollection(config.productsFile)
  const product = products.find((item) => item.id === id)

  if (!product) {
    return null
  }

  Object.assign(product, payload, { updatedAt: new Date().toISOString() })
  await writeCollection(config.productsFile, products)

  return product
}

export async function getAdminStats() {
  const [enquiries, categories, products] = await Promise.all([
    readEnquiries(),
    readCategories(),
    readProducts(),
  ])

  return {
    enquiries: {
      total: enquiries.length,
      new: enquiries.filter((item) => item.status === 'new').length,
      inProgress: enquiries.filter((item) => item.status === 'in-progress').length,
      resolved: enquiries.filter((item) => item.status === 'resolved').length,
      archived: enquiries.filter((item) => item.status === 'archived').length,
    },
    categories: {
      total: categories.length,
    },
    products: {
      total: products.length,
      published: products.filter((item) => item.status === 'published').length,
      draft: products.filter((item) => item.status === 'draft').length,
      archived: products.filter((item) => item.status === 'archived').length,
    },
  }
}
