<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
    <Header />

    <main class="container mx-auto px-4 py-8">
      <router-view />
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'

const themeStore = useThemeStore()
const authStore = useAuthStore()

onMounted(() => {
  // テーマを初期化
  themeStore.initTheme()

  // Clerk を初期化
  initClerk()
})

async function initClerk() {
  // Clerk の初期化
  // 実際には @clerk/vue を使用
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

  if (!publishableKey) {
    console.warn('Clerk publishable key not found')
    return
  }

  try {
    // Clerk スクリプトを動的にロード
    if (!(window as any).Clerk) {
      await loadClerkScript()
    }

    const Clerk = (window as any).Clerk
    await Clerk.load({
      publishableKey
    })

    // ユーザー情報を取得
    if (Clerk.user) {
      authStore.setUser(Clerk.user)
      const token = await Clerk.session?.getToken()
      authStore.setToken(token)
    }

    // セッション変更を監視
    Clerk.addListener((session: any) => {
      if (session.user) {
        authStore.setUser(session.user)
      } else {
        authStore.setUser(null)
      }
    })
  } catch (error) {
    console.error('Failed to initialize Clerk:', error)
  }
}

function loadClerkScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.clerk.dev/npm/@clerk/clerk-js@latest/dist/clerk.browser.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = reject
    document.head.appendChild(script)
  })
}
</script>
