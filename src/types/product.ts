export interface Product {
  product_id: number
  name: string
  description?: string
  price: number  // 後端使用 BigDecimal
  soh: number    // 後端使用 soh (Stock On Hand) 而不是 stock
  category_id: number
  category_name?: string  // JOIN查詢時會包含
  image_url?: string
  image_id?: string       // Google Drive 檔案ID
  is_active: boolean      // 後端使用 is_active 狀態
}

export interface Category {
  category_id: number
  name: string
  description?: string
  created_at: string
}

export interface CartItem {
  member_id: number
  product_id: number
  quantity: number
  create_at: string // 後端使用 create_at，不是 added_at
  product?: Product
}

export interface Order {
  order_id: number
  member_id: number
  total_amount?: number // 計算得出的總金額
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  create_at: string // 後端使用 create_at
  updated_at?: string
  orderDetails: OrderDetail[] // 後端回傳的訂單明細
}

export interface OrderDetail {
  order_id: number
  product_id: number
  quantity: number
  price: number
  product?: Product
}

// 保留舊的 OrderItem 以免相容性問題
export interface OrderItem {
  order_item_id: number
  order_id: number
  product_id: number
  quantity: number
  price: number
  product?: Product
}