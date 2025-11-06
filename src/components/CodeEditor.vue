<template>
  <div class="code-editor bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
    <!-- エディターヘッダー -->
    <div class="flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center space-x-2">
        <span class="material-icons text-indigo-600 dark:text-indigo-400">code</span>
        <span class="font-medium text-gray-900 dark:text-white">{{ fileName }}</span>
      </div>
      <div class="flex items-center space-x-2">
        <button
          v-if="!readonly"
          @click="emit('save')"
          class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center space-x-1"
          :disabled="!isDirty"
        >
          <span class="material-icons text-sm">save</span>
          <span>Save</span>
        </button>
        <button
          @click="handleRun"
          class="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center space-x-1"
          :disabled="isRunning"
        >
          <span class="material-icons text-sm">play_arrow</span>
          <span>{{ isRunning ? 'Running...' : 'Run' }}</span>
        </button>
      </div>
    </div>

    <!-- エディター本体 -->
    <div class="flex">
      <!-- 行番号 -->
      <div class="bg-gray-50 dark:bg-gray-900 px-4 py-4 text-right text-sm text-gray-500 dark:text-gray-500 select-none">
        <div v-for="(_, index) in lines" :key="index" class="leading-6">
          {{ index + 1 }}
        </div>
      </div>

      <!-- コード入力エリア -->
      <textarea
        v-model="localCode"
        @input="handleInput"
        class="flex-1 px-4 py-4 bg-transparent text-gray-900 dark:text-gray-100 font-mono text-sm leading-6 resize-none focus:outline-none"
        :readonly="readonly"
        :rows="Math.max(lines.length, 20)"
        spellcheck="false"
        placeholder="# Type your ScratchScript code here..."
      ></textarea>
    </div>

    <!-- 出力エリア -->
    <div v-if="showOutput" class="border-t border-gray-200 dark:border-gray-700">
      <div class="px-4 py-3 bg-gray-100 dark:bg-gray-900 flex items-center justify-between">
        <span class="font-medium text-gray-900 dark:text-white">Output</span>
        <button
          @click="clearOutput"
          class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          Clear
        </button>
      </div>
      <div class="px-4 py-4 bg-gray-50 dark:bg-gray-900 max-h-64 overflow-y-auto">
        <div v-if="error" class="text-red-600 dark:text-red-400 font-mono text-sm mb-2">
          Error: {{ error }}
        </div>
        <div v-for="(line, index) in output" :key="index" class="font-mono text-sm text-gray-900 dark:text-gray-100">
          {{ line }}
        </div>
        <div v-if="!error && output.length === 0" class="text-gray-500 dark:text-gray-500 text-sm italic">
          No output yet. Click "Run" to execute your code.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  modelValue: string
  fileName?: string
  readonly?: boolean
  isDirty?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'save'): void
}

const props = withDefaults(defineProps<Props>(), {
  fileName: 'script.scs',
  readonly: false,
  isDirty: false
})

const emit = defineEmits<Emits>()

const localCode = ref(props.modelValue)
const output = ref<string[]>([])
const error = ref<string | null>(null)
const isRunning = ref(false)
const showOutput = ref(false)

const lines = computed(() => localCode.value.split('\n'))

watch(() => props.modelValue, (newValue) => {
  localCode.value = newValue
})

function handleInput() {
  emit('update:modelValue', localCode.value)
}

async function handleRun() {
  isRunning.value = true
  showOutput.value = true
  output.value = []
  error.value = null

  try {
    // Web Worker で実行
    const result = await runInWorker(localCode.value)

    if (result.success) {
      output.value = result.output
    } else {
      error.value = result.error || 'Unknown error'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    isRunning.value = false
  }
}

function runInWorker(code: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const worker = new Worker('/scs-worker.js')

    const timeout = setTimeout(() => {
      worker.terminate()
      reject(new Error('Execution timeout'))
    }, 6000) // 6秒でタイムアウト

    worker.onmessage = (e) => {
      clearTimeout(timeout)
      worker.terminate()
      resolve(e.data)
    }

    worker.onerror = (err) => {
      clearTimeout(timeout)
      worker.terminate()
      reject(err)
    }

    worker.postMessage({ source: code })
  })
}

function clearOutput() {
  output.value = []
  error.value = null
}
</script>

<style scoped>
textarea {
  tab-size: 2;
}

textarea::placeholder {
  color: #9ca3af;
}

.dark textarea::placeholder {
  color: #6b7280;
}
</style>
