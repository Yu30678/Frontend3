<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">訂單管理</h1>
        <p class="mt-1 text-sm text-gray-600">管理所有訂單和訂單狀態</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            日期範圍
          </label>
          <select
            v-model="filters.dateRange"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-gray-900"
            @change="fetchOrders"
          >
            <option value="">全部時間</option>
            <option value="today">今天</option>
            <option value="7days">最近7天</option>
            <option value="30days">最近30天</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            搜尋訂單
          </label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="訂單編號或會員ID..."
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-gray-900"
            @input="debouncedSearch"
          />
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

    <!-- Orders Table -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <span class="ml-3 text-gray-500">載入中...</span>
    </div>

    <div v-else-if="orders.length === 0" class="text-center py-12">
      <DocumentTextIcon class="mx-auto h-16 w-16 text-gray-400" />
      <h3 class="mt-4 text-lg font-medium text-gray-900">暫無訂單</h3>
      <p class="mt-2 text-sm text-gray-500">尚未有任何訂單記錄</p>
    </div>

    <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                訂單編號
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                會員ID
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                金額
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                建立時間
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="order in orders" :key="order.order_id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                #{{ order.order_id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ order.member_id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${{ (order.total_amount || 0).toLocaleString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(order.created_at || order.create_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <button
                    @click="viewOrderDetails(order)"
                    class="text-primary-600 hover:text-primary-900"
                  >
                    查看詳情
                  </button>
                  <button
                    v-if="authStore.canEditOrders"
                    @click="openEditModal(order)"
                    class="text-indigo-600 hover:text-indigo-900"
                  >
                    <PencilIcon class="h-4 w-4" />
                  </button>
                  <button
                    v-if="authStore.canEditOrders"
                    @click="confirmDelete(order)"
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

    <!-- Order Details Modal -->
    <div v-if="showDetailsModal && selectedOrder" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              訂單詳情 #{{ selectedOrder.order_id }}
            </h3>
            <button
              @click="closeDetailsModal"
              class="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">訂單編號</label>
                <p class="text-sm text-gray-900">#{{ selectedOrder.order_id }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">會員ID</label>
                <p class="text-sm text-gray-900">{{ selectedOrder.member_id }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">訂單金額</label>
                <p class="text-sm text-gray-900">${{ (selectedOrder.total_amount || 0).toLocaleString() }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">訂單狀態</label>
                <span
                  :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    getStatusColor(selectedOrder.status || 'pending')
                  ]"
                >
                  {{ getStatusText(selectedOrder.status || 'pending') }}
                </span>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">建立時間</label>
                <p class="text-sm text-gray-900">{{ formatDate(selectedOrder.created_at || selectedOrder.create_at) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">更新時間</label>
                <p class="text-sm text-gray-900">{{ formatDate(selectedOrder.updated_at || selectedOrder.created_at || selectedOrder.create_at) }}</p>
              </div>
            </div>

            <div class="border-t pt-4">
              <h4 class="text-sm font-medium text-gray-900 mb-2">訂單商品</h4>
              
              <div v-if="isLoadingDetails" class="text-center py-4">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                <p class="mt-2 text-sm text-gray-500">載入商品資訊中...</p>
              </div>
              
              <div v-else-if="orderDetailsWithProducts.length > 0" class="space-y-2">
                <div
                  v-for="(detail, index) in orderDetailsWithProducts"
                  :key="index"
                  class="flex justify-between items-center p-3 bg-gray-50 rounded"
                >
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">{{ detail.productName }}</p>
                    <p class="text-sm text-gray-500">商品ID: {{ detail.product_id }}</p>
                    <p class="text-sm text-gray-500">數量: {{ detail.quantity }} × ${{ detail.price.toLocaleString() }}</p>
                  </div>
                  <p class="text-sm font-medium text-gray-900">
                    ${{ (detail.quantity * detail.price).toLocaleString() }}
                  </p>
                </div>
              </div>
              
              <div v-else class="text-sm text-gray-500 text-center py-4">
                無訂單明細資料
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end">
            <button
              @click="closeDetailsModal"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Order Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              編輯訂單 #{{ editForm.order_id }}
            </h3>
            <button
              @click="closeEditModal"
              class="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>

          <form @submit.prevent="handleOrderUpdate" class="space-y-6">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  訂單編號
                </label>
                <input
                  v-model="editForm.order_id"
                  type="number"
                  readonly
                  class="block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 sm:text-sm text-gray-900"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  會員ID
                </label>
                <input
                  v-model="editForm.member_id"
                  type="number"
                  required
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-gray-900"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                建立時間
              </label>
              <input
                v-model="editForm.create_at"
                type="datetime-local"
                required
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-gray-900"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                訂單明細
              </label>
              <div class="space-y-2">
                <div
                  v-for="(detail, index) in editForm.orderDetails"
                  :key="index"
                  class="flex items-center space-x-4 p-3 bg-gray-50 rounded"
                >
                  <div class="flex-1">
                    <label class="block text-xs text-gray-500">商品ID</label>
                    <input
                      v-model="detail.product_id"
                      type="number"
                      required
                      class="w-full text-sm border-gray-300 rounded text-gray-900"
                    />
                  </div>
                  <div class="flex-1">
                    <label class="block text-xs text-gray-500">數量</label>
                    <input
                      v-model="detail.quantity"
                      type="number"
                      min="1"
                      required
                      class="w-full text-sm border-gray-300 rounded text-gray-900"
                    />
                  </div>
                  <div class="flex-1">
                    <label class="block text-xs text-gray-500">價格</label>
                    <input
                      v-model="detail.price"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      class="w-full text-sm border-gray-300 rounded text-gray-900"
                    />
                  </div>
                  <button
                    type="button"
                    @click="removeOrderDetail(index)"
                    class="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon class="h-4 w-4" />
                  </button>
                </div>
              </div>
              <button
                type="button"
                @click="addOrderDetail"
                class="mt-2 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                + 新增商品
              </button>
            </div>

            <div class="flex gap-4 pt-4">
              <button
                type="button"
                @click="closeEditModal"
                class="flex-1 px-4 py-2 bg-white text-gray-500 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm hover:bg-primary-700 disabled:opacity-50"
              >
                <span v-if="!isSubmitting">更新訂單</span>
                <span v-else>處理中...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmModal
      v-if="showDeleteModal"
      :title="'刪除訂單'"
      :message="`確定要刪除訂單 #${orderToDelete?.order_id} 嗎？此操作無法復原。`"
      @confirm="handleDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DocumentTextIcon, XMarkIcon, TrashIcon, PencilIcon } from '@heroicons/vue/24/outline'
import { orderService } from '@/services/order'
import { productService } from '@/services/product'
import type { Order, OrderDetail } from '@/types/product'
import DeleteConfirmModal from '@/components/common/DeleteConfirmModal.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const isLoading = ref(true)
const orders = ref<Order[]>([])
const isUpdating = ref<Record<number, boolean>>({})
const showDetailsModal = ref(false)
const selectedOrder = ref<Order | null>(null)
const showDeleteModal = ref(false)
const orderToDelete = ref<Order | null>(null)
const orderDetailsWithProducts = ref<Array<OrderDetail & { productName?: string }>>([])  
const isLoadingDetails = ref(false)
const showEditModal = ref(false)
const isSubmitting = ref(false)

// 編輯表單狀態
const editForm = ref({
  order_id: 0,
  member_id: 0,
  create_at: '',
  orderDetails: [] as OrderDetail[]
})

const filters = ref({
  dateRange: '',
  search: ''
})

// 移除模擬資料，使用真實訂單明細

let searchTimeout: NodeJS.Timeout | null = null

onMounted(() => {
  fetchOrders()
})

const fetchOrders = async () => {
  try {
    isLoading.value = true
    const response = await orderService.getAllOrders()
    
    // 檢查API回應格式：status: 200 和 data 陣列
    if (response.status === 200 && response.data && Array.isArray(response.data)) {
      // 處理每個訂單，計算總金額
      const processedOrders = response.data.map(order => {
        // 計算訂單總金額
        const total_amount = order.orderDetails ? 
          order.orderDetails.reduce((sum, detail) => sum + (detail.quantity * detail.price), 0) : 0
        
        return {
          ...order,
          total_amount,
          created_at: order.create_at, // 統一使用 created_at
          status: order.status || 'pending' // 預設狀態
        }
      })
      
      // 過濾和搜尋邏輯
      let filteredOrders = processedOrders
      
      // 搜尋篩選
      if (filters.value.search) {
        filteredOrders = filteredOrders.filter(o => 
          o.order_id.toString().includes(filters.value.search) ||
          o.member_id.toString().includes(filters.value.search)
        )
      }
      
      // 日期篩選
      if (filters.value.dateRange) {
        const now = new Date()
        const filterDate = new Date()
        
        switch (filters.value.dateRange) {
          case 'today':
            filterDate.setHours(0, 0, 0, 0)
            break
          case '7days':
            filterDate.setDate(now.getDate() - 7)
            break
          case '30days':
            filterDate.setDate(now.getDate() - 30)
            break
        }
        
        if (filters.value.dateRange !== '') {
          filteredOrders = filteredOrders.filter(o => 
            new Date(o.created_at) >= filterDate
          )
        }
      }
      
      orders.value = filteredOrders
    }
  } catch (error) {
    console.error('獲取訂單列表失敗:', error)
  } finally {
    isLoading.value = false
  }
}

// 移除更新訂單狀態功能，因為訂單狀態通常是系統自動處理的
// 如果需要的話，可以在訂單詳情中添加狀態更新功能

const viewOrderDetails = async (order: Order) => {
  selectedOrder.value = order
  showDetailsModal.value = true
  
  // 獲取訂單明細的商品資訊
  await fetchOrderDetailsWithProducts(order)
}

const fetchOrderDetailsWithProducts = async (order: Order) => {
  try {
    isLoadingDetails.value = true
    orderDetailsWithProducts.value = []
    
    if (order.orderDetails && order.orderDetails.length > 0) {
      // 獲取所有商品資訊
      const productsResponse = await productService.getAdminProducts()
      
      if (productsResponse.status === 200 && productsResponse.data) {
        const products = productsResponse.data
        
        // 為每個訂單明細添加商品名稱
        orderDetailsWithProducts.value = order.orderDetails.map(detail => {
          const product = products.find(p => p.product_id === detail.product_id)
          return {
            ...detail,
            productName: product?.name || `商品ID: ${detail.product_id}`
          }
        })
      } else {
        // 如果無法獲取商品資訊，只顯示商品ID
        orderDetailsWithProducts.value = order.orderDetails.map(detail => ({
          ...detail,
          productName: `商品ID: ${detail.product_id}`
        }))
      }
    }
  } catch (error) {
    console.error('獲取訂單明細失敗:', error)
    // 如果發生錯誤，只顯示商品ID
    if (order.orderDetails) {
      orderDetailsWithProducts.value = order.orderDetails.map(detail => ({
        ...detail,
        productName: `商品ID: ${detail.product_id}`
      }))
    }
  } finally {
    isLoadingDetails.value = false
  }
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedOrder.value = null
}

const debouncedSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    fetchOrders()
  }, 500)
}

