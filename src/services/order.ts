import { api } from './api'
import type { ApiResponse } from '@/types/api'
import type { Order } from '@/types/product'

export const orderService = {
  // 會員獲取自己的訂單
  async getOrders(memberId?: number): Promise<ApiResponse<Order[]>> {
    try {
      console.log('📋 獲取會員訂單 - 會員ID:', memberId)
      
      const url = memberId ? `/order?member_id=${memberId}` : '/order'
      console.log('🌐 訂單API請求URL:', url)
      const response = await api.get(url)
      
      console.log('📦 訂單API原始回應:', response)
      console.log('📦 訂單API回應資料:', response.data)
      
      // 詳細記錄回應結構
      if (response.data && response.data.data) {
        console.log('📋 訂單列表:', response.data.data)
        if (Array.isArray(response.data.data) && response.data.data.length > 0) {
          console.log('🔍 第一筆訂單原始資料:', response.data.data[0])
        }
      }
      
      // 處理後端回應格式 {status: 200, message: \"...\", data: [...]}
      if (response.data && response.data.status === 200 && response.data.data) {
        // 計算每個訂單的總金額
        const ordersWithTotalAmount = response.data.data.map((order: any) => {
          let totalAmount = 0
          if (order.orderDetails && Array.isArray(order.orderDetails)) {
            totalAmount = order.orderDetails.reduce((sum: number, detail: any) => {
              return sum + (detail.quantity * detail.price)
            }, 0)
          }
          
          return {
            ...order,
            total_amount: totalAmount,
            status: order.status || 'pending' // 設定預設狀態
          }
        })
        
        console.log('💰 訂單已計算總金額:', ordersWithTotalAmount)
        
        return {
          status: 200,
          message: response.data.message || '獲取訂單成功',
          data: ordersWithTotalAmount,
          success: true
        }
      } else {
        throw new Error(response.data?.message || '獲取訂單失敗')
      }
    } catch (error: any) {
      console.error('❌ 獲取訂單失敗:', error)
      return {
        success: false,
        message: error.message || '取得訂單列表失敗'
      }
    }
  },

  async getMemberOrders(memberId?: number): Promise<ApiResponse<Order[]>> {
    // 為了向後兼容，保留這個方法
    return this.getOrders(memberId)
  },

  async getOrder(id: number): Promise<ApiResponse<Order>> {
    try {
      console.log('📋 獲取訂單詳情 - 訂單ID:', id)
      // 使用與獲取訂單列表相同的端點，但加上order_id參數
      const response = await api.get(`/order?order_id=${id}`)
      
      console.log('📦 訂單詳情API回應:', response.data)
      
      // 處理後端回應格式
      if (response.data && response.data.status === 200 && response.data.data) {
        const orderData = response.data.data
        
        // 計算總金額
        let totalAmount = 0
        if (orderData.orderDetails && Array.isArray(orderData.orderDetails)) {
          totalAmount = orderData.orderDetails.reduce((sum: number, detail: any) => {
            return sum + (detail.quantity * detail.price)
          }, 0)
        }
        
        const processedOrder = {
          ...orderData,
          total_amount: totalAmount,
          status: orderData.status || 'pending'
        }
        
        return {
          status: 200,
          message: response.data.message || '獲取訂單詳情成功',
          data: processedOrder,
          success: true
        }
      } else {
        throw new Error(response.data?.message || '獲取訂單詳情失敗')
      }
    } catch (error: any) {
      console.error('❌ 獲取訂單詳情失敗:', error)
      return {
        success: false,
        message: error.message || '取得訂單詳情失敗'
      }
    }
  },

  async createOrder(memberId: number): Promise<ApiResponse<Order>> {
    try {
      console.log('📝 創建訂單 - 會員ID:', memberId)
      
      const requestData = {
        member_id: memberId
      }
      
      console.log('📤 創建訂單請求資料:', requestData)
      
      const response = await api.post('/order', requestData)
      
      console.log('📥 創建訂單回應:', response.data)
      
      // 處理後端回應格式 {status: 201, message: \"...\", data: {...}}
      // 201 表示創建成功，200 表示一般成功
      if (response.data && (response.data.status === 200 || response.data.status === 201) && response.data.data) {
        return {
          status: response.data.status,
          message: response.data.message || '創建訂單成功',
          data: response.data.data,
          success: true
        }
      } else {
        console.error('❌ 後端回應格式異常:', response.data)
        throw new Error(response.data?.message || '創建訂單失敗')
      }
    } catch (error: any) {
      console.error('❌ 創建訂單失敗:', error)
      return {
        success: false,
        message: error.message || '創建訂單失敗'
      }
    }
  },

  async updateOrderStatus(id: number, status: string): Promise<ApiResponse> {
    try {
      const response = await api.put(`/order/${id}`, { status })
      return response.data
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '更新訂單狀態失敗'
      }
    }
  },

  // Admin functions
  async getAllOrders(): Promise<ApiResponse<Order[]>> {
    try {
      const response = await api.get('/user/orders')
      // 處理後端回應格式 {status: 200, message: "...", data: [...]}
      if (response.data && response.data.status === 200 && response.data.data) {
        return {
          status: 200,
          message: response.data.message || '獲取訂單成功',
          data: response.data.data
        }
      } else {
        throw new Error(response.data?.message || '獲取訂單失敗')
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '取得所有訂單失敗'
      }
    }
  },

  async updateOrder(orderId: number, orderData: any): Promise<ApiResponse<Order>> {
    try {
      const updateData = {
        order_id: orderId,
        ...orderData
      }
      const response = await api.put('/user/orders', updateData)
      
      // 處理後端回應格式 {status: 200, message: "...", data: {...}}
      if (response.data && response.data.status === 200) {
        return {
          status: 200,
          message: response.data.message || '更新訂單成功',
          data: response.data.data,
          success: true
        }
      } else {
        throw new Error(response.data?.message || '更新訂單失敗')
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '更新訂單失敗'
      }
    }
  },

  async deleteOrder(orderId: number): Promise<ApiResponse> {
    try {
      const response = await api.delete('/user/orders', {
        data: { order_id: orderId }
      })
      return response.data
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '刪除訂單失敗'
      }
    }
  }
}