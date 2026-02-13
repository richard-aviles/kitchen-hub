<template>
  <div class="p-4 max-w-3xl mx-auto">
    <!-- Loading skeleton -->
    <div v-if="loading" class="animate-pulse">
      <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-28 mb-3"></div>
      <div class="h-7 bg-gray-200 dark:bg-slate-700 rounded w-2/3 mb-6"></div>
      <div class="flex gap-4 mb-6">
        <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
        <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
        <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
      </div>
      <div class="card mb-4">
        <div class="h-5 bg-gray-200 dark:bg-slate-700 rounded w-28 mb-3"></div>
        <div class="space-y-2">
          <div v-for="n in 5" :key="n" class="h-4 bg-gray-200 dark:bg-slate-700 rounded" :style="{ width: (60 + Math.random() * 30) + '%' }"></div>
        </div>
      </div>
      <div class="card mb-4">
        <div class="h-5 bg-gray-200 dark:bg-slate-700 rounded w-28 mb-3"></div>
        <div class="space-y-3">
          <div v-for="n in 4" :key="n" class="flex gap-3">
            <div class="w-7 h-7 bg-gray-200 dark:bg-slate-700 rounded-full flex-shrink-0"></div>
            <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded flex-1 mt-1.5"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!recipe" class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400 mb-4">Recipe not found.</p>
      <router-link to="/recipes" class="btn btn-primary">Back to Recipes</router-link>
    </div>

    <template v-else>
      <div v-if="recipeStore.error" class="bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg p-3 mb-4 text-sm">
        {{ recipeStore.error }}
      </div>

      <RecipeDetail
        :recipe="recipe"
        @edit="goEdit"
        @delete="showDeleteConfirm = true"
      />
    </template>

    <ConfirmDialog
      :show="showDeleteConfirm"
      title="Delete Recipe"
      message="This recipe will be permanently deleted. This cannot be undone."
      confirm-text="Delete"
      @confirm="handleDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRecipeStore } from '../stores'
import RecipeDetail from '../components/recipe/RecipeDetail.vue'
import ConfirmDialog from '../components/common/ConfirmDialog.vue'

const route = useRoute()
const router = useRouter()
const recipeStore = useRecipeStore()

const loading = computed(() => recipeStore.loading)
const recipe = computed(() => recipeStore.getById(route.params.id))
const showDeleteConfirm = ref(false)

onMounted(async () => {
  if (recipeStore.recipes.length === 0) {
    await recipeStore.loadAll()
  }
})

function goEdit() {
  router.push(`/recipes/${route.params.id}/edit`)
}

async function handleDelete() {
  showDeleteConfirm.value = false
  await recipeStore.remove(route.params.id)
  router.push('/recipes')
}
</script>
