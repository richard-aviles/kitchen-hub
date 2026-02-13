<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Instructions</label>
    <div class="space-y-2">
      <div
        v-for="(step, i) in modelValue"
        :key="i"
        class="flex gap-2 items-start"
      >
        <span class="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 text-gray-500 dark:bg-slate-600 dark:text-gray-300 flex items-center justify-center text-sm font-semibold mt-1.5">
          {{ i + 1 }}
        </span>
        <textarea
          :value="step"
          @input="updateStep(i, $event.target.value)"
          placeholder="Describe this step..."
          rows="2"
          class="input flex-1 text-sm"
        />
        <button
          @click="removeStep(i)"
          type="button"
          class="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 px-1 pt-2"
          :disabled="modelValue.length <= 1"
        >
          &times;
        </button>
      </div>
    </div>
    <button
      @click="addStep"
      type="button"
      class="mt-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
    >
      + Add step
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

function addStep() {
  emit('update:modelValue', [...props.modelValue, ''])
}

function removeStep(index) {
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== index))
}

function updateStep(index, value) {
  const updated = [...props.modelValue]
  updated[index] = value
  emit('update:modelValue', updated)
}
</script>
