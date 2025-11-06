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
import { Auth0Client } from '@auth0/auth0-spa-js'

const themeStore = useThemeStore()
const authStore = useAuthStore()

onMounted(() => {
  // テーマを初期化
  themeStore.initTheme()

  // Auth0 を初期化
  initAuth0()
})

async function initAuth0() {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID

  if (!domain || !clientId) {
    console.warn('Auth0 configuration not found')
    return
  }

  try {
    // Auth0 クライアントを初期化
    const auth0 = new Auth0Client({
      domain,
      clientId,
      authorizationParams: {
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE
      },
      cacheLocation: 'localstorage'
    })

    authStore.setAuth0Client(auth0)

    // リダイレクト後のコールバックを処理
    const query = window.location.search
    if (query.includes('code=') && query.includes('state=')) {
      try {
        await auth0.handleRedirectCallback()
        window.history.replaceState({}, document.title, '/')
      } catch (error) {
        console.error('Failed to handle redirect callback:', error)
      }
    }

    // 認証状態を確認
    const isAuthenticated = await auth0.isAuthenticated()

    if (isAuthenticated) {
      // ユーザー情報を取得
      const user = await auth0.getUser()
      authStore.setUser(user || null)

      // アクセストークンを取得
      try {
        const token = await auth0.getTokenSilently()
        authStore.setToken(token)
      } catch (error) {
        console.error('Failed to get token:', error)
      }
    } else {
      authStore.setUser(null)
    }
  } catch (error) {
    console.error('Failed to initialize Auth0:', error)
  }
}
</script>
