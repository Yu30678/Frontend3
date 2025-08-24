import { api } from './api'
import type { ApiResponse } from '@/types/api'

export interface AdminUser {
  user_id: number
  name: string
  account: string
  password?: string  // 添加password欄位用於編輯時顯示遮蔽版本
  level: number
  created_at?: string
  updated_at?: string
}

export const userService = {
  async getAllUsers(): Promise<ApiResponse<AdminUser[]>> {
    try {
      // 獲取當前用戶資訊
      const currentUser = localStorage.getItem('user')
      const currentUserData = currentUser ? JSON.parse(currentUser) : null
      
      console.log('Getting users with current user:', currentUserData) // Debug用
      
      const response = await api.get('/user/users')
      
      console.log('Get users response:', response.data) // Debug用
      
      // 處理後端回應格式 {status: 200, message: "...", data: [...]}
      if (response.data && response.data.status === 200 && response.data.data) {
        return {
          status: 200,
          message: response.data.message || '獲取管理員成功',
          data: response.data.data
        }
      } else {
        throw new Error(response.data?.message || '獲取管理員失敗')
      }
    } catch (error: any) {
      console.error('Get users error:', error) // Debug用
      return {
        success: false,
        message: error.message || '取得管理員列表失敗'
      }
    }
  },

  async createUser(userData: { 
    name: string; 
    password: string; 
    account: string; 
    level: number 
  }): Promise<ApiResponse<AdminUser>> {
    try {
      const response = await api.post('/user/users', userData)
      
      // 處理後端回應格式 {status: 200, message: "...", data: {...}}
      if (response.data && response.data.status === 200) {
        return {
          status: 200,
          message: response.data.message || '創建管理員成功',
          data: response.data.data,
          success: true
        }
      } else {
        throw new Error(response.data?.message || '創建管理員失敗')
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '創建管理員失敗'
      }
    }
  },

  async updateUser(userData: { 
    userId: number; 
    name: string; 
    password: string; 
    account: string; 
    level: number 
  }): Promise<ApiResponse<AdminUser>> {
    try {
      // 獲取當前用戶資訊（可能需要用於認證）
      const currentUser = localStorage.getItem('user')
      const currentUserData = currentUser ? JSON.parse(currentUser) : null
      
      // 根據Postman成功的請求格式：userId在最前面
      const requestData = {
        userId: userData.userId,
        name: userData.name,
        password: userData.password,
        account: userData.account,
        level: userData.level
      }
      
      console.log('🚀 開始更新用戶')
      console.log('👤 Current user data:', currentUserData)
      console.log('📤 Update request data:', requestData)
      
      // 確保userId正確傳遞
      console.log('🆔 userId being sent:', userData.userId)
      
      const response = await api.put('/user/users', requestData)
      
      console.log('📥 Update response:', response.data)
      
      // 處理後端回應格式 {status: 200, message: "...", data: {...}}
      if (response.data && response.data.status === 200) {
        return {
          status: 200,
          message: response.data.message || '更新管理員成功',
          data: response.data.data,
          success: true
        }
      } else {
        throw new Error(response.data?.message || '更新管理員失敗')
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '更新管理員失敗'
      }
    }
  },

  async deleteUser(userId: number): Promise<ApiResponse> {
    try {
      console.log('🚀 開始刪除用戶')
      console.log('🔍 Deleting user with ID:', userId)
      console.log('📊 userId type:', typeof userId)
      
      if (!userId || isNaN(Number(userId))) {
        console.error('❌ 無效的用戶ID:', userId)
        throw new Error('無效的用戶ID')
      }
      
      // 根據Postman的格式：使用"user_id"作為key
      const deleteData = { 
        user_id: Number(userId)
      }
      console.log('📤 Delete data being sent (按照Postman格式):', deleteData)
      
      const response = await api.delete('/user/users', {
        data: deleteData
      })
      
      console.log('📥 Delete response:', response.data)
      
      // 處理後端回應格式 {status: 200, message: "..."}
      if (response.data && response.data.status === 200) {
        return {
          status: 200,
          message: response.data.message || '刪除管理員成功',
          success: true
        }
      } else {
        throw new Error(response.data?.message || '刪除管理員失敗')
      }
    } catch (error: any) {
      console.error('❌ Delete user error:', error)
      return {
        success: false,
        message: error.message || '刪除管理員失敗'
      }
    }
  }
}