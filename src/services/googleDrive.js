/**
 * Google Drive API Wrapper
 *
 * All functions take a token as first arg and use fetch() with Bearer header.
 * Only accesses files created by this app (drive.file scope).
 */

const BASE_URL = 'https://www.googleapis.com/drive/v3/files'
const UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files'

function headers(token) {
  return { Authorization: `Bearer ${token}` }
}

/**
 * Search for a folder by name in the user's Drive.
 * @returns {{ id: string } | null}
 */
export async function findFolder(token, name) {
  const q = `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
  const url = `${BASE_URL}?q=${encodeURIComponent(q)}&fields=files(id,name)&spaces=drive`

  const res = await fetch(url, { headers: headers(token) })
  if (!res.ok) throw new Error(`Drive API error: ${res.status}`)

  const data = await res.json()
  return data.files?.length > 0 ? { id: data.files[0].id } : null
}

/**
 * Create a folder in the user's Drive root.
 * @returns {{ id: string }}
 */
export async function createFolder(token, name) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      ...headers(token),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name,
      mimeType: 'application/vnd.google-apps.folder'
    })
  })
  if (!res.ok) throw new Error(`Failed to create folder: ${res.status}`)

  const data = await res.json()
  return { id: data.id }
}

/**
 * Find existing folder or create a new one. Returns folder ID.
 * @returns {string} Folder ID
 */
export async function getOrCreateFolder(token, name) {
  const existing = await findFolder(token, name)
  if (existing) return existing.id

  const created = await createFolder(token, name)
  return created.id
}

/**
 * Find a file by name within a specific folder.
 * @returns {{ id: string } | null}
 */
export async function findFile(token, folderId, fileName) {
  const q = `name='${fileName}' and '${folderId}' in parents and trashed=false`
  const url = `${BASE_URL}?q=${encodeURIComponent(q)}&fields=files(id,name,modifiedTime)&spaces=drive`

  const res = await fetch(url, { headers: headers(token) })
  if (!res.ok) throw new Error(`Drive API error: ${res.status}`)

  const data = await res.json()
  return data.files?.length > 0 ? { id: data.files[0].id, modifiedTime: data.files[0].modifiedTime } : null
}

/**
 * Upload a new JSON file to a folder using multipart upload.
 * @param {object|string} data - JSON data to upload
 * @returns {{ id: string }}
 */
export async function uploadFile(token, folderId, fileName, data) {
  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    parents: [folderId]
  }

  const body = JSON.stringify(typeof data === 'string' ? data : data)
  const boundary = '---kitchenhub_boundary'

  const multipartBody =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: application/json\r\n\r\n` +
    `${body}\r\n` +
    `--${boundary}--`

  const res = await fetch(`${UPLOAD_URL}?uploadType=multipart&fields=id`, {
    method: 'POST',
    headers: {
      ...headers(token),
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartBody
  })
  if (!res.ok) throw new Error(`Failed to upload file: ${res.status}`)

  const result = await res.json()
  return { id: result.id }
}

/**
 * Update an existing file's content.
 * @param {object|string} data - JSON data to upload
 */
export async function updateFile(token, fileId, data) {
  const body = JSON.stringify(typeof data === 'string' ? data : data)

  const res = await fetch(`${UPLOAD_URL}/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: {
      ...headers(token),
      'Content-Type': 'application/json'
    },
    body
  })
  if (!res.ok) throw new Error(`Failed to update file: ${res.status}`)
}

/**
 * Download a file's content and parse as JSON.
 * @returns {object} Parsed JSON data
 */
export async function downloadFile(token, fileId) {
  const res = await fetch(`${BASE_URL}/${fileId}?alt=media`, {
    headers: headers(token)
  })
  if (!res.ok) throw new Error(`Failed to download file: ${res.status}`)

  return res.json()
}
