export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

export interface ApiError {
  message: string
  code?: string
  details?: any
}