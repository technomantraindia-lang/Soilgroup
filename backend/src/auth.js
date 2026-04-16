import crypto from 'node:crypto'
import { config } from './config.js'

function signToken(value) {
  return crypto.createHmac('sha256', config.jwtSecret).update(value).digest('base64url')
}

export function createAuthToken(username) {
  const payload = {
    sub: username,
    exp: Date.now() + 12 * 60 * 60 * 1000,
  }

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = signToken(encodedPayload)

  return `${encodedPayload}.${signature}`
}

export function verifyAuthToken(token) {
  if (!token || !token.includes('.')) {
    return null
  }

  const [encodedPayload, signature] = token.split('.')

  if (!encodedPayload || !signature) {
    return null
  }

  if (signToken(encodedPayload) !== signature) {
    return null
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'))

    if (!payload?.exp || payload.exp < Date.now()) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

export function authenticateAdmin(username, password) {
  return username === config.adminUsername && password === config.adminPassword
}

export function readBearerToken(headers) {
  const authorization = headers.authorization || ''

  if (!authorization.startsWith('Bearer ')) {
    return null
  }

  return authorization.slice(7).trim()
}
