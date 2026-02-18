<template>
  <form @submit.prevent="handleSubmit" class="space-y-6 pb-20" novalidate>
    <!-- Name -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recipe Name *</label>
      <input v-model="form.name" type="text" required class="input" placeholder="e.g. Chicken Stir Fry" />
    </div>

    <!-- Prep/Cook time + Servings -->
    <div class="grid grid-cols-3 gap-3">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prep (min)</label>
        <input v-model.number="form.prepTime" type="number" min="0" class="input text-sm" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cook (min)</label>
        <input v-model.number="form.cookTime" type="number" min="0" class="input text-sm" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Servings</label>
        <input v-model.number="form.servings" type="number" min="1" class="input text-sm" />
      </div>
    </div>

    <!-- Ingredients -->
    <IngredientInput v-model="form.ingredients" />

    <!-- Instructions -->
    <InstructionInput v-model="form.instructions" />

    <!-- Tags -->
    <TagSelector v-model="form.tags" />

    <!-- Nutrition -->
    <NutritionInput v-model="form.nutrition" />

    <!-- Notes -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
      <textarea v-model="form.notes" rows="3" class="input text-sm" placeholder="Tips, variations, etc." />
    </div>

    <!-- Photo upload -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Photo</label>
      <div v-if="photoPreviewUrl" class="relative mb-2">
        <img
          :src="photoPreviewUrl"
          alt="Recipe preview"
          class="w-full h-40 object-cover rounded-lg border border-gray-200 dark:border-slate-600"
        />
        <button
          type="button"
          @click="removePhoto"
          class="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        capture="environment"
        class="hidden"
        @change="onFileSelected"
      />
      <button
        v-if="!photoPreviewUrl"
        type="button"
        @click="$refs.fileInput.click()"
        class="btn btn-secondary text-sm w-full flex items-center justify-center gap-2"
      >
        <CameraIcon class="w-4 h-4" />
        Take or Choose Photo
      </button>
      <button
        v-else
        type="button"
        @click="$refs.fileInput.click()"
        class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mt-1"
      >
        Change photo
      </button>
    </div>

    <!-- Image URL -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
      <input v-model="form.imageUrl" type="url" class="input text-sm" placeholder="https://example.com/photo.jpg" />
      <img
        v-if="form.imageUrl && !photoPreviewUrl"
        :src="form.imageUrl"
        alt="Recipe preview"
        class="mt-2 w-full h-40 object-cover rounded-lg border border-gray-200 dark:border-slate-600"
        @error="$event.target.style.display = 'none'"
      />
    </div>

    <!-- Source URL -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source URL</label>
      <input v-model="form.sourceUrl" type="url" class="input text-sm" placeholder="https://..." />
    </div>

    <!-- Actions -->
    <div class="flex gap-3 pt-2">
      <button type="button" @click="handleSubmit" class="btn btn-primary flex-1">
        {{ initialData ? 'Save Changes' : 'Add Recipe' }}
      </button>
      <button type="button" @click="$emit('cancel')" class="btn btn-secondary">
        Cancel
      </button>
    </div>
  </form>
</template>

<script setup>
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue'
import { XMarkIcon, CameraIcon } from '@heroicons/vue/24/outline'
import IngredientInput from './IngredientInput.vue'
import InstructionInput from './InstructionInput.vue'
import NutritionInput from './NutritionInput.vue'
import TagSelector from './TagSelector.vue'
import { getPhotoUrl, revokePhotoUrl } from '../../services/photoService.js'

const props = defineProps({
  initialData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['save', 'cancel'])

const fileInput = ref(null)
const photoPreviewUrl = ref(null)
const selectedPhotoFile = ref(null)
const photoRemoved = ref(false)

const defaultForm = {
  name: '',
  prepTime: null,
  cookTime: null,
  servings: null,
  ingredients: [{ amount: '', unit: '', name: '', notes: '' }],
  instructions: [''],
  tags: { mealType: [], cuisine: '', custom: [] },
  nutrition: { calories: null, protein: null, carbs: null, fat: null },
  notes: '',
  imageUrl: '',
  sourceUrl: ''
}

const form = reactive(
  props.initialData
    ? {
        name: props.initialData.name || '',
        prepTime: props.initialData.prepTime ?? null,
        cookTime: props.initialData.cookTime ?? null,
        servings: props.initialData.servings ?? null,
        ingredients: props.initialData.ingredients?.length
          ? props.initialData.ingredients.map(ing => ({ ...ing }))
          : [{ amount: '', unit: '', name: '', notes: '' }],
        instructions: props.initialData.instructions?.length
          ? [...props.initialData.instructions]
          : [''],
        tags: {
          mealType: [...(props.initialData.tags?.mealType || [])],
          cuisine: props.initialData.tags?.cuisine || '',
          custom: [...(props.initialData.tags?.custom || [])]
        },
        nutrition: { ...{ calories: null, protein: null, carbs: null, fat: null }, ...props.initialData.nutrition },
        notes: props.initialData.notes || '',
        imageUrl: props.initialData.imageUrl || '',
        sourceUrl: props.initialData.sourceUrl || ''
      }
    : JSON.parse(JSON.stringify(defaultForm))
)

// Load existing photo preview when editing a recipe
onMounted(async () => {
  if (props.initialData?.driveFileId) {
    try {
      const url = await getPhotoUrl(props.initialData.id, props.initialData.driveFileId)
      if (url) photoPreviewUrl.value = url
    } catch {
      // Photo not available — that's fine
    }
  }
})

onBeforeUnmount(() => {
  revokePhotoUrl(photoPreviewUrl.value)
})

function onFileSelected(event) {
  const file = event.target.files?.[0]
  if (!file) return

  selectedPhotoFile.value = file
  photoRemoved.value = false

  // Show preview
  revokePhotoUrl(photoPreviewUrl.value)
  photoPreviewUrl.value = URL.createObjectURL(file)
}

function removePhoto() {
  selectedPhotoFile.value = null
  photoRemoved.value = true
  revokePhotoUrl(photoPreviewUrl.value)
  photoPreviewUrl.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function handleSubmit() {
  if (!form.name.trim()) return

  // Deep-clone to strip Vue reactive proxies before persisting to IndexedDB
  const raw = JSON.parse(JSON.stringify(form))

  // Clean up empty ingredients/instructions
  raw.ingredients = raw.ingredients.filter(ing => ing.name.trim())
  raw.instructions = raw.instructions.filter(step => step.trim())

  emit('save', raw, {
    photoFile: selectedPhotoFile.value,
    photoRemoved: photoRemoved.value
  })
}
</script>
