/**
 * Food Store
 *
 * Manages quick-add foods looked up via USDA or Open Food Facts APIs.
 * Caches foods in IndexedDB so they persist across sessions.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAllFoods, addFood as dbAddFood } from '../db/foods.js'
import { notifySyncNeeded } from '../composables/useSync.js'

export const useFoodStore = defineStore('foods', () => {
  // State
  const foods = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const getById = computed(() => (id) => foods.value.find(f => f.id === id))

  // Actions
  async function loadAll() {
    loading.value = true
    error.value = null
    try {
      foods.value = await getAllFoods()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function addOrUpdate(foodData) {
    const existing = foods.value.find(f => f.id === foodData.id)
    if (existing) return existing

    const now = new Date().toISOString()
    const food = {
      ...foodData,
      createdAt: foodData.createdAt || now,
      updatedAt: now
    }
    await dbAddFood(food)
    foods.value.push(food)
    notifySyncNeeded()
    return food
  }

  return {
    foods,
    loading,
    error,
    getById,
    loadAll,
    addOrUpdate
  }
})
