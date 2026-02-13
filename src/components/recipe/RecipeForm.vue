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
import { reactive } from 'vue'
import IngredientInput from './IngredientInput.vue'
import InstructionInput from './InstructionInput.vue'
import NutritionInput from './NutritionInput.vue'
import TagSelector from './TagSelector.vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['save', 'cancel'])

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
        sourceUrl: props.initialData.sourceUrl || ''
      }
    : JSON.parse(JSON.stringify(defaultForm))
)

function handleSubmit() {
  if (!form.name.trim()) return

  // Deep-clone to strip Vue reactive proxies before persisting to IndexedDB
  const raw = JSON.parse(JSON.stringify(form))

  // Clean up empty ingredients/instructions
  raw.ingredients = raw.ingredients.filter(ing => ing.name.trim())
  raw.instructions = raw.instructions.filter(step => step.trim())

  emit('save', raw)
}
</script>
