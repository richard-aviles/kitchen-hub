<template>
  <!-- Bottom navigation bar - touch-friendly for tablet/phone -->
  <nav class="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg backdrop-saturate-150 border-t border-gray-200 dark:border-slate-700 shadow-lg">
    <div class="flex justify-around items-center h-16">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="relative flex flex-col items-center justify-center w-full h-full transition-colors duration-200"
        :class="[
          isActive(item.path)
            ? 'text-primary-600 dark:text-primary-400'
            : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
        ]"
      >
        <!-- Active indicator pill -->
        <span
          v-if="isActive(item.path)"
          class="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-primary-500 dark:bg-primary-400"
        ></span>
        <component :is="item.icon" class="w-6 h-6" :class="{ 'stroke-[2.5px]': isActive(item.path) }" />
        <span class="text-xs mt-1" :class="{ 'font-semibold': isActive(item.path) }">{{ item.label }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
/**
 * AppNavigation
 *
 * Bottom tab navigation for the app.
 * Touch-friendly design for tablet/wall display use.
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  BookOpenIcon,
  CalendarIcon,
  ShoppingCartIcon,
  Cog6ToothIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()

// Navigation items configuration
const navItems = [
  { path: '/recipes', label: 'Recipes', icon: BookOpenIcon },
  { path: '/calendar', label: 'Plan', icon: CalendarIcon },
  { path: '/shopping', label: 'Shop', icon: ShoppingCartIcon },
  { path: '/settings', label: 'Settings', icon: Cog6ToothIcon }
]

// Check if a route is currently active
const isActive = (path) => {
  return route.path.startsWith(path)
}
</script>
