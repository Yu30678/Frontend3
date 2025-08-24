import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, Member, AdminUser, LoginRequest, AdminLoginRequest, RegisterRequest } from '@/types/auth'
import { authService } from '@/services/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | Member | AdminUser | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => {
    if (!user.value) return false
    // 檢查是否為管理員：有 role 欄位且為 admin，或有 level 欄位
    if ('role' in user.value && user.value.role === 'admin') return true
    if ('level' in user.value && typeof user.value.level === 'number') return true
    return false
  })
  
  const adminLevel = computed(() => {
    if (!user.value || !('level' in user.value)) return null
    return user.value.level
  })
  
  // 權限檢查函數
  const canEditUsers = computed(() => {
    return adminLevel.value === 0 // 只有超級管理員可以編輯管理員
  })
  
  const canEditMembers = computed(() => {
    return adminLevel.value === 0 || adminLevel.value === 1 // 超級管理員和高級管理員可以編輯會員
  })
  
  const canEditProducts = computed(() => {
    return adminLevel.value === 0 || adminLevel.value === 1 || adminLevel.value === 2 // Level 0,1,2 可以編輯商品
  })
  
  const canEditCategories = computed(() => {
    return adminLevel.value === 0 || adminLevel.value === 1 || adminLevel.value === 2 // Level 0,1,2 可以編輯分類
  })
  
  const canEditOrders = computed(() => {
    return adminLevel.value === 0 || adminLevel.value === 1 || adminLevel.value === 2 // Level 0,1,2 可以編輯訂單
  })
  
  const canEditCarts = computed(() => {
    return adminLevel.value === 0 || adminLevel.value === 1 || adminLevel.value === 2 // Level 0,1,2 可以編輯購物車
  })
  
  const canAccessUsersPage = computed(() => {
    return true // 所有等級都可以訪問管理員頁面，但只有 Level 0 可以編輯
  })
  
  const canViewMembers = computed(() => {
    return true // 所有等級都可以瀏覽會員
  })
  
  const canViewProducts = computed(() => {
    return true // 所有等級都可以瀏覽商品
  })
  
  const canViewCategories = computed(() => {
    return true // 所有等級都可以瀏覽分類
  })
  
  const canViewOrders = computed(() => {
    return true // 所有等級都可以瀏覽訂單
  })
  
  const canViewCarts = computed(() => {
    return true // 所有等級都可以瀏覽購物車
  })
  const isMember = computed(() => user.value && 'member_id' in user.value)

  const login = async (credentials: LoginRequest | AdminLoginRequest, userType: 'member' | 'admin' = 'member') => {
    try {
      isLoading.value = true
      error.value = null
      
      let response
      if (userType === 'admin') {
        // 對於管理員登入，將email轉換為account
        const adminCredentials: AdminLoginRequest = {
          account: (credentials as LoginRequest).email,
          password: credentials.password
        }
        response = await authService.adminLogin(adminCredentials)
      } else {
        response = await authService.memberLogin(credentials as LoginRequest)
      }
      
      if (response.status === 200 && response.data) {
        user.value = response.data
        // 生成簡單的token（實際應用中應由後端提供）
        const mockToken = `token-${Date.now()}-${Math.random()}`
        token.value = mockToken
        localStorage.setItem('token', mockToken)
        localStorage.setItem('user', JSON.stringify(response.data))
      } else {
        throw new Error(response.message || '登入失敗')
      }
    } catch (err: any) {
      error.value = err.message || '登入失敗'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData: RegisterRequest) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await authService.memberRegister(userData)
      
      if (response.status === 200 && response.data) {
        user.value = response.data
        // 生成簡單的token
        const mockToken = `token-${Date.now()}-${Math.random()}`
        token.value = mockToken
        localStorage.setItem('token', mockToken)
        localStorage.setItem('user', JSON.stringify(response.data))
      } else {
        throw new Error(response.message || '註冊失敗')
      }
    } catch (err: any) {
      error.value = err.message || '註冊失敗'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    error.value = null
  }

  const initAuth = () => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      try {
        token.value = savedToken
        user.value = JSON.parse(savedUser)
      } catch (err) {
        logout()
      }
    }
  }

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    isMember,
    adminLevel,
    canEditUsers,
    canEditMembers,
    canEditProducts,
    canEditCategories,
    canEditOrders,
    canEditCarts,
    canAccessUsersPage,
    canViewMembers,
    canViewProducts,
    canViewCategories,
    canViewOrders,
    canViewCarts,
    login,
    register,
    logout,
    initAuth
  }
})