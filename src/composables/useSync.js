/**
 * useSync Composable
 *
 * Provides reactive sync state, manual/auto sync, and debounced queue.
 * Used by SettingsView for manual sync and AppHeader for status display.
 */
import { ref, computed, watch } from 'vue'
import { useOnline } from '@vueuse/core'
import { useSettingsStore, useRecipeStore, useMealPlanStore, useShoppingStore, useFoodStore } from '../stores'
import { ensureToken } from '../services/googleAuth.js'
import { getOrCreateFolder } from '../services/googleDrive.js'
import { sync, markDirty, hasPendingChanges } from '../services/syncEngine.js'

const syncing = ref(false)
const syncError = ref(null)

// Debounce timer
let debounceTimer = null
const DEBOUNCE_MS = 5000

/**
 * Computed sync status for UI display.
 */
function useSyncStatus() {
  const isOnline = useOnline()
  const settingsStore = useSettingsStore()

  const syncStatus = computed(() => {
    if (!settingsStore.isGoogleConnected) return 'disconnected'
    if (!isOnline.value) return 'offline'
    if (syncing.value) return 'syncing'
    if (syncError.value) return 'error'
    return 'idle'
  })

  const canSync = computed(() =>
    isOnline.value &&
    settingsStore.isGoogleConnected &&
    !syncing.value
  )

  return { syncStatus, canSync, isOnline }
}

/**
 * Trigger a sync operation. Handles token refresh, folder lookup, and store reload.
 */
async function triggerSync() {
  const settingsStore = useSettingsStore()

  if (!settingsStore.isGoogleConnected || syncing.value) return

  syncing.value = true
  syncError.value = null

  try {
    // Ensure we have a valid token
    const token = await ensureToken()

    // Get or create the KitchenHub folder (cached in settings)
    let folderId = settingsStore.settings.driveFolderId
    if (!folderId) {
      folderId = await getOrCreateFolder(token, 'KitchenHub')
      await settingsStore.update({ driveFolderId: folderId })
    }

    // Run sync
    const result = await sync(token, folderId, settingsStore.settings.lastSyncTime, {
      onStoresReload: reloadStores
    })

    // Persist new sync time
    await settingsStore.update({ lastSyncTime: result.lastSyncTime })
  } catch (e) {
    console.error('Sync failed:', e)
    syncError.value = friendlyError(e.message)
  } finally {
    syncing.value = false
  }
}

/**
 * Reload all Pinia stores from IndexedDB after a download sync.
 */
async function reloadStores() {
  const recipeStore = useRecipeStore()
  const mealPlanStore = useMealPlanStore()
  const shoppingStore = useShoppingStore()
  const foodStore = useFoodStore()

  await recipeStore.loadAll()
  if (mealPlanStore.currentWeekStart) {
    await mealPlanStore.loadWeek(mealPlanStore.currentWeekStart)
  }
  await shoppingStore.loadAll()
  await foodStore.loadAll()
}

/**
 * Queue a debounced sync. Called by stores after mutations.
 * Waits 5s to batch rapid changes into a single sync.
 */
function queueSync() {
  const settingsStore = useSettingsStore()

  markDirty()

  if (!settingsStore.syncEnabled) return

  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    triggerSync()
  }, DEBOUNCE_MS)
}

/**
 * Initialize auto-sync: watch for online reconnection.
 * Call once from App.vue on mount.
 */
function initAutoSync() {
  const isOnline = useOnline()
  const settingsStore = useSettingsStore()

  watch(isOnline, (online, wasOnline) => {
    // Sync when reconnecting (was offline, now online)
    if (online && !wasOnline && settingsStore.syncEnabled) {
      triggerSync()
    }
  })
}

/**
 * Convert raw API errors to user-friendly messages.
 */
function friendlyError(message) {
  if (message.includes('401') || message.includes('expired')) {
    return 'Session expired. Please sign in again.'
  }
  if (message.includes('403')) {
    return 'Permission denied. Try signing out and back in.'
  }
  if (message.includes('404')) {
    return 'Drive folder not found. Try syncing again.'
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'Network error. Check your connection and try again.'
  }
  return message
}

/**
 * Main composable export.
 */
export function useSync() {
  const { syncStatus, canSync } = useSyncStatus()
  const settingsStore = useSettingsStore()

  const lastSyncTime = computed(() => settingsStore.settings.lastSyncTime)

  return {
    syncing,
    syncError,
    syncStatus,
    canSync,
    lastSyncTime,
    triggerSync,
    queueSync,
    initAutoSync
  }
}

/**
 * Notify that local data changed. Called by stores after mutations.
 * Triggers debounced auto-sync if enabled.
 */
export function notifySyncNeeded() {
  queueSync()
}
