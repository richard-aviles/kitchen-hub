<template>
  <div class="flex-1 overflow-hidden flex flex-col">
    <div class="flex-1 overflow-y-auto p-4">
      <!-- Scanner area -->
      <div v-if="!product && !error">
        <div id="barcode-reader" class="w-full rounded-lg overflow-hidden mb-3"></div>
        <p v-if="scanning" class="text-sm text-center text-gray-500 dark:text-gray-400">
          Point your camera at a barcode...
        </p>
        <p v-else-if="loading" class="text-sm text-center text-gray-500 dark:text-gray-400">
          Looking up product...
        </p>
        <div v-if="!scanning && !loading" class="text-center">
          <button
            type="button"
            @click="startScanner"
            class="btn btn-primary"
          >
            Start Scanner
          </button>
          <!-- Manual barcode entry -->
          <div class="mt-4">
            <p class="text-xs text-gray-400 dark:text-gray-500 mb-2">Or enter barcode manually:</p>
            <div class="flex gap-2">
              <input
                v-model="manualBarcode"
                type="text"
                placeholder="e.g. 5901234123457"
                class="input flex-1"
                @keydown.enter="lookupManual"
              />
              <button
                type="button"
                @click="lookupManual"
                class="btn btn-secondary"
                :disabled="!manualBarcode.trim()"
              >
                Look up
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="text-center py-8">
        <p class="text-sm text-red-500 dark:text-red-400 mb-3">{{ error }}</p>
        <button type="button" @click="reset" class="btn btn-secondary">Try Again</button>
      </div>

      <!-- Product found -->
      <div v-if="product" class="space-y-3">
        <div class="text-center">
          <p class="font-medium text-gray-800 dark:text-gray-100">{{ product.name }}</p>
          <p v-if="product.brand" class="text-sm text-gray-500 dark:text-gray-400">{{ product.brand }}</p>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 text-center">Adjust nutrition if needed:</p>
        <div class="grid grid-cols-4 gap-2 text-center bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
          <div>
            <input
              v-model.number="editNutrition.calories"
              type="number"
              min="0"
              class="w-full text-center text-lg font-bold text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 rounded px-1 py-1"
            />
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Calories</div>
          </div>
          <div>
            <input
              v-model.number="editNutrition.protein"
              type="number"
              min="0"
              step="0.1"
              class="w-full text-center text-lg font-bold text-sky-600 dark:text-sky-400 bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 rounded px-1 py-1"
            />
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Protein (g)</div>
          </div>
          <div>
            <input
              v-model.number="editNutrition.carbs"
              type="number"
              min="0"
              step="0.1"
              class="w-full text-center text-lg font-bold text-violet-600 dark:text-violet-400 bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 rounded px-1 py-1"
            />
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Carbs (g)</div>
          </div>
          <div>
            <input
              v-model.number="editNutrition.fat"
              type="number"
              min="0"
              step="0.1"
              class="w-full text-center text-lg font-bold text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 rounded px-1 py-1"
            />
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Fat (g)</div>
          </div>
        </div>
        <p class="text-xs text-center text-gray-400 dark:text-gray-500">per {{ product.servingSize }}</p>

        <button
          type="button"
          @click="selectProduct"
          class="btn btn-primary w-full"
        >
          Select This Product
        </button>
        <button
          type="button"
          @click="reset"
          class="btn btn-secondary w-full"
        >
          Scan Another
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { lookupBarcode } from '../../services/openFoodFactsApi.js'

const emit = defineEmits(['select'])

const scanning = ref(false)
const loading = ref(false)
const error = ref(null)
const product = ref(null)
const manualBarcode = ref('')
const editNutrition = ref({ calories: 0, protein: 0, carbs: 0, fat: 0 })

let scanner = null

async function startScanner() {
  error.value = null
  product.value = null

  try {
    const { Html5Qrcode } = await import('html5-qrcode')
    scanner = new Html5Qrcode('barcode-reader')
    scanning.value = true

    await scanner.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.5
      },
      onScanSuccess
    )
  } catch (e) {
    scanning.value = false
    error.value = 'Could not access camera. Please check permissions or enter the barcode manually.'
  }
}

async function onScanSuccess(decodedText) {
  await stopScanner()
  await lookupProduct(decodedText)
}

async function lookupProduct(barcode) {
  loading.value = true
  error.value = null
  try {
    const result = await lookupBarcode(barcode)
    if (result) {
      product.value = result
      editNutrition.value = {
        calories: result.nutrition?.calories || 0,
        protein: result.nutrition?.protein || 0,
        carbs: result.nutrition?.carbs || 0,
        fat: result.nutrition?.fat || 0
      }
    } else {
      error.value = `Product not found for barcode: ${barcode}`
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function lookupManual() {
  if (!manualBarcode.value.trim()) return
  await lookupProduct(manualBarcode.value.trim())
}

async function stopScanner() {
  scanning.value = false
  if (scanner) {
    try {
      await scanner.stop()
    } catch {
      // Scanner may already be stopped
    }
    scanner.clear()
    scanner = null
  }
}

function selectProduct() {
  emit('select', {
    ...product.value,
    nutrition: { ...editNutrition.value }
  })
}

function reset() {
  error.value = null
  product.value = null
  manualBarcode.value = ''
}

onBeforeUnmount(() => {
  stopScanner()
})
</script>
