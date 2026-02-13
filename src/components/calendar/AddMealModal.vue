<template>
  <teleport to="body">
    <Transition name="modal">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-end md:items-center justify-center"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50" @click="$emit('cancel')"></div>

      <!-- Modal -->
      <div class="modal-content relative bg-white dark:bg-slate-800 w-full md:max-w-lg md:rounded-xl rounded-t-xl max-h-[85vh] flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b dark:border-slate-700">
          <div>
            <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Add Meal</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ slotLabel }} &middot; {{ dateLabel }}</p>
          </div>
          <button type="button" @click="$emit('cancel')" class="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- Step 1: Recipe selection -->
        <div v-if="!selectedRecipe" class="flex-1 overflow-hidden flex flex-col">
          <!-- Search -->
          <div class="p-4 border-b dark:border-slate-700">
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="Search recipes..."
              class="input"
            />
          </div>

          <!-- Recipe list -->
          <div class="flex-1 overflow-y-auto p-4">
            <div v-if="filteredRecipes.length === 0" class="text-center py-12">
              <BookOpenIcon class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p class="text-base font-medium text-gray-500 dark:text-gray-400 mb-1">No recipes found</p>
              <p class="text-sm text-gray-400 dark:text-gray-500 mb-3">
                {{ searchQuery ? 'Try a different search term.' : 'Add a recipe to start planning meals.' }}
              </p>
              <router-link to="/recipes/new" class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium">
                + Create a recipe
              </router-link>
            </div>
            <div v-else class="space-y-2">
              <button
                v-for="recipe in filteredRecipes"
                :key="recipe.id"
                type="button"
                @click="selectRecipe(recipe)"
                class="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 dark:border-slate-600 dark:hover:border-primary-600 dark:hover:bg-primary-900/20 transition-colors"
              >
                <p class="font-medium text-gray-800 dark:text-gray-100">{{ recipe.name }}</p>
                <div class="flex gap-2 mt-1">
                  <span
                    v-for="type in recipe.tags?.mealType || []"
                    :key="type"
                    class="text-xs text-primary-600 dark:text-primary-400"
                  >
                    {{ type }}
                  </span>
                  <span v-if="recipe.prepTime" class="text-xs text-gray-400 dark:text-gray-500">
                    {{ recipe.prepTime + (recipe.cookTime || 0) }} min
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Step 2: Servings selection -->
        <div v-else class="p-4">
          <div class="mb-4">
            <p class="font-medium text-gray-800 dark:text-gray-100">{{ selectedRecipe.name }}</p>
            <button
              type="button"
              @click="selectedRecipe = null"
              class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              &larr; Choose different recipe
            </button>
          </div>

          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Servings</label>
          <input
            v-model.number="servings"
            type="number"
            min="1"
            max="99"
            class="input w-24 mb-4"
          />

          <div class="flex gap-2">
            <button
              type="button"
              @click="$emit('cancel')"
              class="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="confirmAdd"
              class="btn btn-primary flex-1"
            >
              Add to Plan
            </button>
          </div>
        </div>
      </div>
    </div>
    </Transition>
  </teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { format } from 'date-fns'
import { XMarkIcon, BookOpenIcon } from '@heroicons/vue/24/outline'
import { useRecipeStore } from '../../stores'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  date: {
    type: String,
    default: ''
  },
  mealSlot: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['save', 'cancel'])

const recipeStore = useRecipeStore()

const searchQuery = ref('')
const selectedRecipe = ref(null)
const servings = ref(1)
const searchInput = ref(null)

const slotLabel = computed(() => {
  return props.mealSlot ? props.mealSlot.charAt(0).toUpperCase() + props.mealSlot.slice(1) : ''
})

const dateLabel = computed(() => {
  if (!props.date) return ''
  const parts = props.date.split('-')
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  return format(d, 'EEE, MMM d')
})

const filteredRecipes = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return recipeStore.recipes
  return recipeStore.recipes.filter(r =>
    r.name.toLowerCase().includes(query) ||
    r.tags?.mealType?.some(t => t.toLowerCase().includes(query)) ||
    r.tags?.cuisine?.toLowerCase().includes(query)
  )
})

watch(() => props.show, (isVisible) => {
  if (isVisible) {
    searchQuery.value = ''
    selectedRecipe.value = null
    servings.value = 1
    nextTick(() => searchInput.value?.focus())
  }
})

function selectRecipe(recipe) {
  selectedRecipe.value = recipe
  servings.value = recipe.servings || 1
}

function confirmAdd() {
  emit('save', {
    recipeId: selectedRecipe.value.id,
    servings: servings.value
  })
}
</script>
