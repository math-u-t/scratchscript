<template>
  <div class="max-w-6xl mx-auto">
    <!-- ヒーローセクション -->
    <section class="text-center py-16">
      <div class="flex justify-center mb-6">
        <span class="material-icons text-indigo-600 dark:text-indigo-400" style="font-size: 72px;">code</span>
      </div>
      <h1 class="text-5xl font-bold text-gray-900 dark:text-white mb-4">
        ScratchScript
      </h1>
      <p class="text-xl text-gray-600 dark:text-gray-400 mb-8">
        Scratch風のシンプルなスクリプト言語で<br>
        プログラミングを学び、共有しよう
      </p>
      <div class="flex justify-center space-x-4">
        <button
          v-if="authStore.isAuthenticated"
          @click="handleCreateProject"
          class="px-6 py-3 text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center space-x-2"
        >
          <span class="material-icons">add</span>
          <span>新しいプロジェクトを作成</span>
        </button>
        <router-link
          v-else
          to="/login"
          class="px-6 py-3 text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          はじめる
        </router-link>
        <a
          href="#features"
          class="px-6 py-3 text-lg font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-indigo-600 dark:hover:border-indigo-400 rounded-lg transition-colors"
        >
          詳しく見る
        </a>
      </div>
    </section>

    <!-- 機能紹介 -->
    <section id="features" class="py-16">
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
        主な機能
      </h2>
      <div class="grid md:grid-cols-3 gap-8">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div class="flex justify-center mb-4">
            <span class="material-icons text-indigo-600 dark:text-indigo-400 text-5xl">edit_note</span>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
            シンプルな文法
          </h3>
          <p class="text-gray-600 dark:text-gray-400 text-center">
            Scratch風の直感的な文法で、初心者でも簡単にプログラミングを始められます
          </p>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div class="flex justify-center mb-4">
            <span class="material-icons text-indigo-600 dark:text-indigo-400 text-5xl">play_circle</span>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
            ブラウザで実行
          </h3>
          <p class="text-gray-600 dark:text-gray-400 text-center">
            コードはブラウザ上で安全に実行。インストール不要ですぐに使えます
          </p>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div class="flex justify-center mb-4">
            <span class="material-icons text-indigo-600 dark:text-indigo-400 text-5xl">share</span>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
            簡単に共有
          </h3>
          <p class="text-gray-600 dark:text-gray-400 text-center">
            作品を公開して、URLを共有するだけで誰でも見られます
          </p>
        </div>
      </div>
    </section>

    <!-- サンプルコード -->
    <section class="py-16">
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
        サンプルコード
      </h2>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div class="px-4 py-3 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <span class="font-medium text-gray-900 dark:text-white">example.scs</span>
        </div>
        <pre class="p-6 text-sm font-mono text-gray-900 dark:text-gray-100 overflow-x-auto"><code># FizzBuzz サンプル
set i to 1
while i <= 20 do
  if i % 15 == 0 then
    say "FizzBuzz"
  else
    if i % 3 == 0 then
      say "Fizz"
    else
      if i % 5 == 0 then
        say "Buzz"
      else
        say i
      end
    end
  end
  set i to i + 1
end</code></pre>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { createProject } from '@/lib/api-client'

const router = useRouter()
const authStore = useAuthStore()

async function handleCreateProject() {
  try {
    const project = await createProject({
      title: '新しいプロジェクト',
      slug: 'new-project',
      description: '',
      isPublic: false
    })

    router.push(`/project/${authStore.userName}/${project.slug}/edit`)
  } catch (error) {
    console.error('Failed to create project:', error)
    alert('プロジェクトの作成に失敗しました')
  }
}
</script>
