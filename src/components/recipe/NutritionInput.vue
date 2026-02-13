<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nutrition (per serving)</label>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div>
        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Calories</label>
        <input
          :value="modelValue.calories"
          @input="update('calories', $event.target.value)"
          type="number"
          min="0"
          placeholder="0"
          class="input text-sm"
        />
      </div>
      <div>
        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Protein (g)</label>
        <input
          :value="modelValue.protein"
          @input="update('protein', $event.target.value)"
          type="number"
          min="0"
          placeholder="0"
          class="input text-sm"
        />
      </div>
      <div>
        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Carbs (g)</label>
        <input
          :value="modelValue.carbs"
          @input="update('carbs', $event.target.value)"
          type="number"
          min="0"
          placeholder="0"
          class="input text-sm"
        />
      </div>
      <div>
        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Fat (g)</label>
        <input
          :value="modelValue.fat"
          @input="update('fat', $event.target.value)"
          type="number"
          min="0"
          placeholder="0"
          class="input text-sm"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

function update(field, value) {
  const numVal = value === '' ? null : Number(value)
  emit('update:modelValue', { ...props.modelValue, [field]: numVal })
}
</script>
