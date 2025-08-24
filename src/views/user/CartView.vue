<template>
  <div class="px-4 py-6 sm:px-0">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">購物車</h1>
      <p class="mt-1 text-sm text-gray-600">檢查您的商品並準備結帳</p>
    </div>

    <div v-if="cartStore.isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <span class="ml-3 text-gray-500">載入中...</span>
    </div>

    <div v-else-if="cartStore.items.length === 0" class="text-center py-12">
      <ShoppingCartIcon class="mx-auto h-16 w-16 text-gray-400" />
      <h3 class="mt-4 text-lg font-medium text-gray-900">購物車是空的</h3>
      <p class="mt-2 text-sm text-gray-500">還沒有添加任何商品到購物車</p>
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

    <div v-else class="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start xl:gap-x-16">
      <!-- Cart items -->
      <section class="lg:col-span-7">
        <div class="bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">商品清單 ({{ cartStore.items.length }})</h2>
            
            <ul class="divide-y divide-gray-200">
              <li v-for="item in cartStore.items" :key="`${item.member_id}-${item.product_id}`" class="py-6">
                <div class="flex items-center">
                  <!-- Product image -->
                  <div class="flex-shrink-0">
                    <GoogleDriveImage
                      :product="item.product"
                      :alt="item.product?.name"
                      class="h-16 w-16 rounded-md object-cover object-center sm:h-20 sm:w-20"
                    />
                  </div>

                  <!-- Product details -->
                  <div class="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                    <div class="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                      <div>
                        <div class="flex justify-between">
                          <h3 class="text-sm">
                            <span class="font-medium text-gray-900">
                              {{ item.product?.name }}
                            </span>
                          </h3>
                        </div>
                        <div class="mt-1 flex text-sm">
                          <p class="text-gray-500">
                            {{ item.product?.description }}
                          </p>
                        </div>
                        <p class="mt-1 text-sm font-medium text-gray-900">
                          ${{ item.product?.price }}
                        </p>
                      </div>

                      <div class="mt-4 sm:mt-0 sm:pr-9">
                        <div class="flex items-center">
                          <label :for="`quantity-${item.product_id}`" class="sr-only">
                            數量, {{ item.product?.name }}
                          </label>
                          <div class="flex items-center">
                            <input
                              :id="`quantity-${item.product_id}`"
                              :value="item.quantity"
                              @change="onQuantityChange(item, $event)"
                              type="number"
                              min="1"
                              :max="item.product?.soh"
                              :disabled="isUpdating[item.product_id]"
                              class="w-20 text-center border border-gray-300 rounded-md p-2 text-sm text-gray-900 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
                            />
                          </div>
                        </div>

                        <div class="absolute top-0 right-0">
                          <button
                            @click="removeItem(item)"
                            :disabled="isRemoving[item.product_id]"
                            class="p-2 text-gray-400 hover:text-gray-500 disabled:opacity-50"
                          >
                            <span class="sr-only">移除</span>
                            <TrashIcon class="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <p class="mt-4 flex space-x-2 text-sm text-gray-700">
                      <span>小計: ${{ ((item.product?.price || 0) * item.quantity).toFixed(2) }}</span>
                    </p>
                  </div>
                </div>
              </li>
            </ul>

            <div class="mt-6 border-t border-gray-200 pt-4">
              <button
                @click="clearCart"
                :disabled="cartStore.isLoading"
                class="text-sm text-red-600 hover:text-red-500 disabled:opacity-50"
              >
                清空購物車
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Order summary -->
      <section class="mt-16 bg-white shadow sm:rounded-lg lg:mt-0 lg:col-span-5">
        <div class="px-4 py-5 sm:p-6">
          <h2 class="text-lg font-medium text-gray-900">訂單摘要</h2>

          <div class="mt-4 space-y-4">
            <div class="flex items-center justify-between">
              <dt class="text-sm text-gray-600">小計</dt>
              <dd class="text-sm font-medium text-gray-900">
                ${{ cartStore.totalAmount.toFixed(2) }}
              </dd>
            </div>
            <div class="flex items-center justify-between">
              <dt class="text-sm text-gray-600">運費</dt>
              <dd class="text-sm font-medium text-gray-900">
                ${{ shipping.toFixed(2) }}
              </dd>
            </div>
            <div class="flex items-center justify-between border-t border-gray-200 pt-4">
              <dt class="text-base font-medium text-gray-900">總計</dt>
              <dd class="text-base font-medium text-gray-900">
                ${{ (cartStore.totalAmount + shipping).toFixed(2) }}
              </dd>
            </div>
          </div>

          <div class="mt-6">
            <button
              @click="proceedToCheckout"
              :disabled="cartStore.items.length === 0 || isProcessingCheckout"
              class="w-full bg-primary-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!isProcessingCheckout">前往結帳</span>
              <span v-else class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                處理中...
              </span>
            </button>
          </div>

          <div class="mt-6 text-center">
            <p class="text-sm text-gray-500">
              或 
              <router-link
                to="/user/products"
                class="text-primary-600 font-medium hover:text-primary-500"
              >
                繼續購物
              </router-link>
            </p>
          </div>
        </div>
      </section>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ShoppingCartIcon, 
  ShoppingBagIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { orderService } from '@/services/order'
