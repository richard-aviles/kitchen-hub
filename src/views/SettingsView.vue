<template>
  <div class="p-4 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Settings</h1>

    <!-- Appearance Section -->
    <div class="card mb-4">
      <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Appearance</h2>
      <div class="flex items-center justify-between">
        <span class="text-gray-600 dark:text-gray-300">Dark mode</span>
        <button
          type="button"
          @click="toggleDark()"
          class="relative flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
          :class="isDark ? 'bg-slate-700 text-amber-400' : 'bg-gray-200 text-gray-600'"
        >
          <SunIcon v-if="!isDark" class="w-4 h-4" />
          <MoonIcon v-else class="w-4 h-4" />
          <span class="text-sm font-medium">{{ isDark ? 'On' : 'Off' }}</span>
        </button>
      </div>
    </div>

    <!-- App Install Section -->
    <div class="card mb-4">
      <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">App</h2>

      <div v-if="canInstall">
        <p class="text-gray-600 dark:text-gray-300 mb-3">
          Install KitchenHub for a full-screen app experience.
        </p>
        <button type="button" @click="handleInstall" class="btn btn-primary">
          <ArrowDownTrayIcon class="w-5 h-5 inline -mt-0.5 mr-1" />
          Install App
        </button>
      </div>

      <div v-else-if="isInstalled" class="flex items-center gap-2 text-green-600 dark:text-green-400">
        <CheckCircleIcon class="w-5 h-5" />
        <span>KitchenHub is installed</span>
      </div>

      <div v-else>
        <p class="text-gray-500 dark:text-gray-400 text-sm">
          Open in Chrome or Edge to install as an app, or use "Add to Home Screen" in Safari.
        </p>
      </div>
    </div>

    <!-- Google Account Section -->
    <div class="card mb-4">
      <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Google Account</h2>

      <!-- Disconnected state -->
      <template v-if="!settingsStore.isGoogleConnected">
        <p class="text-gray-600 dark:text-gray-300 mb-3">
          Connect to Google Drive to sync your data across devices.
        </p>
        <button
          type="button"
          @click="handleSignIn"
          :disabled="settingsStore.loading"
          class="btn btn-primary"
        >
          <template v-if="settingsStore.loading">
            <ArrowPathIcon class="w-5 h-5 inline -mt-0.5 mr-1 animate-spin" />
            Connecting...
          </template>
          <template v-else>
            Sign in with Google
          </template>
        </button>
        <p v-if="settingsStore.error" class="text-red-600 dark:text-red-400 text-sm mt-2">
          {{ settingsStore.error }}
        </p>
      </template>

      <!-- Connected state -->
      <template v-else>
        <div class="space-y-3">
          <!-- Email display -->
          <div class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <CheckCircleIcon class="w-5 h-5 text-green-500 flex-shrink-0" />
            <span class="text-sm">{{ settingsStore.settings.googleEmail || 'Connected' }}</span>
          </div>

          <!-- Last sync time -->
          <div class="text-sm text-gray-500 dark:text-gray-400">
            <template v-if="lastSyncTime">
              Last synced: {{ formatSyncTime(lastSyncTime) }}
            </template>
            <template v-else>
              Not yet synced
            </template>
          </div>

          <!-- Sync error -->
          <div v-if="syncError" class="text-sm text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-900/50 rounded p-2">
            {{ syncError }}
          </div>

          <!-- Sync Now button -->
          <button
            type="button"
            @click="triggerSync"
            :disabled="!canSync"
            class="btn btn-primary"
          >
            <template v-if="syncing">
              <ArrowPathIcon class="w-5 h-5 inline -mt-0.5 mr-1 animate-spin" />
              Syncing...
            </template>
            <template v-else>
              <ArrowPathIcon class="w-5 h-5 inline -mt-0.5 mr-1" />
              Sync Now
            </template>
          </button>

          <!-- Auto-sync toggle -->
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              :checked="settingsStore.settings.autoSync"
              @change="toggleAutoSync"
              class="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span class="text-sm text-gray-700 dark:text-gray-300">Auto-sync when data changes</span>
          </label>

          <!-- Sign out -->
          <button
            type="button"
            @click="handleSignOut"
            class="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Sign Out
          </button>
        </div>
      </template>
    </div>

    <!-- Data Management Section -->
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Data</h2>
      <p class="text-gray-600 dark:text-gray-300">
        Export and import your data.
      </p>
      <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">
        Phase 8 will add: export/import buttons, data backup options.
      </p>
    </div>
  </div>
</template>

<script setup>
/**
 * SettingsView
 *
 * App settings, install prompt, and Google account management.
 */
import { CheckCircleIcon, ArrowDownTrayIcon, ArrowPathIcon, SunIcon, MoonIcon } from '@heroicons/vue/24/outline'
import { useDark, useToggle } from '@vueuse/core'
import { usePwaInstall } from '../composables/usePwaInstall.js'
import { useSync } from '../composables/useSync.js'
import { useSettingsStore } from '../stores'

const isDark = useDark()
const toggleDark = useToggle(isDark)
const settingsStore = useSettingsStore()
const { canInstall, isInstalled, install } = usePwaInstall()
const { syncing, syncError, canSync, lastSyncTime, triggerSync } = useSync()

async function handleInstall() {
  await install()
}

async function handleSignIn() {
  await settingsStore.googleSignIn()
}

async function handleSignOut() {
  await settingsStore.googleSignOut()
}

function toggleAutoSync(event) {
  settingsStore.update({ autoSync: event.target.checked })
}

function formatSyncTime(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}
</script>
