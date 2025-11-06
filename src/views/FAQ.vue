<template>
  <div class="max-w-4xl mx-auto">
    <div class="text-center mb-12">
      <span class="material-icons text-indigo-600 dark:text-indigo-400 text-6xl mb-4">help</span>
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        よくある質問
      </h1>
      <p class="text-xl text-gray-600 dark:text-gray-400">
        ScratchScript について、よくある質問にお答えします
      </p>
    </div>

    <div class="space-y-6">
      <div
        v-for="(item, index) in faqItems"
        :key="index"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
      >
        <button
          @click="toggleItem(index)"
          class="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white text-left">
            {{ item.question }}
          </h3>
          <span class="material-icons text-gray-600 dark:text-gray-400">
            {{ openItems.includes(index) ? 'expand_less' : 'expand_more' }}
          </span>
        </button>
        <div
          v-if="openItems.includes(index)"
          class="px-6 py-4 border-t border-gray-200 dark:border-gray-700"
        >
          <p class="text-gray-600 dark:text-gray-400 whitespace-pre-line">{{ item.answer }}</p>
        </div>
      </div>
    </div>

    <!-- お問い合わせ -->
    <div class="mt-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-8 text-center">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        その他のご質問
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        FAQ に掲載されていない質問がある場合は、お気軽にお問い合わせください
      </p>
      <a
        href="mailto:support@scratchscript.com"
        class="inline-flex items-center space-x-2 px-6 py-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
      >
        <span class="material-icons">email</span>
        <span>お問い合わせ</span>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const openItems = ref<number[]>([])

const faqItems = [
  {
    question: 'ScratchScript とは何ですか？',
    answer: 'ScratchScript は、Scratch にインスパイアされたテキストベースのプログラミング言語です。初心者でも簡単に学べる文法で、ブラウザ上で実行できます。'
  },
  {
    question: '利用料金はかかりますか？',
    answer: 'ScratchScript は完全無料でご利用いただけます。アカウント登録から、プロジェクトの作成・公開まで、すべて無料です。'
  },
  {
    question: 'どのようにプロジェクトを作成しますか？',
    answer: 'まずログインしてから、トップページの「新しいプロジェクトを作成」ボタンをクリックしてください。エディター画面が開き、すぐにコーディングを始められます。'
  },
  {
    question: 'プロジェクトを公開するにはどうすればいいですか？',
    answer: 'エディター画面で「公開/非公開」トグルボタンをクリックすることで、プロジェクトを公開できます。公開したプロジェクトは、URLを知っている誰でも閲覧できます。'
  },
  {
    question: 'ファイルをアップロードできますか？',
    answer: 'はい、画像や音声ファイルなどをアップロードできます。ただし、1プロジェクトあたり合計5KBまでの制限があります。'
  },
  {
    question: 'サポートされているファイル形式は？',
    answer: '画像（PNG、JPEG、GIF、SVG）、音声（WAV、MP3）、テキストファイルがサポートされています。'
  },
  {
    question: 'コードが実行されない場合はどうすればいいですか？',
    answer: '構文エラーがある可能性があります。エディターの「Run」ボタンをクリックすると、エラーメッセージが表示されます。エラー内容を確認して、コードを修正してください。'
  },
  {
    question: 'プロジェクトを削除できますか？',
    answer: '現在、プロジェクトの削除機能は実装中です。将来のアップデートで追加予定です。'
  },
  {
    question: '複数人でプロジェクトを編集できますか？',
    answer: '現在は個人のみの編集となっていますが、将来的にコラボレーション機能を追加する予定です。'
  },
  {
    question: 'モバイルでも使えますか？',
    answer: 'はい、ScratchScript はレスポンシブデザインで、スマートフォンやタブレットでも快適に使用できます。'
  }
]

function toggleItem(index: number) {
  const idx = openItems.value.indexOf(index)
  if (idx !== -1) {
    openItems.value.splice(idx, 1)
  } else {
    openItems.value.push(index)
  }
}
</script>
