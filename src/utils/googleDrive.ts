/**
 * Google Drive 圖片工具函數
 * 處理 Google Drive 共享連結轉換為直接圖片URL
 */

// Google Drive 資料夾ID (從共享連結中提取)
const GOOGLE_DRIVE_FOLDER_ID = '1pyxs8UoPgQwfF14oLGTcIVnlYigYfqe3'

/**
 * 將 Google Drive 檔案ID 轉換為直接圖片URL
 * @param fileId Google Drive 檔案ID
 * @returns 直接圖片URL
 */
export function getGoogleDriveImageUrl(fileId: string): string {
  if (!fileId) return '/placeholder-image.svg'
  
  // 根據測試結果，使用縮圖格式作為主要格式
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800-h800`
}

/**
 * 將 Google Drive 檔案ID 轉換為縮圖URL
 * @param fileId Google Drive 檔案ID  
 * @param size 縮圖大小 (預設: 200)
 * @returns 縮圖URL
 */
export function getGoogleDriveThumbnailUrl(fileId: string, size: number = 200): string {
  if (!fileId) return '/placeholder-image.svg'
  
  // Google Drive 縮圖URL格式
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=s${size}`
}

/**
 * 獲取Google Drive圖片的多種備選URL
 * @param fileId Google Drive 檔案ID
 * @returns 多種可能的圖片URL格式
 */
export function getGoogleDriveImageUrls(fileId: string): string[] {
  if (!fileId) return ['/placeholder-image.svg']
  
  return [
    `https://drive.google.com/uc?id=${fileId}`, // 標準格式
    `https://drive.google.com/uc?export=view&id=${fileId}`, // 預覽格式
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h400`, // 縮圖格式
    `https://lh3.googleusercontent.com/d/${fileId}=w400-h400` // Google用戶內容格式
  ]
}

/**
 * 檢查是否為有效的 Google Drive 檔案ID
 * @param fileId 檔案ID
 * @returns 是否為有效ID
 */
export function isValidGoogleDriveFileId(fileId: string): boolean {
  // Google Drive 檔案ID 通常是25-44個字符的字串，包含字母、數字、底線和短橫線
  const googleDriveIdRegex = /^[a-zA-Z0-9_-]{20,50}$/
  return googleDriveIdRegex.test(fileId)
}

/**
 * 從 Google Drive 共享連結中提取檔案ID
 * @param shareUrl 共享連結
 * @returns 檔案ID或null
 */
export function extractFileIdFromShareUrl(shareUrl: string): string | null {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/, // https://drive.google.com/file/d/{fileId}/view
    /id=([a-zA-Z0-9_-]+)/, // https://drive.google.com/uc?id={fileId}
  ]
  
  for (const pattern of patterns) {
    const match = shareUrl.match(pattern)
    if (match) {
      return match[1]
    }
  }
  
  return null
}

/**
 * 取得產品圖片URL，智能處理 Google Drive URL 和一般圖片URL
 * @param product 產品資料
 * @returns 圖片URL
 */
export function getProductImageUrl(product: { image_id?: string; image_url?: string }): string {
  // 如果有 image_id，優先使用
  if (product.image_id && isValidGoogleDriveFileId(product.image_id)) {
    return getGoogleDriveImageUrl(product.image_id)
  }
  
  // 檢查 image_url 是否已經是 Google Drive URL
  if (product.image_url) {
    // 如果已經是 Google Drive 縮圖URL，直接使用
    if (product.image_url.includes('drive.google.com/thumbnail')) {
      return product.image_url
    }
    
    // 如果是其他 Google Drive URL，嘗試提取檔案ID並轉換
    if (product.image_url.includes('drive.google.com')) {
      const fileId = extractFileIdFromShareUrl(product.image_url)
      if (fileId) {
        return getGoogleDriveImageUrl(fileId)
      }
    }
    
    // 其他情況直接使用 image_url
    return product.image_url
  }
  
  // 最後回退到預設圖片
  return '/placeholder-image.svg'
}

/**
 * 取得產品縮圖URL
 * @param product 產品資料
 * @param size 縮圖大小
 * @returns 縮圖URL
 */
export function getProductThumbnailUrl(product: { image_id?: string; image_url?: string }, size: number = 200): string {
  // 如果有 image_id，優先使用
  if (product.image_id && isValidGoogleDriveFileId(product.image_id)) {
    return getGoogleDriveThumbnailUrl(product.image_id, size)
  }
  
  // 檢查 image_url 是否已經是 Google Drive URL
  if (product.image_url) {
    // 如果已經是 Google Drive 縮圖URL，調整尺寸
    if (product.image_url.includes('drive.google.com/thumbnail')) {
      // 提取檔案ID並重新生成指定尺寸的縮圖
      const match = product.image_url.match(/id=([a-zA-Z0-9_-]+)/)
      if (match) {
        return getGoogleDriveThumbnailUrl(match[1], size)
      }
      return product.image_url
    }
    
    // 如果是其他 Google Drive URL，嘗試提取檔案ID並轉換
    if (product.image_url.includes('drive.google.com')) {
      const fileId = extractFileIdFromShareUrl(product.image_url)
      if (fileId) {
        return getGoogleDriveThumbnailUrl(fileId, size)
      }
    }
    
    // 其他情況直接使用 image_url
    return product.image_url
  }
  
  // 最後回退到預設圖片
  return '/placeholder-image.svg'
}