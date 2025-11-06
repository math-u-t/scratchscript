<template>
  <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
    <div class="container mx-auto px-4 py-6">
      <div class="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        <!-- コピーライト -->
        <div class="text-sm text-gray-600 dark:text-gray-400">
          © {{ currentYear }} ScratchScript. All rights reserved.
        </div>

        <!-- リンク -->
        <div class="flex items-center space-x-6">
          <router-link
            to="/faq"
            class="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            FAQ
          </router-link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center space-x-1"
          >
            <span class="material-icons text-sm">code</span>
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>
