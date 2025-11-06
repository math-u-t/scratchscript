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
        <input
          v-model="project.title"
          @input="markDirty"
          class="text-3xl font-bold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-indigo-600 rounded px-2 text-gray-900 dark:text-white"
          placeholder="プロジェクト名"
        />
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">
            {{ project.isPublic ? '公開' : '非公開' }}
          </span>
          <button
            @click="togglePublic"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span class="material-icons text-gray-700 dark:text-gray-300">
              {{ project.isPublic ? 'visibility' : 'visibility_off' }}
            </span>
          </button>
        </div>
      </div>

      <textarea
        v-model="project.description"
        @input="markDirty"
        class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 text-gray-900 dark:text-white"
        rows="2"
        placeholder="プロジェクトの説明..."
      ></textarea>

      <div class="mt-4 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
        <div>作成: {{ formatDate(project.createdAt) }}</div>
        <div>更新: {{ formatDate(project.updatedAt) }}</div>
        <router-link
          :to="`/project/${project.userName}/${project.slug}`"
          class="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
        >
          <span class="material-icons text-sm">open_in_new</span>
          <span>公開ページを見る</span>
        </router-link>
      </div>
    </div>

    <!-- コードエディター -->
    <CodeEditor
      v-model="project.sourceCode"
      :file-name="`${project.slug}.scs`"
      :is-dirty="isDirty"
      @save="handleSave"
    />

    <!-- 保存状態 -->
    <div v-if="saveStatus" class="mt-4 text-center">
      <span
        :class="[
          'inline-flex items-center space-x-2 px-4 py-2 rounded-lg',
          saveStatus === 'saving' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-900 dark:text-blue-200' : '',
          saveStatus === 'saved' ? 'bg-green-100 dark:bg-green-900/20 text-green-900 dark:text-green-200' : '',
          saveStatus === 'error' ? 'bg-red-100 dark:bg-red-900/20 text-red-900 dark:text-red-200' : ''
        ]"
      >
        <span class="material-icons text-sm">
          {{ saveStatus === 'saving' ? 'sync' : saveStatus === 'saved' ? 'check_circle' : 'error' }}
        </span>
        <span>{{ saveStatusMessage }}</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getPublicProject, updateProject } from '@/lib/api-client'
import type { Project } from '@/types'
import CodeEditor from '@/components/CodeEditor.vue'

const route = useRoute()
const authStore = useAuthStore()

const project = ref<Project | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const isDirty = ref(false)
const saveStatus = ref<'saving' | 'saved' | 'error' | null>(null)
const saveStatusMessage = ref('')

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

    // 権限チェック
    if (!project.value.managers.includes(authStore.user?.id)) {
      error.value = 'このプロジェクトを編集する権限がありません'
      return
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'プロジェクトの読み込みに失敗しました'
  } finally {
    loading.value = false
  }
}

function markDirty() {
  isDirty.value = true
}

function togglePublic() {
  if (project.value) {
    project.value.isPublic = !project.value.isPublic
    markDirty()
  }
}

async function handleSave() {
  if (!project.value) return

  try {
    saveStatus.value = 'saving'
    saveStatusMessage.value = '保存中...'

    await updateProject(project.value.id, {
      title: project.value.title,
      description: project.value.description,
      sourceCode: project.value.sourceCode,
      isPublic: project.value.isPublic
    })

    isDirty.value = false
    saveStatus.value = 'saved'
    saveStatusMessage.value = '保存しました'

    setTimeout(() => {
      saveStatus.value = null
    }, 3000)
  } catch (err) {
    saveStatus.value = 'error'
    saveStatusMessage.value = '保存に失敗しました'
    console.error('Save failed:', err)
  }
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('ja-JP')
}
</script>
