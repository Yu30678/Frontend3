export interface User {
  id: number
  username: string
  email: string
  role: 'admin' | 'member'
  createdAt: string
  updatedAt?: string
}

export interface AdminUser {
  user_id: number
  name: string
  account: string
  password?: string
  level: number
  created_at?: string
  updated_at?: string
}

export interface Member {
  member_id: number
  name: string  // 後端使用 name 而不是 username
  password: string
  email: string
  phone?: string
  address?: string
  create_at: string  // 後端使用 create_at
  updated_at?: string
}

export interface LoginRequest {
  email: string  // 後端登入使用 email
  password: string
}

export interface AdminLoginRequest {
  account: string  // 管理員登入使用 account
  password: string
}

export interface LoginResponse {
  status: number  // 後端回傳 status 而不是 success
  success?: boolean
  message: string
  data?: User | Member | AdminUser
}

export interface RegisterRequest {
  name: string  // 後端使用 name
  password: string
  email: string
  phone?: string
  address?: string
}