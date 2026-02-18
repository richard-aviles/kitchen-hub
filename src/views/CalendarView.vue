<template>
  <div class="p-4 max-w-6xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Meal Plan</h1>

    <div v-if="mealPlanStore.error" class="bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg p-3 mb-4 text-sm">
      {{ mealPlanStore.error }}
    </div>

    <DayDetail
      v-if="viewMode === 'day'"
      :initial-date="selectedDay"
      @add-meal="openAddModal"
      @remove-meal="handleRemoveMeal"
      @move-meal="handleMoveMeal"
      @edit-meal="openEditModal"
      @back="viewMode = 'week'"
    />

    <WeekCalendar
      v-else
      @add-meal="openAddModal"
      @remove-meal="handleRemoveMeal"
      @move-meal="handleMoveMeal"
      @select-day="handleSelectDay"
      @edit-meal="openEditModal"
    />

    <WeekNutritionSummary v-if="viewMode === 'week'" />

    <AddMealModal
      :show="showModal"
      :date="modalDate"
      :meal-slot="modalSlot"
      @save="handleSave"
      @cancel="showModal = false"
    />

    <EditMealModal
      :show="showEditModal"
      :entry="editEntry"
      @save="handleEditSave"
      @delete="handleEditDelete"
      @cancel="showEditModal = false"
    />
  </div>
</template>

<script setup>
/**
 * CalendarView
 *
 * Main view for weekly meal planning.
 * Displays a 7-day calendar with breakfast/lunch/dinner slots.
 */
import { ref, onMounted } from 'vue'
import { startOfWeek } from 'date-fns'
import { useMealPlanStore, useRecipeStore, useFoodStore } from '../stores'
import WeekCalendar from '../components/calendar/WeekCalendar.vue'
import DayDetail from '../components/calendar/DayDetail.vue'
import WeekNutritionSummary from '../components/calendar/WeekNutritionSummary.vue'
import AddMealModal from '../components/calendar/AddMealModal.vue'
import EditMealModal from '../components/calendar/EditMealModal.vue'

const mealPlanStore = useMealPlanStore()
const recipeStore = useRecipeStore()
const foodStore = useFoodStore()

const viewMode = ref('week')
const selectedDay = ref(null)
const showModal = ref(false)
const modalDate = ref('')
const modalSlot = ref('')
const showEditModal = ref(false)
const editEntry = ref(null)

onMounted(async () => {
  const weekStart = startOfWeek(new Date())
  await Promise.all([
    recipeStore.loadAll(),
    mealPlanStore.loadWeek(weekStart),
    foodStore.loadAll()
  ])
})

function openAddModal({ date, slot }) {
  modalDate.value = date
  modalSlot.value = slot
  showModal.value = true
}

async function handleSave({ recipeId, foodId, food, servings }) {
  // If this is a food, save it to the food store first
  if (foodId && food) {
    await foodStore.addOrUpdate(food)
  }

  await mealPlanStore.addMeal({
    recipeId,
    foodId,
    date: modalDate.value,
    slot: modalSlot.value,
    servings
  })
  showModal.value = false
}

function handleSelectDay(date) {
  selectedDay.value = date
  viewMode.value = 'day'
}

function openEditModal(entry) {
  editEntry.value = entry
  showEditModal.value = true
}

async function handleEditSave({ id, servings }) {
  await mealPlanStore.updateMeal(id, { servings })
  showEditModal.value = false
}

async function handleEditDelete(id) {
  await mealPlanStore.removeMeal(id)
  showEditModal.value = false
}

async function handleRemoveMeal(id) {
  await mealPlanStore.removeMeal(id)
}

async function handleMoveMeal({ id, date, slot }) {
  await mealPlanStore.moveMeal(id, date, slot)
}
</script>
