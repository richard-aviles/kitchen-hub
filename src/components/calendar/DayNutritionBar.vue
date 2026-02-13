<template>
  <div v-if="calories > 0" class="text-center mt-2 pt-2 border-t border-gray-200 dark:border-slate-700">
    <span class="text-xs text-amber-600 dark:text-amber-400 font-medium">{{ formattedCalories }} cal</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useNutritionCalc } from '../../composables/useNutritionCalc'
import { useMealPlanStore, useRecipeStore } from '../../stores'

const props = defineProps({
  date: {
    type: String,
    required: true
  }
})

const mealPlanStore = useMealPlanStore()
const recipeStore = useRecipeStore()

const { weekEntries } = storeToRefs(mealPlanStore)

const { dailyNutrition } = useNutritionCalc(
  weekEntries,
  recipeStore.getById
)

const calories = computed(() => {
  return dailyNutrition.value[props.date]?.calories || 0
})

const formattedCalories = computed(() => {
  return Math.round(calories.value).toLocaleString()
})
</script>
