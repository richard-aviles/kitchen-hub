<template>
  <div
    class="flex items-center gap-3 py-2 px-3 rounded-lg group transition-colors"
    :class="item.checked ? 'bg-gray-50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-800'"
  >
    <button
      type="button"
      @click="$emit('toggle', item.id)"
      class="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
      :class="item.checked ? 'border-primary-500 bg-primary-500' : 'border-gray-300 hover:border-primary-400 dark:border-slate-500 dark:hover:border-primary-400'"
      :aria-label="item.checked ? 'Uncheck item' : 'Check item'"
    >
      <CheckIcon v-if="item.checked" class="w-3.5 h-3.5 text-white" />
    </button>

    <div class="flex-1 min-w-0">
      <p
        class="text-sm font-medium truncate"
        :class="item.checked ? 'text-gray-400 line-through dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'"
      >
        <span v-if="item.amount" class="text-gray-500 dark:text-gray-400">{{ item.amount }}{{ item.unit ? ' ' + item.unit : '' }}</span>
        {{ item.name }}
      </p>
    </div>

    <span
      v-if="item.source === 'manual'"
      class="flex-shrink-0 text-xs text-gray-400 dark:text-gray-500"
    >
      manual
    </span>

    <button
      type="button"
      @click.stop="$emit('remove', item.id)"
      class="flex-shrink-0 md:opacity-0 md:group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
      aria-label="Remove item"
    >
      <XMarkIcon class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup>
import { CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline'

defineProps({
  item: {
    type: Object,
    required: true
  }
})

defineEmits(['toggle', 'remove'])
</script>
