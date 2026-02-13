/**
 * Shopping Store
 *
 * Manages shopping list: generated from meal plan + manual items.
 * Handles ingredient aggregation and scaling.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getAllShoppingItems,
  addShoppingItem,
  updateShoppingItem,
  deleteShoppingItem,
  clearAllShoppingItems
} from '../db/shopping.js'
import { notifySyncNeeded } from '../composables/useSync.js'

export const useShoppingStore = defineStore('shopping', () => {
  // State
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const uncheckedItems = computed(() =>
    items.value.filter(item => !item.checked)
  )

  const checkedItems = computed(() =>
    items.value.filter(item => item.checked)
  )

  const itemCount = computed(() => items.value.length)
  const uncheckedCount = computed(() => uncheckedItems.value.length)

  const itemsByCategory = computed(() => {
    const grouped = {}
    for (const item of items.value) {
      const cat = item.category || 'Other'
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push(item)
    }
    // Sort categories alphabetically, but put "Other" last
    const sorted = {}
    const keys = Object.keys(grouped).sort((a, b) => {
      if (a === 'Other') return 1
      if (b === 'Other') return -1
      return a.localeCompare(b)
    })
    for (const key of keys) {
      sorted[key] = grouped[key]
    }
    return sorted
  })

  // Actions
  async function loadAll() {
    loading.value = true
    error.value = null
    try {
      items.value = await getAllShoppingItems()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  /**
   * Generate shopping list from the current week's meal plan.
   * Aggregates ingredients across all meals, scaling by servings.
   */
  async function generateFromMealPlan(mealEntries, recipes) {
    loading.value = true
    error.value = null
    try {
      // Clear existing generated items (keep manual items)
      const manualItems = items.value.filter(i => i.source === 'manual')
      const manualItemsClone = manualItems.map(i => ({ ...i }))

      // Clear the DB
      await clearAllShoppingItems()

      // Aggregate ingredients from all meal entries
      const aggregated = {}

      for (const entry of mealEntries) {
        const recipe = recipes.find(r => r.id === entry.recipeId)
        if (!recipe || !recipe.ingredients) continue

        const recipeServings = recipe.servings || 1
        const scaleFactor = entry.servings / recipeServings

        for (const ing of recipe.ingredients) {
          if (!ing.name || !ing.name.trim()) continue

          const key = normalizeIngredientKey(ing.name, ing.unit)

          if (aggregated[key]) {
            aggregated[key].amount = addAmounts(aggregated[key].amount, ing.amount, scaleFactor)
          } else {
            aggregated[key] = {
              id: crypto.randomUUID(),
              name: ing.name.trim(),
              amount: scaleAmount(ing.amount, scaleFactor),
              unit: ing.unit || '',
              category: guessCategory(ing.name),
              checked: false,
              source: 'generated',
              notes: ''
            }
          }
        }
      }

      // Convert to array and persist
      const generatedItems = Object.values(aggregated)

      // Re-add manual items
      const allItems = [...generatedItems, ...manualItemsClone]

      for (const item of allItems) {
        await addShoppingItem(item)
      }

      items.value = allItems
      notifySyncNeeded()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function toggleItem(id) {
    const item = items.value.find(i => i.id === id)
    if (item) {
      item.checked = !item.checked
      await updateShoppingItem(id, { checked: item.checked })
      notifySyncNeeded()
    }
  }

  async function addManualItem({ name, amount, unit, category }) {
    const item = {
      id: crypto.randomUUID(),
      name: name.trim(),
      amount: amount || '',
      unit: unit || '',
      category: category || guessCategory(name),
      checked: false,
      source: 'manual',
      notes: ''
    }
    await addShoppingItem(item)
    items.value.push(item)
    notifySyncNeeded()
    return item
  }

  async function removeItem(id) {
    await deleteShoppingItem(id)
    items.value = items.value.filter(i => i.id !== id)
    notifySyncNeeded()
  }

  async function clearChecked() {
    const checked = items.value.filter(i => i.checked)
    for (const item of checked) {
      await deleteShoppingItem(item.id)
    }
    items.value = items.value.filter(i => !i.checked)
    notifySyncNeeded()
  }

  async function clearAll() {
    await clearAllShoppingItems()
    items.value = []
    notifySyncNeeded()
  }

  return {
    // State
    items,
    loading,
    error,
    // Getters
    uncheckedItems,
    checkedItems,
    itemCount,
    uncheckedCount,
    itemsByCategory,
    // Actions
    loadAll,
    generateFromMealPlan,
    toggleItem,
    addManualItem,
    removeItem,
    clearChecked,
    clearAll
  }
})

