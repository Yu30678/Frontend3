<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            {{ product ? '編輯商品' : '新增商品' }}
          </h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                商品名稱 *
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-gray-900"
                placeholder="請輸入商品名稱"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                分類 *
              </label>
              <select
                v-model="form.category_id"
                required
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-gray-900"
              >
                <option value="">請選擇分類</option>
                <option v-for="category in categories" :key="category.category_id" :value="category.category_id">
                  {{ category.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                價格 *
              </label>
              <input
                v-model.number="form.price"
                type="number"
                min="0"
                step="0.01"
                required
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-gray-900"
                placeholder="0.00"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                庫存數量 *
              </label>
              <input
                v-model.number="form.soh"
                type="number"
                min="0"
                required
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-gray-900"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              商品描述
            </label>
            <textarea
              v-model="form.description"
              rows="4"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-gray-900"
              placeholder="請輸入商品描述"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Google Drive 檔案ID
              </label>
              <div class="flex space-x-2">
                <input
                  v-model="form.image_id"
                  type="text"
                  class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-gray-900"
                  placeholder="輸入Google Drive檔案ID"
                />
                <button
                  type="button"
                  @click="testImageUrl"
                  class="px-3 py-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                >
                  測試
                </button>
              </div>
              <div class="mt-1 space-y-1">
                <p class="text-xs text-gray-500">
                  🔗 從 Google Drive 檔案分享連結中取得檔案ID
                </p>
                <p class="text-xs text-gray-400">
                  連結格式: https://drive.google.com/file/d/<span class="font-mono bg-yellow-100 px-1">檔案ID</span>/view
                </p>
                <p class="text-xs text-red-500" v-if="imageTestResult">
                  {{ imageTestResult }}
                </p>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                備用圖片URL
              </label>
              <input
                v-model="form.image_url"
                type="url"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-gray-900"
                placeholder="https://..."
              />
              <p class="mt-1 text-xs text-gray-500">當Google Drive圖片無法載入時使用</p>
            </div>
          </div>
          
          <div v-if="form.image_id || form.image_url" class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">圖片預覽</label>
            <GoogleDriveImage
              :product="{ image_id: form.image_id, image_url: form.image_url }"
              :alt="form.name"
              class="h-32 w-32 object-cover rounded border"
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
              <span v-if="!isLoading">{{ product ? '更新' : '新增' }}</span>
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
// import { getProductImageUrl } from '@/utils/googleDrive'
import GoogleDriveImage from '@/components/common/GoogleDriveImage.vue'
import type { Product, Category } from '@/types/product'

const props = defineProps<{
  product: Product | null
  categories: Category[]
}>()

const emit = defineEmits<{
  close: []
  save: [data: Partial<Product>]
}>()

const isLoading = ref(false)
const imageTestResult = ref('')

const form = ref({
  name: '',
  description: '',
  price: 0,
  soh: 0,
  category_id: '',
  image_url: '',
  image_id: ''
})

watch(() => props.product, (newProduct) => {
  if (newProduct) {
    form.value = {
      name: newProduct.name,
      description: newProduct.description || '',
      price: newProduct.price,
      soh: newProduct.soh || 0,
      category_id: newProduct.category_id.toString(),
      image_url: newProduct.image_url || '',
      image_id: newProduct.image_id || ''
    }
  } else {
    form.value = {
      name: '',
      description: '',
      price: 0,
      soh: 0,
      category_id: '',
      image_url: '',
      image_id: ''
    }
  }
}, { immediate: true })

const handleSubmit = async () => {
  try {
    isLoading.value = true
    
    const data = {
      ...form.value,
      category_id: parseInt(form.value.category_id)
    }
    
    emit('save', data)
  } catch (error) {
    console.error('提交表單失敗:', error)
  } finally {
    isLoading.value = false
  }
}

const testImageUrl = () => {
  imageTestResult.value = '🔄 測試中...'
  
  if (!form.value.image_id) {
    imageTestResult.value = '請先輸入 Google Drive 檔案ID'
    return
  }

  // 移除嚴格的檔案ID驗證，讓用戶可以嘗試任何ID
  if (form.value.image_id.length < 10) {
    imageTestResult.value = '檔案ID太短，請檢查是否完整'
    return
  }

  // 測試多種URL格式 - 根據實際測試結果調整順序
  const testUrls = [
    `https://drive.google.com/thumbnail?id=${form.value.image_id}&sz=w800-h800`,
    `https://drive.google.com/thumbnail?id=${form.value.image_id}&sz=w400-h400`,
    `https://drive.google.com/thumbnail?id=${form.value.image_id}&sz=w600-h600`
  ]
  
  let testIndex = 0
  const testNextUrl = () => {
    if (testIndex >= testUrls.length) {
      imageTestResult.value = '❌ 無法載入圖片，請檢查：\n• 檔案ID是否正確\n• Google Drive檔案權限設定為「知道連結的任何人」都可檢視\n• 檔案是否為圖片格式'
      return
    }
    
    const testImage = new Image()
    const currentUrl = testUrls[testIndex]
    
    testImage.onload = () => {
      const formatNames = ['800x800縮圖', '400x400縮圖', '600x600縮圖']
      imageTestResult.value = `✅ 圖片可以正常載入\n使用格式: ${formatNames[testIndex]}`
    }
    
    testImage.onerror = () => {
      testIndex++
      testNextUrl()
    }
    
    testImage.src = currentUrl
  }
  
  testNextUrl()
}
</script>