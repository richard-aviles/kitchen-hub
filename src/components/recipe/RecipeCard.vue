<template>
  <router-link
    :to="`/recipes/${recipe.id}`"
    class="card block hover:shadow-lg transition-shadow duration-200 cursor-pointer overflow-hidden border-t-4"
    :class="borderColor"
  >
    <img
      v-if="recipe.imageUrl"
      :src="recipe.imageUrl"
      :alt="recipe.name"
      class="-mx-4 -mt-4 mb-3 w-[calc(100%+2rem)] h-32 object-cover"
      @error="$event.target.style.display = 'none'"
    />
    <div class="flex items-start justify-between mb-2">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">{{ recipe.name }}</h3>
      <span
        v-if="recipe.nutrition?.calories != null"
        class="flex-shrink-0 ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
      >
        {{ recipe.nutrition.calories }} cal
      </span>
    </div>

    <div class="flex flex-wrap gap-2 mb-3">
      <span
        v-for="type in recipe.tags?.mealType || []"
        :key="type"
        class="px-2 py-0.5 text-xs font-medium rounded-full"
        :class="mealTagColor(type)"
      >
        {{ type }}
      </span>
    </div>

    <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
      <span v-if="recipe.prepTime" class="flex items-center gap-1">
        <ClockIcon class="w-4 h-4" />
        {{ recipe.prepTime + (recipe.cookTime || 0) }} min
      </span>
      <span v-if="recipe.servings" class="flex items-center gap-1">
        <UsersIcon class="w-4 h-4" />
        {{ recipe.servings }}
      </span>
      <span v-if="recipe.tags?.cuisine" class="flex items-center gap-1">
        {{ recipe.tags.cuisine }}
      </span>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'
import { ClockIcon, UsersIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  recipe: {
    type: Object,
    required: true
  }
})

const mealTagColors = {
  Breakfast: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  Lunch: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  Dinner: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  Snack: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  Dessert: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
}

function mealTagColor(type) {
  return mealTagColors[type] || 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
}

const mealTypeBorders = {
  Breakfast: 'border-amber-400 dark:border-amber-500',
  Lunch: 'border-emerald-400 dark:border-emerald-500',
  Dinner: 'border-indigo-400 dark:border-indigo-500',
  Snack: 'border-orange-400 dark:border-orange-500',
  Dessert: 'border-pink-400 dark:border-pink-500',
}

const borderColor = computed(() => {
  const primaryType = props.recipe.tags?.mealType?.[0]
  return mealTypeBorders[primaryType] || 'border-gray-200 dark:border-slate-600'
})
</script>
