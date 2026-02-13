/**
 * Google Auth Service
 *
 * Handles Google OAuth via Google Identity Services (GIS).
 * Token stored in module-level variable only (never IndexedDB).
 * Uses drive.file scope — only access files the app creates.
 */

const SCOPES = 'https://www.googleapis.com/auth/drive.file'

let tokenClient = null
let accessToken = null
let tokenExpiresAt = 0

/**
 * Wait for the GIS library to load.
 */
function waitForGis(timeout = 5000) {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve()
      return
    }
    const start = Date.now()
    const interval = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        clearInterval(interval)
        resolve()
      } else if (Date.now() - start > timeout) {
        clearInterval(interval)
        reject(new Error('Google Identity Services failed to load. Check your internet connection.'))
      }
    }, 100)
  })
}

/**
 * Initialize the token client. Call once on app startup.
 * @param {string} clientId - Google OAuth Client ID
 */
export async function initAuth(clientId) {
  if (!clientId || clientId === 'your-client-id-here.apps.googleusercontent.com') {
    console.warn('Google Client ID not configured. Set VITE_GOOGLE_CLIENT_ID in .env')
    return
  }

  await waitForGis()

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    callback: () => {} // overridden per-request in signIn/ensureToken
  })
}

/**
 * Request user sign-in via Google consent screen.
 * @returns {Promise<{ token: string, email: string }>}
 */
export function signIn() {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Google Auth not initialized. Check your Client ID in .env'))
      return
    }

    tokenClient.callback = async (response) => {
      if (response.error) {
        reject(new Error(response.error_description || response.error))
        return
      }

      accessToken = response.access_token
      // GIS tokens expire in ~3600s; track expiry with a 60s buffer
      tokenExpiresAt = Date.now() + (response.expires_in - 60) * 1000

      try {
        const email = await fetchUserEmail(accessToken)
        resolve({ token: accessToken, email })
      } catch (e) {
        resolve({ token: accessToken, email: null })
      }
    }

    tokenClient.requestAccessToken({ prompt: 'consent' })
  })
}

/**
 * Sign out: revoke the token and clear local state.
 */
export function signOut() {
  if (accessToken) {
    window.google?.accounts?.oauth2?.revoke(accessToken)
  }
  accessToken = null
  tokenExpiresAt = 0
}

/**
 * Get the current access token, or null if not signed in.
 */
export function getToken() {
  return accessToken
}

/**
 * Ensure we have a valid token. If expired/missing, silently request a new one.
 * @returns {Promise<string>} A valid access token
 */
export function ensureToken() {
  // Token still valid
  if (accessToken && Date.now() < tokenExpiresAt) {
    return Promise.resolve(accessToken)
  }

  // Try silent refresh
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Google Auth not initialized'))
      return
    }

    tokenClient.callback = (response) => {
      if (response.error) {
        accessToken = null
        tokenExpiresAt = 0
        reject(new Error('Session expired. Please sign in again.'))
        return
      }

      accessToken = response.access_token
      tokenExpiresAt = Date.now() + (response.expires_in - 60) * 1000
      resolve(accessToken)
    }

    // prompt: '' attempts silent refresh without user interaction
    tokenClient.requestAccessToken({ prompt: '' })
  })
}

/**
 * Fetch user email from Google's userinfo endpoint.
 */
async function fetchUserEmail(token) {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to fetch user info')
  const data = await res.json()
  return data.email
}
