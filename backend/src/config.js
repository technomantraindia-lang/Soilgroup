import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return
  }

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/)

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!line || line.startsWith('#')) {
      continue
    }

    const separatorIndex = line.indexOf('=')

    if (separatorIndex === -1) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    let value = line.slice(separatorIndex + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

function splitOrigins(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

loadEnvFile(path.join(rootDir, '.env'))

export const config = {
  rootDir,
  publicDir: path.join(rootDir, 'public'),
  adminDir: path.join(rootDir, 'public', 'admin'),
  dataDir: path.join(rootDir, 'data'),
  enquiriesFile: path.join(rootDir, 'data', 'enquiries.json'),
  categoriesFile: path.join(rootDir, 'data', 'categories.json'),
  productsFile: path.join(rootDir, 'data', 'products.json'),
  port: Number(process.env.PORT || 4000),
  frontendOrigins: splitOrigins(
    process.env.FRONTEND_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173'
  ),
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  jwtSecret: process.env.JWT_SECRET || 'soilgroup-local-secret',
}
