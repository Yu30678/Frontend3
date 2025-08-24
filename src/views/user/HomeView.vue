<template>
  <div class="px-4 py-6 sm:px-0">
    <div class="border-4 border-dashed border-gray-200 rounded-lg p-8">
      <div class="text-center">
        <ShoppingBagIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-lg font-medium text-gray-900">歡迎來到購物商城</h3>
        <p class="mt-1 text-sm text-gray-500">
          瀏覽我們的精選商品，開始您的購物之旅！
        </p>
        <div class="mt-6">
          <router-link
            to="/user/products"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            開始購物
          </router-link>
        </div>
      </div>
    </div>

    <!-- Featured Products Section -->
    <div v-if="featuredProducts.length > 0" class="mt-8">
      <h2 class="text-2xl font-bold tracking-tight text-gray-900 mb-6">精選商品</h2>
      <div class="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
        <div
          v-for="product in featuredProducts"
          :key="product.product_id"
          class="group cursor-pointer"
        >
          <div class="w-full aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden xl:aspect-w-7 xl:aspect-h-8">
            <GoogleDriveImage
              :product="product"
              :alt="product.name"
              class="w-full h-full object-center object-cover group-hover:opacity-75"
            />
          </div>
          <h3 class="mt-4 text-sm text-gray-700">{{ product.name }}</h3>
          <p class="mt-1 text-lg font-medium text-gray-900">${{ product.price }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ShoppingBagIcon, PlusIcon } from '@heroicons/vue/24/outline'
import { productService } from '@/services/product'
import GoogleDriveImage from '@/components/common/GoogleDriveImage.vue'
import type { Product } from '@/types/product'

const featuredProducts = ref<Product[]>([])

onMounted(async () => {
  try {
    const response = await productService.getProducts(1, 8)
    if (response.status === 200 && response.data) {
      featuredProducts.value = response.data
    }
  } catch (error) {
    console.error('獲取精選商品失敗:', error)
  }
})
</script>