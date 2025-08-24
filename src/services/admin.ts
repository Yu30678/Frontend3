import { api } from './api'
import type { ApiResponse } from '@/types/api'
import type { Member } from '@/types/auth'

export interface AdminUser {
  userId?: number
  name: string
  password: string
  account: string
  level: number
}

export interface AdminCartItem {
  member_id: number
  product_id: number
  quantity: number
}

export const adminService = {
  // 會員管理 API
  async getMembers(memberId?: number): Promise<ApiResponse<Member[]>> {
    try {
      const url = memberId ? `/user/members?member_id=${memberId}` : '/user/members'
      const response = await api.get(url)
      // 處理後端回應格式 {status: 200, message: "...", data: [...]}
      if (response.data && response.data.status === 200 && response.data.data) {
        return {
          status: 200,
          message: response.data.message || '獲取會員成功',
          data: response.data.data
        }
      } else {
        throw new Error(response.data?.message || '獲取會員失敗')
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '取得會員列表失敗'
      }
    }
  },

  async getAllMembers(): Promise<ApiResponse<Member[]>> {
    return this.getMembers()
  },

  async createMember(memberData: {
    name: string
    password: string
    phone: string
    address: string
    create_at: string
    email: string
  }): Promise<ApiResponse<Member>> {
    try {
      const response = await api.post('/user/members', memberData)
      return response.data
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '新增會員失敗'
      }
    }
  },

  async updateMember(memberData: {
    member_id: string
    name: string
    password: string
    phone: string
    address: string
    email: string
  }): Promise<ApiResponse<Member>> {
    try {
      const response = await api.put('/user/members', memberData)
      return response.data
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '更新會員資料失敗'
      }
    }
  },

  async deleteMember(memberId: number): Promise<ApiResponse> {
    try {
      const response = await api.delete('/user/members', {
        data: { member_id: memberId }
      })
      return response.data
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '刪除會員失敗'
      }
    }
  },

  // 管理員用戶管理 API
  async getUsers(): Promise<ApiResponse<AdminUser[]>> {
    try {
      const response = await api.get('/user/users')
      return response.data
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '取得管理員列表失敗'
      }
    }
  },

  async createUser(userData: {
    name: string
    password: string
    account: string
    level: number
  }): Promise<ApiResponse<AdminUser>> {
    try {
      const response = await api.post('/user/users', userData)
      return response.data
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '新增管理員失敗'
      }
    }
  },

  async updateUser(userData: {
    userId: number
    name: string
    password: string
    account: string
    level: number
  }): Promise<ApiResponse<AdminUser>> {
    try {
      const response = await api.put('/user/users', userData)
      return response.data
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '更新管理員資料失敗'
      }
    }
  },

  async deleteUser(userId: number): Promise<ApiResponse> {
    try {
      const response = await api.delete('/user/users', {
        data: { user_id: userId }
      })
      return response.data
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '刪除管理員失敗'
      }
    }
  },

  // 購物車管理 API
  async getAllCarts(): Promise<ApiResponse<AdminCartItem[]>> {
    try {
      console.log('🛒 開始獲取購物車列表')
      const response = await api.get('/user/carts')
      
      console.log('📦 購物車API回應:', response.data)
      
      // 處理後端回應格式 {status: 200, message: \"...\", data: [...]}
      if (response.data && response.data.status === 200 && response.data.data) {
        return {
          status: 200,
          message: response.data.message || '獲取購物車成功',
          data: response.data.data
        }
      } else {
        throw new Error(response.data?.message || '獲取購物車失敗')
      }
    } catch (error: any) {
      console.error('❌ 獲取購物車失敗:', error)
      return {
        success: false,
        message: error.message || '取得購物車列表失敗'
      }
    }
  },

  async updateCart(cartData: {
    member_id: number
    product_id: number
    quantity: number
  }): Promise<ApiResponse> {
    try {
      console.log('🔄 更新購物車:', cartData)
      const response = await api.put('/user/carts', cartData)
      
      console.log('📤 更新購物車回應:', response.data)
      
      // 處理後端回應格式 {status: 200, message: \"...\"}
      if (response.data && response.data.status === 200) {
        return {
          status: 200,
          message: response.data.message || '更新購物車成功',
          success: true
        }
      } else {
        throw new Error(response.data?.message || '更新購物車失敗')
      }
    } catch (error: any) {
      console.error('❌ 更新購物車失敗:', error)
      return {
        success: false,
        message: error.message || '更新購物車失敗'
      }
    }
  },

  async deleteCart(cartData: {
    member_id: number
    product_id: number
  }): Promise<ApiResponse> {
    try {
      console.log('🗑️ 刪除購物車項目:', cartData)
      const response = await api.delete('/user/carts', {
        data: cartData
      })
      
      console.log('📥 刪除購物車回應:', response.data)
      
      // 處理後端回應格式 {status: 200, message: \"...\"}
      if (response.data && response.data.status === 200) {
        return {
          status: 200,
          message: response.data.message || '刪除購物車項目成功',
          success: true
        }
      } else {
        throw new Error(response.data?.message || '刪除購物車項目失敗')
      }
    } catch (error: any) {
      console.error('❌ 刪除購物車項目失敗:', error)
      return {
        success: false,
        message: error.message || '刪除購物車項目失敗'
      }
    }
  }
}