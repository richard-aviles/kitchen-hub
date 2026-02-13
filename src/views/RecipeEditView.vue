<template>
  <div class="p-4 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
      {{ isEditMode ? 'Edit Recipe' : 'New Recipe' }}
    </h1>

    <div v-if="isEditMode && !recipe" class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400 mb-4">Recipe not found.</p>
      <router-link to="/recipes" class="btn btn-primary">Back to Recipes</router-link>
    </div>

    <RecipeForm
      v-else
      :initial-data="recipe"
      @save="handleSave"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRecipeStore } from '../stores'
import RecipeForm from '../components/recipe/RecipeForm.vue'

const route = useRoute()
const router = useRouter()
const recipeStore = useRecipeStore()

const isEditMode = computed(() => !!route.params.id)
const recipe = computed(() =>
  isEditMode.value ? recipeStore.getById(route.params.id) : null
)

onMounted(async () => {
  if (recipeStore.recipes.length === 0) {
    await recipeStore.loadAll()
  }
})

async function handleSave(formData) {
  if (isEditMode.value) {
    await recipeStore.update(route.params.id, formData)
    router.push(`/recipes/${route.params.id}`)
  } else {
    const newRecipe = await recipeStore.add(formData)
    router.push(`/recipes/${newRecipe.id}`)
  }
}

function handleCancel() {
  if (isEditMode.value) {
    router.push(`/recipes/${route.params.id}`)
  } else {
    router.push('/recipes')
  }
}
</script>
