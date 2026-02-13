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
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Add Item</h2>
          <button type="button" @click="$emit('cancel')" class="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item name</label>
            <input
              ref="nameInput"
              v-model="name"
              type="text"
              placeholder="e.g. Bread"
              class="input"
              @keyup.enter="confirm"
            />
          </div>

          <div class="flex gap-2">
            <div class="w-20">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Qty</label>
              <input
                v-model="amount"
                type="text"
                placeholder="1"
                class="input"
              />
            </div>
            <div class="w-24">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
              <input
                v-model="unit"
                type="text"
                placeholder="lb"
                class="input"
              />
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select v-model="category" class="input">
                <option value="">Auto</option>
                <option value="Produce">Produce</option>
                <option value="Dairy">Dairy</option>
                <option value="Meat & Seafood">Meat & Seafood</option>
                <option value="Pantry">Pantry</option>
                <option value="Frozen">Frozen</option>
                <option value="Beverages">Beverages</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div class="flex gap-2 mt-4">
          <button
            type="button"
            @click="$emit('cancel')"
            class="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="confirm"
            :disabled="!name.trim()"
            class="btn btn-primary flex-1 disabled:opacity-50"
          >
            Add Item
          </button>
        </div>
      </div>
    </div>
    </Transition>
  </teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['save', 'cancel'])

const name = ref('')
const amount = ref('')
const unit = ref('')
const category = ref('')
const nameInput = ref(null)

watch(() => props.show, (isVisible) => {
  if (isVisible) {
    name.value = ''
    amount.value = ''
    unit.value = ''
    category.value = ''
    nextTick(() => nameInput.value?.focus())
  }
})

function confirm() {
  if (!name.value.trim()) return
  emit('save', {
    name: name.value,
    amount: amount.value,
    unit: unit.value,
    category: category.value
  })
}
</script>
