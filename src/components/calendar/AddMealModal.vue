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

        <!-- Tab bar -->
        <div class="flex border-b dark:border-slate-700" v-if="!selectedItem">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            @click="activeTab = tab.id"
            class="flex-1 py-2.5 text-sm font-medium text-center transition-colors"
            :class="activeTab === tab.id
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab content: Recipe (original behavior) -->
        <div v-if="activeTab === 'recipe' && !selectedItem" class="flex-1 overflow-hidden flex flex-col">
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

        <!-- Tab content: My Foods -->
        <div v-if="activeTab === 'myfoods' && !selectedItem" class="flex-1 overflow-hidden flex flex-col">
          <div class="p-4 border-b dark:border-slate-700">
            <input
              v-model="myFoodsSearch"
              type="text"
              placeholder="Filter saved foods..."
              class="input"
            />
          </div>
          <div class="flex-1 overflow-y-auto p-4">
            <!-- No foods saved yet -->
            <div v-if="foodStore.foods.length === 0" class="text-center py-12">
              <BoltIcon class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p class="text-base font-medium text-gray-500 dark:text-gray-400 mb-1">No saved foods yet</p>
              <p class="text-sm text-gray-400 dark:text-gray-500">Use the Search or Scan tabs to add foods.</p>
            </div>
            <!-- No filter results -->
            <div v-else-if="filteredFoods.length === 0" class="text-center py-12">
              <p class="text-sm text-gray-500 dark:text-gray-400">No foods match "{{ myFoodsSearch }}"</p>
            </div>
            <!-- Foods list -->
            <div v-else class="space-y-2">
              <button
                v-for="food in filteredFoods"
                :key="food.id"
                type="button"
                @click="selectFood(food)"
                class="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 dark:border-slate-600 dark:hover:border-primary-600 dark:hover:bg-primary-900/20 transition-colors"
              >
                <p class="font-medium text-gray-800 dark:text-gray-100 truncate">{{ food.name }}</p>
                <p v-if="food.brand" class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ food.brand }}</p>
                <div class="flex gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span class="text-amber-600 dark:text-amber-400 font-medium">{{ food.nutrition.calories }} cal</span>
                  <span>P: {{ food.nutrition.protein }}g</span>
                  <span>C: {{ food.nutrition.carbs }}g</span>
                  <span>F: {{ food.nutrition.fat }}g</span>
                  <span class="text-gray-400 dark:text-gray-500">per {{ food.servingSize }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Tab content: Food Search -->
        <FoodSearchPanel
          v-if="activeTab === 'food' && !selectedItem"
          ref="foodSearchPanel"
          @select="selectFood"
        />

        <!-- Tab content: Barcode Scanner -->
        <BarcodeScannerPanel
          v-if="activeTab === 'scan' && !selectedItem"
          @select="selectFood"
        />

        <!-- Servings selection (shared for both recipe and food) -->
        <div v-if="selectedItem" class="p-4">
          <div class="mb-4">
            <div class="flex items-center gap-2">
              <span v-if="selectedItem.type === 'food'" class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                <BoltIcon class="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              </span>
              <p class="font-medium text-gray-800 dark:text-gray-100">{{ selectedItem.name }}</p>
            </div>
            <button
              type="button"
              @click="selectedItem = null"
              class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mt-1"
            >
              &larr; Choose different {{ selectedItem.type === 'food' ? 'food' : 'recipe' }}
            </button>
          </div>

          <!-- Editable nutrition for food -->
          <div v-if="selectedItem.type === 'food'" class="mb-4">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Adjust nutrition if needed:</p>
            <div class="grid grid-cols-4 gap-2 bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
              <div class="text-center">
                <input
                  v-model.number="editNutrition.calories"
                  type="number"
                  min="0"
                  class="w-full text-center text-sm font-bold text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 rounded px-1 py-1"
                />
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Cal</div>
              </div>
              <div class="text-center">
                <input
                  v-model.number="editNutrition.protein"
                  type="number"
                  min="0"
                  step="0.1"
                  class="w-full text-center text-sm font-bold text-sky-600 dark:text-sky-400 bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 rounded px-1 py-1"
                />
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Protein (g)</div>
              </div>
              <div class="text-center">
                <input
                  v-model.number="editNutrition.carbs"
                  type="number"
                  min="0"
                  step="0.1"
                  class="w-full text-center text-sm font-bold text-violet-600 dark:text-violet-400 bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 rounded px-1 py-1"
                />
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Carbs (g)</div>
              </div>
              <div class="text-center">
                <input
                  v-model.number="editNutrition.fat"
                  type="number"
                  min="0"
                  step="0.1"
                  class="w-full text-center text-sm font-bold text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 rounded px-1 py-1"
                />
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Fat (g)</div>
              </div>
            </div>
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
import { XMarkIcon, BookOpenIcon, BoltIcon } from '@heroicons/vue/24/outline'
import { useRecipeStore, useFoodStore } from '../../stores'
import FoodSearchPanel from './FoodSearchPanel.vue'
import BarcodeScannerPanel from './BarcodeScannerPanel.vue'

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
const foodStore = useFoodStore()

const tabs = [
  { id: 'recipe', label: 'Recipes' },
  { id: 'myfoods', label: 'My Foods' },
  { id: 'food', label: 'Search' },
  { id: 'scan', label: 'Scan' }
]

const activeTab = ref('recipe')
const searchQuery = ref('')
const myFoodsSearch = ref('')
const selectedItem = ref(null)  // { type: 'recipe'|'food', name, data }
const servings = ref(1)
const editNutrition = ref({ calories: 0, protein: 0, carbs: 0, fat: 0 })
const searchInput = ref(null)
const foodSearchPanel = ref(null)

const slotLabel = computed(() => {
  return props.mealSlot ? props.mealSlot.charAt(0).toUpperCase() + props.mealSlot.slice(1) : ''
})

const dateLabel = computed(() => {
  if (!props.date) return ''
  const parts = props.date.split('-')
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  return format(d, 'EEE, MMM d')
})

const filteredFoods = computed(() => {
  if (!myFoodsSearch.value.trim()) return foodStore.foods
  const q = myFoodsSearch.value.toLowerCase()
  return foodStore.foods.filter(f =>
    f.name.toLowerCase().includes(q) ||
    (f.brand && f.brand.toLowerCase().includes(q))
  )
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
    activeTab.value = 'recipe'
    searchQuery.value = ''
    myFoodsSearch.value = ''
    selectedItem.value = null
    servings.value = 1
    nextTick(() => searchInput.value?.focus())
  }
})

watch(activeTab, (tab) => {
  if (tab === 'recipe') {
    nextTick(() => searchInput.value?.focus())
  } else if (tab === 'food') {
    nextTick(() => foodSearchPanel.value?.focus())
  }
})

function selectRecipe(recipe) {
  selectedItem.value = {
    type: 'recipe',
    name: recipe.name,
    data: recipe
  }
  servings.value = 1
}

function selectFood(food) {
  selectedItem.value = {
    type: 'food',
    name: food.name,
    data: food
  }
  editNutrition.value = {
    calories: food.nutrition?.calories || 0,
    protein: food.nutrition?.protein || 0,
    carbs: food.nutrition?.carbs || 0,
    fat: food.nutrition?.fat || 0
  }
  servings.value = 1
}

function confirmAdd() {
  if (selectedItem.value.type === 'food') {
    const food = {
      ...selectedItem.value.data,
      nutrition: { ...editNutrition.value }
    }
    emit('save', {
      foodId: food.id,
      food,
      servings: servings.value
    })
  } else {
    emit('save', {
      recipeId: selectedItem.value.data.id,
      servings: servings.value
    })
  }
}
</script>
