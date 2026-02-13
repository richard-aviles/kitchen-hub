<template>
  <div>
    <!-- Week navigation -->
    <div class="flex items-center justify-between mb-4">
      <button
        type="button"
        @click="prevWeek"
        class="btn btn-secondary text-sm"
      >
        <ChevronLeftIcon class="w-4 h-4" />
      </button>

      <div class="text-center">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {{ weekRangeLabel }}
        </h2>
        <button
          type="button"
          @click="goToToday"
          class="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          Today
        </button>
      </div>

      <button
        type="button"
        @click="nextWeek"
        class="btn btn-secondary text-sm"
      >
        <ChevronRightIcon class="w-4 h-4" />
      </button>
    </div>

    <!-- Loading skeleton -->
    <div v-if="mealPlanStore.loading">
      <div class="hidden md:grid md:grid-cols-7 md:gap-2">
        <div v-for="n in 7" :key="n" class="rounded-lg p-3 bg-gray-50 dark:bg-slate-800 animate-pulse">
          <div class="text-center mb-3">
            <div class="h-3 bg-gray-200 dark:bg-slate-700 rounded w-8 mx-auto mb-1"></div>
            <div class="h-5 bg-gray-200 dark:bg-slate-700 rounded w-6 mx-auto"></div>
          </div>
          <div class="space-y-3">
            <div v-for="s in 3" :key="s">
              <div class="h-3 bg-gray-200 dark:bg-slate-700 rounded w-12 mb-1"></div>
              <div class="h-10 bg-gray-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="md:hidden space-y-2">
        <div v-for="n in 3" :key="n" class="rounded-lg p-3 bg-gray-50 dark:bg-slate-800 animate-pulse">
          <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-16 mb-2"></div>
          <div class="flex gap-2">
            <div v-for="s in 3" :key="s" class="flex-1 h-12 bg-gray-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop: 7-column grid -->
    <div v-else class="hidden md:grid md:grid-cols-7 md:gap-2">
      <DayColumn
        v-for="day in weekDays"
        :key="day.toISOString()"
        :date="day"
        :is-today="isSameDay(day, today)"
        @add-meal="$emit('add-meal', $event)"
        @remove-meal="$emit('remove-meal', $event)"
        @move-meal="$emit('move-meal', $event)"
      />
    </div>

    <!-- Mobile: vertical stack -->
    <div v-if="!mealPlanStore.loading" class="md:hidden space-y-2">
      <DayColumn
        v-for="day in weekDays"
        :key="day.toISOString()"
        :date="day"
        :is-today="isSameDay(day, today)"
        @add-meal="$emit('add-meal', $event)"
        @remove-meal="$emit('remove-meal', $event)"
        @move-meal="$emit('move-meal', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, format, isSameDay } from 'date-fns'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import DayColumn from './DayColumn.vue'
import { useMealPlanStore } from '../../stores'

const emit = defineEmits(['add-meal', 'remove-meal', 'move-meal'])

const mealPlanStore = useMealPlanStore()
const today = new Date()

const weekDays = computed(() => {
  if (!mealPlanStore.currentWeekStart) return []
  return Array.from({ length: 7 }, (_, i) => addDays(mealPlanStore.currentWeekStart, i))
})

const weekRangeLabel = computed(() => {
  if (!mealPlanStore.currentWeekStart) return ''
  const start = mealPlanStore.currentWeekStart
  const end = endOfWeek(start)
  const startStr = format(start, 'MMM d')
  const endStr = format(end, start.getMonth() === end.getMonth() ? 'd' : 'MMM d')
  return `${startStr} - ${endStr}, ${format(end, 'yyyy')}`
})

function prevWeek() {
  const prev = subWeeks(mealPlanStore.currentWeekStart, 1)
  mealPlanStore.loadWeek(prev)
}

function nextWeek() {
  const next = addWeeks(mealPlanStore.currentWeekStart, 1)
  mealPlanStore.loadWeek(next)
}

function goToToday() {
  const weekStart = startOfWeek(new Date())
  mealPlanStore.loadWeek(weekStart)
}
</script>
