/**
 * Sync Engine
 *
 * Core sync logic using last-write-wins conflict resolution (DEC-009).
 * Uploads/downloads JSON files to/from Google Drive.
 *
 * Drive folder structure:
 *   KitchenHub/
 *   ├── recipes.json
 *   ├── mealplans.json
 *   ├── shopping.json
 *   └── sync-metadata.json
 */
import {
  findFile,
  uploadFile,
  updateFile,
  downloadFile
} from './googleDrive.js'
import {
  exportRecipes,
  importRecipes,
  exportMealPlans,
  importMealPlans,
  exportShopping,
  importShopping
} from './dataSerializer.js'

const DATA_FILES = [
  { name: 'recipes.json', exportFn: exportRecipes, importFn: importRecipes },
  { name: 'mealplans.json', exportFn: exportMealPlans, importFn: importMealPlans },
  { name: 'shopping.json', exportFn: exportShopping, importFn: importShopping }
]

const METADATA_FILE = 'sync-metadata.json'

// Dirty flag: set when local data changes, cleared after sync
let isDirty = false

/**
 * Mark local data as changed, needing sync.
 */
export function markDirty() {
  isDirty = true
}

/**
 * Check if local data has pending changes.
 */
export function hasPendingChanges() {
  return isDirty
}

/**
 * Upload or update a file in Drive. Finds existing file first.
 */
async function uploadOrUpdate(token, folderId, fileName, data) {
  const existing = await findFile(token, folderId, fileName)
  if (existing) {
    await updateFile(token, existing.id, data)
  } else {
    await uploadFile(token, folderId, fileName, data)
  }
}

/**
 * Download metadata from Drive.
 * @returns {{ lastModified: string } | null}
 */
async function downloadMetadata(token, folderId) {
  const file = await findFile(token, folderId, METADATA_FILE)
  if (!file) return null
  return downloadFile(token, file.id)
}

/**
 * Upload all local data to Drive.
 */
async function uploadAll(token, folderId) {
  for (const { name, exportFn } of DATA_FILES) {
    const data = await exportFn()
    await uploadOrUpdate(token, folderId, name, data)
  }

  // Update metadata with current timestamp
  const metadata = { lastModified: new Date().toISOString() }
  await uploadOrUpdate(token, folderId, METADATA_FILE, metadata)

  return metadata.lastModified
}

/**
 * Download all data from Drive into IndexedDB.
 */
async function downloadAll(token, folderId) {
  for (const { name, importFn } of DATA_FILES) {
    const file = await findFile(token, folderId, name)
    if (file) {
      const data = await downloadFile(token, file.id)
      await importFn(data)
    }
  }
}

/**
 * Core sync function. Implements last-write-wins (DEC-009).
 *
 * @param {string} token - Google access token
 * @param {string} folderId - Drive folder ID
 * @param {string|null} lastSyncTime - Last known sync time (ISO string)
 * @param {object} options
 * @param {Function} options.onStoresReload - Called after download to refresh Pinia stores
 * @returns {{ lastSyncTime: string }} New sync timestamp
 */
export async function sync(token, folderId, lastSyncTime, { onStoresReload } = {}) {
  // 1. Download metadata from Drive
  const driveMetadata = await downloadMetadata(token, folderId)

  // 2. Compare timestamps to decide direction
  const driveModified = driveMetadata?.lastModified
    ? new Date(driveMetadata.lastModified).getTime()
    : 0
  const localModified = lastSyncTime
    ? new Date(lastSyncTime).getTime()
    : 0

  let newSyncTime

  if (driveModified > localModified && !isDirty) {
    // Drive is newer and no local changes — download
    await downloadAll(token, folderId)
    newSyncTime = driveMetadata.lastModified

    // Refresh in-memory stores after importing
    if (onStoresReload) {
      await onStoresReload()
    }
  } else {
    // Local is newer, or first sync, or local has pending changes — upload
    newSyncTime = await uploadAll(token, folderId)
  }

  isDirty = false
  return { lastSyncTime: newSyncTime }
}
