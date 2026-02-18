/**
 * Photos Data Access Layer
 *
 * CRUD operations for the photos IndexedDB table.
 * Photos are cached locally as blobs with a reference to their Google Drive file ID.
 */
import db from './index.js'

/**
 * Get cached photo by recipe ID.
 * @returns {{ id, recipeId, blob, driveFileId, updatedAt } | undefined}
 */
export async function getPhotoByRecipeId(recipeId) {
  return db.photos.where('recipeId').equals(recipeId).first()
}

/**
 * Save or update a photo in the local cache.
 */
export async function savePhoto({ id, recipeId, blob, driveFileId, updatedAt }) {
  await db.photos.put({ id, recipeId, blob, driveFileId, updatedAt })
}

/**
 * Delete cached photo by recipe ID.
 */
export async function deletePhotoByRecipeId(recipeId) {
  await db.photos.where('recipeId').equals(recipeId).delete()
}
