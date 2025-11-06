/**
 * 認証ストア
 *
 * Auth0 の認証状態を管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Auth0Client, User } from '@auth0/auth0-spa-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoaded = ref(false)
  const auth0Client = ref<Auth0Client | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const userName = computed(() => {
    if (!user.value) return null
    return user.value.name || user.value.nickname || user.value.email?.split('@')[0] || user.value.sub
  })

  const setAuth0Client = (client: Auth0Client) => {
    auth0Client.value = client
  }

  const setUser = (newUser: User | null) => {
    user.value = newUser
    isLoaded.value = true
  }

  const setToken = (newToken: string | null) => {
    token.value = newToken
  }

  const signOut = async () => {
    if (auth0Client.value) {
      await auth0Client.value.logout({
        logoutParams: {
          returnTo: window.location.origin
        }
      })
    }
    user.value = null
    token.value = null
  }

  return {
    user,
    token,
    isLoaded,
    auth0Client,
    isAuthenticated,
    userName,
    setAuth0Client,
    setUser,
    setToken,
    signOut
  }
})
