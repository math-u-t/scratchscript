/**
 * テーマストア
 *
 * ダーク/ライトモードの切り替えを管理
 */

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Theme } from '@/types'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>('light')

  // ローカルストレージから初期値を読み込む
  const initTheme = () => {
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored === 'dark' || stored === 'light') {
      theme.value = stored
    } else {
      // システム設定を確認
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme.value = prefersDark ? 'dark' : 'light'
    }
    applyTheme()
  }

  // テーマを適用
  const applyTheme = () => {
    if (theme.value === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // テーマを切り替え
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  // テーマを設定
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
  }

  // ローカルストレージに保存
  watch(theme, (newTheme) => {
    localStorage.setItem('theme', newTheme)
    applyTheme()
  })

  return {
    theme,
    initTheme,
    toggleTheme,
    setTheme
  }
})
