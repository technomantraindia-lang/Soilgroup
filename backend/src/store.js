import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { config } from './config.js'
import { ensureDatabaseSetup } from './database.js'
import { DEFAULT_CATEGORY_SEED, DEFAULT_PRODUCT_SEED } from './defaultCatalog.js'

const PRODUCT_STATUS_OPTIONS = new Set(['draft', 'published', 'archived'])

let writeQueue = Promise.resolve()
let catalogSeedPromise = null

function sortByNewest(items) {
  return [...items].sort((left, right) => {
    return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime()
  })
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

function normalizeTimestamp(value, fallbackTimestamp) {
  if (!value) {
    return fallbackTimestamp
  }

  const normalizedDate = new Date(value)

  if (Number.isNaN(normalizedDate.getTime())) {
    return fallbackTimestamp
  }

  return normalizedDate.toISOString()
}

async function ensureStorageFile(filePath) {
  await fs.mkdir(config.dataDir, { recursive: true })

  if (!existsSync(filePath)) {
    await fs.writeFile(filePath, '[]\n', 'utf8')
  }
}

async function readJsonCollection(filePath, { ensureFile = true } = {}) {
  if (ensureFile) {
    await ensureStorageFile(filePath)
  } else if (!existsSync(filePath)) {
    return []
  }

  try {
    const content = await fs.readFile(filePath, 'utf8')
    const parsed = JSON.parse(content)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function writeJsonCollection(filePath, records) {
  await ensureStorageFile(filePath)

  writeQueue = writeQueue.then(() =>
    fs.writeFile(filePath, `${JSON.stringify(records, null, 2)}\n`, 'utf8')
  )

  return writeQueue
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

async function getCategoriesCollection() {
  const database = await ensureDatabaseSetup()
  return database.collection('categories')
}

async function getProductsCollection() {
  const database = await ensureDatabaseSetup()
  return database.collection('products')
}

function normalizeCategoryRecord(record, fallbackTimestamp) {
  const name = sanitizeText(record?.name)
  const slug = sanitizeText(record?.slug) || createSlug(name)

  return {
    ...record,
    id: sanitizeText(record?.id) || crypto.randomUUID(),
    createdAt: normalizeTimestamp(record?.createdAt, fallbackTimestamp),
    updatedAt: normalizeTimestamp(record?.updatedAt, fallbackTimestamp),
    name,
    slug,
    description: sanitizeText(record?.description),
  }
}

function normalizeProductRecord(record, categoryIdBySlug, categorySlugById, fallbackTimestamp) {
  const name = sanitizeText(record?.name)
  const slug = sanitizeText(record?.slug) || createSlug(name)
  const categoryId =
    sanitizeText(record?.categoryId) ||
    categoryIdBySlug.get(sanitizeText(record?.categorySlug)) ||
    ''
  const categorySlug =
    sanitizeText(record?.categorySlug) || categorySlugById.get(categoryId) || ''
  const primaryUse = sanitizeText(record?.primaryUse || record?.shortDescription)
  const contentsNote = sanitizeText(record?.contentsNote || record?.description)
  const availableSizes = sanitizeArray(record?.availableSizes || record?.available_sizes)
  const contents = sanitizeContents(record?.contents)
  const rawStatus = sanitizeText(record?.status || 'draft').toLowerCase()
  const status = PRODUCT_STATUS_OPTIONS.has(rawStatus) ? rawStatus : 'draft'

  return {
    ...record,
    id: sanitizeText(record?.id) || crypto.randomUUID(),
    createdAt: normalizeTimestamp(record?.createdAt, fallbackTimestamp),
    updatedAt: normalizeTimestamp(record?.updatedAt, fallbackTimestamp),
    name,
    slug,
    categoryId,
    categorySlug,
    primaryUse,
    shortDescription: primaryUse,
    contents,
    contentsNote,
    description: contentsNote,
    availableSizes,
    available_sizes: availableSizes,
    imageUrl: sanitizeText(record?.imageUrl),
    status,
  }
}

async function seedCatalogCollections() {
  const [categoriesCollection, productsCollection] = await Promise.all([
    getCategoriesCollection(),
    getProductsCollection(),
  ])

  const [categoryCount, productCount] = await Promise.all([
    categoriesCollection.countDocuments(),
    productsCollection.countDocuments(),
  ])

  if (categoryCount > 0 || productCount > 0) {
    return
  }

  const [legacyCategories, legacyProducts] = await Promise.all([
    readJsonCollection(config.categoriesFile, { ensureFile: false }),
    readJsonCollection(config.productsFile, { ensureFile: false }),
  ])

  const timestamp = new Date().toISOString()

  const categoriesToSeed =
    legacyCategories.length > 0
      ? legacyCategories.map((category) => normalizeCategoryRecord(category, timestamp))
      : DEFAULT_CATEGORY_SEED.map((category) =>
          normalizeCategoryRecord(
            {
              ...category,
              id: crypto.randomUUID(),
              createdAt: timestamp,
              updatedAt: timestamp,
            },
            timestamp
          )
        )

  const categoryIdBySlug = new Map(categoriesToSeed.map((category) => [category.slug, category.id]))
  const categorySlugById = new Map(categoriesToSeed.map((category) => [category.id, category.slug]))

  const seededProductSource =
    legacyProducts.length > 0
      ? legacyProducts
      : DEFAULT_PRODUCT_SEED.map((product) => ({
          ...product,
          id: crypto.randomUUID(),
          createdAt: timestamp,
          updatedAt: timestamp,
          categoryId: categoryIdBySlug.get(product.categorySlug) || '',
        }))

  const productsToSeed = seededProductSource
    .map((product) =>
      normalizeProductRecord(product, categoryIdBySlug, categorySlugById, timestamp)
    )
    .filter((product) => product.categoryId)

  if (categoriesToSeed.length > 0) {
    await categoriesCollection.insertMany(categoriesToSeed)
  }

  if (productsToSeed.length > 0) {
    await productsCollection.insertMany(productsToSeed)
  }
}

export async function initializeCatalogStore() {
  if (!catalogSeedPromise) {
    catalogSeedPromise = seedCatalogCollections().catch((error) => {
      catalogSeedPromise = null
      throw error
    })
  }

  return catalogSeedPromise
}

async function findAllDocuments(collection, query = {}) {
  return collection.find(query, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray()
}

export async function readEnquiries() {
  return sortByNewest(await readJsonCollection(config.enquiriesFile))
}

export async function createEnquiry(payload) {
  const enquiries = await readEnquiries()
  const enquiry = createTimestampedRecord(payload, { status: 'new' })

  enquiries.unshift(enquiry)
  await writeJsonCollection(config.enquiriesFile, enquiries)

  return enquiry
}

export async function updateEnquiry(id, updates) {
  const enquiries = await readJsonCollection(config.enquiriesFile)
  const enquiry = enquiries.find((item) => item.id === id)

  if (!enquiry) {
    return null
  }

  Object.assign(enquiry, updates, { updatedAt: new Date().toISOString() })
  await writeJsonCollection(config.enquiriesFile, enquiries)

  return enquiry
}

export async function deleteEnquiry(id) {
  const enquiries = await readJsonCollection(config.enquiriesFile)
  const nextEnquiries = enquiries.filter((item) => item.id !== id)

  if (nextEnquiries.length === enquiries.length) {
    return false
  }

  await writeJsonCollection(config.enquiriesFile, nextEnquiries)
  return true
}

export async function readCategories() {
  await initializeCatalogStore()
  const categoriesCollection = await getCategoriesCollection()
  return findAllDocuments(categoriesCollection)
}

export async function createCategory(payload) {
  await initializeCatalogStore()
  const categoriesCollection = await getCategoriesCollection()
  const category = createTimestampedRecord(payload)

  await categoriesCollection.insertOne(category)
  return category
}

export async function deleteCategory(id) {
  await initializeCatalogStore()

  const [categoriesCollection, productsCollection] = await Promise.all([
    getCategoriesCollection(),
    getProductsCollection(),
  ])

  const linkedProductCount = await productsCollection.countDocuments({ categoryId: id })

  if (linkedProductCount > 0) {
    return {
      ok: false,
      reason: 'CATEGORY_HAS_PRODUCTS',
    }
  }

  const deleteResult = await categoriesCollection.deleteOne({ id })

  if (deleteResult.deletedCount === 0) {
    return {
      ok: false,
      reason: 'CATEGORY_NOT_FOUND',
    }
  }

  return { ok: true }
}

export async function updateCategory(id, payload) {
  await initializeCatalogStore()

  const [categoriesCollection, productsCollection] = await Promise.all([
    getCategoriesCollection(),
    getProductsCollection(),
  ])

  const existingCategory = await categoriesCollection.findOne({ id }, { projection: { _id: 0 } })

  if (!existingCategory) {
    return null
  }

  const updatedCategory = {
    ...existingCategory,
    ...payload,
    updatedAt: new Date().toISOString(),
  }

  await categoriesCollection.updateOne(
    { id },
    {
      $set: updatedCategory,
    }
  )

  if (existingCategory.slug !== updatedCategory.slug) {
    await productsCollection.updateMany(
      { categoryId: id },
      {
        $set: {
          categorySlug: updatedCategory.slug,
        },
      }
    )
  }

  return updatedCategory
}

export async function readProducts() {
  await initializeCatalogStore()
  const productsCollection = await getProductsCollection()
  return findAllDocuments(productsCollection)
}

export async function createProduct(payload) {
  await initializeCatalogStore()
  const productsCollection = await getProductsCollection()
  const product = createTimestampedRecord(payload)

  await productsCollection.insertOne(product)
  return product
}

export async function deleteProduct(id) {
  await initializeCatalogStore()
  const productsCollection = await getProductsCollection()
  const deleteResult = await productsCollection.deleteOne({ id })

  return deleteResult.deletedCount > 0
}

export async function updateProduct(id, payload) {
  await initializeCatalogStore()
  const productsCollection = await getProductsCollection()
  const existingProduct = await productsCollection.findOne({ id }, { projection: { _id: 0 } })

  if (!existingProduct) {
    return null
  }

  const updatedProduct = {
    ...existingProduct,
    ...payload,
    updatedAt: new Date().toISOString(),
  }

  await productsCollection.updateOne(
    { id },
    {
      $set: updatedProduct,
    }
  )

  return updatedProduct
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
