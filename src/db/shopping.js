/**
 * Shopping List Data Access Layer
 *
 * Thin wrapper over Dexie for shopping item CRUD operations.
 */
import db from './index.js'

export async function getAllShoppingItems() {
  return db.shopping.toArray()
}

export async function addShoppingItem(item) {
  await db.shopping.add(JSON.parse(JSON.stringify(item)))
  return item
}

export async function updateShoppingItem(id, updates) {
  await db.shopping.update(id, JSON.parse(JSON.stringify(updates)))
  return db.shopping.get(id)
}

export async function deleteShoppingItem(id) {
  await db.shopping.delete(id)
}

export async function clearAllShoppingItems() {
  await db.shopping.clear()
}
