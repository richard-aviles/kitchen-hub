/**
 * Photo Service
 *
 * Orchestrates photo resize, upload to Google Drive, IndexedDB caching,
 * and retrieval with cache-first strategy.
 */
import { getPhotoByRecipeId, savePhoto, deletePhotoByRecipeId } from '../db/photos.js'
import { getOrCreateFolder, uploadImage, updateImage, downloadImage, deleteFile, findFile } from './googleDrive.js'
import { ensureToken } from './googleAuth.js'

const PHOTOS_FOLDER = 'photos'
const MAX_SIZE = 800
const JPEG_QUALITY = 0.8

/**
 * Resize an image file to max dimension and compress as JPEG.
 * @param {File|Blob} file - Original image
 * @returns {Promise<Blob>} Resized JPEG blob
 */
export function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img
      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width > height) {
          height = Math.round((height / width) * MAX_SIZE)
          width = MAX_SIZE
        } else {
          width = Math.round((width / height) * MAX_SIZE)
          height = MAX_SIZE
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Failed to compress image'))
        },
        'image/jpeg',
        JPEG_QUALITY
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

/**
 * Upload a photo for a recipe: resize, cache locally, upload to Drive.
 * @param {string} appFolderId - KitchenHub root folder ID in Drive
 * @param {string} recipeId
 * @param {File|Blob} file - Original image from file input
 * @param {string|null} existingDriveFileId - If replacing an existing photo
 * @returns {Promise<string>} Drive file ID
 */
export async function uploadPhoto(appFolderId, recipeId, file, existingDriveFileId = null) {
  const blob = await resizeImage(file)
  const token = await ensureToken()

  // Get or create the photos subfolder inside KitchenHub folder
  const photosFolderId = await getOrCreatePhotosFolder(token, appFolderId)

  let driveFileId
  if (existingDriveFileId) {
    // Update existing file
    await updateImage(token, existingDriveFileId, blob)
    driveFileId = existingDriveFileId
  } else {
    // Upload new file
    const result = await uploadImage(token, photosFolderId, `${recipeId}.jpg`, blob)
    driveFileId = result.id
  }

  // Cache locally
  await savePhoto({
    id: recipeId,
    recipeId,
    blob,
    driveFileId,
    updatedAt: new Date().toISOString()
  })

  return driveFileId
}

/**
 * Get a displayable URL for a recipe's photo.
 * Cache-first: IndexedDB → Drive download → cache.
 * @returns {Promise<string|null>} Object URL or null if no photo
 */
export async function getPhotoUrl(recipeId, driveFileId) {
  if (!driveFileId) return null

  // Try local cache first
  const cached = await getPhotoByRecipeId(recipeId)
  if (cached?.blob) {
    return URL.createObjectURL(cached.blob)
  }

  // Download from Drive and cache
  try {
    const token = await ensureToken()
    const blob = await downloadImage(token, driveFileId)

    await savePhoto({
      id: recipeId,
      recipeId,
      blob,
      driveFileId,
      updatedAt: new Date().toISOString()
    })

    return URL.createObjectURL(blob)
  } catch {
    // Offline or token expired — no photo available
    return null
  }
}

/**
 * Delete a recipe's photo from Drive and local cache.
 */
export async function deletePhoto(recipeId, driveFileId) {
  // Delete from local cache
  await deletePhotoByRecipeId(recipeId)

  // Delete from Drive if we have a file ID
  if (driveFileId) {
    try {
      const token = await ensureToken()
      await deleteFile(token, driveFileId)
    } catch {
      // Offline or already deleted — not critical
    }
  }
}

/**
 * Revoke an object URL to free memory.
 */
export function revokePhotoUrl(url) {
  if (url) URL.revokeObjectURL(url)
}

/**
 * Get or create the photos subfolder inside the app's root Drive folder.
 */
async function getOrCreatePhotosFolder(token, appFolderId) {
  // Look for existing photos folder inside the app folder
  const q = `name='${PHOTOS_FOLDER}' and '${appFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id)&spaces=drive`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error(`Drive API error: ${res.status}`)

  const data = await res.json()
  if (data.files?.length > 0) return data.files[0].id

  // Create photos subfolder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: PHOTOS_FOLDER,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [appFolderId]
    })
  })
  if (!createRes.ok) throw new Error(`Failed to create photos folder: ${createRes.status}`)

  const created = await createRes.json()
  return created.id
}
