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
      <div class="modal-content relative bg-white dark:bg-slate-800 w-full md:max-w-sm md:rounded-xl rounded-t-xl p-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Edit Meal</h2>
          <button type="button" @click="$emit('cancel')" class="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <div class="mb-4">
          <div class="flex items-center gap-2 mb-1">
            <span v-if="entry?.foodId" class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
              <BoltIcon class="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            </span>
            <p class="font-medium text-gray-800 dark:text-gray-100">{{ mealName }}</p>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ slotLabel }} &middot; {{ dateLabel }}</p>
        </div>

        <!-- Servings / Amount toggle (foods only) -->
        <div v-if="canUseAmount" class="flex gap-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1 w-fit mb-3">
          <button
            type="button"
            @click="setInputMode('servings')"
            class="px-3 py-1 text-xs font-medium rounded-md transition-colors"
            :class="inputMode === 'servings'
              ? 'bg-white dark:bg-slate-600 shadow-sm text-gray-800 dark:text-gray-100'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
          >
            Servings
          </button>
          <button
            type="button"
            @click="setInputMode('amount')"
            class="px-3 py-1 text-xs font-medium rounded-md transition-colors"
            :class="inputMode === 'amount'
              ? 'bg-white dark:bg-slate-600 shadow-sm text-gray-800 dark:text-gray-100'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
          >
            Amount ({{ parsedServingSize?.unit }})
          </button>
        </div>

        <!-- Servings input -->
        <div v-if="inputMode === 'servings'">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Servings</label>
          <input
            v-model.number="servings"
            type="number"
            min="0.25"
            step="0.25"
            class="input w-24 mb-4"
          />
        </div>

        <!-- Amount input -->
        <div v-else>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Amount ({{ parsedServingSize?.unit }})
          </label>
          <input
            v-model.number="rawAmount"
            type="number"
            min="0.1"
            step="1"
            class="input w-24 mb-4"
          />
        </div>

        <div class="flex gap-2">
          <button
            type="button"
            @click="handleSave"
            class="btn btn-primary flex-1"
          >
            Save
          </button>
          <button
            type="button"
            @click="$emit('delete', entry.id)"
            class="btn text-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/70"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
    </Transition>
  </teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format } from 'date-fns'
import { XMarkIcon, BoltIcon } from '@heroicons/vue/24/outline'
import { useRecipeStore, useFoodStore } from '../../stores'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  entry: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['save', 'delete', 'cancel'])

const recipeStore = useRecipeStore()
const foodStore = useFoodStore()

const servings = ref(1)
const inputMode = ref('servings')
const rawAmount = ref(0)

const food = computed(() => {
  if (!props.entry?.foodId) return null
  return foodStore.getById(props.entry.foodId)
})

function parseServingSize(sizeStr) {
  if (!sizeStr) return null
  const match = sizeStr.match(/^([\d.]+)\s*([a-zA-Z]+)/)
  if (!match) return null
  return { value: parseFloat(match[1]), unit: match[2] }
}

const parsedServingSize = computed(() => parseServingSize(food.value?.servingSize))
const canUseAmount = computed(() => !!parsedServingSize.value)

function setInputMode(mode) {
  if (!parsedServingSize.value) return
  if (mode === 'amount' && inputMode.value === 'servings') {
    rawAmount.value = Math.round(servings.value * parsedServingSize.value.value * 10) / 10
  } else if (mode === 'servings' && inputMode.value === 'amount') {
    servings.value = Math.round((rawAmount.value / parsedServingSize.value.value) * 100) / 100 || 1
  }
  inputMode.value = mode
}

const mealName = computed(() => {
  if (!props.entry) return ''
  if (props.entry.foodId) {
    const food = foodStore.getById(props.entry.foodId)
    return food?.name || 'Unknown Food'
  }
  if (props.entry.recipeId) {
    const recipe = recipeStore.getById(props.entry.recipeId)
    return recipe?.name || 'Unknown Recipe'
  }
  return 'Unknown Item'
})

const slotLabel = computed(() => {
  if (!props.entry?.slot) return ''
  return props.entry.slot.charAt(0).toUpperCase() + props.entry.slot.slice(1)
})

const dateLabel = computed(() => {
  if (!props.entry?.date) return ''
  const parts = props.entry.date.split('-')
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  return format(d, 'EEE, MMM d')
})

watch(() => props.show, (isVisible) => {
  if (isVisible && props.entry) {
    servings.value = props.entry.servings || 1
    inputMode.value = 'servings'
    rawAmount.value = 0
  }
})

function handleSave() {
  const finalServings = (inputMode.value === 'amount' && parsedServingSize.value)
    ? rawAmount.value / parsedServingSize.value.value
    : servings.value
  emit('save', {
    id: props.entry.id,
    servings: finalServings
  })
}
</script>
