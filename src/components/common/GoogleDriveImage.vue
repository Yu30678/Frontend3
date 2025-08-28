<template>
  <img
    :src="currentImageUrl"
    :alt="alt"
    :class="imageClass"
    @error="handleImageError"
    @load="handleImageLoad"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { getGoogleDriveImageUrls, getProductImageUrl } from '@/utils/googleDrive'

// 全域請求限制器，避免同時發送太多請求
class RequestLimiter {
  private requestQueue: Array<() => void> = []
  private isProcessing = false
  private readonly minDelay = 500 // 最小延遲500ms
  
  async addRequest(requestFn: () => void) {
    return new Promise<void>((resolve) => {
      this.requestQueue.push(() => {
        requestFn()
        resolve()
      })
      this.processQueue()
    })
  }
  
  private async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) return
    
    this.isProcessing = true
    while (this.requestQueue.length > 0) {
      const requestFn = this.requestQueue.shift()
      if (requestFn) {
        requestFn()
        // 每個請求間隔至少500ms
        await new Promise(resolve => setTimeout(resolve, this.minDelay))
      }
    }
    this.isProcessing = false
  }
}

const globalLimiter = new RequestLimiter()

interface Props {
  product?: { image_id?: string; image_url?: string }
  imageId?: string
  fallbackUrl?: string
  alt?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  alt: '商品圖片',
  fallbackUrl: '/placeholder-image.svg',
  class: ''
})

const currentUrlIndex = ref(0)
const hasError = ref(false)
const isLoading = ref(true)

// 獲取所有可能的圖片URL - 減少同時請求數量以避免429錯誤
const imageUrls = computed(() => {
  const urls: string[] = []
  
  // 如果有傳入 imageId prop
  if (props.imageId) {
    // 只使用縮圖格式，減少URL數量
    urls.push(`https://drive.google.com/thumbnail?id=${props.imageId}&sz=w400-h400`)
  }
  
  // 如果有傳入 product 物件
  if (props.product) {
    if (props.product.image_id) {
      // 只使用一個尺寸的縮圖，減少請求數量
      urls.push(`https://drive.google.com/thumbnail?id=${props.product.image_id}&sz=w400-h400`)
    }
    if (props.product.image_url) {
      urls.push(props.product.image_url)
    }
  }
  
  // 加入預設圖片作為最後備援
  urls.push(props.fallbackUrl)
  
  return urls.length > 0 ? urls : [props.fallbackUrl]
})

// 當前使用的圖片URL
const currentImageUrl = computed(() => {
  if (hasError.value && currentUrlIndex.value >= imageUrls.value.length) {
    return props.fallbackUrl
  }
  return imageUrls.value[currentUrlIndex.value] || props.fallbackUrl
})

const imageClass = computed(() => {
  return props.class + (isLoading.value ? ' opacity-50' : '')
})

// 圖片載入錯誤處理
const handleImageError = async (event: Event) => {
  const img = event.target as HTMLImageElement
  console.warn(`圖片載入失敗: ${currentImageUrl.value}`)
  
  // 如果還有其他URL可以嘗試
  if (currentUrlIndex.value < imageUrls.value.length - 1) {
    currentUrlIndex.value++
    console.info(`嘗試下一個URL: ${imageUrls.value[currentUrlIndex.value]}`)
    
    // 如果是Google Drive URL，使用請求限制器
    if (currentImageUrl.value.includes('drive.google.com')) {
      await globalLimiter.addRequest(() => {
        img.src = imageUrls.value[currentUrlIndex.value]
      })
    } else {
      // 非Google Drive URL立即載入
      img.src = imageUrls.value[currentUrlIndex.value]
    }
  } else {
    // 所有URL都失敗了，使用fallback
    hasError.value = true
    img.src = props.fallbackUrl
    console.error('所有圖片URL都載入失敗，使用預設圖片')
  }
  isLoading.value = false
}

// 圖片載入成功處理
const handleImageLoad = () => {
  isLoading.value = false
  hasError.value = false
  console.info(`圖片載入成功: ${currentImageUrl.value}`)
}

// 當props改變時重置狀態
watch(() => [props.product, props.imageId], () => {
  currentUrlIndex.value = 0
  hasError.value = false
  isLoading.value = true
}, { deep: true })

onMounted(() => {
  isLoading.value = true
})
</script>