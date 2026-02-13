<template>
  <teleport to="body">
    <Transition name="modal">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      @keydown.escape="$emit('cancel')"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50" @click="$emit('cancel')"></div>

      <!-- Dialog -->
      <div class="modal-content relative bg-white dark:bg-slate-800 w-full md:max-w-sm md:rounded-xl rounded-t-xl p-4">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{{ title }}</h2>
        <p class="text-gray-600 dark:text-gray-300 text-sm mb-4">{{ message }}</p>

        <div class="flex gap-2">
          <button
            type="button"
            @click="$emit('cancel')"
            class="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            ref="confirmBtn"
            type="button"
            @click="$emit('confirm')"
            class="btn flex-1"
            :class="confirmClass"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
    </Transition>
  </teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Are you sure?'
  },
  message: {
    type: String,
    default: ''
  },
  confirmText: {
    type: String,
    default: 'Delete'
  },
  confirmClass: {
    type: String,
    default: 'btn-danger'
  }
})

defineEmits(['confirm', 'cancel'])

const confirmBtn = ref(null)

watch(() => props.show, (isVisible) => {
  if (isVisible) {
    nextTick(() => confirmBtn.value?.focus())
  }
})
</script>