// --- Helper functions ---

/**
 * Normalize ingredient name + unit into a grouping key.
 * e.g. "Chicken Breast" + "lb" → "chicken breast|lb"
 */
function normalizeIngredientKey(name, unit) {
  return `${name.trim().toLowerCase()}|${(unit || '').trim().toLowerCase()}`
}

/**
 * Scale an amount string by a factor.
 * Handles numeric and non-numeric amounts.
 */
function scaleAmount(amount, factor) {
  if (!amount) return ''
  const num = parseFloat(amount)
  if (isNaN(num)) return amount
  const scaled = num * factor
  return formatAmount(scaled)
}

/**
 * Add a new amount (scaled) to an existing aggregated amount.
 */
function addAmounts(existingAmount, newAmount, scaleFactor) {
  const existing = parseFloat(existingAmount)
  const adding = parseFloat(newAmount)

  if (isNaN(existing) && isNaN(adding)) return existingAmount
  if (isNaN(existing)) return scaleAmount(newAmount, scaleFactor)
  if (isNaN(adding)) return existingAmount

  return formatAmount(existing + adding * scaleFactor)
}

/**
 * Format a number to a clean string (remove trailing zeros).
 */
function formatAmount(num) {
  if (Number.isInteger(num)) return String(num)
  // Round to 2 decimal places, remove trailing zeros
  return parseFloat(num.toFixed(2)).toString()
}

/**
 * Simple category guessing based on ingredient name.
 * Returns a reasonable grocery aisle category.
 */
function guessCategory(name) {
  const n = name.toLowerCase()

  const produce = ['lettuce', 'tomato', 'onion', 'garlic', 'pepper', 'carrot', 'celery', 'potato', 'broccoli', 'spinach', 'kale', 'avocado', 'lemon', 'lime', 'apple', 'banana', 'berry', 'berries', 'orange', 'cucumber', 'zucchini', 'mushroom', 'ginger', 'cilantro', 'parsley', 'basil', 'mint', 'corn', 'cabbage', 'squash', 'pea', 'bean sprout', 'scallion', 'green onion', 'jalapeño', 'jalapeno', 'herb']
  const dairy = ['milk', 'cheese', 'butter', 'yogurt', 'cream', 'sour cream', 'egg', 'eggs']
  const meat = ['chicken', 'beef', 'pork', 'turkey', 'lamb', 'fish', 'salmon', 'shrimp', 'bacon', 'sausage', 'steak', 'ground']
  const pantry = ['flour', 'sugar', 'salt', 'oil', 'vinegar', 'sauce', 'paste', 'rice', 'pasta', 'noodle', 'bread', 'tortilla', 'can', 'broth', 'stock', 'honey', 'syrup', 'vanilla', 'baking', 'cornstarch', 'soy sauce', 'spice', 'cumin', 'paprika', 'cinnamon', 'oregano', 'thyme', 'bay leaf', 'pepper flake']
  const frozen = ['frozen', 'ice cream']
  const beverages = ['juice', 'water', 'soda', 'coffee', 'tea']

  if (produce.some(p => n.includes(p))) return 'Produce'
  if (dairy.some(d => n.includes(d))) return 'Dairy'
  if (meat.some(m => n.includes(m))) return 'Meat & Seafood'
  if (frozen.some(f => n.includes(f))) return 'Frozen'
  if (beverages.some(b => n.includes(b))) return 'Beverages'
  if (pantry.some(p => n.includes(p))) return 'Pantry'

  return 'Other'
}