import { getProductImageUrl } from '@/utils/googleDrive'
import GoogleDriveImage from '@/components/common/GoogleDriveImage.vue'
import type { CartItem } from '@/types/product'

const router = useRouter()
const cartStore = useCartStore()

const isUpdating = ref<Record<number, boolean>>({})
const isRemoving = ref<Record<number, boolean>>({})
const isProcessingCheckout = ref(false)
const shipping = ref(50) // 固定運費

const message = ref({
  show: false,
  type: 'success' as 'success' | 'error',
  text: ''
})

onMounted(async () => {
  console.log('🛒 購物車頁面：開始載入購物車')
  await cartStore.fetchCart()
  console.log('🛒 購物車頁面：購物車資料', cartStore.items)
  
  // 調試每個購物車項目的結構
  cartStore.items.forEach((item, index) => {
    console.log(`📦 購物車項目 ${index + 1}:`, {
      member_id: item.member_id,
      product_id: item.product_id,
      quantity: item.quantity,
      create_at: item.create_at,
      product: item.product
    })
  })
})

const updateQuantity = async (item: CartItem, newQuantity: number) => {
  if (newQuantity < 1 || newQuantity > (item.product?.soh || 0)) {
    return
  }

  try {
    isUpdating.value[item.product_id] = true
    console.log('🔄 購物車頁面：更新數量', { product_id: item.product_id, newQuantity })
    await cartStore.updateQuantity(item.product_id, newQuantity)
    showMessage('數量已更新', 'success')
  } catch (error) {
    showMessage('更新數量失敗', 'error')
    console.error('更新數量失敗:', error)
  } finally {
    isUpdating.value[item.product_id] = false
  }
}

const onQuantityChange = (item: CartItem, event: Event) => {
  const target = event.target as HTMLInputElement
  const newQuantity = parseInt(target.value)
  
  if (newQuantity && newQuantity !== item.quantity) {
    updateQuantity(item, newQuantity)
  }
}

const removeItem = async (item: CartItem) => {
  if (!confirm('確定要移除這個商品嗎？')) {
    return
  }

  try {
    isRemoving.value[item.product_id] = true
    console.log('🗑️ 購物車頁面：移除商品', { product_id: item.product_id })
    await cartStore.removeItem(item.product_id)
    showMessage('商品已移除', 'success')
  } catch (error) {
    showMessage('移除商品失敗', 'error')
    console.error('移除商品失敗:', error)
  } finally {
    isRemoving.value[item.product_id] = false
  }
}

const clearCart = async () => {
  if (!confirm('確定要清空整個購物車嗎？此操作無法復原。')) {
    return
  }

  try {
    await cartStore.clearCart()
    showMessage('購物車已清空', 'success')
  } catch (error) {
    showMessage('清空購物車失敗', 'error')
    console.error('清空購物車失敗:', error)
  }
}

const proceedToCheckout = async () => {
  try {
    isProcessingCheckout.value = true
    
    console.log('💳 開始結帳流程')
    
    // 獲取當前用戶ID
    const authStore = useAuthStore()
    if (!authStore.user) {
      showMessage('請先登入', 'error')
      return
    }
    
    let memberId: number
    if ('member_id' in authStore.user && authStore.user.member_id) {
      memberId = Number(authStore.user.member_id)
    } else if ('id' in authStore.user && authStore.user.id) {
      memberId = Number(authStore.user.id)
    } else {
      showMessage('無法獲取用戶資訊', 'error')
      return
    }
    
    console.log('👤 結帳用戶ID:', memberId)
    console.log('🛒 購物車商品數量:', cartStore.items.length)
    
    if (cartStore.items.length === 0) {
      showMessage('購物車為空，無法結帳', 'error')
      return
    }
    
    // 創建訂單
    const orderResponse = await orderService.createOrder(memberId)
    
    if (orderResponse.success || orderResponse.status === 200 || orderResponse.status === 201) {
      console.log('✅ 訂單創建成功:', orderResponse.data)
      showMessage('訂單創建成功！', 'success')
      
      // 清空購物車（現在不會拋出錯誤）
      console.log('🗑️ 嘗試清空購物車...')
      await cartStore.clearCart()
      console.log('✅ 購物車清空完成')
      
      // 延遲一下再跳轉，讓用戶看到成功訊息
      setTimeout(() => {
        router.push('/user/orders')
      }, 1500)
    } else {
      throw new Error(orderResponse.message || '創建訂單失敗')
    }
    
  } catch (error: any) {
    console.error('❌ 結帳失敗:', error)
    showMessage(error.message || '結帳失敗，請稍後再試', 'error')
  } finally {
    isProcessingCheckout.value = false
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/placeholder-image.jpg'
}

const showMessage = (text: string, type: 'success' | 'error') => {
  message.value = { show: true, type, text }
  setTimeout(() => {
    message.value.show = false
  }, 3000)
}
</script>