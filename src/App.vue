<template>
  <div class="min-h-screen bg-gray-100 dark:bg-slate-900">
    <!-- Header -->
    <AppHeader />
    <ConnectionToast />

    <!-- Main content area - with padding for fixed header/nav -->
    <main class="pt-14 pb-20">
      <router-view v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </main>

    <!-- Bottom navigation -->
    <AppNavigation />
  </div>
</template>

<script setup>
/**
 * App.vue - Root Component
 *
 * Provides the main layout structure:
 * - Fixed header at top
 * - Main content area (router-view)
 * - Fixed bottom navigation
 *
 * Initializes settings from IndexedDB and sets up auto-sync on mount.
 */
import { onMounted, watchEffect } from 'vue'
import { useDark } from '@vueuse/core'
import AppHeader from './components/common/AppHeader.vue'
import AppNavigation from './components/common/AppNavigation.vue'
import ConnectionToast from './components/common/ConnectionToast.vue'
import { useSettingsStore } from './stores'
import { useSync } from './composables/useSync.js'

const settingsStore = useSettingsStore()
const { initAutoSync } = useSync()
const isDark = useDark()

watchEffect(() => {
  const color = isDark.value ? '#1e293b' : '#10b981'
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color)
})

onMounted(async () => {
  await settingsStore.load()
  initAutoSync()
})
</script>
