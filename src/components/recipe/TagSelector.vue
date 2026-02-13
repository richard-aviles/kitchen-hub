<template>
  <div class="space-y-4">
    <!-- Meal Type toggle pills -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meal Type</label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="type in mealTypes"
          :key="type"
          type="button"
          @click="toggleMealType(type)"
          class="px-3 py-1 text-sm font-medium rounded-full transition-colors"
          :class="modelValue.mealType.includes(type)
            ? 'bg-primary-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600'"
        >
          {{ type }}
        </button>
      </div>
    </div>

    <!-- Cuisine -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cuisine</label>
      <select
        :value="modelValue.cuisine"
        @change="updateCuisine($event.target.value)"
        class="input text-sm"
      >
        <option value="">Select cuisine...</option>
        <option v-for="c in cuisines" :key="c" :value="c">{{ c }}</option>
      </select>
    </div>

    <!-- Custom tags -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Custom Tags</label>
      <div class="flex flex-wrap gap-2 mb-2">
        <span
          v-for="(tag, i) in modelValue.custom"
          :key="i"
          class="inline-flex items-center gap-1 px-2 py-1 text-sm rounded-full bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300"
        >
          {{ tag }}
          <button type="button" @click="removeCustomTag(i)" class="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400">&times;</button>
        </span>
      </div>
      <div class="flex gap-2">
        <input
          v-model="newTag"
          @keydown.enter.prevent="addCustomTag"
          type="text"
          placeholder="Add a tag..."
          class="input flex-1 text-sm"
        />
        <button type="button" @click="addCustomTag" class="btn btn-secondary text-sm">Add</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert']
const cuisines = [
  'American', 'Chinese', 'French', 'Greek', 'Indian',
  'Italian', 'Japanese', 'Korean', 'Mexican', 'Thai', 'Other'
]

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])
const newTag = ref('')

function toggleMealType(type) {
  const current = [...props.modelValue.mealType]
  const index = current.indexOf(type)
  if (index >= 0) {
    current.splice(index, 1)
  } else {
    current.push(type)
  }
  emit('update:modelValue', { ...props.modelValue, mealType: current })
}

function updateCuisine(value) {
  emit('update:modelValue', { ...props.modelValue, cuisine: value })
}

function addCustomTag() {
  const tag = newTag.value.trim()
  if (tag && !props.modelValue.custom.includes(tag)) {
    emit('update:modelValue', {
      ...props.modelValue,
      custom: [...props.modelValue.custom, tag]
    })
    newTag.value = ''
  }
}

function removeCustomTag(index) {
  const custom = props.modelValue.custom.filter((_, i) => i !== index)
  emit('update:modelValue', { ...props.modelValue, custom })
}
</script>
