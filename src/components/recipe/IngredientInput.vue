<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ingredients</label>
    <div class="space-y-2">
      <div
        v-for="(ing, i) in modelValue"
        :key="i"
        class="flex gap-2 items-start"
      >
        <input
          v-model="ing.amount"
          type="text"
          placeholder="Amt"
          class="input w-16 text-sm"
        />
        <input
          v-model="ing.unit"
          type="text"
          placeholder="Unit"
          class="input w-20 text-sm"
        />
        <input
          v-model="ing.name"
          type="text"
          placeholder="Ingredient"
          class="input flex-1 text-sm"
        />
        <input
          v-model="ing.notes"
          type="text"
          placeholder="Notes"
          class="input w-24 text-sm hidden sm:block"
        />
        <button
          @click="removeRow(i)"
          type="button"
          class="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 px-1 pt-2"
          :disabled="modelValue.length <= 1"
        >
          &times;
        </button>
      </div>
    </div>
    <button
      @click="addRow"
      type="button"
      class="mt-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
    >
      + Add ingredient
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

function addRow() {
  emit('update:modelValue', [
    ...props.modelValue,
    { amount: '', unit: '', name: '', notes: '' }
  ])
}

function removeRow(index) {
  const updated = props.modelValue.filter((_, i) => i !== index)
  emit('update:modelValue', updated)
}
</script>
