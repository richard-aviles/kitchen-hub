/**
 * Seed Data — Test recipes for development
 *
 * Run once to populate IndexedDB with sample recipes.
 * Import and call seedRecipes() from browser console or a component.
 */
import db from './index.js'

const testRecipes = [
  {
    id: crypto.randomUUID(),
    name: 'Chicken Stir Fry',
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    ingredients: [
      { amount: '1.5', unit: 'lbs', name: 'chicken breast', notes: 'cut into strips' },
      { amount: '2', unit: 'tbsp', name: 'soy sauce', notes: '' },
      { amount: '1', unit: 'tbsp', name: 'sesame oil', notes: '' },
      { amount: '2', unit: 'cups', name: 'broccoli florets', notes: '' },
      { amount: '1', unit: '', name: 'red bell pepper', notes: 'sliced' },
      { amount: '3', unit: 'cloves', name: 'garlic', notes: 'minced' },
      { amount: '1', unit: 'tbsp', name: 'cornstarch', notes: '' },
      { amount: '2', unit: 'cups', name: 'rice', notes: 'cooked, for serving' }
    ],
    instructions: [
      'Cut chicken into thin strips and season with salt and pepper.',
      'Heat sesame oil in a large skillet or wok over high heat.',
      'Cook chicken strips for 5-6 minutes until golden. Remove and set aside.',
      'Add broccoli and bell pepper to the pan, stir fry for 3-4 minutes.',
      'Add garlic and cook 30 seconds until fragrant.',
      'Mix soy sauce with cornstarch and a splash of water. Pour into pan.',
      'Return chicken to pan and toss everything together for 2 minutes.',
      'Serve over cooked rice.'
    ],
    tags: { mealType: ['Dinner'], cuisine: 'Asian', custom: ['Quick', 'High Protein'] },
    nutrition: { calories: 420, protein: 38, carbs: 35, fat: 12 },
    notes: 'Great for meal prep. Can swap chicken for tofu.',
    sourceUrl: '',
    photoId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    name: 'Classic Pancakes',
    prepTime: 5,
    cookTime: 15,
    servings: 4,
    ingredients: [
      { amount: '1.5', unit: 'cups', name: 'all-purpose flour', notes: '' },
      { amount: '3.5', unit: 'tsp', name: 'baking powder', notes: '' },
      { amount: '1', unit: 'tbsp', name: 'sugar', notes: '' },
      { amount: '1.25', unit: 'cups', name: 'milk', notes: '' },
      { amount: '1', unit: '', name: 'egg', notes: '' },
      { amount: '3', unit: 'tbsp', name: 'butter', notes: 'melted' },
      { amount: '1', unit: 'pinch', name: 'salt', notes: '' }
    ],
    instructions: [
      'Mix flour, baking powder, sugar, and salt in a large bowl.',
      'Make a well in the center. Pour in milk, egg, and melted butter.',
      'Whisk until smooth — a few small lumps are okay.',
      'Heat a griddle or pan over medium heat. Lightly grease with butter.',
      'Pour about 1/4 cup batter per pancake onto the griddle.',
      'Cook until bubbles form on the surface, then flip. Cook 1-2 more minutes.',
      'Serve with maple syrup, fresh fruit, or whipped cream.'
    ],
    tags: { mealType: ['Breakfast'], cuisine: 'American', custom: ['Kid Friendly'] },
    nutrition: { calories: 310, protein: 8, carbs: 42, fat: 12 },
    notes: 'Add blueberries or chocolate chips to the batter for variety.',
    sourceUrl: '',
    photoId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    name: 'Caesar Salad',
    prepTime: 15,
    cookTime: 0,
    servings: 2,
    ingredients: [
      { amount: '1', unit: 'head', name: 'romaine lettuce', notes: 'chopped' },
      { amount: '0.5', unit: 'cup', name: 'parmesan cheese', notes: 'shaved' },
      { amount: '1', unit: 'cup', name: 'croutons', notes: '' },
      { amount: '3', unit: 'tbsp', name: 'Caesar dressing', notes: '' },
      { amount: '1', unit: '', name: 'lemon', notes: 'juiced' },
      { amount: '1', unit: '', name: 'chicken breast', notes: 'grilled, optional' }
    ],
    instructions: [
      'Wash and chop romaine lettuce into bite-sized pieces.',
      'If adding chicken, grill a seasoned chicken breast and slice it.',
      'Toss lettuce with Caesar dressing and lemon juice.',
      'Top with shaved parmesan, croutons, and sliced chicken.',
      'Serve immediately.'
    ],
    tags: { mealType: ['Lunch'], cuisine: 'American', custom: ['Low Carb'] },
    nutrition: { calories: 280, protein: 22, carbs: 14, fat: 16 },
    notes: 'Add grilled chicken to make it a full meal.',
    sourceUrl: '',
    photoId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    name: 'Spaghetti Bolognese',
    prepTime: 10,
    cookTime: 40,
    servings: 6,
    ingredients: [
      { amount: '1', unit: 'lb', name: 'ground beef', notes: '' },
      { amount: '1', unit: '', name: 'onion', notes: 'diced' },
      { amount: '3', unit: 'cloves', name: 'garlic', notes: 'minced' },
      { amount: '1', unit: 'can (28oz)', name: 'crushed tomatoes', notes: '' },
      { amount: '2', unit: 'tbsp', name: 'tomato paste', notes: '' },
      { amount: '1', unit: 'tsp', name: 'dried oregano', notes: '' },
      { amount: '1', unit: 'tsp', name: 'dried basil', notes: '' },
      { amount: '1', unit: 'lb', name: 'spaghetti', notes: '' },
      { amount: '0.5', unit: 'cup', name: 'parmesan cheese', notes: 'grated, for serving' }
    ],
    instructions: [
      'Cook spaghetti according to package directions. Drain and set aside.',
      'Brown ground beef in a large pot over medium-high heat. Drain excess fat.',
      'Add diced onion and cook 3-4 minutes until softened.',
      'Add garlic and cook 30 seconds.',
      'Stir in crushed tomatoes, tomato paste, oregano, and basil.',
      'Simmer on low for 25-30 minutes, stirring occasionally.',
      'Season with salt and pepper to taste.',
      'Serve sauce over spaghetti with grated parmesan.'
    ],
    tags: { mealType: ['Dinner'], cuisine: 'Italian', custom: ['Family Favorite', 'Meal Prep'] },
    nutrition: { calories: 520, protein: 28, carbs: 62, fat: 16 },
    notes: 'Sauce freezes well. Double the batch for easy future meals.',
    sourceUrl: '',
    photoId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    name: 'Greek Yogurt Parfait',
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    ingredients: [
      { amount: '1', unit: 'cup', name: 'Greek yogurt', notes: 'plain or vanilla' },
      { amount: '0.5', unit: 'cup', name: 'granola', notes: '' },
      { amount: '0.5', unit: 'cup', name: 'mixed berries', notes: 'fresh or frozen' },
      { amount: '1', unit: 'tbsp', name: 'honey', notes: '' }
    ],
    instructions: [
      'Layer half the yogurt in a glass or bowl.',
      'Add half the granola and half the berries.',
      'Repeat layers with remaining yogurt, granola, and berries.',
      'Drizzle honey on top. Serve immediately.'
    ],
    tags: { mealType: ['Breakfast', 'Snack'], cuisine: '', custom: ['No Cook', 'Quick'] },
    nutrition: { calories: 320, protein: 18, carbs: 45, fat: 8 },
    notes: 'Prep the night before (skip granola) for overnight grab-and-go.',
    sourceUrl: '',
    photoId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    name: 'Beef Tacos',
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    ingredients: [
      { amount: '1', unit: 'lb', name: 'ground beef', notes: '' },
      { amount: '1', unit: 'packet', name: 'taco seasoning', notes: '' },
      { amount: '8', unit: '', name: 'taco shells', notes: 'hard or soft' },
      { amount: '1', unit: 'cup', name: 'shredded lettuce', notes: '' },
      { amount: '1', unit: 'cup', name: 'shredded cheddar cheese', notes: '' },
      { amount: '2', unit: '', name: 'tomatoes', notes: 'diced' },
      { amount: '0.5', unit: 'cup', name: 'sour cream', notes: '' },
      { amount: '1', unit: '', name: 'avocado', notes: 'sliced' }
    ],
    instructions: [
      'Brown ground beef in a skillet over medium-high heat. Drain fat.',
      'Add taco seasoning and water per packet instructions. Simmer 5 minutes.',
      'Warm taco shells in the oven at 325°F for 5 minutes.',
      'Set up toppings: lettuce, cheese, tomatoes, sour cream, avocado.',
      'Fill shells with seasoned beef and top as desired.'
    ],
    tags: { mealType: ['Dinner', 'Lunch'], cuisine: 'Mexican', custom: ['Kid Friendly', 'Quick'] },
    nutrition: { calories: 450, protein: 26, carbs: 30, fat: 24 },
    notes: 'Taco Tuesday staple. Works great with ground turkey too.',
    sourceUrl: '',
    photoId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    name: 'Overnight Oats',
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    ingredients: [
      { amount: '0.5', unit: 'cup', name: 'rolled oats', notes: '' },
      { amount: '0.5', unit: 'cup', name: 'milk', notes: 'any kind' },
      { amount: '0.25', unit: 'cup', name: 'Greek yogurt', notes: '' },
      { amount: '1', unit: 'tbsp', name: 'chia seeds', notes: '' },
      { amount: '1', unit: 'tbsp', name: 'maple syrup', notes: '' },
      { amount: '0.5', unit: 'cup', name: 'sliced banana', notes: 'or berries' }
    ],
    instructions: [
      'Combine oats, milk, yogurt, chia seeds, and maple syrup in a jar.',
      'Stir well, cover, and refrigerate overnight (or at least 4 hours).',
      'In the morning, top with sliced banana or berries.',
      'Eat cold or microwave for 1-2 minutes if you prefer warm.'
    ],
    tags: { mealType: ['Breakfast'], cuisine: '', custom: ['No Cook', 'Meal Prep'] },
    nutrition: { calories: 350, protein: 14, carbs: 52, fat: 10 },
    notes: 'Make 5 jars on Sunday for the whole week.',
    sourceUrl: '',
    photoId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    name: 'Grilled Cheese & Tomato Soup',
    prepTime: 5,
    cookTime: 15,
    servings: 2,
    ingredients: [
      { amount: '4', unit: 'slices', name: 'bread', notes: 'sourdough or white' },
      { amount: '4', unit: 'slices', name: 'cheddar cheese', notes: '' },
      { amount: '2', unit: 'tbsp', name: 'butter', notes: '' },
      { amount: '1', unit: 'can (28oz)', name: 'tomato soup', notes: '' }
    ],
    instructions: [
      'Heat tomato soup in a pot over medium heat, stirring occasionally.',
      'Butter one side of each bread slice.',
      'Place cheese between two slices (butter sides facing out).',
      'Cook sandwiches in a skillet over medium heat, 3-4 minutes per side until golden and cheese is melted.',
      'Serve grilled cheese alongside a bowl of hot tomato soup.'
    ],
    tags: { mealType: ['Lunch'], cuisine: 'American', custom: ['Kid Friendly', 'Comfort Food'] },
    nutrition: { calories: 480, protein: 16, carbs: 48, fat: 26 },
    notes: 'Classic comfort food combo. Add bacon for extra indulgence.',
    sourceUrl: '',
    photoId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export async function seedRecipes() {
  const existing = await db.recipes.count()
  if (existing > 0) {
    console.log(`Database already has ${existing} recipes. Skipping seed.`)
    return existing
  }

  await db.recipes.bulkAdd(testRecipes)
  console.log(`Seeded ${testRecipes.length} test recipes.`)
  return testRecipes.length
}

export async function forceSeedRecipes() {
  await db.recipes.bulkAdd(testRecipes)
  console.log(`Added ${testRecipes.length} test recipes.`)
  return testRecipes.length
}
