import { MongoClient } from 'mongodb'
import { config } from './config.js'

const DEFAULT_DATABASE_NAME = 'soilgroup_website'

let clientPromise = null
let databasePromise = null
let databaseSetupPromise = null

function getDatabaseNameFromUri(uri) {
  try {
    const parsedUri = new URL(uri)
    const pathname = parsedUri.pathname.replace(/^\//, '').trim()
    return pathname || DEFAULT_DATABASE_NAME
  } catch {
    return DEFAULT_DATABASE_NAME
  }
}

function getDatabaseName() {
  return config.mongodbDatabaseName || getDatabaseNameFromUri(config.mongodbUri)
}

async function createMongoClient() {
  const client = new MongoClient(config.mongodbUri)
  await client.connect()
  return client
}

export async function getMongoClient() {
  if (!clientPromise) {
    clientPromise = createMongoClient().catch((error) => {
      clientPromise = null
      throw error
    })
  }

  return clientPromise
}

export async function getDatabase() {
  if (!databasePromise) {
    databasePromise = getMongoClient()
      .then((client) => client.db(getDatabaseName()))
      .catch((error) => {
        databasePromise = null
        throw error
      })
  }

  return databasePromise
}

export async function ensureDatabaseSetup() {
  if (!databaseSetupPromise) {
    databaseSetupPromise = (async () => {
      const database = await getDatabase()

      await Promise.all([
        database.collection('categories').createIndex({ slug: 1 }, { unique: true }),
        database.collection('products').createIndex({ slug: 1 }, { unique: true }),
        database.collection('products').createIndex({ categoryId: 1, status: 1 }),
        database.collection('products').createIndex({ createdAt: -1 }),
      ])

      return database
    })().catch((error) => {
      databaseSetupPromise = null
      throw error
    })
  }

  return databaseSetupPromise
}
