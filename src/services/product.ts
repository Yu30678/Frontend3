import { api } from './api'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { Product, Category } from '@/types/product'

export const productService = {
  async getProducts(page?: number, limit?: number, categoryId?: number): Promise<PaginatedResponse<Product>> {
    try {
      const response = await api.get('/product')
      
      // 處理後端回應格式 {status: 200, message: "...", data: [...]}
      if (response.data && response.data.status === 200 && response.data.data) {
        const products = response.data.data
        return {
          status: 200,
          message: '獲取商品成功',
          data: products,
          pagination: {
            currentPage: page || 1,
            totalPages: Math.ceil(products.length / (limit || 12)),
            totalItems: products.length,
            itemsPerPage: limit || 12
          }
        }
      } else {
        throw new Error(response.data?.message || '獲取商品失敗')
      }
    } catch (error: any) {
      // API失敗時使用模擬數據
      console.warn('API調用失敗，使用模擬數據:', error.message)
      
      const mockProducts: Product[] = [
        {
          product_id: 1,
          name: 'iPhone 15 Pro',
          price: 35900,
          soh: 25,
          category_id: 1,
          category_name: '電子產品',
          image_url: 'https://picsum.photos/300/300?random=1',
          is_active: true
        },
        {
          product_id: 2,
          name: 'MacBook Air M2',
          price: 36900,
          soh: 15,
          category_id: 1,
          category_name: '電子產品',
          image_url: 'https://picsum.photos/300/300?random=2',
          is_active: true
        },
        {
          product_id: 3,
          name: '時尚休閒T恤',
          price: 590,
          soh: 100,
          category_id: 2,
          category_name: '服飾配件',
          image_url: 'https://picsum.photos/300/300?random=3',
          is_active: true
        },
        {
          product_id: 4,
          name: '運動休閒鞋',
          price: 2490,
          soh: 50,
          category_id: 2,
          category_name: '服飾配件',
          image_url: 'https://picsum.photos/300/300?random=4',
          is_active: true
        },
        {
          product_id: 5,
          name: '北歐風餐桌',
          price: 15900,
          soh: 8,
          category_id: 3,
          category_name: '家居用品',
          image_url: 'https://picsum.photos/300/300?random=5',
          is_active: true
        },
        {
          product_id: 6,
          name: '舒適沙發',
          price: 25900,
          soh: 5,
          category_id: 3,
          category_name: '家居用品',
          image_url: 'https://picsum.photos/300/300?random=6',
          is_active: true
        }
      ]
      
      // 根據分類篩選
      let filteredProducts = mockProducts
      if (categoryId) {
        filteredProducts = mockProducts.filter(p => p.category_id === categoryId)
      }
      
      // 分頁處理
      const itemsPerPage = limit || 12
      const currentPage = page || 1
      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex)
      
      return {
        status: 200,
        message: '獲取商品成功',
        data: paginatedProducts,
        pagination: {
          currentPage,
          totalPages: Math.ceil(filteredProducts.length / itemsPerPage),
          totalItems: filteredProducts.length,
          itemsPerPage
        }
      }
    }
  },

  async getProduct(id: number): Promise<ApiResponse<Product>> {
    try {
      console.log('🔍 獲取商品詳情 - 商品ID:', id)
      const response = await api.get(`/product?product_id=${id}`)
      
      console.log('📦 商品詳情API回應:', response.data)
      
      // 處理後端回應格式 {status: 200, message: "...", data: {...}}
      if (response.data && response.data.status === 200 && response.data.data) {
        return {
          status: 200,
          message: response.data.message || '獲取商品詳情成功',
          data: response.data.data,
          success: true
        }
      } else {
        throw new Error(response.data?.message || '獲取商品詳情失敗')
      }
    } catch (error: any) {
      console.error('❌ 獲取商品詳情失敗:', error)
      
      // API失敗時使用模擬數據
      console.warn('🎭 使用模擬商品數據 ID:', id)
      
      const mockProducts: Record<number, Product> = {
        1: {
          product_id: 1,
          name: 'iPhone 15 Pro',
          price: 35900,
          soh: 25,
          category_id: 1,
          image_url: 'https://picsum.photos/300/300?random=1',
          is_active: true
        },
        2: {
          product_id: 2,
          name: 'MacBook Air M2',
          price: 36900,
          soh: 15,
          category_id: 1,
          image_url: 'https://picsum.photos/300/300?random=2',
          is_active: true
        },
        3: {
          product_id: 3,
          name: '時尚休閒T恤',
          price: 590,
          soh: 100,
          category_id: 2,
          image_url: 'https://picsum.photos/300/300?random=3',
          is_active: true
        },
        4: {
          product_id: 4,
          name: '運動休閒鞋',
          price: 2490,
          soh: 50,
          category_id: 2,
          image_url: 'https://picsum.photos/300/300?random=4',
          is_active: true
        }
      }
      
      const mockProduct = mockProducts[id] || {
        product_id: id,
        name: '模擬商品 ' + id,
        price: 999,
        soh: 10,
        category_id: 1,
        image_url: `https://picsum.photos/300/300?random=${id}`,
        is_active: true
      }
      
      return {
        status: 200,
        message: '獲取商品詳情成功',
        data: mockProduct,
        success: true
      }
    }
  },

  async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const response = await api.get('/user/categories')
      return response.data
    } catch (error: any) {
      // 模擬API延遲和數據
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const mockCategories: Category[] = [
        {
          category_id: 1,
          name: '電子產品',
          description: '手機、電腦、平板等電子設備',
          created_at: '2024-01-01T00:00:00'
        },
        {
          category_id: 2,
          name: '服飾配件',
          description: '衣服、鞋子、包包等時尚用品',
          created_at: '2024-01-01T00:00:00'
        },
        {
          category_id: 3,
          name: '家居用品',
          description: '家具、裝飾品、生活用品',
          created_at: '2024-01-01T00:00:00'
        }
      ]
      
      return {
        status: 200,
        message: '獲取分類成功',
        data: mockCategories
      }
    }
  },

  // Admin functions
  async getAdminProducts(): Promise<ApiResponse<Product[]>> {
    try {
      const response = await api.get('/user/products')
      // 處理後端回應格式 {status: 200, message: "...", data: [...]}
      if (response.data && response.data.status === 200 && response.data.data) {
        return {
          status: 200,
          message: response.data.message || '獲取商品成功',
          data: response.data.data
        }
      } else {
        throw new Error(response.data?.message || '獲取商品失敗')
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '取得管理員商品列表失敗'
      }
    }
  },

  async createProduct(productData: { name: string; price: string; soh: number; category_id: number; image_url?: string }): Promise<ApiResponse<Product>> {
    try {
      const response = await api.post('/user/products', productData)
      return response.data
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '創建商品失敗'
      }
    }
  },

  async updateProduct(productData: { product_id: number; name: string; price: string; soh: number; category_id: number; is_active?: boolean; image_url?: string }): Promise<ApiResponse<Product>> {
    try {
      const response = await api.put('/user/products', productData)
      return response.data
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '更新商品失敗'
      }
    }
  },

  async deleteProduct(productId: number): Promise<ApiResponse> {
    try {
      const response = await api.delete('/user/products', {
        data: { product_id: productId }
      })
      return response.data
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '刪除商品失敗'
      }
    }
  },

  async createCategory(categoryData: { name: string }): Promise<ApiResponse<Category>> {
    try {
      const response = await api.post('/user/categories', categoryData)
      return response.data
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '創建分類失敗'
      }
    }
  },

  async updateCategory(categoryData: { category_id: number; name: string }): Promise<ApiResponse<Category>> {
    try {
      const response = await api.put('/user/categories', categoryData)
      return response.data
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '更新分類失敗'
      }
    }
  },

  async deleteCategory(categoryId: number): Promise<ApiResponse> {
    try {
      const response = await api.delete('/user/categories', {
        data: { category_id: categoryId }
      })
      return response.data
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '刪除分類失敗'
      }
    }
  }
}