const resetFilters = () => {
  filters.value = {
    dateRange: '',
    search: ''
  }
  fetchOrders()
}

const getStatusColor = (status: string) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status: string) => {
  const statusMap = {
    pending: '待處理',
    processing: '處理中',
    shipped: '已出貨',
    delivered: '已送達',
    cancelled: '已取消'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-TW')
}

const confirmDelete = (order: Order) => {
  orderToDelete.value = order
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (orderToDelete.value) {
    try {
      await orderService.deleteOrder(orderToDelete.value.order_id)
      showDeleteModal.value = false
      orderToDelete.value = null
      fetchOrders()
    } catch (error) {
      console.error('刪除訂單失敗:', error)
    }
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  orderToDelete.value = null
}

const openEditModal = (order: Order) => {
  selectedOrder.value = order
  // 設定編輯表單資料
  editForm.value = {
    order_id: order.order_id,
    member_id: order.member_id,
    create_at: formatDateTimeForInput(order.create_at),
    orderDetails: order.orderDetails ? [...order.orderDetails] : []
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedOrder.value = null
}

const formatDateTimeForInput = (dateString: string) => {
  if (!dateString) return ''
  // 轉換為 datetime-local 格式 (YYYY-MM-DDTHH:mm)
  const date = new Date(dateString)
  return date.toISOString().slice(0, 16)
}

const addOrderDetail = () => {
  editForm.value.orderDetails.push({
    order_id: editForm.value.order_id,
    product_id: 0,
    quantity: 1,
    price: 0
  })
}

const removeOrderDetail = (index: number) => {
  editForm.value.orderDetails.splice(index, 1)
}

const handleOrderUpdate = async () => {
  try {
    isSubmitting.value = true
    
    // 根據後端PUT方法的要求格式化資料
    const updateData = {
      order_id: editForm.value.order_id,
      member_id: editForm.value.member_id,
      create_at: editForm.value.create_at,
      orderDetails: editForm.value.orderDetails
    }
    
    const response = await orderService.updateOrder(editForm.value.order_id, updateData)
    
    if (response.success || response.status === 200) {
      closeEditModal()
      fetchOrders() // 重新獲取訂單列表
    } else {
      throw new Error(response.message || '更新訂單失敗')
    }
  } catch (error) {
    console.error('更新訂單失敗:', error)
    alert('更新訂單失敗，請檢查輸入資料是否正確')
  } finally {
    isSubmitting.value = false
  }
}
</script>