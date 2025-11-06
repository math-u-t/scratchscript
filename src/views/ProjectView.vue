<template>
  <div v-if="loading" class="flex justify-center items-center py-16">
    <div class="text-gray-600 dark:text-gray-400">読み込み中...</div>
  </div>

  <div v-else-if="error" class="max-w-2xl mx-auto">
    <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
      <div class="flex items-center space-x-2 mb-2">
        <span class="material-icons text-red-600 dark:text-red-400">error</span>
        <h2 class="text-xl font-semibold text-red-900 dark:text-red-200">エラー</h2>
      </div>
      <p class="text-red-700 dark:text-red-300">{{ error }}</p>
    </div>
  </div>

  <div v-else-if="project" class="max-w-7xl mx-auto">
    <!-- プロジェクトヘッダー -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          {{ project.title }}
        </h1>
        <router-link
          v-if="canEdit"
          :to="`/project/${project.userName}/${project.slug}/edit`"
          class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center space-x-1"
        >
          <span class="material-icons text-sm">edit</span>
          <span>編集</span>
        </router-link>
      </div>

      <p v-if="project.description" class="text-gray-600 dark:text-gray-400 mb-4">
        {{ project.description }}
      </p>

      <div class="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
        <div class="flex items-center space-x-1">
          <span class="material-icons text-sm">person</span>
          <span>{{ project.userName }}</span>
        </div>
        <div class="flex items-center space-x-1">
          <span class="material-icons text-sm">schedule</span>
          <span>{{ formatDate(project.updatedAt) }}</span>
        </div>
        <div class="flex items-center space-x-1">
          <span class="material-icons text-sm">visibility</span>
          <span>{{ project.isPublic ? '公開' : '非公開' }}</span>
        </div>
      </div>
    </div>

    <!-- コードビューアー -->
    <CodeEditor
      v-model="displayCode"
      :file-name="`${project.slug}.scs`"
      :readonly="true"
    />

    <!-- シェアボタン -->
    <div class="mt-6 flex justify-center space-x-4">
      <button
        @click="copyLink"
        class="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-indigo-600 dark:hover:border-indigo-400 rounded-lg transition-colors flex items-center space-x-2"
      >
        <span class="material-icons text-sm">link</span>
        <span>{{ linkCopied ? 'コピーしました！' : 'リンクをコピー' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getPublicProject } from '@/lib/api-client'
import type { Project } from '@/types'
import CodeEditor from '@/components/CodeEditor.vue'

const route = useRoute()
const authStore = useAuthStore()

const project = ref<Project | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const linkCopied = ref(false)

const displayCode = ref('')

const canEdit = computed(() => {
  if (!project.value || !authStore.user) return false
  return project.value.managers.includes(authStore.user.id)
})

onMounted(async () => {
  await loadProject()
})

async function loadProject() {
  try {
    loading.value = true
    error.value = null

    const userName = route.params.userName as string
    const slug = route.params.slug as string

    project.value = await getPublicProject(userName, slug)
    displayCode.value = project.value.sourceCode
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'プロジェクトの読み込みに失敗しました'
  } finally {
    loading.value = false
  }
}

async function copyLink() {
  try {
    const url = window.location.href
    await navigator.clipboard.writeText(url)
    linkCopied.value = true
    setTimeout(() => {
      linkCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy link:', err)
  }
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('ja-JP')
}
</script>
