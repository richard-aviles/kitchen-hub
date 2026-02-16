/**
 * Foods Data Access Layer
 *
 * Thin wrapper over Dexie for food CRUD operations.
 * Foods are individual items looked up via USDA or Open Food Facts APIs.
 */
import db from './index.js'

export async function getAllFoods() {
  return db.foods.toArray()
}

export async function getFoodById(id) {
  return db.foods.get(id)
}

export async function addFood(food) {
  await db.foods.put(JSON.parse(JSON.stringify(food)))
  return food
}

export async function updateFood(id, updates) {
  await db.foods.update(id, JSON.parse(JSON.stringify(updates)))
  return db.foods.get(id)
}

export async function deleteFood(id) {
  await db.foods.delete(id)
}
