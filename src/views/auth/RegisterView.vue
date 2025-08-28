<template>
  <div class="space-y-6">
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900">會員註冊</h2>
      <p class="mt-2 text-sm text-gray-600">
        建立您的購物帳戶
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div v-if="authStore.error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
        {{ authStore.error }}
      </div>

      <div>
        <label for="username" class="block text-sm font-medium text-gray-700">
          用戶名稱 *
        </label>
        <div class="mt-1">
          <input
            id="username"
            v-model="form.name"
            type="text"
            required
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
          />
        </div>
      </div>

      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">
          電子郵件 *
        </label>
        <div class="mt-1">
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
          />
        </div>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">
          密碼 *
        </label>
        <div class="mt-1">
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
          />
        </div>
      </div>

      <div>
        <label for="phone" class="block text-sm font-medium text-gray-700">
          手機號碼
        </label>
        <div class="mt-1">
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
          />
        </div>
      </div>

      <div>
        <label for="address" class="block text-sm font-medium text-gray-700">
          地址
        </label>
        <div class="mt-1">
          <textarea
            id="address"
            v-model="form.address"
            rows="3"
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          <span v-if="!authStore.isLoading">註冊</span>
          <span v-else class="flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            註冊中...
          </span>
        </button>
      </div>

      <div class="text-center">
        <router-link
          to="/auth/login"
          class="text-sm text-primary-600 hover:text-primary-500"
        >
          已有帳戶？立即登入
        </router-link>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { RegisterRequest } from '@/types/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref<RegisterRequest>({
  name: '',
  password: '',
  email: '',
  phone: '',
  address: ''
})

const handleSubmit = async () => {
  try {
    await authStore.register(form.value)
    // 註冊成功後跳轉到登入頁面
    router.push('/auth/login')
  } catch (error) {
    console.error('註冊失敗:', error)
  }
}
</script>