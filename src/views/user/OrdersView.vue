<template>
  <div class="px-4 py-6 sm:px-0">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">我的訂單</h1>
      <p class="mt-1 text-sm text-gray-600">查看您的訂單歷史和狀態</p>
    </div>


    <!-- Orders List -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <span class="ml-3 text-gray-500">載入中...</span>
    </div>

    <div v-else-if="orders.length === 0" class="text-center py-12">
      <DocumentTextIcon class="mx-auto h-16 w-16 text-gray-400" />
      <h3 class="mt-4 text-lg font-medium text-gray-900">暫無訂單</h3>
      <p class="mt-2 text-sm text-gray-500">您還沒有任何訂單</p>
      <div class="mt-6">
        <router-link
          to="/user/products"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          <ShoppingBagIcon class="-ml-1 mr-2 h-5 w-5" />
          開始購物
        </router-link>
      </div>
    </div>

    <div v-else class="space-y-6">
      <div
        v-for="order in orders"
        :key="order.order_id"
        class="bg-white shadow overflow-hidden sm:rounded-lg"
      >
        <div class="px-4 py-5 sm:px-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                訂單 #{{ order.order_id }}
              </h3>
              <p class="mt-1 max-w-2xl text-sm text-gray-500">
                下單時間：{{ formatDate(order.create_at) }}
              </p>
            </div>
            <div class="text-right">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-sm font-medium',
                  getStatusColor(order.status)
                ]"
              >
                {{ getStatusText(order.status) }}
              </span>
              <p class="mt-1 text-lg font-medium text-gray-900">
                ${{ order.total_amount || '計算中...' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div v-if="expandedOrders.includes(order.order_id)" class="border-t border-gray-200">
          <div class="px-4 py-5 sm:px-6">
            <h4 class="text-sm font-medium text-gray-900 mb-4">訂單商品</h4>
            <div v-if="orderDetails[order.order_id]">
              <div
                v-for="item in orderDetails[order.order_id].orderDetails"
                :key="`${item.order_id}-${item.product_id}`"
                class="flex items-center py-3 border-b border-gray-100 last:border-b-0"
              >
                <GoogleDriveImage
                  :product="item.product"
                  :alt="item.product?.name || '商品圖片'"
                  class="h-12 w-12 rounded object-cover object-center"
                />
                <div class="ml-4 flex-1">
                  <h5 class="text-sm font-medium text-gray-900">
                    {{ item.product?.name }}
                  </h5>
                  <p class="text-sm text-gray-500">
                    數量: {{ item.quantity }} × ${{ item.price }}
                  </p>
                </div>
                <div class="text-sm font-medium text-gray-900">
                  ${{ (item.quantity * item.price).toFixed(2) }}
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p class="mt-2 text-sm text-gray-500">載入訂單詳情...</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="bg-gray-50 px-4 py-4 sm:px-6">
          <div class="flex justify-between items-center">
            <button
              @click="toggleOrderDetails(order)"
              class="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              {{ expandedOrders.includes(order.order_id) ? '收起詳情' : '查看詳情' }}
            </button>
            
            <div class="flex space-x-3">
              <button
                v-if="order.status === 'pending'"
                @click="cancelOrder(order)"
                :disabled="isCancelling[order.order_id]"
                class="text-red-600 hover:text-red-500 text-sm font-medium disabled:opacity-50"
              >
                <span v-if="!isCancelling[order.order_id]">取消訂單</span>
                <span v-else>取消中...</span>
              </button>
              
              <button
                v-if="order.status === 'delivered'"
                class="text-primary-600 hover:text-primary-500 text-sm font-medium"
              >
                再次購買
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div
      v-if="message.show"
      :class="[
        'fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50',
        message.type === 'success' ? 'bg-green-500' : 'bg-red-500',
        'text-white'
      ]"
    >
      <div class="flex items-center">
        <CheckCircleIcon v-if="message.type === 'success'" class="h-5 w-5 mr-2" />
        <ExclamationTriangleIcon v-else class="h-5 w-5 mr-2" />
        {{ message.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  DocumentTextIcon, 
  ShoppingBagIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import { orderService } from '@/services/order'
import { productService } from '@/services/product'
import { useAuthStore } from '@/stores/auth'
import { getProductImageUrl } from '@/utils/googleDrive'
import GoogleDriveImage from '@/components/common/GoogleDriveImage.vue'
import type { Order, Product } from '@/types/product'

const isLoading = ref(true)
const orders = ref<Order[]>([])
const expandedOrders = ref<number[]>([])
const orderDetails = ref<Record<number, Order>>({})
const isCancelling = ref<Record<number, boolean>>({})


const message = ref({
  show: false,
  type: 'success' as 'success' | 'error',
  text: ''
})

onMounted(() => {
  fetchOrders()
})

const fetchOrders = async () => {
  try {
    isLoading.value = true
    
    // 獲取當前用戶ID
    const authStore = useAuthStore()
    if (!authStore.user) {
      console.error('❌ 用戶未登入')
      return
    }
    
    let memberId: number
    if ('member_id' in authStore.user && authStore.user.member_id) {
      memberId = Number(authStore.user.member_id)
    } else if ('id' in authStore.user && authStore.user.id) {
      memberId = Number(authStore.user.id)
    } else {
      console.error('❌ 無法獲取會員ID')
      return
    }
    
    console.log('📋 獲取訂單 - 會員ID:', memberId)
    const response = await orderService.getOrders(memberId)
    
    console.log('📦 訂單服務回應完整資料:', response)
    
    if (response.success && response.data) {
      orders.value = response.data
      console.log('✅ 訂單載入成功:', orders.value)
      console.log('🔍 第一筆訂單詳細資料:', orders.value[0])
    } else if (response.status === 200 && response.data) {
      orders.value = response.data
      console.log('✅ 訂單載入成功 (status 200):', orders.value)
      console.log('🔍 第一筆訂單詳細資料:', orders.value[0])
    } else {
      // 如果沒有數據，使用模擬數據進行展示
      orders.value = [
        {
          order_id: 1001,
          member_id: 1,
          total_amount: 299,
          status: 'delivered',
          create_at: '2024-01-15T10:30:00',
          updated_at: '2024-01-17T14:20:00',
          orderDetails: []
        },
        {
          order_id: 1002,
          member_id: 1,
          total_amount: 156,
          status: 'shipped',
          create_at: '2024-01-10T09:15:00',
          updated_at: '2024-01-12T16:45:00',
          orderDetails: []
        },
        {
          order_id: 1003,
          member_id: 1,
          total_amount: 89,
          status: 'processing',
          create_at: '2024-01-08T16:20:00',
          updated_at: '2024-01-09T10:30:00',
          orderDetails: []
        }
      ]
    }
  } catch (error) {
    console.error('獲取訂單列表失敗:', error)
    showMessage('獲取訂單列表失敗', 'error')
  } finally {
    isLoading.value = false
  }
}

const toggleOrderDetails = async (order: Order) => {
  const orderId = order.order_id
  
  if (expandedOrders.value.includes(orderId)) {
    expandedOrders.value = expandedOrders.value.filter(id => id !== orderId)
  } else {
    expandedOrders.value.push(orderId)
    
    if (!orderDetails.value[orderId]) {
      try {
        // 直接使用已載入的訂單資料，不需要額外的API調用
        const orderData = { ...order }
        
        // 處理訂單商品詳細資訊，載入真實商品資料
        if (orderData.orderDetails && Array.isArray(orderData.orderDetails)) {
          console.log('🔍 處理訂單商品詳細資訊:', orderData.orderDetails)
          
          try {
            // 先載入完整的商品列表
            console.log('📦 載入商品列表以獲取商品詳細資訊...')
            const productsResponse = await productService.getAdminProducts()
            
            let productsMap: Map<number, any> = new Map()
            
            if (productsResponse.status === 200 && productsResponse.data) {
              // 建立商品ID到商品資訊的映射
              productsResponse.data.forEach((product: any) => {
                productsMap.set(product.product_id, product)
              })
              console.log('✅ 商品列表載入成功，商品數量:', productsResponse.data.length)
              console.log('📋 可用商品:', Array.from(productsMap.keys()))
            } else {
              console.log('⚠️ 無法載入商品列表，使用備用方法')
            }
            
            // 為每個訂單商品設置詳細資訊
            orderData.orderDetails.forEach((detail: any) => {
              const productInfo = productsMap.get(detail.product_id)
              
              if (productInfo) {
                // 使用真實商品資訊，但保留訂單中的價格
                detail.product = {
                  ...productInfo,
                  price: detail.price // 使用訂單中記錄的購買價格
                }
                console.log(`✅ 載入真實商品 ${detail.product_id}:`, detail.product.name, '訂單價格:', detail.price)
              } else {
                // 備用方案：使用基本資訊
                detail.product = {
                  product_id: detail.product_id,
                  name: `商品 #${detail.product_id}`,
                  price: detail.price,
                  soh: 0,
                  category_id: 1,
                  image_id: '1mNWrY6BLLZFxMpZGGJOGUJhzWa-oGx5a',
                  is_active: true
                }
                console.log(`⚠️ 使用備用商品資訊 ${detail.product_id}`)
              }
            })
            
          } catch (error) {
            console.error('❌ 載入商品資訊失敗:', error)
            // 錯誤處理：使用基本資訊
            orderData.orderDetails.forEach((detail: any) => {
              detail.product = {
                product_id: detail.product_id,
                name: `商品 #${detail.product_id}`,
                price: detail.price,
                soh: 0,
                category_id: 1,
                image_url: '/placeholder-image.jpg',
                is_active: true
              }
            })
          }
          
          orderDetails.value[orderId] = orderData
          console.log('✅ 訂單詳情載入完成:', orderData)
        } else {
          console.log('⚠️ 訂單沒有 orderDetails，使用模擬資料')
          // 模擬訂單詳情
          orderDetails.value[orderId] = {
            ...order,
            orderDetails: [
              {
                order_id: orderId,
                product_id: 1,
                quantity: 2,
                price: 99.50,
                product: {
                  product_id: 1,
                  name: 'iPhone 15 Pro',
                  price: 99.50,
                  soh: 10,
                  category_id: 1,
                  image_id: '1mNWrY6BLLZFxMpZGGJOGUJhzWa-oGx5a',
                  is_active: true
                }
              },
              {
                order_id: orderId,
                product_id: 4,
                quantity: 1,
                price: 50.00,
                product: {
                  product_id: 4,
                  name: '運動休閒鞋',
                  price: 50.00,
                  soh: 5,
                  category_id: 2,
                  image_id: '1xCJvPX-KNsovAYUE0Xk_u_IhVGrIJ5Yx',
                  is_active: true
                }
              }
            ]
          }
        }
      } catch (error) {
        console.error('獲取訂單詳情失敗:', error)
        showMessage('獲取訂單詳情失敗', 'error')
      }
    }
  }
}

const cancelOrder = async (order: Order) => {
  if (!confirm('確定要取消這個訂單嗎？')) {
    return
  }

  try {
    isCancelling.value[order.order_id] = true
    const response = await orderService.updateOrderStatus(order.order_id, 'cancelled')
    
    if (response.success) {
      // 更新本地訂單狀態
      const orderIndex = orders.value.findIndex(o => o.order_id === order.order_id)
      if (orderIndex !== -1) {
        orders.value[orderIndex].status = 'cancelled'
      }
      showMessage('訂單已取消', 'success')
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('取消訂單失敗:', error)
    showMessage('取消訂單失敗', 'error')
  } finally {
    isCancelling.value[order.order_id] = false
  }
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
  if (!dateString) return '無效日期'
  
  try {
    // 處理多種可能的日期格式
    const date = new Date(dateString)
    
    // 檢查日期是否有效
    if (isNaN(date.getTime())) {
      console.log('📅 無效日期格式:', dateString)
      return '無效日期'
    }
    
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('📅 日期格式化錯誤:', error)
    return '無效日期'
  }
}

const showMessage = (text: string, type: 'success' | 'error') => {
  message.value = { show: true, type, text }
  setTimeout(() => {
    message.value.show = false
  }, 3000)
}
</script>