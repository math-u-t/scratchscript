/**
 * プロジェクトストア
 *
 * 現在編集中のプロジェクトを管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Project } from '@/types'

export const useProjectStore = defineStore('project', () => {
  const currentProject = ref<Project | null>(null)
  const isDirty = ref(false)

  const hasProject = computed(() => !!currentProject.value)

  const setProject = (project: Project | null) => {
    currentProject.value = project
    isDirty.value = false
  }

  const updateProject = (updates: Partial<Project>) => {
    if (currentProject.value) {
      currentProject.value = { ...currentProject.value, ...updates }
      isDirty.value = true
    }
  }

  const updateSourceCode = (code: string) => {
    if (currentProject.value) {
      currentProject.value.sourceCode = code
      isDirty.value = true
    }
  }

  const markSaved = () => {
    isDirty.value = false
  }

  const clearProject = () => {
    currentProject.value = null
    isDirty.value = false
  }

  return {
    currentProject,
    isDirty,
    hasProject,
    setProject,
    updateProject,
    updateSourceCode,
    markSaved,
    clearProject
  }
})
