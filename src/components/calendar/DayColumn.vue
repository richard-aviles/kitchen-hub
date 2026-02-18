<template>
  <div
    class="rounded-lg p-3 transition-colors"
    :class="isToday ? 'bg-primary-50 dark:bg-primary-900/20' : 'bg-gray-50 dark:bg-slate-800'"
  >
    <!-- Day header (clickable to open daily view) -->
    <button
      type="button"
      class="w-full text-center mb-3 rounded-md py-1 transition-colors hover:bg-primary-100 dark:hover:bg-primary-900/30"
      @click="$emit('select-day', date)"
    >
      <div class="text-xs font-medium uppercase tracking-wide" :class="isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'">
        {{ dayName }}
      </div>
      <div
        class="text-lg font-bold mt-0.5"
        :class="isToday ? 'text-primary-700 dark:text-primary-300' : 'text-gray-800 dark:text-gray-100'"
      >
        {{ dayNumber }}
      </div>
    </button>

    <!-- Desktop: vertical stack of slots -->
    <div class="hidden md:flex md:flex-col md:gap-3">
      <MealSlot
        v-for="s in mealSlots"
        :key="s"
        :date="dateString"
        :meal-slot="s"
        :entries="getSlotEntries(s)"
        @add-meal="$emit('add-meal', $event)"
        @remove-meal="$emit('remove-meal', $event)"
        @move-meal="$emit('move-meal', $event)"
      />
    </div>

    <!-- Mobile: horizontal row of slots -->
    <div class="flex gap-2 md:hidden">
      <div v-for="s in mealSlots" :key="s" class="flex-1">
        <MealSlot
          :date="dateString"
          :meal-slot="s"
          :entries="getSlotEntries(s)"
          @add-meal="$emit('add-meal', $event)"
          @remove-meal="$emit('remove-meal', $event)"
          @move-meal="$emit('move-meal', $event)"
        />
      </div>
    </div>

    <!-- Daily calorie indicator -->
    <DayNutritionBar :date="dateString" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { format } from 'date-fns'
import MealSlot from './MealSlot.vue'
import DayNutritionBar from './DayNutritionBar.vue'
import { useMealPlanStore } from '../../stores'

const props = defineProps({
  date: {
    type: Date,
    required: true
  },
  isToday: {
    type: Boolean,
    default: false
  }
})

defineEmits(['add-meal', 'remove-meal', 'move-meal', 'select-day'])

const mealSlots = ['breakfast', 'lunch', 'dinner']
const mealPlanStore = useMealPlanStore()

const dateString = computed(() => format(props.date, 'yyyy-MM-dd'))
const dayName = computed(() => format(props.date, 'EEE'))
const dayNumber = computed(() => format(props.date, 'd'))

function getSlotEntries(slot) {
  return mealPlanStore.getEntriesForSlot(dateString.value, slot)
}
</script>
