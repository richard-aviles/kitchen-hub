/**
 * usePwaInstall
 *
 * Captures the browser's install prompt event and provides
 * reactive state for showing an install button in the UI.
 *
 * Usage:
 *   const { canInstall, isInstalled, install } = usePwaInstall()
 */
import { ref, onMounted, onUnmounted } from 'vue'

// Module-level so it persists across component mounts
let deferredPrompt = null

export function usePwaInstall() {
  const canInstall = ref(false)
  const isInstalled = ref(false)

  function onBeforeInstallPrompt(e) {
    e.preventDefault()
    deferredPrompt = e
    canInstall.value = true
  }

  function onAppInstalled() {
    canInstall.value = false
    isInstalled.value = true
    deferredPrompt = null
  }

  async function install() {
    if (!deferredPrompt) return false
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    deferredPrompt = null
    canInstall.value = false
    return outcome === 'accepted'
  }

  onMounted(() => {
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)

    // Check if already running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      isInstalled.value = true
    }
  })

  onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.removeEventListener('appinstalled', onAppInstalled)
  })

  return { canInstall, isInstalled, install }
}
