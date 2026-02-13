<template>
  <Transition name="toast">
    <div
      v-if="showToast"
      class="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-medium"
      :class="isOnline ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300'"
    >
      {{ isOnline ? 'Back online' : 'Offline — everything still works' }}
    </div>
  </Transition>
</template>

<script setup>
/**
 * ConnectionToast
 *
 * Shows a brief toast notification when network status changes.
 * Auto-dismisses after 3 seconds. Skips initial page load.
 */
import { ref, watch } from 'vue'
import { useOnline } from '@vueuse/core'

const isOnline = useOnline()
const showToast = ref(false)
let timeoutId = null
let isFirstLoad = true

watch(isOnline, () => {
  if (isFirstLoad) {
    isFirstLoad = false
    return
  }

  showToast.value = true
  clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    showToast.value = false
  }, 3000)
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px);
}
</style>
