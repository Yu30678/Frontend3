<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">分類管理</h1>
        <p class="mt-1 text-sm text-gray-600">管理所有商品分類</p>
      </div>
      <button
        v-if="authStore.canEditCategories"
        @click="openCreateModal"
        class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <PlusIcon class="-ml-1 mr-2 h-5 w-5" />
        新增分類
      </button>
    </div>

    <!-- Categories List -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <span class="ml-3 text-gray-500">載入中...</span>
    </div>

    <div v-else-if="categories.length === 0" class="text-center py-12">
      <TagIcon class="mx-auto h-16 w-16 text-gray-400" />
      <h3 class="mt-4 text-lg font-medium text-gray-900">暫無分類</h3>
      <p class="mt-2 text-sm text-gray-500">開始新增您的第一個商品分類</p>
    </div>

    <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
      <ul class="divide-y divide-gray-200">
        <li v-for="category in categories" :key="category.category_id" class="px-4 py-4 hover:bg-gray-50">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <TagIcon class="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-900">
                  {{ category.name }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ category.description }}
                </div>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <div class="flex space-x-2">
                <button
                  v-if="authStore.canEditCategories"
                  @click="openEditModal(category)"
                  class="text-primary-600 hover:text-primary-900"
                >
                  <PencilIcon class="h-4 w-4" />
                </button>
                <button
                  v-if="authStore.canEditCategories"
                  @click="confirmDelete(category)"
                  class="text-red-600 hover:text-red-900"
                >
                  <TrashIcon class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Category Modal -->
    <CategoryModal
      v-if="showModal"
      :category="selectedCategory"
      @close="closeModal"
      @save="handleSave"
    />

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmModal
      v-if="showDeleteModal"
      :title="'刪除分類'"
      :message="`確定要刪除分類「${categoryToDelete?.name}」嗎？此操作無法復原。`"
      @confirm="handleDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  TagIcon 
} from '@heroicons/vue/24/outline'
import { productService } from '@/services/product'
import type { Category } from '@/types/product'
import CategoryModal from '@/components/admin/CategoryModal.vue'
import DeleteConfirmModal from '@/components/common/DeleteConfirmModal.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const isLoading = ref(true)
const categories = ref<Category[]>([])
const showModal = ref(false)
const showDeleteModal = ref(false)
const selectedCategory = ref<Category | null>(null)
const categoryToDelete = ref<Category | null>(null)

onMounted(() => {
  fetchCategories()
})

const fetchCategories = async () => {
  try {
    isLoading.value = true
    const response = await productService.getCategories()
    
    if (response.status === 200 && response.data) {
      categories.value = response.data
    }
  } catch (error) {
    console.error('獲取分類列表失敗:', error)
  } finally {
    isLoading.value = false
  }
}

const openCreateModal = () => {
  selectedCategory.value = null
  showModal.value = true
}

const openEditModal = (category: Category) => {
  selectedCategory.value = category
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedCategory.value = null
}

const handleSave = async (categoryData: any) => {
  try {
    if (selectedCategory.value) {
      // 更新分類 - 使用正確的API格式
      const updateData = {
        category_id: selectedCategory.value.category_id,
        name: categoryData.name
      }
      await productService.updateCategory(updateData)
    } else {
      // 新增分類 - 使用正確的API格式
      const createData = {
        name: categoryData.name
      }
      await productService.createCategory(createData)
    }
    
    closeModal()
    fetchCategories()
  } catch (error) {
    console.error('保存分類失敗:', error)
  }
}

const confirmDelete = (category: Category) => {
  categoryToDelete.value = category
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (categoryToDelete.value) {
    try {
      await productService.deleteCategory(categoryToDelete.value.category_id)
      showDeleteModal.value = false
      categoryToDelete.value = null
      fetchCategories()
    } catch (error) {
      console.error('刪除分類失敗:', error)
    }
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  categoryToDelete.value = null
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-TW')
}
</script>