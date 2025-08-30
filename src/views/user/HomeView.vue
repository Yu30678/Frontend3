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

    <!-- Shopping Animation Section -->
    <div class="mt-8">
      <h2 class="text-2xl font-bold tracking-tight text-gray-900 mb-6 text-center">開始您的購物體驗</h2>
      <div class="shopping-animation-container bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
        <!-- 購物流程動畫 -->
        <div class="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-12">
          <!-- Step 1: 瀏覽商品 -->
          <div class="flex flex-col items-center animate-float">
            <div class="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <svg class="w-10 h-10 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">瀏覽商品</h3>
            <p class="text-sm text-gray-600 text-center">探索精選商品</p>
          </div>

          <!-- 箭頭 1 -->
          <div class="hidden md:block">
            <svg class="w-8 h-8 text-gray-400 animate-bounce-x" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>

          <!-- Step 2: 加入購物車 -->
          <div class="flex flex-col items-center animate-float-delayed">
            <div class="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <svg class="w-10 h-10 text-white animate-bounce-y" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6.5-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">加入購物車</h3>
            <p class="text-sm text-gray-600 text-center">收集心儀商品</p>
          </div>

          <!-- 箭頭 2 -->
          <div class="hidden md:block">
            <svg class="w-8 h-8 text-gray-400 animate-bounce-x" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>

          <!-- Step 3: 結帳付款 -->
          <div class="flex flex-col items-center animate-float">
            <div class="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mb-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <svg class="w-10 h-10 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">安全結帳</h3>
            <p class="text-sm text-gray-600 text-center">快速完成付款</p>
          </div>
        </div>

        <!-- 漂浮的購物圖標 -->
        <div class="relative mt-8 h-16 overflow-hidden">
          <div class="absolute inset-0 flex items-center justify-center">
            <!-- 漂浮商品圖標 -->
            <div class="flex space-x-8">
              <div class="w-8 h-8 bg-yellow-400 rounded-lg animate-float-slow shadow-lg"></div>
              <div class="w-6 h-6 bg-red-400 rounded-full animate-float-medium shadow-lg"></div>
              <div class="w-10 h-6 bg-green-400 rounded-lg animate-float-fast shadow-lg"></div>
              <div class="w-7 h-7 bg-blue-400 rounded-full animate-float-slow shadow-lg"></div>
              <div class="w-9 h-5 bg-purple-400 rounded-lg animate-float-medium shadow-lg"></div>
            </div>
          </div>
        </div>

        <!-- CTA 按鈕 -->
        <div class="text-center mt-6">
          <router-link
            to="/user/products"
            class="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <svg class="w-5 h-5 mr-2 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            立即開始購物
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ShoppingBagIcon, PlusIcon } from '@heroicons/vue/24/outline'
</script>

<style scoped>
/* 自定義動畫 */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes float-delayed {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
}

@keyframes bounce-x {
  0%, 100% {
    transform: translateX(0px);
  }
  50% {
    transform: translateX(5px);
  }
}

@keyframes bounce-y {
  0%, 100% {
    transform: translateY(0px);
  }
  25% {
    transform: translateY(-3px);
  }
  75% {
    transform: translateY(3px);
  }
}

@keyframes float-slow {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-8px) rotate(5deg);
  }
  75% {
    transform: translateY(8px) rotate(-5deg);
  }
}

@keyframes float-medium {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-12px) scale(1.1);
  }
}

@keyframes float-fast {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-15px) rotate(10deg);
  }
  66% {
    transform: translateY(-5px) rotate(-10deg);
  }
}

@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 動畫類別 */
.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed 3s ease-in-out infinite 0.5s;
}

.animate-bounce-x {
  animation: bounce-x 2s ease-in-out infinite;
}

.animate-bounce-y {
  animation: bounce-y 1s ease-in-out infinite;
}

.animate-float-slow {
  animation: float-slow 4s ease-in-out infinite;
}

.animate-float-medium {
  animation: float-medium 3s ease-in-out infinite 0.3s;
}

.animate-float-fast {
  animation: float-fast 2s ease-in-out infinite 0.6s;
}

.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}

/* 漸變動畫容器 */
.shopping-animation-container {
  position: relative;
  overflow: hidden;
}

.shopping-animation-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
  animation: float-slow 6s ease-in-out infinite;
}

/* 互動效果 */
.animate-float:hover,
.animate-float-delayed:hover {
  transform: translateY(-5px) scale(1.05);
  transition: transform 0.3s ease;
}
</style>