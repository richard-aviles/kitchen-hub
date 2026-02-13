/**
 * Recipe Data Access Layer
 *
 * Thin wrapper over Dexie for recipe CRUD operations.
 */
import db from './index.js'

export async function getAllRecipes() {
  return db.recipes.toArray()
}

export async function getRecipeById(id) {
  return db.recipes.get(id)
}

export async function addRecipe(recipe) {
  await db.recipes.add(recipe)
  return recipe
}

export async function updateRecipe(id, updates) {
  await db.recipes.update(id, updates)
  return db.recipes.get(id)
}

export async function deleteRecipe(id) {
  await db.recipes.delete(id)
}
