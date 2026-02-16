/**
 * useNutritionCalc
 *
 * Composable that computes daily and weekly nutrition summaries
 * from meal plan entries and recipe/food nutrition data.
 *
 * @param {import('vue').ComputedRef<Array>} weekEntries - computed ref of meal plan entries
 * @param {Function} getById - function that returns a recipe by ID
 * @param {Function} [getFoodById] - optional function that returns a food by ID
 */
import { computed, toValue } from 'vue'

const MACROS = ['calories', 'protein', 'carbs', 'fat']

function emptyMacros() {
  return { calories: 0, protein: 0, carbs: 0, fat: 0 }
}

export function useNutritionCalc(weekEntries, getById, getFoodById) {
  const dailyNutrition = computed(() => {
    const entries = toValue(weekEntries)
    const byDate = {}

    for (const entry of entries) {
      let nutrition = null

      if (entry.foodId && getFoodById) {
        const food = getFoodById(entry.foodId)
        nutrition = food?.nutrition
      } else if (entry.recipeId) {
        const recipe = getById(entry.recipeId)
        nutrition = recipe?.nutrition
      }

      if (!nutrition) continue

      if (!byDate[entry.date]) {
        byDate[entry.date] = emptyMacros()
      }

      const servings = entry.servings || 1
      for (const macro of MACROS) {
        byDate[entry.date][macro] += (nutrition[macro] || 0) * servings
      }
    }

    return byDate
  })

  const weeklyTotals = computed(() => {
    const totals = emptyMacros()
    for (const day of Object.values(dailyNutrition.value)) {
      for (const macro of MACROS) {
        totals[macro] += day[macro]
      }
    }
    return totals
  })

  const dailyAverages = computed(() => {
    const avg = emptyMacros()
    for (const macro of MACROS) {
      avg[macro] = Math.round(weeklyTotals.value[macro] / 7)
    }
    return avg
  })

  const hasAnyNutrition = computed(() => {
    return Object.keys(dailyNutrition.value).length > 0
  })

  return {
    dailyNutrition,
    weeklyTotals,
    dailyAverages,
    hasAnyNutrition
  }
}
