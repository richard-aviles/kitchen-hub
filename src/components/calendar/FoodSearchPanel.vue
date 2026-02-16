<template>
  <div class="flex-1 overflow-hidden flex flex-col">
    <!-- Search input -->
    <div class="p-4 border-b dark:border-slate-700">
      <input
        ref="searchInput"
        v-model="query"
        type="text"
        placeholder="Search foods (e.g. banana, chicken breast)..."
        class="input"
      />
    </div>

    <!-- Results -->
    <div class="flex-1 overflow-y-auto p-4">
      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-2"></div>
        <p class="text-sm text-gray-500 dark:text-gray-400">Searching foods...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-sm text-red-500 dark:text-red-400">{{ error }}</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="!query.trim()" class="text-center py-12">
        <MagnifyingGlassIcon class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p class="text-base font-medium text-gray-500 dark:text-gray-400 mb-1">Search for a food</p>
        <p class="text-sm text-gray-400 dark:text-gray-500">Type a food name to search the USDA database.</p>
      </div>

      <!-- No results -->
      <div v-else-if="results.length === 0 && !loading" class="text-center py-12">
        <p class="text-sm text-gray-500 dark:text-gray-400">No foods found for "{{ query }}"</p>
      </div>

      <!-- Results list -->
      <div v-else class="space-y-2">
        <button
          v-for="food in results"
          :key="food.id"
          type="button"
          @click="$emit('select', food)"
          class="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 dark:border-slate-600 dark:hover:border-primary-600 dark:hover:bg-primary-900/20 transition-colors"
        >
          <p class="font-medium text-gray-800 dark:text-gray-100 truncate">{{ food.name }}</p>
          <p v-if="food.brand" class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ food.brand }}</p>
          <div class="flex gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span class="text-amber-600 dark:text-amber-400 font-medium">{{ food.nutrition.calories }} cal</span>
            <span>P: {{ food.nutrition.protein }}g</span>
            <span>C: {{ food.nutrition.carbs }}g</span>
            <span>F: {{ food.nutrition.fat }}g</span>
            <span class="text-gray-400 dark:text-gray-500">per {{ food.servingSize }}</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { searchFoods } from '../../services/usdaApi.js'

defineEmits(['select'])

const query = ref('')
const results = ref([])
const loading = ref(false)
const error = ref(null)
const searchInput = ref(null)

const debouncedSearch = useDebounceFn(async (q) => {
  if (!q.trim()) {
    results.value = []
    return
  }

  loading.value = true
  error.value = null
  try {
    results.value = await searchFoods(q.trim())
  } catch (e) {
    error.value = e.message
    results.value = []
  } finally {
    loading.value = false
  }
}, 400)

watch(query, (val) => {
  if (!val.trim()) {
    results.value = []
    loading.value = false
    return
  }
  loading.value = true
  debouncedSearch(val)
})

function focus() {
  nextTick(() => searchInput.value?.focus())
}

defineExpose({ focus })
</script>
