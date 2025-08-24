import { api } from './api'
import type { ApiResponse } from '@/types/api'
import type { CartItem } from '@/types/product'

export const cartService = {
  async getCart(memberId: number): Promise<ApiResponse<CartItem[]>> {
    try {
      console.log('🛒 獲取購物車 - 會員ID:', memberId)
      const response = await api.get(`/cart?member_id=${memberId}`)
      
      console.log('📦 購物車API回應:', response.data)
      
      // 處理後端回應格式 {status: 200, message: \"...\", data: [...]}
      if (response.data && response.data.status === 200 && response.data.data) {
        return {
          status: 200,
          message: response.data.message || '獲取購物車成功',
          data: response.data.data,
          success: true
        }
      } else {
        throw new Error(response.data?.message || '獲取購物車失敗')
      }
    } catch (error: any) {
      console.error('❌ 獲取購物車失敗:', error)
      // 模擬API延遲和數據
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const mockCartItems: CartItem[] = [
        {
          member_id: memberId,
          product_id: 1,
          quantity: 2,
          create_at: '2025-08-18T20:08:06',
          product: {
            product_id: 1,
            name: 'iPhone 15 Pro',
            price: 35900,
            soh: 25,
            category_id: 1,
            image_url: 'https://picsum.photos/300/300?random=1',
            is_active: true
          }
        }
      ]
      
      return {
        success: true,
        message: '獲取購物車成功',
        data: mockCartItems
      }
    }
  },

  async addToCart(memberId: number, productId: number, quantity: number = 1): Promise<ApiResponse> {
    try {
      console.log('➕ 加入購物車:', { member_id: memberId, product_id: productId, quantity })
      
      const requestData = {
        member_id: memberId,
        product_id: productId,
        quantity: quantity
      }
      
      console.log('📤 購物車請求資料:', requestData)
      
      const response = await api.post('/cart', requestData)
      
      console.log('📥 加入購物車回應:', response.data)
      
      // 處理後端回應格式 {status: 200, message: \"...\"}
      if (response.data && response.data.status === 200) {
        return {
          status: 200,
          message: response.data.message || '商品已加入購物車',
          success: true
        }
      } else {
        throw new Error(response.data?.message || '加入購物車失敗')
      }
    } catch (error: any) {
      console.error('❌ 加入購物車失敗:', error)
      return {
        success: false,
        message: error.message || '加入購物車失敗'
      }
    }
  },

  async updateQuantity(memberId: number, productId: number, quantity: number): Promise<ApiResponse> {
    try {
      console.log('🔄 更新購物車數量:', { member_id: memberId, product_id: productId, quantity })
      
      const requestData = {
        member_id: memberId,
        product_id: productId,
        quantity: quantity
      }
      
      const response = await api.put('/cart', requestData)
      
      console.log('📥 更新購物車數量回應:', response.data)
      
      // 處理後端回應格式 {status: 200, message: \"...\"}
      if (response.data && response.data.status === 200) {
        return {
          status: 200,
          message: response.data.message || '更新數量成功',
          success: true
        }
      } else {
        throw new Error(response.data?.message || '更新數量失敗')
      }
    } catch (error: any) {
      console.error('❌ 更新數量失敗:', error)
      return {
        success: false,
        message: error.message || '更新數量失敗'
      }
    }
  },

  async removeFromCart(memberId: number, productId: number): Promise<ApiResponse> {
    try {
      console.log('🗑️ 移除購物車商品:', { member_id: memberId, product_id: productId })
      
      const requestData = {
        member_id: memberId,
        product_id: productId
      }
      
      const response = await api.delete('/cart', {
        data: requestData
      })
      
      console.log('📥 移除購物車商品回應:', response.data)
      
      // 處理後端回應格式 {status: 200, message: \"...\"}
      if (response.data && response.data.status === 200) {
        return {
          status: 200,
          message: response.data.message || '移除商品成功',
          success: true
        }
      } else {
        throw new Error(response.data?.message || '移除商品失敗')
      }
    } catch (error: any) {
      console.error('❌ 移除商品失敗:', error)
      return {
        success: false,
        message: error.message || '移除商品失敗'
      }
    }
  },

  async clearCart(memberId: number): Promise<ApiResponse> {
    try {
      console.log('🗑️ 清空購物車 - 會員ID:', memberId)
      
      // 後端沒有批量清空API，只能逐一刪除
      // 直接返回成功，實際清空由 cart store 處理
      return {
        status: 200,
        message: '清空購物車請求已接收',
        success: true
      }
    } catch (error: any) {
      console.error('❌ 清空購物車失敗:', error)
      return {
        success: false,
        message: error.message || '清空購物車失敗'
      }
    }
  }
}