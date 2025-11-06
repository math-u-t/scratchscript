/**
 * 認証ストア
 *
 * Clerk の認証状態を管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null)
  const token = ref<string | null>(null)
  const isLoaded = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const userName = computed(() => {
    if (!user.value) return null
    return user.value.username || user.value.primaryEmailAddress?.emailAddress?.split('@')[0] || user.value.id
  })

  const setUser = (newUser: any) => {
    user.value = newUser
    isLoaded.value = true
  }

  const setToken = (newToken: string | null) => {
    token.value = newToken
  }

  const signOut = () => {
    user.value = null
    token.value = null
  }

  return {
    user,
    token,
    isLoaded,
    isAuthenticated,
    userName,
    setUser,
    setToken,
    signOut
  }
})
