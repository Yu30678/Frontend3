<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <ExclamationTriangleIcon class="h-6 w-6 text-red-600" />
        </div>
        <div class="mt-3 text-center">
          <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">{{ message }}</p>
          </div>
          <div class="flex gap-4 px-4 py-3">
            <button
              @click="$emit('cancel')"
              class="flex-1 px-4 py-2 bg-white text-gray-500 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              取消
            </button>
            <button
              @click="$emit('confirm')"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              確認刪除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

defineProps<{
  title: string
  message: string
}>()

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>