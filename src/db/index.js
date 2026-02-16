/**
 * Dexie Database Instance
 *
 * Central IndexedDB database for KitchenHub.
 * Defines all tables and their indexed fields.
 */
import Dexie from 'dexie'

const db = new Dexie('KitchenHubDB')

db.version(1).stores({
  recipes: 'id, name, *tags.mealType, createdAt, updatedAt',
  mealPlans: 'id, date, [date+slot]',
  shopping: 'id, name, checked, category',
  photos: 'id, recipeId',
  settings: 'key'
})

db.version(2).stores({
  recipes: 'id, name, *tags.mealType, createdAt, updatedAt',
  mealPlans: 'id, date, [date+slot]',
  shopping: 'id, name, checked, category',
  photos: 'id, recipeId',
  settings: 'key',
  foods: 'id, name, barcode, source'
})

export default db
