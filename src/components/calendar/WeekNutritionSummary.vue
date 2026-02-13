<template>
  <div v-if="hasAnyNutrition" class="card mt-4">
    <!-- Weekly Totals -->
    <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Weekly Nutrition</h2>
    <div class="grid grid-cols-4 gap-4 text-center mb-4">
      <div>
        <div class="text-xl font-bold text-amber-600 dark:text-amber-400">{{ formatNum(weeklyTotals.calories) }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">Calories</div>
      </div>
      <div>
        <div class="text-xl font-bold text-sky-600 dark:text-sky-400">{{ formatNum(weeklyTotals.protein) }}g</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">Protein</div>
      </div>
      <div>
        <div class="text-xl font-bold text-violet-600 dark:text-violet-400">{{ formatNum(weeklyTotals.carbs) }}g</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">Carbs</div>
      </div>
      <div>
        <div class="text-xl font-bold text-rose-600 dark:text-rose-400">{{ formatNum(weeklyTotals.fat) }}g</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">Fat</div>
      </div>
    </div>

    <!-- Daily Average -->
    <div class="border-t border-gray-200 dark:border-slate-700 pt-3">
      <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Daily Average</h3>
      <div class="grid grid-cols-4 gap-4 text-center">
        <div>
          <div class="text-base font-semibold text-amber-600 dark:text-amber-400">{{ formatNum(dailyAverages.calories) }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Calories</div>
        </div>
        <div>
          <div class="text-base font-semibold text-sky-600 dark:text-sky-400">{{ formatNum(dailyAverages.protein) }}g</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Protein</div>
        </div>
        <div>
          <div class="text-base font-semibold text-violet-600 dark:text-violet-400">{{ formatNum(dailyAverages.carbs) }}g</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Carbs</div>
        </div>
        <div>
          <div class="text-base font-semibold text-rose-600 dark:text-rose-400">{{ formatNum(dailyAverages.fat) }}g</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Fat</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useNutritionCalc } from '../../composables/useNutritionCalc'
import { useMealPlanStore, useRecipeStore } from '../../stores'

const mealPlanStore = useMealPlanStore()
const recipeStore = useRecipeStore()

const { weekEntries } = storeToRefs(mealPlanStore)

const { weeklyTotals, dailyAverages, hasAnyNutrition } = useNutritionCalc(
  weekEntries,
  recipeStore.getById
)

function formatNum(n) {
  return Math.round(n).toLocaleString()
}
</script>
