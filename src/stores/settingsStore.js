/**
 * Settings Store
 *
 * Manages app settings and Google authentication state.
 * Persists settings to IndexedDB via the settings table.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import db from '../db/index.js'
import { initAuth, signIn, signOut as authSignOut } from '../services/googleAuth.js'

const SETTINGS_KEY = 'appSettings'

export const useSettingsStore = defineStore('settings', () => {
  // State
  const settings = ref({
    // Google account
    googleConnected: false,
    googleEmail: null,
    lastSyncTime: null,
    driveFolderId: null,

    // Sync preferences
    autoSync: true,

    // Display preferences
    theme: 'light',

    // Default values
    defaultServings: 4,
    shoppingDateRange: 7  // days
  })

  const loading = ref(false)
  const error = ref(null)

  // Getters
  const isGoogleConnected = computed(() => settings.value.googleConnected)
  const syncEnabled = computed(() =>
    settings.value.googleConnected && settings.value.autoSync
  )

  // Actions
  async function load() {
    loading.value = true
    error.value = null
    try {
      const saved = await db.settings.get(SETTINGS_KEY)
      if (saved) {
        // Merge saved settings over defaults (preserves new fields added later)
        const { key, ...savedSettings } = saved
        settings.value = { ...settings.value, ...savedSettings }
      }

      // Initialize Google Auth if we have a client ID
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
      if (clientId) {
        await initAuth(clientId)
      }
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function update(updates) {
    settings.value = { ...settings.value, ...updates }
    await saveSettings()
  }

  async function saveSettings() {
    try {
      await db.settings.put({ key: SETTINGS_KEY, ...settings.value })
    } catch (e) {
      console.error('Failed to save settings:', e)
    }
  }

  async function googleSignIn() {
    loading.value = true
    error.value = null
    try {
      const { token, email } = await signIn()
      settings.value.googleConnected = true
      settings.value.googleEmail = email
      await saveSettings()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function googleSignOut() {
    authSignOut()
    settings.value.googleConnected = false
    settings.value.googleEmail = null
    settings.value.driveFolderId = null
    await saveSettings()
  }

  return {
    // State
    settings,
    loading,
    error,
    // Getters
    isGoogleConnected,
    syncEnabled,
    // Actions
    load,
    update,
    googleSignIn,
    googleSignOut
  }
})
