<template>
  <div class="max-w-md mx-auto">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      <div class="text-center mb-8">
        <div class="mb-4">
          <span class="material-icons text-indigo-600 dark:text-indigo-400 text-6xl">account_circle</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          ログイン
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          ScratchScript へようこそ
        </p>
      </div>

      <!-- Auth0 ログインボタン -->
      <div class="space-y-4">
        <button
          @click="handleLogin"
          class="w-full px-6 py-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
        >
          <span class="material-icons">login</span>
          <span>Auth0 でログイン</span>
        </button>
      </div>

      <div class="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>安全なAuth0認証でログインします</p>
        <p class="mt-2">アカウントがない場合は自動的に作成されます</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  // すでにログインしている場合はホームにリダイレクト
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})

async function handleLogin() {
  try {
    const auth0Client = authStore.auth0Client

    if (!auth0Client) {
      console.error('Auth0 client not initialized')
      return
    }

    // Auth0 のユニバーサルログインページにリダイレクト
    await auth0Client.loginWithRedirect({
      authorizationParams: {
        redirect_uri: window.location.origin
      }
    })
  } catch (error) {
    console.error('Login failed:', error)
  }
}
</script>
