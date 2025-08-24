<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">商品管理</h1>
        <p class="mt-1 text-sm text-gray-600">管理所有商品庫存和資訊</p>
      </div>
      <button
        v-if="authStore.canEditProducts"
        @click="openCreateModal"
        class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <PlusIcon class="-ml-1 mr-2 h-5 w-5" />
        新增商品
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            搜尋商品
          </label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="商品名稱..."
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-gray-900"
            @input="debouncedSearch"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            分類
          </label>
          <select
            v-model="filters.category"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-gray-900"
            @change="fetchProducts"
          >
            <option value="">所有分類</option>
            <option v-for="category in categories" :key="category.category_id" :value="category.category_id">
              {{ category.name }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            庫存狀態
          </label>
          <select
            v-model="filters.stockStatus"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-gray-900"
            @change="fetchProducts"
          >
            <option value="">所有狀態</option>
            <option value="inStock">有庫存</option>
            <option value="lowStock">庫存不足</option>
          </select>
        </div>
        
        <div class="flex items-end">
          <button
            @click="resetFilters"
            class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            重設篩選
          </button>
        </div>
      </div>
    </div>

    <!-- Products Table -->
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
      <div v-if="isLoading" class="p-6 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-2 text-sm text-gray-500">載入中...</p>
      </div>
      
      <div v-else-if="products.length === 0" class="p-6 text-center text-gray-500">
        <ShoppingBagIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">暫無商品</h3>
        <p class="mt-1 text-sm text-gray-500">開始新增您的第一個商品</p>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                商品
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                分類
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                價格
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                庫存
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                狀態
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="product in products" :key="product.product_id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <GoogleDriveImage
                      :product="product"
                      :alt="product.name"
                      class="h-10 w-10 rounded object-cover"
                    />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ product.name }}
                    </div>
                    <div class="text-sm text-gray-500 max-w-xs truncate">
                      {{ product.description }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ getCategoryName(product.category_id) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${{ product.price }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ product.soh }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    getStockStatusColor(product.soh)
                  ]"
                >
                  {{ getStockStatusText(product.soh) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <button
                    v-if="authStore.canEditProducts"
                    @click="openEditModal(product)"
                    class="text-primary-600 hover:text-primary-900"
                  >
                    <PencilIcon class="h-4 w-4" />
                  </button>
                  <button
                    v-if="authStore.canEditProducts"
                    @click="confirmDelete(product)"
                    class="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
      <div class="flex-1 flex justify-between sm:hidden">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          上一頁
        </button>
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          下一頁
        </button>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            顯示第 <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> 到
            <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, totalItems) }}</span> 筆，
            共 <span class="font-medium">{{ totalItems }}</span> 筆結果
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              上一頁
            </button>
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                page === currentPage
                  ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
              ]"
            >
              {{ page }}
            </button>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              下一頁
            </button>
          </nav>
        </div>
      </div>
    </div>

    <!-- Product Modal -->
    <ProductModal
      v-if="showModal"
      :product="selectedProduct"
      :categories="categories"
      @close="closeModal"
      @save="handleSave"
    />

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmModal
      v-if="showDeleteModal"
      :title="'刪除商品'"
      :message="`確定要刪除商品「${productToDelete?.name}」嗎？此操作無法復原。`"
      @confirm="handleDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ShoppingBagIcon 
} from '@heroicons/vue/24/outline'
import { productService } from '@/services/product'
import { getProductThumbnailUrl } from '@/utils/googleDrive'
import GoogleDriveImage from '@/components/common/GoogleDriveImage.vue'
import type { Product, Category } from '@/types/product'
import ProductModal from '@/components/admin/ProductModal.vue'
import DeleteConfirmModal from '@/components/common/DeleteConfirmModal.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const isLoading = ref(true)
const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const showModal = ref(false)
const showDeleteModal = ref(false)
const selectedProduct = ref<Product | null>(null)
const productToDelete = ref<Product | null>(null)

const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))

const filters = ref({
  search: '',
  category: '',
  stockStatus: ''
})

let searchTimeout: NodeJS.Timeout | null = null

