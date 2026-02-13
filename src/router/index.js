/**
 * Vue Router Configuration
 *
 * Defines the routes for KitchenHub navigation.
 * Each route maps a URL path to a view component.
 */
import { createRouter, createWebHistory } from 'vue-router'

// Import views (lazy-loaded for better performance)
const RecipesView = () => import('../views/RecipesView.vue')
const RecipeDetailView = () => import('../views/RecipeDetailView.vue')
const RecipeEditView = () => import('../views/RecipeEditView.vue')
const CalendarView = () => import('../views/CalendarView.vue')
const ShoppingView = () => import('../views/ShoppingView.vue')
const SettingsView = () => import('../views/SettingsView.vue')

// Define routes
const routes = [
  {
    path: '/',
    redirect: '/recipes'
  },
  {
    path: '/recipes',
    name: 'Recipes',
    component: RecipesView,
    meta: { title: 'Recipes' }
  },
  {
    path: '/recipes/new',
    name: 'RecipeNew',
    component: RecipeEditView,
    meta: { title: 'New Recipe' }
  },
  {
    path: '/recipes/:id',
    name: 'RecipeDetail',
    component: RecipeDetailView,
    meta: { title: 'Recipe' }
  },
  {
    path: '/recipes/:id/edit',
    name: 'RecipeEdit',
    component: RecipeEditView,
    meta: { title: 'Edit Recipe' }
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: CalendarView,
    meta: { title: 'Meal Plan' }
  },
  {
    path: '/shopping',
    name: 'Shopping',
    component: ShoppingView,
    meta: { title: 'Shopping List' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView,
    meta: { title: 'Settings' }
  }
]

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Update page title on navigation
router.beforeEach((to, from, next) => {
  document.title = to.meta.title
    ? `${to.meta.title} | KitchenHub`
    : 'KitchenHub'
  next()
})

export default router
