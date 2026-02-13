/**
 * Recipe Store
 *
 * Manages recipe data: list, add, update, delete operations.
 * Data is persisted in IndexedDB via Dexie.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getAllRecipes,
  addRecipe,
  updateRecipe,
  deleteRecipe
} from '../db/recipes.js'
import { notifySyncNeeded } from '../composables/useSync.js'

export const useRecipeStore = defineStore('recipes', () => {
  // State
  const recipes = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const recipeCount = computed(() => recipes.value.length)

  const getById = computed(() => {
    return (id) => recipes.value.find(r => r.id === id)
  })

  const getByMealType = computed(() => {
    return (mealType) => recipes.value.filter(r =>
      r.tags?.mealType?.includes(mealType)
    )
  })

  // Actions
  async function loadAll() {
    loading.value = true
    error.value = null
    try {
      recipes.value = await getAllRecipes()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function add(recipeData) {
    const now = new Date().toISOString()
    const recipe = {
      id: crypto.randomUUID(),
      ...recipeData,
      photoId: null,
      createdAt: now,
      updatedAt: now
    }
    await addRecipe(recipe)
    recipes.value.push(recipe)
    notifySyncNeeded()
    return recipe
  }

  async function update(id, updates) {
    const now = new Date().toISOString()
    const updatedFields = { ...updates, updatedAt: now }
    const updated = await updateRecipe(id, updatedFields)
    const index = recipes.value.findIndex(r => r.id === id)
    if (index !== -1) {
      recipes.value[index] = updated
    }
    notifySyncNeeded()
    return updated
  }

  async function remove(id) {
    await deleteRecipe(id)
    recipes.value = recipes.value.filter(r => r.id !== id)
    notifySyncNeeded()
  }

  return {
    // State
    recipes,
    loading,
    error,
    // Getters
    recipeCount,
    getById,
    getByMealType,
    // Actions
    loadAll,
    add,
    update,
    remove
  }
})
