<template>
  <div class="px-4 py-6 sm:px-0">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">個人資料</h1>
      <p class="mt-1 text-sm text-gray-600">管理您的帳戶資訊和設定</p>
    </div>

    <div class="space-y-6">
      <!-- Profile Information -->
      <div class="bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              基本資料
            </h3>
            <button
              v-if="!isEditing"
              @click="startEditing"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PencilIcon class="-ml-0.5 mr-2 h-4 w-4" />
              編輯
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  用戶名稱
                </label>
                <input
                  v-model="form.username"
                  :disabled="!isEditing"
                  type="text"
                  required
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  電子郵件
                </label>
                <input
                  v-model="form.email"
                  :disabled="!isEditing"
                  type="email"
                  required
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  手機號碼
                </label>
                <input
                  v-model="form.phone"
                  :disabled="!isEditing"
                  type="tel"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  註冊時間
                </label>
                <input
                  :value="formatDate(memberProfile?.create_at || '')"
                  disabled
                  type="text"
                  class="block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                地址
              </label>
              <textarea
                v-model="form.address"
                :disabled="!isEditing"
                rows="3"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="請輸入您的地址"
              />
            </div>

            <div v-if="isEditing" class="flex gap-3 pt-4">
              <button
                type="button"
                @click="cancelEditing"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                取消
              </button>
              <button
                type="submit"
                :disabled="isLoading"
                class="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                <span v-if="!isLoading">儲存變更</span>
                <span v-else class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  儲存中...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Password Change -->
      <div class="bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                密碼安全
              </h3>
              <p class="mt-1 text-sm text-gray-500">
                定期更新密碼以確保帳戶安全
              </p>
            </div>
            <button
              v-if="!isChangingPassword"
              @click="startPasswordChange"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <LockClosedIcon class="-ml-0.5 mr-2 h-4 w-4" />
              修改密碼
            </button>
          </div>

          <form v-if="isChangingPassword" @submit.prevent="handlePasswordSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                目前密碼
              </label>
              <input
                v-model="passwordForm.currentPassword"
                type="password"
                required
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                新密碼
              </label>
              <input
                v-model="passwordForm.newPassword"
                type="password"
                required
                minlength="6"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                確認新密碼
              </label>
              <input
                v-model="passwordForm.confirmPassword"
                type="password"
                required
                minlength="6"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>

            <div class="flex gap-3 pt-4">
              <button
                type="button"
                @click="cancelPasswordChange"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                :disabled="isChangingPasswordLoading"
                class="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
              >
                <span v-if="!isChangingPasswordLoading">更新密碼</span>
                <span v-else>更新中...</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Account Actions -->
      <div class="bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            帳戶操作
          </h3>
          <div class="space-y-3">
            <button
              @click="logout"
              class="w-full sm:w-auto inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowRightOnRectangleIcon class="-ml-1 mr-2 h-5 w-5" />
              登出
            </button>
            
            <div class="border-t border-gray-200 pt-4">
              <button
                @click="confirmDeleteAccount"
                class="w-full sm:w-auto inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
              >
                <TrashIcon class="-ml-1 mr-2 h-5 w-5" />
                刪除帳戶
              </button>
              <p class="mt-2 text-sm text-gray-500">
                刪除帳戶將永久移除您的所有資料，此操作無法復原
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div
      v-if="message.show"
      :class="[
        'fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50',
        message.type === 'success' ? 'bg-green-500' : 'bg-red-500',
        'text-white'
      ]"
    >
      <div class="flex items-center">
        <CheckCircleIcon v-if="message.type === 'success'" class="h-5 w-5 mr-2" />
        <ExclamationTriangleIcon v-else class="h-5 w-5 mr-2" />
        {{ message.text }}
      </div>
    </div>

    <!-- Delete Account Confirmation -->
    <DeleteConfirmModal
      v-if="showDeleteConfirm"
      title="刪除帳戶"
      message="確定要刪除您的帳戶嗎？此操作將永久移除您的所有資料，包括訂單記錄，且無法復原。"
      @confirm="handleDeleteAccount"
      @cancel="cancelDeleteAccount"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  PencilIcon, 
  LockClosedIcon, 
  ArrowRightOnRectangleIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/auth'
