<template>
  <div>
    <!-- Back to week + day navigation -->
    <div class="mb-4">
      <button
        type="button"
        @click="$emit('back')"
        class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mb-2 inline-flex items-center gap-1"
      >
        <ArrowLeftIcon class="w-3.5 h-3.5" />
        Back to week
      </button>
      <div class="flex items-center justify-between">
        <button
          type="button"
          @click="prevDay"
          class="btn btn-secondary text-sm"
        >
          <ChevronLeftIcon class="w-4 h-4" />
        </button>

        <div class="text-center">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {{ dayLabel }}
          </h2>
          <button
            v-if="!isToday"
            type="button"
            @click="goToToday"
            class="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Today
          </button>
        </div>

        <button
          type="button"
          @click="nextDay"
          class="btn btn-secondary text-sm"
        >
          <ChevronRightIcon class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="mealPlanStore.loading" class="space-y-4">
      <div v-for="n in 3" :key="n" class="rounded-lg p-4 bg-gray-50 dark:bg-slate-800 animate-pulse">
        <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20 mb-3"></div>
        <div class="h-14 bg-gray-200 dark:bg-slate-700 rounded"></div>
      </div>
    </div>

    <!-- Day content -->
    <div v-else class="space-y-4">
      <div
        class="rounded-lg p-4 transition-colors"
        :class="isToday ? 'bg-primary-50 dark:bg-primary-900/20' : 'bg-gray-50 dark:bg-slate-800'"
      >
        <div v-for="s in mealSlots" :key="s" class="mb-4 last:mb-0">
          <MealSlot
            :date="dateString"
            :meal-slot="s"
            :entries="getSlotEntries(s)"
            @add-meal="$emit('add-meal', $event)"
            @remove-meal="$emit('remove-meal', $event)"
            @move-meal="$emit('move-meal', $event)"
            @edit-meal="$emit('edit-meal', $event)"
          />
        </div>
      </div>

      <!-- Day nutrition summary -->
      <div v-if="dayNutrition" class="card p-4">
        <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Daily Nutrition</h3>
        <div class="grid grid-cols-4 gap-4 text-center">
          <div>
            <div class="text-xl font-bold text-amber-600 dark:text-amber-400">{{ Math.round(dayNutrition.calories).toLocaleString() }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Calories</div>
          </div>
          <div>
            <div class="text-xl font-bold text-sky-600 dark:text-sky-400">{{ Math.round(dayNutrition.protein) }}g</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Protein</div>
          </div>
          <div>
            <div class="text-xl font-bold text-violet-600 dark:text-violet-400">{{ Math.round(dayNutrition.carbs) }}g</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Carbs</div>
          </div>
          <div>
            <div class="text-xl font-bold text-rose-600 dark:text-rose-400">{{ Math.round(dayNutrition.fat) }}g</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Fat</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { addDays, subDays, format, isSameDay, startOfWeek } from 'date-fns'
import { storeToRefs } from 'pinia'
import { ChevronLeftIcon, ChevronRightIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline'
import MealSlot from './MealSlot.vue'
import { useNutritionCalc } from '../../composables/useNutritionCalc'
import { useMealPlanStore, useRecipeStore, useFoodStore } from '../../stores'

const props = defineProps({
  initialDate: {
    type: Date,
    default: () => new Date()
  }
})

const emit = defineEmits(['add-meal', 'remove-meal', 'move-meal', 'edit-meal', 'back'])

const mealPlanStore = useMealPlanStore()
const recipeStore = useRecipeStore()
const foodStore = useFoodStore()

const mealSlots = ['breakfast', 'lunch', 'dinner']
const currentDate = ref(props.initialDate || new Date())

const dateString = computed(() => format(currentDate.value, 'yyyy-MM-dd'))
const isToday = computed(() => isSameDay(currentDate.value, new Date()))

const dayLabel = computed(() => format(currentDate.value, 'EEEE, MMM d, yyyy'))

const { weekEntries } = storeToRefs(mealPlanStore)

const { dailyNutrition } = useNutritionCalc(
  weekEntries,
  recipeStore.getById,
  foodStore.getById
)

const dayNutrition = computed(() => {
  const n = dailyNutrition.value[dateString.value]
  if (!n || (n.calories === 0 && n.protein === 0 && n.carbs === 0 && n.fat === 0)) return null
  return n
})

function getSlotEntries(slot) {
  return mealPlanStore.getEntriesForSlot(dateString.value, slot)
}

// Ensure the week data is loaded when navigating to a day in a different week
watch(currentDate, (newDate) => {
  const weekStart = startOfWeek(newDate)
  if (!mealPlanStore.currentWeekStart || !isSameDay(weekStart, mealPlanStore.currentWeekStart)) {
    mealPlanStore.loadWeek(weekStart)
  }
})

function prevDay() {
  currentDate.value = subDays(currentDate.value, 1)
}

function nextDay() {
  currentDate.value = addDays(currentDate.value, 1)
}

function goToToday() {
  currentDate.value = new Date()
}
</script>
