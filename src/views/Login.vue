<template>
  <div class="max-w-md mx-auto">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      <div class="text-center mb-8">
        <span class="material-icons text-indigo-600 dark:text-indigo-400 text-6xl mb-4">account_circle</span>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          ログイン
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          ScratchScript へようこそ
        </p>
      </div>

      <!-- Clerk のログインコンポーネントをマウント -->
      <div id="clerk-sign-in" class="mb-6"></div>

      <div class="text-center text-sm text-gray-600 dark:text-gray-400">
        <p>アカウントをお持ちでない場合は、</p>
        <p>上記のフォームから新規登録できます</p>
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
    return
  }

  // Clerk のログインコンポーネントをマウント
  await mountClerkSignIn()
})

async function mountClerkSignIn() {
  try {
    // Clerk が読み込まれるまで待機
    let attempts = 0
    while (!(window as any).Clerk && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }

    const Clerk = (window as any).Clerk

    if (!Clerk) {
      console.error('Clerk not loaded')
      return
    }

    // サインインコンポーネントをマウント
    const signInElement = document.getElementById('clerk-sign-in')
    if (signInElement) {
      Clerk.mountSignIn(signInElement, {
        afterSignInUrl: '/',
        signUpUrl: '/login'
      })
    }
  } catch (error) {
    console.error('Failed to mount Clerk sign-in:', error)
  }
}
</script>