import type { Member } from '@/types/auth'
import DeleteConfirmModal from '@/components/common/DeleteConfirmModal.vue'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const isEditing = ref(false)
const isChangingPassword = ref(false)
const isChangingPasswordLoading = ref(false)
const showDeleteConfirm = ref(false)
const memberProfile = ref<Member | null>(null)

const form = ref({
  username: '',
  email: '',
  phone: '',
  address: ''
})

const originalForm = ref({
  username: '',
  email: '',
  phone: '',
  address: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const message = ref({
  show: false,
  type: 'success' as 'success' | 'error',
  text: ''
})

onMounted(() => {
  loadProfile()
})

const loadProfile = async () => {
  try {
    // 直接從auth store獲取當前登入用戶資料
    if (authStore.user && 'member_id' in authStore.user) {
      memberProfile.value = authStore.user as Member
      form.value = {
        username: memberProfile.value.name || '', // 使用 name 而不是 username
        email: memberProfile.value.email,
        phone: memberProfile.value.phone || '',
        address: memberProfile.value.address || ''
      }
      originalForm.value = { ...form.value }
    } else {
      showMessage('請重新登入', 'error')
    }
  } catch (error) {
    console.error('載入個人資料失敗:', error)
    showMessage('載入個人資料失敗', 'error')
  }
}

const startEditing = () => {
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
  form.value = { ...originalForm.value }
}

const handleSubmit = async () => {
  try {
    isLoading.value = true
    const response = await authService.updateMemberProfile(form.value)
    
    if (response.success) {
      originalForm.value = { ...form.value }
      isEditing.value = false
      showMessage('個人資料更新成功', 'success')
    } else {
      throw new Error(response.message)
    }
  } catch (error: any) {
    console.error('更新個人資料失敗:', error)
    showMessage(error.message || '更新失敗', 'error')
  } finally {
    isLoading.value = false
  }
}

const startPasswordChange = () => {
  isChangingPassword.value = true
}

const cancelPasswordChange = () => {
  isChangingPassword.value = false
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

const handlePasswordSubmit = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    showMessage('新密碼與確認密碼不符', 'error')
    return
  }

  if (passwordForm.value.newPassword.length < 6) {
    showMessage('新密碼至少需要6個字元', 'error')
    return
  }

  try {
    isChangingPasswordLoading.value = true
    
    const response = await authService.updatePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    
    if (response.status === 200) {
      cancelPasswordChange()
      showMessage('密碼更新成功', 'success')
    } else {
      throw new Error(response.message || '密碼更新失敗')
    }
  } catch (error: any) {
    console.error('密碼更新失敗:', error)
    showMessage(error.message || '密碼更新失敗', 'error')
  } finally {
    isChangingPasswordLoading.value = false
  }
}

const logout = () => {
  authStore.logout()
  router.push('/auth/login')
}

const confirmDeleteAccount = () => {
  showDeleteConfirm.value = true
}

const cancelDeleteAccount = () => {
  showDeleteConfirm.value = false
}

const handleDeleteAccount = async () => {
  try {
    const response = await authService.deleteMemberAccount()
    if (response.success) {
      showMessage('帳戶已刪除', 'success')
      setTimeout(() => {
        authStore.logout()
        router.push('/')
      }, 2000)
    } else {
      throw new Error(response.message)
    }
  } catch (error: any) {
    console.error('刪除帳戶失敗:', error)
    showMessage(error.message || '刪除帳戶失敗', 'error')
  } finally {
    showDeleteConfirm.value = false
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const showMessage = (text: string, type: 'success' | 'error') => {
  message.value = { show: true, type, text }
  setTimeout(() => {
    message.value.show = false
  }, 3000)
}
</script>