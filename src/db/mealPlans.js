/**
 * Meal Plan Data Access Layer
 *
 * Thin wrapper over Dexie for meal plan CRUD operations.
 */
import db from './index.js'

export async function getMealPlansForWeek(startDate, endDate) {
  return db.mealPlans
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray()
}

export async function addMealPlan(entry) {
  await db.mealPlans.add(JSON.parse(JSON.stringify(entry)))
  return entry
}

export async function updateMealPlan(id, updates) {
  await db.mealPlans.update(id, JSON.parse(JSON.stringify(updates)))
  return db.mealPlans.get(id)
}

export async function deleteMealPlan(id) {
  await db.mealPlans.delete(id)
}
