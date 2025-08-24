<template>
  <div>
    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <UsersIcon class="h-8 w-8 text-gray-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  總會員數
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ stats.totalMembers }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <ShoppingBagIcon class="h-8 w-8 text-gray-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  總商品數
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ stats.totalProducts }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <DocumentTextIcon class="h-8 w-8 text-gray-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  總訂單數
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ stats.totalOrders }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <CurrencyDollarIcon class="h-8 w-8 text-gray-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  總銷售額
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  ${{ stats.totalRevenue.toLocaleString() }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Orders -->
    <div class="bg-white shadow overflow-hidden sm:rounded-md mb-8">
      <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 class="text-lg leading-6 font-medium text-gray-900">最近訂單</h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">最新的10筆訂單</p>
      </div>
      
      <div v-if="isLoading" class="p-6 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-2 text-sm text-gray-500">載入中...</p>
      </div>
      
      <ul v-else-if="recentOrders.length > 0" class="divide-y divide-gray-200">
        <li v-for="order in recentOrders" :key="order.order_id" class="px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span class="text-sm font-medium text-gray-700">
                    #{{ order.order_id }}
                  </span>
                </div>
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-900">
                  訂單 #{{ order.order_id }}
                </div>
                <div class="text-sm text-gray-500">
                  會員ID: {{ order.member_id }} | 金額: ${{ order.total_amount }}
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <span
                :class="[
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  getStatusColor(order.status)
                ]"
              >
                {{ getStatusText(order.status) }}
              </span>
              <span class="text-sm text-gray-500">
                {{ formatDate(order.created_at) }}
              </span>
            </div>
          </div>
        </li>
      </ul>
      
      <div v-else class="p-6 text-center text-gray-500">
        暫無訂單數據
      </div>
      
      <div class="bg-gray-50 px-4 py-3 text-right">
        <router-link
          to="/admin/orders"
          class="text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          查看所有訂單 →
        </router-link>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">快速操作</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <router-link
            to="/admin/products"
            class="relative block p-6 bg-white border border-gray-300 rounded-lg hover:border-gray-400 hover:shadow-md transition-all duration-200"
          >
            <div class="flex items-center">
              <PlusIcon class="h-8 w-8 text-primary-600" />
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-900">新增商品</p>
                <p class="text-sm text-gray-500">管理商品庫存</p>
              </div>
            </div>
          </router-link>

          <router-link
            to="/admin/categories"
            class="relative block p-6 bg-white border border-gray-300 rounded-lg hover:border-gray-400 hover:shadow-md transition-all duration-200"
          >
            <div class="flex items-center">
              <TagIcon class="h-8 w-8 text-primary-600" />
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-900">管理分類</p>
                <p class="text-sm text-gray-500">商品分類設定</p>
              </div>
            </div>
          </router-link>

          <router-link
            to="/admin/orders"
            class="relative block p-6 bg-white border border-gray-300 rounded-lg hover:border-gray-400 hover:shadow-md transition-all duration-200"
          >
            <div class="flex items-center">
              <DocumentTextIcon class="h-8 w-8 text-primary-600" />
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-900">處理訂單</p>
                <p class="text-sm text-gray-500">訂單狀態管理</p>
              </div>
            </div>
          </router-link>

          <router-link
            to="/admin/members"
            class="relative block p-6 bg-white border border-gray-300 rounded-lg hover:border-gray-400 hover:shadow-md transition-all duration-200"
          >
            <div class="flex items-center">
              <UsersIcon class="h-8 w-8 text-primary-600" />
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-900">會員管理</p>
                <p class="text-sm text-gray-500">查看會員資料</p>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  UsersIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  PlusIcon,
  TagIcon
} from '@heroicons/vue/24/outline'
import type { Order } from '@/types/product'
import { orderService } from '@/services/order'
import { productService } from '@/services/product'
import { adminService } from '@/services/admin'

const isLoading = ref(true)
const stats = ref({
  totalMembers: 0,
  totalProducts: 0,
  totalOrders: 0,
  totalRevenue: 0
})
const recentOrders = ref<Order[]>([])

onMounted(async () => {
  await Promise.all([
    fetchDashboardStats(),
    fetchRecentOrders()
  ])
})

const fetchDashboardStats = async () => {
  try {
    // 獲取各種統計數據
    const [membersResponse, productsResponse, ordersResponse] = await Promise.all([
      adminService.getAllMembers(),
      productService.getAdminProducts(),
      orderService.getAllOrders()
    ])
    
    let totalMembers = 0
    let totalProducts = 0
    let totalOrders = 0
    let totalRevenue = 0
    
    // 處理會員數據
    if (membersResponse.status === 200 && membersResponse.data) {
      totalMembers = Array.isArray(membersResponse.data) ? membersResponse.data.length : 0
    }
    
    // 處理商品數據
    if (productsResponse.status === 200 && productsResponse.data) {
      totalProducts = Array.isArray(productsResponse.data) ? productsResponse.data.length : 0
    }
    
    // 處理訂單數據
    if (ordersResponse.status === 200 && ordersResponse.data) {
      const orders = Array.isArray(ordersResponse.data) ? ordersResponse.data : []
      totalOrders = orders.length
      totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
    }
    
    stats.value = {
      totalMembers,
      totalProducts,
      totalOrders,
      totalRevenue
    }
  } catch (error) {
    console.error('獲取統計數據失敗:', error)
    // 使用預設值
    stats.value = {
      totalMembers: 0,
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0
    }
  }
}

const fetchRecentOrders = async () => {
  try {
    isLoading.value = true
    const response = await orderService.getAllOrders()
    
    if (response.status === 200 && response.data && Array.isArray(response.data)) {
      // 取最新的10筆訂單
      recentOrders.value = response.data
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)
    }
  } catch (error) {
    console.error('獲取最近訂單失敗:', error)
  } finally {
    isLoading.value = false
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
  return new Date(dateString).toLocaleString('zh-TW')
}
</script>