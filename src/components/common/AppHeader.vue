<template>
  <header class="fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg backdrop-saturate-150 border-b border-gray-200 dark:border-slate-700 shadow-sm z-10">
    <div class="flex items-center justify-between h-14 px-4">
      <!-- App title with floating particles -->
      <div class="relative flex items-center">
        <!-- Floating particles -->
        <div class="particle particle-1"></div>
        <div class="particle particle-2"></div>
        <div class="particle particle-3"></div>
        <div class="particle particle-4"></div>
        <div class="particle particle-5"></div>
        <div class="particle particle-6"></div>
        <div class="particle particle-7"></div>
        <div class="particle particle-8"></div>
        <h1 class="text-2xl font-extrabold tracking-wide logo-gradient relative z-[1]">
          KitchenHub
        </h1>
      </div>

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
 * Top header bar with app title, floating particle logo, and status indicators.
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

<style scoped>
/* Gradient text */
.logo-gradient {
  background: linear-gradient(to right, #047857, #10b981, #6ee7b7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
:root.dark .logo-gradient {
  background: linear-gradient(to right, #34d399, #6ee7b7, #a7f3d0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Particle base */
.particle {
  position: absolute;
  border-radius: 50%;
  z-index: 0;
}

/* Individual particles — top row */
.particle-1 { width: 8px;  height: 8px;  top: -10px; left: 4px;   background: #34d399; opacity: 0.8;  animation: pfloat1 2.5s ease-in-out infinite; }
.particle-2 { width: 6px;  height: 6px;  top: -14px; left: 36px;  background: #6ee7b7; opacity: 0.7;  animation: pfloat2 2.0s ease-in-out infinite 0.3s; }
.particle-3 { width: 10px; height: 10px; top: -8px;  left: 72px;  background: #10b981; opacity: 0.55; animation: pfloat3 3.0s ease-in-out infinite 0.7s; }
.particle-4 { width: 7px;  height: 7px;  top: -16px; left: 108px; background: #34d399; opacity: 0.75; animation: pfloat4 2.2s ease-in-out infinite 0.1s; }
.particle-5 { width: 8px;  height: 8px;  top: -6px;  left: 140px; background: #6ee7b7; opacity: 0.6;  animation: pfloat5 2.8s ease-in-out infinite 0.5s; }

/* Bottom row */
.particle-6 { width: 5px; height: 5px; bottom: -8px;  left: 16px;  background: #a7f3d0; opacity: 0.5;  animation: pfloat3 3.0s ease-in-out infinite; }
.particle-7 { width: 6px; height: 6px; bottom: -10px; left: 60px;  background: #10b981; opacity: 0.4;  animation: pfloat1 2.5s ease-in-out infinite; }
.particle-8 { width: 5px; height: 5px; bottom: -6px;  left: 120px; background: #34d399; opacity: 0.45; animation: pfloat4 2.2s ease-in-out infinite 0.3s; }

@keyframes pfloat1 { 0%,100% { transform: translateY(0); }    50% { transform: translateY(-6px); } }
@keyframes pfloat2 { 0%,100% { transform: translateY(0); }    50% { transform: translateY(-8px); } }
@keyframes pfloat3 { 0%,100% { transform: translateY(-3px); } 50% { transform: translateY(4px); } }
@keyframes pfloat4 { 0%,100% { transform: translateY(2px); }  50% { transform: translateY(-5px); } }
@keyframes pfloat5 { 0%,100% { transform: translateY(-1px); } 50% { transform: translateY(-7px); } }
</style>
