<template>
  <header class="fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg backdrop-saturate-150 border-b border-gray-200 dark:border-slate-700 shadow-sm z-10">
    <div class="flex items-center justify-between h-14 px-4">
      <!-- App title -->
      <h1 class="text-xl font-bold text-primary-600 dark:text-primary-400">
        KitchenHub
      </h1>

      <!-- Status indicators -->
      <div class="flex items-center gap-2">
        <!-- Sync status indicator (only when Google connected) -->
        <div v-if="settingsStore.isGoogleConnected" class="flex items-center">
          <!-- Syncing: spinning arrow -->
          <ArrowPathIcon
            v-if="syncStatus === 'syncing'"
            class="w-4 h-4 text-primary-500 animate-spin"
            title="Syncing..."
          />
          <!-- Synced/idle: green check -->
          <CheckCircleIcon
            v-else-if="syncStatus === 'idle'"
            class="w-4 h-4 text-green-500"
            title="Synced"
          />
          <!-- Error: red warning -->
          <ExclamationTriangleIcon
            v-else-if="syncStatus === 'error'"
            class="w-4 h-4 text-red-500"
            title="Sync error"
          />
          <!-- Offline: gray cloud -->
          <CloudIcon
            v-else-if="syncStatus === 'offline'"
            class="w-4 h-4 text-gray-400"
            title="Offline"
          />
        </div>

        <!-- Online/Offline indicator -->
        <div
          class="flex items-center gap-1 text-sm"
          :class="isOnline ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'"
        >
          <span
            class="w-2 h-2 rounded-full"
            :class="isOnline ? 'bg-green-500' : 'bg-gray-400'"
          ></span>
          <span class="hidden sm:inline">{{ isOnline ? 'Online' : 'Offline' }}</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
/**
 * AppHeader
 *
 * Top header bar with app title and status indicators.
 * Shows online/offline status and sync state.
 */
import { useOnline } from '@vueuse/core'
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CloudIcon
} from '@heroicons/vue/24/outline'
import { useSync } from '../../composables/useSync.js'
import { useSettingsStore } from '../../stores'

const isOnline = useOnline()
const settingsStore = useSettingsStore()
const { syncStatus } = useSync()
</script>
