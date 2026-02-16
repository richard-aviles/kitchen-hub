<template>
  <div class="min-h-[60px]">
    <div
      class="text-xs font-semibold uppercase tracking-wide mb-1"
      :class="slotColor"
    >
      {{ mealSlot }}
    </div>
    <draggable
      :list="localEntries"
      :group="{ name: 'meals', pull: true, put: true }"
      item-key="id"
      :data-date="date"
      :data-slot="mealSlot"
      class="space-y-1 min-h-[36px] rounded-md p-1 transition-colors"
      ghost-class="opacity-50"
      @change="onChange"
    >
      <template #item="{ element }">
        <MealEntry
          :entry="element"
          :recipe="getRecipe(element.recipeId)"
          :food="getFood(element.foodId)"
          @remove="$emit('remove-meal', $event)"
        />
      </template>
    </draggable>
    <button
      v-if="localEntries.length === 0"
      type="button"
      @click="$emit('add-meal', { date, slot: mealSlot })"
      class="w-full py-3 text-xs text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md border border-dashed border-gray-200 hover:border-primary-300 dark:text-gray-500 dark:hover:text-primary-400 dark:hover:bg-primary-900/20 dark:border-slate-600 dark:hover:border-primary-600 transition-colors"
    >
      + Add Meal
    </button>
    <button
      v-else
      type="button"
      @click="$emit('add-meal', { date, slot: mealSlot })"
      class="w-full mt-1 py-2.5 text-xs text-gray-400 hover:text-primary-600 dark:text-gray-500 dark:hover:text-primary-400 transition-colors"
    >
      + Add
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import draggable from 'vuedraggable'
import MealEntry from './MealEntry.vue'
import { useRecipeStore, useFoodStore } from '../../stores'

const props = defineProps({
  date: {
    type: String,
    required: true
  },
  mealSlot: {
    type: String,
    required: true,
    validator: (v) => ['breakfast', 'lunch', 'dinner'].includes(v)
  },
  entries: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['add-meal', 'remove-meal', 'move-meal'])

const recipeStore = useRecipeStore()
const foodStore = useFoodStore()

const slotColorMap = {
  breakfast: 'text-amber-500 dark:text-amber-400',
  lunch: 'text-emerald-500 dark:text-emerald-400',
  dinner: 'text-indigo-500 dark:text-indigo-400',
}
const slotColor = computed(() => slotColorMap[props.mealSlot] || 'text-gray-400 dark:text-gray-500')

const localEntries = ref([...props.entries])

watch(() => props.entries, (newEntries) => {
  localEntries.value = [...newEntries]
}, { deep: true })

function getRecipe(recipeId) {
  if (!recipeId) return null
  return recipeStore.getById(recipeId)
}

function getFood(foodId) {
  if (!foodId) return null
  return foodStore.getById(foodId)
}

function onChange(evt) {
  if (evt.added) {
    const entry = evt.added.element
    emit('move-meal', { id: entry.id, date: props.date, slot: props.mealSlot })
  }
}
</script>
