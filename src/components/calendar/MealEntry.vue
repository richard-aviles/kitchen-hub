<template>
  <div class="flex items-center gap-2 bg-white dark:bg-slate-700 rounded-lg p-2 shadow-sm border border-gray-100 dark:border-slate-600 group">
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-1.5">
        <span v-if="food" class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex-shrink-0" title="Quick-add food">
          <BoltIcon class="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
        </span>
        <p class="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
          {{ displayName }}
        </p>
      </div>
      <span class="text-xs text-gray-500 dark:text-gray-400">{{ entry.servings }} serving{{ entry.servings !== 1 ? 's' : '' }}</span>
    </div>
    <button
      type="button"
      @click.stop="$emit('remove', entry.id)"
      class="md:opacity-0 md:group-hover:opacity-100 flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition-opacity duration-200"
      aria-label="Remove meal"
    >
      <TrashIcon class="w-5 h-5" />
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { TrashIcon, BoltIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  entry: {
    type: Object,
    required: true
  },
  recipe: {
    type: Object,
    default: null
  },
  food: {
    type: Object,
    default: null
  }
})

defineEmits(['remove'])

const displayName = computed(() => {
  if (props.food) return props.food.name
  if (props.recipe) return props.recipe.name
  return 'Unknown Item'
})
</script>
