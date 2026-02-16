/**
 * Meal Plan Store
 *
 * Manages meal planning: weekly calendar entries.
 * Each entry links a recipe to a specific date and meal slot.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { startOfWeek, endOfWeek, format } from 'date-fns'
import {
  getMealPlansForWeek,
  addMealPlan,
  updateMealPlan,
  deleteMealPlan
} from '../db/mealPlans.js'
import { notifySyncNeeded } from '../composables/useSync.js'

export const useMealPlanStore = defineStore('mealPlan', () => {
  // State
  const entries = ref([])
  const currentWeekStart = ref(null)  // Date object for start of displayed week
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const weekEntries = computed(() => {
    if (!currentWeekStart.value) return []
    const start = format(currentWeekStart.value, 'yyyy-MM-dd')
    const end = format(endOfWeek(currentWeekStart.value), 'yyyy-MM-dd')
    return entries.value.filter(e => e.date >= start && e.date <= end)
  })

  const getEntriesForDate = computed(() => {
    return (date) => entries.value.filter(e => e.date === date)
  })

  const getEntriesForSlot = computed(() => {
    return (date, slot) => entries.value.filter(e =>
      e.date === date && e.slot === slot
    )
  })

  // Actions
  async function loadWeek(weekStart) {
    loading.value = true
    error.value = null
    try {
      currentWeekStart.value = weekStart
      const start = format(weekStart, 'yyyy-MM-dd')
      const end = format(endOfWeek(weekStart), 'yyyy-MM-dd')
      entries.value = await getMealPlansForWeek(start, end)
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function addMeal({ recipeId, foodId, date, slot, servings }) {
    const now = new Date().toISOString()
    const entry = {
      id: crypto.randomUUID(),
      date,
      slot,
      servings: servings || 1,
      createdAt: now,
      updatedAt: now
    }
    if (foodId) {
      entry.foodId = foodId
    } else {
      entry.recipeId = recipeId
    }
    await addMealPlan(entry)
    entries.value.push(entry)
    notifySyncNeeded()
    return entry
  }

  async function updateMeal(id, updates) {
    const now = new Date().toISOString()
    const updatedFields = { ...updates, updatedAt: now }
    const updated = await updateMealPlan(id, updatedFields)
    const index = entries.value.findIndex(e => e.id === id)
    if (index !== -1) {
      entries.value[index] = updated
    }
    notifySyncNeeded()
    return updated
  }

  async function removeMeal(id) {
    await deleteMealPlan(id)
    entries.value = entries.value.filter(e => e.id !== id)
    notifySyncNeeded()
  }

  async function moveMeal(id, newDate, newSlot) {
    const now = new Date().toISOString()
    const updates = { date: newDate, slot: newSlot, updatedAt: now }
    await updateMealPlan(id, updates)
    const index = entries.value.findIndex(e => e.id === id)
    if (index !== -1) {
      entries.value[index] = { ...entries.value[index], ...updates }
    }
    notifySyncNeeded()
  }

  return {
    // State
    entries,
    currentWeekStart,
    loading,
    error,
    // Getters
    weekEntries,
    getEntriesForDate,
    getEntriesForSlot,
    // Actions
    loadWeek,
    addMeal,
    updateMeal,
    removeMeal,
    moveMeal
  }
})
