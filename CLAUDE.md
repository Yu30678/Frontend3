# CLAUDE.md

購物車專案
一律以繁體中文回覆
## Project Overview
後端以Java撰寫，HttpServer,Maven;前端使用Vue 3 + TypeScript + Vite
這個專案分別有使用者,管理員功能

### 技術棧
- **前端**: Vue 3, TypeScript, Vite, Pinia, Vue Router
- **UI**: Tailwind CSS, Headless UI
- **HTTP客戶端**: Axios
- **圖標**: Heroicons

## Development Commands
```bash
# 安裝依賴
npm install

# 開發環境運行 (localhost:3000)
npm run dev

# 建構生產版本
npm run build

# 類型檢查
npm run type-check

# 代碼格式檢查
npm run lint
```

### API參考
- **後端參考**: /Users/changyu/IdeaProjects/Backend_side_project Branch:For_Railway
- **後端參考**: /Users/changyu/IdeaProjects/Backend_side_project/src/main/java/dao
- **前端參考**: /Users/changyu/otis/yu-project
- **會員(member)功能API**:
  - cartController
  - memberController  
  - orderController
  - productController
  - 
- **管理員(user)功能API**:
  - userController


## File Structure
```
src/
├── views/                    # 頁面組件
│   ├── auth/                # 認證相關頁面
│   │   ├── AuthLayout.vue   # 認證頁面佈局
│   │   ├── LoginView.vue    # 登入頁面
│   │   └── RegisterView.vue # 註冊頁面
│   ├── user/                # 使用者功能頁面
│   │   ├── UserLayout.vue   # 使用者頁面佈局
│   │   ├── HomeView.vue     # 首頁
│   │   ├── ProductsView.vue # 商品列表
│   │   ├── CartView.vue     # 購物車
│   │   ├── OrdersView.vue   # 訂單記錄
│   │   └── ProfileView.vue  # 個人資料
│   └── admin/               # 管理員功能頁面
│       ├── AdminLayout.vue  # 管理員後台佈局
│       ├── DashboardView.vue # 儀表板
│       └── ProductsView.vue # 商品管理
├── components/              # 共用組件
│   ├── common/              # 通用組件
│   │   └── DeleteConfirmModal.vue
│   └── admin/               # 管理員專用組件
│       └── ProductModal.vue
├── stores/                  # Pinia狀態管理
│   ├── auth.ts             # 認證狀態
│   └── cart.ts             # 購物車狀態
├── services/               # API服務層
│   ├── api.ts              # HTTP客戶端配置
│   ├── auth.ts             # 認證服務
│   ├── cart.ts             # 購物車服務
│   ├── product.ts          # 商品服務
│   └── order.ts            # 訂單服務
├── types/                  # TypeScript型別定義
│   ├── auth.ts             # 認證相關型別
│   ├── product.ts          # 商品相關型別
│   └── api.ts              # API響應型別
├── router/                 # Vue Router配置
│   └── index.ts            # 路由定義和權限控制
└── assets/                 # 靜態資源
    └── main.css            # 全域樣式
```

## 功能特色

### ✅ 已完成功能
- **認證系統**: 使用者/管理員分離登入、會員註冊
- **使用者功能**: 
  - 首頁商品展示
  - 商品列表(搜尋、篩選、分頁)
  - 購物車管理(新增、修改數量、刪除)
  - 訂單記錄查看
  - 個人資料管理
- **管理員功能**: 
  - 後台儀表板
  - 商品管理(CRUD操作)
- **共用組件**: 確認刪除彈窗、商品編輯彈窗
- **狀態管理**: 認證狀態、購物車狀態
- **API服務**: 完整的HTTP服務層

### 🚧 待開發功能
- 管理員分類管理
- 管理員訂單管理  
- 管理員會員管理
- 管理員用戶管理
- 支付功能整合
- 圖片上傳功能

## 環境設定

### 環境變數
複製 `.env.example` 為 `.env` 並設定：
```bash
VITE_API_BASE_URL=http://localhost:8080
```

### 開發前準備
1. 確保後端API服務正在運行 (port 8080)
2. 安裝依賴: `npm install`
3. 啟動開發服務器: `npm run dev`

## API端點對應

### 使用者端點
- POST `/member/login` - 會員登入
- POST `/member` - 會員註冊
- GET `/member` - 取得會員資料
- PUT `/member` - 更新會員資料
- DELETE `/member` - 刪除會員帳戶

### 商品端點
- GET `/product` - 取得商品列表
- GET `/product/:id` - 取得商品詳情

### 購物車端點
- GET `/cart` - 取得購物車
- POST `/cart` - 新增商品到購物車
- PUT `/cart/:id` - 更新購物車商品數量
- DELETE `/cart/:id` - 移除購物車商品
- DELETE `/cart` - 清空購物車

### 訂單端點
- GET `/order` - 取得使用者訂單
- POST `/order` - 建立訂單
- GET `/order/:id` - 取得訂單詳情

### 管理員端點
- POST `/user/users/login` - 管理員登入
- GET `/user/categories` - 管理分類
- GET `/user/products` - 管理商品
- GET `/user/orders` - 管理訂單
- GET `/user/members` - 管理會員

## 部署說明
1. 建構生產版本: `npm run build`
2. 部署 `dist` 目錄到靜態檔案服務器
3. 確保路由設定支援 SPA 模式

## 開發注意事項
- 所有API調用都有錯誤處理
- 使用Tailwind CSS進行樣式設計
- 響應式設計支援手機和桌面端
- 路由權限控制已實現
- 狀態管理採用Pinia
- TypeScript型別定義完整