<template>
  <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
    <nav class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <!-- ロゴ -->
        <router-link to="/" class="flex items-center space-x-2 no-underline">
          <span class="material-icons text-3xl text-indigo-600 dark:text-indigo-400">code</span>
          <span class="text-xl font-bold text-gray-900 dark:text-white">ScratchScript</span>
        </router-link>

        <!-- ナビゲーション -->
        <div class="flex items-center space-x-6">
          <router-link
            to="/faq"
            class="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            FAQ
          </router-link>

          <ThemeToggle />

          <!-- 認証状態 -->
          <div v-if="authStore.isAuthenticated" class="flex items-center space-x-4">
            <span class="text-sm text-gray-700 dark:text-gray-300">
              {{ authStore.userName }}
            </span>
            <button
              @click="handleSignOut"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Sign Out
            </button>
          </div>
          <router-link
            v-else
            to="/login"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            Sign In
          </router-link>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import ThemeToggle from './ThemeToggle.vue'

const authStore = useAuthStore()
const router = useRouter()

async function handleSignOut() {
  try {
    // Auth0 のサインアウト
    await authStore.signOut()
  } catch (error) {
    console.error('Sign out failed:', error)
  }
}
</script>
