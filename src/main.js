/**
 * KitchenHub - Main Entry Point
 *
 * Initializes the Vue application with:
 * - Pinia for state management
 * - Vue Router for navigation
 * - Global styles (Tailwind CSS)
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './style.css'
import { seedRecipes } from './db/seedData.js'

// Create Vue app instance
const app = createApp(App)

// Install plugins
app.use(createPinia())  // State management
app.use(router)         // Navigation

// Mount to DOM
app.mount('#app')

// Seed test recipes if database is empty
seedRecipes()
