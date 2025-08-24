<template>
  <div class="space-y-6">
    <div class="flex justify-center space-x-4 mb-6">
      <button
        @click="switchUserType('member')"
        :class="[
          'px-4 py-2 rounded-md font-medium',
          userType === 'member' 
            ? 'bg-primary-600 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        ]"
      >
        會員登入
      </button>
      <button
        @click="switchUserType('admin')"
        :class="[
          'px-4 py-2 rounded-md font-medium',
          userType === 'admin' 
            ? 'bg-primary-600 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        ]"
      >
        管理員登入
      </button>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div v-if="authStore.error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
        {{ authStore.error }}
      </div>

      <div>
        <label for="loginField" class="block text-sm font-medium text-gray-700">
          {{ userType === 'member' ? '電子郵件' : '管理員帳號' }}
        </label>
        <div class="mt-1">
          <input
            id="loginField"
            v-model="form.email"
            :type="userType === 'member' ? 'email' : 'text'"
            required
            :placeholder="userType === 'member' ? '請輸入您的電子郵件' : '請輸入管理員帳號'"
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">
          密碼
        </label>
        <div class="mt-1">
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            placeholder="請輸入密碼"
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          <span v-if="!authStore.isLoading">登入</span>
          <span v-else class="flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            登入中...
          </span>
        </button>
      </div>

      <div v-if="userType === 'member'" class="text-center">
        <div class="space-y-2">
          <router-link
            to="/auth/register"
            class="block text-sm text-primary-600 hover:text-primary-500"
          >
            還沒有帳戶？立即註冊
          </router-link>
          
          <div class="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded-md">
            <p class="font-medium mb-2">測試帳號：</p>
            <p>會員: member@test.com / 123456</p>
            <p>管理員: admin / 123456</p>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { LoginRequest } from '@/types/auth'

const router = useRouter()
const authStore = useAuthStore()

const userType = ref<'member' | 'admin'>('member')
const form = ref<LoginRequest>({
  email: '',
  password: ''
})

// 切換用戶類型時清空表單
const switchUserType = (type: 'member' | 'admin') => {
  userType.value = type
  form.value = { email: '', password: '' }
  authStore.error = null
}

const handleSubmit = async () => {
  try {
    await authStore.login(form.value, userType.value)
    
    if (userType.value === 'admin') {
      router.push('/admin')
    } else {
      router.push('/user')
    }
  } catch (error) {
    console.error('登入失敗:', error)
  }
}
</script>