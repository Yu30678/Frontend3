<template>
  <div class="px-4 py-6 sm:px-0">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">商品列表</h1>
        <p class="mt-1 text-sm text-gray-600">瀏覽所有可購買的商品</p>
      </div>
      <div class="mt-4 sm:mt-0 text-sm text-gray-500">
        共找到 {{ totalItems }} 件商品
      </div>
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
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            @input="debouncedSearch"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            商品分類
          </label>
          <select
            v-model="filters.category"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
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
            價格範圍
          </label>
          <select
            v-model="filters.priceRange"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            @change="fetchProducts"
          >
            <option value="">不限價格</option>
            <option value="0-100">$0 - $100</option>
            <option value="100-500">$100 - $500</option>
            <option value="500-1000">$500 - $1,000</option>
            <option value="1000+">$1,000以上</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            排序方式
          </label>
          <select
            v-model="filters.sortBy"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            @change="fetchProducts"
          >
            <option value="">預設排序</option>
            <option value="price_asc">價格：低到高</option>
            <option value="price_desc">價格：高到低</option>
            <option value="name_asc">名稱：A到Z</option>
            <option value="created_desc">最新商品</option>
          </select>
        </div>
      </div>
      
      <div class="mt-4 flex justify-end">
        <button
          @click="resetFilters"
          class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          重設篩選
        </button>
      </div>
    </div>

    <!-- Products Grid -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <span class="ml-3 text-gray-500">載入中...</span>
    </div>

    <div v-else-if="products.length === 0" class="text-center py-12">
      <ShoppingBagIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">暫無商品</h3>
      <p class="mt-1 text-sm text-gray-500">沒有找到符合條件的商品</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-4">
      <div
        v-for="product in products"
        :key="product.product_id"
        class="group relative bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
      >
        <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
          <GoogleDriveImage
            :product="product"
            :alt="product.name"
            class="h-48 w-full object-cover object-center group-hover:opacity-75 transition-opacity duration-200"
          />
          <div v-if="product.soh === 0" class="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <span class="text-white font-medium text-sm">缺貨</span>
          </div>
        </div>
        
        <div class="p-4">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h3 class="text-sm font-medium text-gray-900 line-clamp-2">
                {{ product.name }}
              </h3>
              <p class="mt-1 text-sm text-gray-500 line-clamp-2">
                {{ product.description }}
              </p>
              <p class="mt-1 text-xs text-gray-400">
                分類: {{ getCategoryName(product.category_id) }}
              </p>
            </div>
          </div>
          
          <div class="mt-4 flex items-center justify-between">
            <div class="flex items-center">
              <span class="text-lg font-medium text-gray-900">
                ${{ product.price }}
              </span>
              <span class="ml-2 text-sm text-gray-500">
                庫存: {{ product.soh }}
              </span>
            </div>
            
            <button
              @click="addToCart(product)"
              :disabled="product.soh === 0 || isAddingToCart[product.product_id]"
              class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!isAddingToCart[product.product_id]">
                <ShoppingCartIcon class="h-4 w-4 mr-1" />
                加入購物車
              </span>
              <span v-else class="flex items-center">
                <svg class="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                添加中
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-8">
      <nav class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div class="flex flex-1 justify-between sm:hidden">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            上一頁
          </button>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            下一頁
          </button>
        </div>
        <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              顯示第 <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> 到
              <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, totalItems) }}</span> 筆，
              共 <span class="font-medium">{{ totalItems }}</span> 筆結果
            </p>
          </div>
          <div>
            <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm">
              <button
                @click="prevPage"
                :disabled="currentPage === 1"
                class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                <ChevronLeftIcon class="h-5 w-5" />
              </button>
              
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="goToPage(page)"
                :class="[
                  'relative inline-flex items-center px-4 py-2 text-sm font-semibold',
                  page === currentPage
                    ? 'z-10 bg-primary-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                ]"
              >
                {{ page }}
              </button>
              
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                <ChevronRightIcon class="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </nav>
    </div>

    <!-- Success Toast -->
    <div
      v-if="showSuccessToast"
      class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
    >
      <div class="flex items-center">
        <CheckCircleIcon class="h-5 w-5 mr-2" />
        商品已加入購物車
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  ShoppingBagIcon, 
  ShoppingCartIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CheckCircleIcon 
} from '@heroicons/vue/24/outline'
import { productService } from '@/services/product'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { getProductImageUrl } from '@/utils/googleDrive'
import GoogleDriveImage from '@/components/common/GoogleDriveImage.vue'
import type { Product, Category } from '@/types/product'

const cartStore = useCartStore()
const authStore = useAuthStore()

const isLoading = ref(true)
const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const currentPage = ref(1)
const itemsPerPage = ref(12)
const totalItems = ref(0)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))
const isAddingToCart = ref<Record<number, boolean>>({})
const showSuccessToast = ref(false)

const filters = ref({
  search: '',
  category: '',
  priceRange: '',
  sortBy: ''
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
    const response = await productService.getProducts(
      currentPage.value,
      itemsPerPage.value,
      filters.value.category ? parseInt(filters.value.category) : undefined
    )
    
    if (response.status === 200 && response.data) {
      products.value = response.data.filter(p => p.soh > 0 && p.is_active) // 只顯示有庫存且啟用的商品
      totalItems.value = response.pagination?.totalItems || response.data.length
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
    priceRange: '',
    sortBy: ''
  }
  currentPage.value = 1
  fetchProducts()
}

const getCategoryName = (categoryId: number) => {
  const category = categories.value.find(c => c.category_id === categoryId)
  return category?.name || '未分類'
}

const addToCart = async (product: Product) => {
  if (!authStore.isAuthenticated) {
    // 未登入的使用者引導至登入頁面
    if (confirm('請先登入才能加入購物車，是否前往登入頁面？')) {
      // router.push('/auth/login')
    }
    return
  }

  try {
    isAddingToCart.value[product.product_id] = true
    await cartStore.addToCart(product.product_id, 1)
    showSuccessToast.value = true
    setTimeout(() => {
      showSuccessToast.value = false
    }, 3000)
  } catch (error) {
    console.error('加入購物車失敗:', error)
    alert('加入購物車失敗，請稍後再試')
  } finally {
    isAddingToCart.value[product.product_id] = false
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/placeholder-image.jpg'
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

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>