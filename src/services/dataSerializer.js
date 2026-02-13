/**
 * Data Serializer
 *
 * Handles export from and import to IndexedDB.
 * Photos are local-only and not synced (DEC-010).
 */
import db from '../db/index.js'

/**
 * Export all recipes, stripping photoId (photos are local-only).
 */
export async function exportRecipes() {
  const recipes = await db.recipes.toArray()
  return recipes.map(({ photoId, ...rest }) => rest)
}

/**
 * Import recipes: clear existing and bulk-add new data.
 */
export async function importRecipes(data) {
  await db.recipes.clear()
  if (data?.length) {
    await db.recipes.bulkAdd(data)
  }
}

/**
 * Export all meal plans.
 */
export async function exportMealPlans() {
  return db.mealPlans.toArray()
}

/**
 * Import meal plans: clear existing and bulk-add new data.
 */
export async function importMealPlans(data) {
  await db.mealPlans.clear()
  if (data?.length) {
    await db.mealPlans.bulkAdd(data)
  }
}

/**
 * Export all shopping items.
 */
export async function exportShopping() {
  return db.shopping.toArray()
}

/**
 * Import shopping items: clear existing and bulk-add new data.
 */
export async function importShopping(data) {
  await db.shopping.clear()
  if (data?.length) {
    await db.shopping.bulkAdd(data)
  }
}
