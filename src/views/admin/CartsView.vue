<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">購物車管理</h1>
        <p class="mt-1 text-sm text-gray-600">管理所有會員的購物車內容</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <span class="ml-3 text-gray-500">載入中...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="carts.length === 0" class="text-center py-12">
      <ShoppingCartIcon class="mx-auto h-16 w-16 text-gray-400" />
      <h3 class="mt-4 text-lg font-medium text-gray-900">暫無購物車資料</h3>
      <p class="mt-2 text-sm text-gray-500">目前沒有會員在購物車中放入商品</p>
    </div>

    <!-- Carts Table -->
    <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                會員ID
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                商品ID
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                商品名稱
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                數量
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                單價
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                小計
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="cart in carts" :key="`${cart.member_id}-${cart.product_id}`" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ cart.member_id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ cart.product_id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ cart.product_name || '載入中...' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <input
                  v-if="authStore.canEditCarts"
                  v-model.number="cart.quantity"
                  type="number"
                  min="1"
                  max="999"
                  class="w-20 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-gray-900"
                  @change="updateCartQuantity(cart)"
                />
                <span v-else class="text-sm text-gray-900">
                  {{ cart.quantity }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${{ cart.price || 0 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${{ (cart.quantity * (cart.price || 0)).toFixed(0) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  v-if="authStore.canEditCarts"
                  @click="confirmDeleteCart(cart)"
                  class="text-red-600 hover:text-red-900"
                  title="刪除購物車項目"
                >
                  <TrashIcon class="h-4 w-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 統計信息 -->
    <div v-if="carts.length > 0" class="mt-6 bg-white shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">統計信息</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="text-sm font-medium text-blue-600">總項目數</div>
          <div class="text-2xl font-bold text-blue-900">{{ carts.length }}</div>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <div class="text-sm font-medium text-green-600">活躍會員數</div>
          <div class="text-2xl font-bold text-green-900">{{ uniqueMembers }}</div>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg">
          <div class="text-sm font-medium text-purple-600">總商品數</div>
          <div class="text-2xl font-bold text-purple-900">{{ totalQuantity }}</div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmModal
      v-if="showDeleteModal"
      :title="'刪除購物車項目'"
      :message="`確定要刪除會員 ${cartToDelete?.member_id} 的商品 ${cartToDelete?.product_id} 嗎？`"
      @confirm="handleDeleteCart"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  ShoppingCartIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import { adminService, type AdminCartItem } from '@/services/admin'
import { productService } from '@/services/product'
import DeleteConfirmModal from '@/components/common/DeleteConfirmModal.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

interface ExtendedCartItem extends AdminCartItem {
  product_name?: string
  price?: number
}

const isLoading = ref(true)
const carts = ref<ExtendedCartItem[]>([])
const showDeleteModal = ref(false)
const cartToDelete = ref<ExtendedCartItem | null>(null)

// 計算統計信息
const uniqueMembers = computed(() => {
  const memberIds = new Set(carts.value.map(cart => cart.member_id))
  return memberIds.size
})

const totalQuantity = computed(() => {
  return carts.value.reduce((total, cart) => total + cart.quantity, 0)
})

onMounted(() => {
  fetchCarts()
})

const fetchCarts = async () => {
  try {
    isLoading.value = true
    const response = await adminService.getAllCarts()
    
    console.log('📦 購物車資料回應:', response)
    
    // 檢查API回應格式：status: 200 和 data 陣列
    if (response.status === 200 && response.data && Array.isArray(response.data)) {
      carts.value = response.data
      // 載入商品資訊
      await loadProductInfo()
    } else if (response.data && Array.isArray(response.data)) {
      carts.value = response.data
      await loadProductInfo()
    }
  } catch (error) {
    console.error('獲取購物車列表失敗:', error)
  } finally {
    isLoading.value = false
  }
}

const loadProductInfo = async () => {
  // 獲取所有商品資訊以建立對照表
  try {
    console.log('🔍 載入商品資訊...')
    const response = await productService.getAdminProducts()
    
    if (response.status === 200 && response.data) {
      const products = response.data
      console.log('📦 商品列表:', products)
      
      // 建立商品ID到商品資訊的對照表
      const productMap = new Map()
      products.forEach(product => {
        productMap.set(product.product_id, {
          name: product.name,
          price: Number(product.price)
        })
      })
      
      // 為每個購物車項目設定商品名稱和價格
      carts.value.forEach(cart => {
        const productInfo = productMap.get(cart.product_id)
        if (productInfo) {
          cart.product_name = productInfo.name
          cart.price = productInfo.price
        } else {
          // 如果找不到商品資訊，使用預設值
          cart.product_name = `商品 ${cart.product_id}`
          cart.price = 0
        }
      })
      
      console.log('✅ 商品資訊載入完成')
    } else {
      throw new Error('無法獲取商品列表')
    }
  } catch (error) {
    console.error('❌ 載入商品資訊失敗:', error)
    // 如果無法從API獲取，使用備用方案
    carts.value.forEach(cart => {
      if (!cart.product_name) {
        cart.product_name = `商品 ${cart.product_id}`
        cart.price = 0
      }
    })
  }
}

const updateCartQuantity = async (cart: ExtendedCartItem) => {
  try {
    console.log('🔄 更新購物車數量:', cart)
    
    const updateData = {
      member_id: cart.member_id,
      product_id: cart.product_id,
      quantity: cart.quantity
    }
    
    const response = await adminService.updateCart(updateData)
    
    if (response.success || response.status === 200) {
      // 更新成功，不需要重新載入整個列表
      console.log('✅ 購物車數量更新成功')
    } else {
      throw new Error(response.message || '更新購物車數量失敗')
    }
  } catch (error: any) {
    console.error('更新購物車數量失敗:', error)
    alert(error.message || '更新購物車數量失敗，請稍後再試')
    // 恢復原始值
    fetchCarts()
  }
}

const confirmDeleteCart = (cart: ExtendedCartItem) => {
  cartToDelete.value = cart
  showDeleteModal.value = true
}

const handleDeleteCart = async () => {
  if (cartToDelete.value) {
    try {
      console.log('🗑️ 刪除購物車項目:', cartToDelete.value)
      
      const deleteData = {
        member_id: cartToDelete.value.member_id,
        product_id: cartToDelete.value.product_id
      }
      
      const response = await adminService.deleteCart(deleteData)
      
      if (response.success || response.status === 200) {
        showDeleteModal.value = false
        cartToDelete.value = null
        fetchCarts()
        console.log('✅ 購物車項目刪除成功')
      } else {
        throw new Error(response.message || '刪除購物車項目失敗')
      }
    } catch (error: any) {
      console.error('刪除購物車項目失敗:', error)
      alert(error.message || '刪除購物車項目失敗，請稍後再試')
    }
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  cartToDelete.value = null
}
</script>