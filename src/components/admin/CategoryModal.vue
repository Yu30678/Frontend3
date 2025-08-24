<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            {{ category ? '編輯分類' : '新增分類' }}
          </h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              分類名稱 *
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-gray-900"
              placeholder="請輸入分類名稱"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              分類描述
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="請輸入分類描述"
            />
          </div>

          <div class="flex gap-4 pt-4">
            <button
              type="button"
              @click="$emit('close')"
              class="flex-1 px-4 py-2 bg-white text-gray-500 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="isLoading"
              class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <span v-if="!isLoading">{{ category ? '更新' : '新增' }}</span>
              <span v-else>處理中...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import type { Category } from '@/types/product'

const props = defineProps<{
  category: Category | null
}>()

const emit = defineEmits<{
  close: []
  save: [data: Omit<Category, 'category_id' | 'created_at'>]
}>()

const isLoading = ref(false)

const form = ref({
  name: '',
  description: ''
})

watch(() => props.category, (newCategory) => {
  if (newCategory) {
    form.value = {
      name: newCategory.name,
      description: newCategory.description || ''
    }
  } else {
    form.value = {
      name: '',
      description: ''
    }
  }
}, { immediate: true })

const handleSubmit = async () => {
  try {
    isLoading.value = true
    emit('save', form.value)
  } catch (error) {
    console.error('提交表單失敗:', error)
  } finally {
    isLoading.value = false
  }
}
</script>