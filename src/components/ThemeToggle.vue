<template>
  <button
    @click="themeStore.toggleTheme()"
    class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    :aria-label="themeStore.theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
  >
    <span class="material-icons text-gray-700 dark:text-gray-300">
      {{ themeStore.theme === 'light' ? 'dark_mode' : 'light_mode' }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
</script>
