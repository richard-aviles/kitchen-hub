<template>
  <div class="p-4 pb-20 max-w-2xl mx-auto">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Shopping List</h1>
      <div class="flex gap-2">
        <button
          type="button"
          @click="handleGenerate"
          :disabled="shoppingStore.loading"
          class="btn btn-primary text-sm"
        >
          <ArrowPathIcon v-if="shoppingStore.loading" class="w-4 h-4 animate-spin" />
          <template v-else>Generate</template>
        </button>
        <button
          type="button"
          @click="showAddModal = true"
          class="btn btn-secondary text-sm"
        >
          + Add
        </button>
      </div>
    </div>

    <!-- Error display -->
    <div v-if="shoppingStore.error" class="bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg p-3 mb-4 text-sm">
      {{ shoppingStore.error }}
    </div>

    <!-- Empty state -->
    <div v-if="shoppingStore.items.length === 0 && !shoppingStore.loading" class="card text-center py-16">
      <ShoppingCartIcon class="w-16 h-16 text-primary-300 dark:text-primary-700 mx-auto mb-4" />
      <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">Shopping list is empty</h2>
      <p class="text-sm text-gray-400 dark:text-gray-500 mb-6">
        Tap <strong class="text-gray-500 dark:text-gray-400">Generate</strong> to create a list from this week's meal plan,
        or <strong class="text-gray-500 dark:text-gray-400">+ Add</strong> to add items manually.
      </p>
      <div class="flex gap-2 justify-center">
        <button type="button" @click="handleGenerate" class="btn btn-primary text-sm">Generate from Plan</button>
        <button type="button" @click="showAddModal = true" class="btn btn-secondary text-sm">+ Add Item</button>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="shoppingStore.loading" class="space-y-4 animate-pulse">
      <div class="h-3 bg-gray-200 dark:bg-slate-700 rounded w-20 mb-1"></div>
      <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 divide-y divide-gray-50 dark:divide-slate-700">
        <div v-for="n in 8" :key="n" class="flex items-center gap-3 py-2 px-3">
          <div class="w-6 h-6 bg-gray-200 dark:bg-slate-700 rounded-full flex-shrink-0"></div>
          <div class="flex-1">
            <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded" :style="{ width: (40 + Math.random() * 40) + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Shopping list by category -->
    <div v-if="!shoppingStore.loading && shoppingStore.items.length > 0" class="space-y-4">
      <!-- Summary bar -->
      <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>{{ shoppingStore.uncheckedCount }} item{{ shoppingStore.uncheckedCount !== 1 ? 's' : '' }} remaining</span>
        <button
          v-if="shoppingStore.checkedItems.length > 0"
          type="button"
          @click="showClearConfirm = true"
          class="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 py-1 px-2 rounded transition-colors"
        >
          Clear checked ({{ shoppingStore.checkedItems.length }})
        </button>
      </div>

      <!-- Grouped items -->
      <div
        v-for="(categoryItems, categoryName) in shoppingStore.itemsByCategory"
        :key="categoryName"
      >
        <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1 px-1">
          {{ categoryName }}
        </h3>
        <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 divide-y divide-gray-50 dark:divide-slate-700">
          <ShoppingItem
            v-for="item in categoryItems"
            :key="item.id"
            :item="item"
            @toggle="shoppingStore.toggleItem($event)"
            @remove="shoppingStore.removeItem($event)"
          />
        </div>
      </div>
    </div>

    <AddItemModal
      :show="showAddModal"
      @save="handleAddItem"
      @cancel="showAddModal = false"
    />

    <ConfirmDialog
      :show="showClearConfirm"
      title="Clear Checked Items"
      message="Remove all checked items from the shopping list?"
      confirm-text="Clear"
      @confirm="handleClearChecked"
      @cancel="showClearConfirm = false"
    />
  </div>
</template>

<script setup>
/**
 * ShoppingView
 *
 * Main view for the shopping list.
 * Shows aggregated ingredients from planned meals, grouped by category.
 */
import { ref, onMounted } from 'vue'
import { startOfWeek } from 'date-fns'
import { ArrowPathIcon, ShoppingCartIcon } from '@heroicons/vue/24/outline'
import { useShoppingStore, useMealPlanStore, useRecipeStore } from '../stores'
import ShoppingItem from '../components/shopping/ShoppingItem.vue'
import AddItemModal from '../components/shopping/AddItemModal.vue'
import ConfirmDialog from '../components/common/ConfirmDialog.vue'

const shoppingStore = useShoppingStore()
const mealPlanStore = useMealPlanStore()
const recipeStore = useRecipeStore()

const showAddModal = ref(false)
const showClearConfirm = ref(false)

onMounted(async () => {
  await shoppingStore.loadAll()
  // Ensure recipes and meal plan are loaded for generation
  if (recipeStore.recipes.length === 0) {
    await recipeStore.loadAll()
  }
  if (!mealPlanStore.currentWeekStart) {
    await mealPlanStore.loadWeek(startOfWeek(new Date()))
  }
})

async function handleGenerate() {
  // Use the meal plan store's current week entries and all recipes
  const entries = mealPlanStore.weekEntries
  const recipes = recipeStore.recipes
  await shoppingStore.generateFromMealPlan(entries, recipes)
}

async function handleAddItem(data) {
  await shoppingStore.addManualItem(data)
  showAddModal.value = false
}

async function handleClearChecked() {
  showClearConfirm.value = false
  await shoppingStore.clearChecked()
}
</script>
