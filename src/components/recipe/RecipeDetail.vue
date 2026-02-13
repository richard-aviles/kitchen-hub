<template>
  <div>
    <!-- Header with actions -->
    <div class="flex items-start justify-between mb-4">
      <div>
        <router-link to="/recipes" class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mb-2 inline-block">
          &larr; Back to Recipes
        </router-link>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">{{ recipe.name }}</h1>
      </div>
      <div class="flex gap-2">
        <button @click="$emit('edit')" class="btn btn-secondary text-sm">Edit</button>
        <button @click="$emit('delete')" class="btn text-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/70">Delete</button>
      </div>
    </div>

    <!-- Metadata -->
    <div class="flex flex-wrap gap-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
      <span v-if="recipe.prepTime" class="flex items-center gap-1">
        <ClockIcon class="w-4 h-4" />
        Prep: {{ recipe.prepTime }} min
      </span>
      <span v-if="recipe.cookTime" class="flex items-center gap-1">
        <ClockIcon class="w-4 h-4" />
        Cook: {{ recipe.cookTime }} min
      </span>
      <span v-if="recipe.servings" class="flex items-center gap-1">
        <UsersIcon class="w-4 h-4" />
        {{ recipe.servings }} servings
      </span>
    </div>

    <!-- Meal type + cuisine tags -->
    <div class="flex flex-wrap gap-2 mb-6">
      <span
        v-for="type in recipe.tags?.mealType || []"
        :key="type"
        class="px-3 py-1 text-sm font-medium rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
      >
        {{ type }}
      </span>
      <span
        v-if="recipe.tags?.cuisine"
        class="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
      >
        {{ recipe.tags.cuisine }}
      </span>
      <span
        v-for="tag in recipe.tags?.custom || []"
        :key="tag"
        class="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300"
      >
        {{ tag }}
      </span>
    </div>

    <!-- Ingredients -->
    <div v-if="recipe.ingredients?.length" class="card mb-4">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Ingredients</h2>
      <ul class="space-y-2">
        <li v-for="(ing, i) in recipe.ingredients" :key="i" class="flex items-baseline gap-2 text-gray-700 dark:text-gray-300">
          <span class="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0 mt-1.5"></span>
          <span>
            <span v-if="ing.amount" class="font-medium">{{ ing.amount }}</span>{{ ' ' }}<span v-if="ing.unit">{{ ing.unit }}{{ ' ' }}</span>{{ ing.name }}
            <span v-if="ing.notes" class="text-gray-400 dark:text-gray-500 text-sm">({{ ing.notes }})</span>
          </span>
        </li>
      </ul>
    </div>

    <!-- Instructions -->
    <div v-if="recipe.instructions?.length" class="card mb-4">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Instructions</h2>
      <ol class="space-y-3">
        <li v-for="(step, i) in recipe.instructions" :key="i" class="flex gap-3 text-gray-700 dark:text-gray-300">
          <span class="flex-shrink-0 w-7 h-7 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 flex items-center justify-center text-sm font-semibold">
            {{ i + 1 }}
          </span>
          <span class="pt-0.5">{{ step }}</span>
        </li>
      </ol>
    </div>

    <!-- Nutrition -->
    <div v-if="hasNutrition" class="card mb-4">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Nutrition (per serving)</h2>
      <div class="grid grid-cols-4 gap-4 text-center">
        <div v-if="recipe.nutrition?.calories != null">
          <div class="text-2xl font-bold text-amber-600 dark:text-amber-400">{{ recipe.nutrition.calories }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Calories</div>
        </div>
        <div v-if="recipe.nutrition?.protein != null">
          <div class="text-xl font-bold text-sky-600 dark:text-sky-400">{{ recipe.nutrition.protein }}g</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Protein</div>
        </div>
        <div v-if="recipe.nutrition?.carbs != null">
          <div class="text-xl font-bold text-violet-600 dark:text-violet-400">{{ recipe.nutrition.carbs }}g</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Carbs</div>
        </div>
        <div v-if="recipe.nutrition?.fat != null">
          <div class="text-xl font-bold text-rose-600 dark:text-rose-400">{{ recipe.nutrition.fat }}g</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Fat</div>
        </div>
      </div>
    </div>

    <!-- Notes -->
    <div v-if="recipe.notes" class="card mb-4">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Notes</h2>
      <p class="text-gray-700 dark:text-gray-300 whitespace-pre-line">{{ recipe.notes }}</p>
    </div>

    <!-- Source link -->
    <div v-if="recipe.sourceUrl" class="mb-4">
      <a
        :href="recipe.sourceUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm underline"
      >
        View original source &rarr;
      </a>
    </div>
  </div>
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

defineEmits(['edit', 'delete'])

const hasNutrition = computed(() => {
  const n = props.recipe.nutrition
  return n && (n.calories != null || n.protein != null || n.carbs != null || n.fat != null)
})
</script>
