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
import { useSettingsStore } from '../stores/settingsStore.js'
import RecipeForm from '../components/recipe/RecipeForm.vue'
import { uploadPhoto, deletePhoto } from '../services/photoService.js'

const route = useRoute()
const router = useRouter()
const recipeStore = useRecipeStore()
const settingsStore = useSettingsStore()

const isEditMode = computed(() => !!route.params.id)
const recipe = computed(() =>
  isEditMode.value ? recipeStore.getById(route.params.id) : null
)

onMounted(async () => {
  if (recipeStore.recipes.length === 0) {
    await recipeStore.loadAll()
  }
})

async function handleSave(formData, photoAction) {
  let recipeId
  let existingDriveFileId = null

  if (isEditMode.value) {
    recipeId = route.params.id
    existingDriveFileId = recipe.value?.driveFileId || null
    await recipeStore.update(recipeId, formData)
  } else {
    const newRecipe = await recipeStore.add(formData)
    recipeId = newRecipe.id
  }

  // Handle photo upload/removal
  if (photoAction?.photoFile && settingsStore.settings?.driveFolderId) {
    try {
      const driveFileId = await uploadPhoto(
        settingsStore.settings.driveFolderId,
        recipeId,
        photoAction.photoFile,
        existingDriveFileId
      )
      await recipeStore.update(recipeId, { driveFileId })
    } catch (err) {
      console.warn('Photo upload failed:', err.message)
    }
  } else if (photoAction?.photoRemoved && existingDriveFileId) {
    try {
      await deletePhoto(recipeId, existingDriveFileId)
      await recipeStore.update(recipeId, { driveFileId: null })
    } catch (err) {
      console.warn('Photo delete failed:', err.message)
    }
  }

  router.push(`/recipes/${recipeId}`)
}

function handleCancel() {
  if (isEditMode.value) {
    router.push(`/recipes/${route.params.id}`)
  } else {
    router.push('/recipes')
  }
}
</script>
