<template>
  <div class="p-4 max-w-5xl mx-auto">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Recipes</h1>
      <router-link to="/recipes/new" class="btn btn-primary text-sm">
        + Add Recipe
      </router-link>
    </div>

    <!-- Search & Filter -->
    <div class="mb-4 space-y-3">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search recipes..."
        class="input"
      />
      <div class="flex flex-wrap gap-2">
        <button
          v-for="type in mealTypes"
          :key="type"
          @click="toggleMealType(type)"
          class="px-3 py-1 text-sm font-medium rounded-full transition-colors"
          :class="activeMealType === type
            ? 'bg-primary-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600'"
        >
          {{ type }}
        </button>
        <button
          @click="activeMealType = null"
          class="px-3 py-1 text-sm font-medium rounded-full transition-colors"
          :class="activeMealType === null
            ? 'bg-primary-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600'"
        >
          All
        </button>
      </div>
      <p v-if="searchQuery || activeMealType" class="text-sm text-gray-500 dark:text-gray-400">
        {{ filteredRecipes.length }} result{{ filteredRecipes.length !== 1 ? 's' : '' }}
      </p>
    </div>

    <!-- Error display -->
    <div v-if="recipeStore.error" class="bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg p-3 mb-4 text-sm">
      {{ recipeStore.error }}
    </div>

    <!-- Loading skeleton -->
    <div v-if="recipeStore.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="n in 6" :key="n" class="card animate-pulse">
        <div class="h-5 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-3"></div>
        <div class="flex gap-2 mb-3">
          <div class="h-5 bg-gray-200 dark:bg-slate-700 rounded-full w-16"></div>
          <div class="h-5 bg-gray-200 dark:bg-slate-700 rounded-full w-14"></div>
        </div>
        <div class="flex gap-4">
          <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-16"></div>
          <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-12"></div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="recipeStore.recipes.length === 0" class="card text-center py-16">
      <BookOpenIcon class="w-16 h-16 text-primary-300 dark:text-primary-700 mx-auto mb-4" />
      <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">No recipes yet</h2>
      <p class="text-sm text-gray-400 dark:text-gray-500 mb-6">Start building your collection — add your first recipe to get cooking.</p>
      <router-link to="/recipes/new" class="btn btn-primary">+ Add Recipe</router-link>
    </div>

    <!-- No search results -->
    <div v-else-if="filteredRecipes.length === 0" class="card text-center py-16">
      <MagnifyingGlassIcon class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
      <h2 class="text-base font-semibold text-gray-600 dark:text-gray-300 mb-1">No matches found</h2>
      <p class="text-sm text-gray-400 dark:text-gray-500">Try a different search term or clear your filters.</p>
    </div>

    <!-- Recipe grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <RecipeCard
        v-for="recipe in filteredRecipes"
        :key="recipe.id"
        :recipe="recipe"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { BookOpenIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { useRecipeStore } from '../stores'
import RecipeCard from '../components/recipe/RecipeCard.vue'

const recipeStore = useRecipeStore()

const searchQuery = ref('')
const activeMealType = ref(null)
const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert']

onMounted(() => {
  recipeStore.loadAll()
})

function toggleMealType(type) {
  activeMealType.value = activeMealType.value === type ? null : type
}

const filteredRecipes = computed(() => {
  let result = recipeStore.recipes

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(r => r.name.toLowerCase().includes(q))
  }

  if (activeMealType.value) {
    result = result.filter(r =>
      r.tags?.mealType?.includes(activeMealType.value)
    )
  }

  return result
})
</script>