const visiblePages = computed(() => {
  const pages: number[] = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

onMounted(() => {
  fetchCategories()
  fetchProducts()
})

const fetchProducts = async () => {
  try {
    isLoading.value = true
    const response = await productService.getAdminProducts()
    
    // 檢查API回應格式：status: 200 和 data 陣列
    if (response.status === 200 && response.data && Array.isArray(response.data)) {
      // 過濾和搜尋邏輯
      let filteredProducts = response.data
      
      // 分類篩選
      if (filters.value.category) {
        filteredProducts = filteredProducts.filter(p => p.category_id === parseInt(filters.value.category))
      }
      
      // 搜尋篩選
      if (filters.value.search) {
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(filters.value.search.toLowerCase())
        )
      }
      
      // 庫存狀態篩選
      if (filters.value.stockStatus) {
        filteredProducts = filteredProducts.filter(p => {
          switch (filters.value.stockStatus) {
            case 'inStock': return (p.soh || 0) > 0
            case 'lowStock': return (p.soh || 0) <= 0
            default: return true
          }
        })
      }
      
      // 分頁處理
      totalItems.value = filteredProducts.length
      
      // 如果當前頁面超出範圍，重置為第一頁
      const totalPagesCalc = Math.ceil(filteredProducts.length / itemsPerPage.value)
      if (currentPage.value > totalPagesCalc && totalPagesCalc > 0) {
        currentPage.value = 1
      }
      
      const startIndex = (currentPage.value - 1) * itemsPerPage.value
      const endIndex = startIndex + itemsPerPage.value
      products.value = filteredProducts.slice(startIndex, endIndex)
    }
  } catch (error) {
    console.error('獲取商品列表失敗:', error)
  } finally {
    isLoading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const response = await productService.getCategories()
    if (response.status === 200 && response.data) {
      categories.value = response.data
    }
  } catch (error) {
    console.error('獲取分類列表失敗:', error)
  }
}

const debouncedSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchProducts()
  }, 500)
}

const resetFilters = () => {
  filters.value = {
    search: '',
    category: '',
    stockStatus: ''
  }
  currentPage.value = 1
  fetchProducts()
}

const openCreateModal = () => {
  selectedProduct.value = null
  showModal.value = true
}

const openEditModal = (product: Product) => {
  selectedProduct.value = product
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedProduct.value = null
}

const handleSave = async (productData: any) => {
  try {
    // 處理圖片URL：如果有 image_id，轉換為 Google Drive 縮圖URL
    let finalImageUrl = productData.image_url || ''
    
    if (productData.image_id && productData.image_id.length > 10) {
      // 將 Google Drive 檔案ID 轉換為縮圖URL
      finalImageUrl = `https://drive.google.com/thumbnail?id=${productData.image_id}&sz=w800-h800`
    }
    
    if (selectedProduct.value) {
      // 更新商品 - 只發送 image_url，不發送 image_id
      const updateData = {
        product_id: selectedProduct.value.product_id,
        name: productData.name,
        price: productData.price.toString(),
        soh: productData.soh,
        category_id: productData.category_id,
        is_active: productData.is_active ?? true,
        image_url: finalImageUrl
      }
      await productService.updateProduct(updateData)
    } else {
      // 新增商品 - 只發送 image_url，不發送 image_id
      const createData = {
        name: productData.name,
        price: productData.price.toString(),
        soh: productData.soh,
        category_id: productData.category_id,
        image_url: finalImageUrl
      }
      await productService.createProduct(createData)
    }
    
    closeModal()
    fetchProducts()
  } catch (error) {
    console.error('保存商品失敗:', error)
  }
}

const confirmDelete = (product: Product) => {
  productToDelete.value = product
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (productToDelete.value) {
    try {
      await productService.deleteProduct(productToDelete.value.product_id)
      showDeleteModal.value = false
      productToDelete.value = null
      fetchProducts()
    } catch (error) {
      console.error('刪除商品失敗:', error)
    }
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  productToDelete.value = null
}

const getCategoryName = (categoryId: number) => {
  const category = categories.value.find(c => c.category_id === categoryId)
  return category?.name || '未分類'
}

const getStockStatusColor = (soh: number) => {
  if (soh <= 0) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

const getStockStatusText = (soh: number) => {
  if (soh <= 0) return '庫存不足'
  return '有庫存'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-TW')
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchProducts()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchProducts()
  }
}

const goToPage = (page: number) => {
  currentPage.value = page
  fetchProducts()
}
</script>