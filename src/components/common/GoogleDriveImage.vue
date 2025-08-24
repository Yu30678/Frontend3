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

interface Props {
  product?: { image_id?: string; image_url?: string }
  imageId?: string
  fallbackUrl?: string
  alt?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  alt: '商品圖片',
  fallbackUrl: '/placeholder-image.jpg',
  class: ''
})

const currentUrlIndex = ref(0)
const hasError = ref(false)
const isLoading = ref(true)

// 獲取所有可能的圖片URL - 根據測試結果，Google Drive 縮圖格式可以正常工作
const imageUrls = computed(() => {
  const urls: string[] = []
  
  // 如果有傳入 imageId prop
  if (props.imageId) {
    urls.push(...getGoogleDriveImageUrls(props.imageId))
  }
  
  // 如果有傳入 product 物件
  if (props.product) {
    if (props.product.image_id) {
      // 基於測試結果，使用有效的縮圖格式
      urls.push(
        `https://drive.google.com/thumbnail?id=${props.product.image_id}&sz=w800-h800`,
        `https://drive.google.com/thumbnail?id=${props.product.image_id}&sz=w400-h400`,
        `https://drive.google.com/thumbnail?id=${props.product.image_id}&sz=w600-h600`
      )
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
const handleImageError = () => {
  console.warn(`圖片載入失敗: ${currentImageUrl.value}`)
  
  // 如果還有其他URL可以嘗試
  if (currentUrlIndex.value < imageUrls.value.length - 1) {
    currentUrlIndex.value++
    console.info(`嘗試下一個URL: ${imageUrls.value[currentUrlIndex.value]}`)
    
    // 如果是429錯誤，增加延遲
    if (currentImageUrl.value.includes('drive.google.com')) {
      setTimeout(() => {
        // 觸發重新載入
        const img = new Image()
        img.src = imageUrls.value[currentUrlIndex.value]
      }, Math.random() * 2000 + 1000) // 1-3秒隨機延遲
    }
  } else {
    // 所有URL都失敗了
    hasError.value = true
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