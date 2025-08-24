import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CartItem, Product } from '@/types/product'
import { cartService } from '@/services/cart'
import { productService } from '@/services/product'
import { useAuthStore } from './auth'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // 商品資料快取
  const productsCache = ref<Map<number, Product>>(new Map())
  const productsCacheTime = ref<number>(0)
  const CACHE_DURATION = 5 * 60 * 1000 // 5分鐘快取

  const itemCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
  const totalAmount = computed(() => 
    items.value.reduce((sum, item) => 
      sum + (item.product?.price || 0) * item.quantity, 0
    )
  )

  const loadProductDetails = async () => {
    try {
      console.log('🔍 開始載入購物車商品詳細資訊')
      
      const now = Date.now()
      
      // 檢查快取是否有效
      if (productsCache.value.size > 0 && (now - productsCacheTime.value) < CACHE_DURATION) {
        console.log('📋 使用商品資料快取')
        
        // 使用快取資料
        items.value.forEach(item => {
          const productInfo = productsCache.value.get(item.product_id)
          if (productInfo) {
            item.product = productInfo
            console.log(`✅ 從快取載入商品 ${item.product_id}:`, productInfo.name)
          }
        })
        
        console.log('✅ 從快取載入商品詳細資訊完成')
        return
      }
      
      // 快取無效或空，重新載入
      console.log('🔄 快取無效，重新載入商品資料')
      
      // 獲取所有商品資訊
      const response = await productService.getAdminProducts()
      
      if (response.status === 200 && response.data) {
        const products = response.data
        console.log('📦 獲取的商品列表:', products)
        
        // 更新快取
        productsCache.value.clear()
        const productMap = new Map()
        products.forEach(product => {
          productsCache.value.set(product.product_id, product)
          productMap.set(product.product_id, product)
        })
        productsCacheTime.value = now
        
        // 為每個購物車項目設定商品詳細資訊
        items.value.forEach(item => {
          const productInfo = productMap.get(item.product_id)
          if (productInfo) {
            item.product = productInfo
            console.log(`✅ 購物車商品 ${item.product_id} 載入商品資訊:`, productInfo.name)
          } else {
            console.log(`⚠️ 找不到商品 ${item.product_id} 的詳細資訊`)
          }
        })
        
        console.log('✅ 購物車商品詳細資訊載入完成')
      } else {
        console.log('⚠️ 無法獲取商品列表，使用備用方法')
        // 如果無法獲取完整商品列表，嘗試逐一獲取
        for (const item of items.value) {
          if (item.product_id && item.product_id > 0) {
            try {
              // 先檢查快取
              let productInfo = productsCache.value.get(item.product_id)
              
              if (!productInfo) {
                const productResponse = await productService.getProduct(item.product_id)
                if (productResponse.status === 200 && productResponse.data) {
                  productInfo = productResponse.data
                  // 添加到快取
                  productsCache.value.set(item.product_id, productInfo)
                }
              }
              
              if (productInfo) {
                item.product = productInfo
                console.log(`✅ 單獨載入商品 ${item.product_id}:`, productInfo.name)
              }
            } catch (error) {
              console.log(`❌ 載入商品 ${item.product_id} 失敗:`, error)
            }
          }
        }
        productsCacheTime.value = now
      }
    } catch (error) {
      console.error('❌ 載入商品詳細資訊失敗:', error)
    }
  }

  const fetchCart = async () => {
    try {
      const authStore = useAuthStore()
      if (!authStore.user) return
      
      isLoading.value = true
      error.value = null
      
      // 獲取正確的會員ID
      let memberId: number
      if ('member_id' in authStore.user && authStore.user.member_id) {
        memberId = Number(authStore.user.member_id)
      } else if ('id' in authStore.user && authStore.user.id) {
        memberId = Number(authStore.user.id)
      } else {
        throw new Error('無法獲取會員ID')
      }
      
      console.log('👤 Final Member ID for fetchCart:', memberId, typeof memberId)
      
      const response = await cartService.getCart(memberId)
      console.log('🛒 購物車store收到的回應:', response)
      
      if (response.success && response.data) {
        items.value = response.data
        console.log('✅ 購物車store已更新items:', items.value)
        
        // 載入商品詳細資訊
        await loadProductDetails()
      } else if (response.status === 200 && response.data) {
        items.value = response.data
        console.log('✅ 購物車store已更新items (status 200):', items.value)
        
        // 載入商品詳細資訊
        await loadProductDetails()
      }
    } catch (err: any) {
      console.error('❌ fetchCart錯誤:', err)
      error.value = err.message || '取得購物車失敗'
    } finally {
      isLoading.value = false
    }
  }

  const addToCart = async (productId: number, quantity: number = 1) => {
    try {
      const authStore = useAuthStore()
      if (!authStore.user) return
      
      isLoading.value = true
      error.value = null
      
      // 調試：顯示用戶資料結構
      console.log('🔍 Auth User Data:', authStore.user)
      
      // 獲取正確的會員ID
      let memberId: number
      if ('member_id' in authStore.user && authStore.user.member_id) {
        memberId = Number(authStore.user.member_id)
      } else if ('id' in authStore.user && authStore.user.id) {
        memberId = Number(authStore.user.id)
      } else {
        throw new Error('無法獲取會員ID')
      }
      
      console.log('👤 Final Member ID for addToCart:', memberId, typeof memberId)
      
      const response = await cartService.addToCart(memberId, productId, quantity)
      if (response.success) {
        await fetchCart()
      } else {
        throw new Error(response.message || '加入購物車失敗')
      }
    } catch (err: any) {
      error.value = err.message || '加入購物車失敗'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateQuantity = async (productId: number, quantity: number) => {
    try {
      const authStore = useAuthStore()
      if (!authStore.user) return
      
      error.value = null
      
      // 獲取正確的會員ID
      let memberId: number
      if ('member_id' in authStore.user && authStore.user.member_id) {
        memberId = Number(authStore.user.member_id)
      } else if ('id' in authStore.user && authStore.user.id) {
        memberId = Number(authStore.user.id)
      } else {
        throw new Error('無法獲取會員ID')
      }
      const response = await cartService.updateQuantity(memberId, productId, quantity)
      if (response.success) {
        await fetchCart()
      } else {
        throw new Error(response.message || '更新數量失敗')
      }
    } catch (err: any) {
      error.value = err.message || '更新數量失敗'
      throw err
    }
  }

  const removeItem = async (productId: number) => {
    try {
      const authStore = useAuthStore()
      if (!authStore.user) return
      
      error.value = null
      
      // 獲取正確的會員ID
      let memberId: number
      if ('member_id' in authStore.user && authStore.user.member_id) {
        memberId = Number(authStore.user.member_id)
      } else if ('id' in authStore.user && authStore.user.id) {
        memberId = Number(authStore.user.id)
      } else {
        throw new Error('無法獲取會員ID')
      }
      const response = await cartService.removeFromCart(memberId, productId)
      if (response.success) {
        await fetchCart()
      } else {
        throw new Error(response.message || '移除商品失敗')
      }
    } catch (err: any) {
      error.value = err.message || '移除商品失敗'
      throw err
    }
  }

  const clearCart = async () => {
    try {
      const authStore = useAuthStore()
      if (!authStore.user) {
        console.log('⚠️ 用戶未登入，直接清空前端購物車')
        items.value = []
        return
      }
      
      isLoading.value = true
      error.value = null
      
      // 獲取正確的會員ID
      let memberId: number
      try {
        if ('member_id' in authStore.user && authStore.user.member_id) {
          memberId = Number(authStore.user.member_id)
        } else if ('id' in authStore.user && authStore.user.id) {
          memberId = Number(authStore.user.id)
        } else {
          throw new Error('無法獲取會員ID')
        }
      } catch (err) {
        console.warn('⚠️ 無法獲取會員ID，直接清空前端購物車')
        items.value = []
        return
      }
      
      console.log('🗑️ 準備清空購物車，當前商品:', items.value)
      
      // 如果購物車已經是空的，直接返回
      if (items.value.length === 0) {
        console.log('✅ 購物車已經是空的')
        return
      }
      
      // 後端沒有批量清空API，直接使用逐一刪除方式
      if (items.value.length > 0) {
        const deletePromises = items.value.map(item => 
          cartService.removeFromCart(memberId, item.product_id)
        )
        
        const results = await Promise.allSettled(deletePromises)
        const failedDeletes = results.filter(result => result.status === 'rejected')
        
        console.log(`📊 刪除結果: 成功 ${results.length - failedDeletes.length}/${results.length}`)
      }
      
      // 無論API是否成功，都清空前端狀態
      items.value = []
      console.log('✅ 前端購物車狀態已清空')
      
    } catch (err: any) {
      console.error('❌ 清空購物車過程中發生錯誤:', err)
      
      // 無論什麼錯誤，都要清空前端狀態
      items.value = []
      console.log('🔄 強制清空前端購物車狀態')
      
      error.value = err.message || '清空購物車時發生錯誤'
    } finally {
      isLoading.value = false
    }
  }

  return {
    items,
    isLoading,
    error,
    itemCount,
    totalAmount,
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart
  }
})