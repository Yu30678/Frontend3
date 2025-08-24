<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">管理員管理</h1>
        <p class="mt-1 text-sm text-gray-600">管理系統管理員帳戶</p>
      </div>
      <button
        v-if="authStore.canEditUsers"
        @click="openCreateModal"
        class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <PlusIcon class="-ml-1 mr-2 h-5 w-5" />
        新增管理員
      </button>
    </div>

    <!-- Users Table -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <span class="ml-3 text-gray-500">載入中...</span>
    </div>

    <div v-else-if="users.length === 0" class="text-center py-12">
      <UserGroupIcon class="mx-auto h-16 w-16 text-gray-400" />
      <h3 class="mt-4 text-lg font-medium text-gray-900">暫無管理員</h3>
      <p class="mt-2 text-sm text-gray-500">開始新增第一個管理員帳戶</p>
    </div>

    <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                管理員資訊
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                權限等級
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                狀態
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.user_id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span class="text-sm font-medium text-indigo-600">
                        {{ user.name.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ user.name }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ user.account }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    getLevelColor(user.level)
                  ]"
                >
                  {{ getLevelText(user.level) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  活躍
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <button
                    v-if="authStore.canEditUsers"
                    @click="openEditModal(user)"
                    class="text-primary-600 hover:text-primary-900"
                  >
                    <PencilIcon class="h-4 w-4" />
                  </button>
                  <button
                    v-if="authStore.canEditUsers && user.user_id !== currentUserId"
                    @click="confirmDelete(user)"
                    class="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- User Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              {{ selectedUser ? '編輯管理員' : '新增管理員' }}
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                管理員名稱 *
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-gray-900"
                placeholder="請輸入管理員名稱"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                帳號 *
              </label>
              <input
                v-model="form.account"
                type="text"
                required
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-gray-900"
                placeholder="請輸入帳號"
              />
            </div>

            <div v-if="!selectedUser">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                密碼 *
              </label>
              <input
                v-model="form.password"
                type="password"
                required
                minlength="6"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-gray-900"
                placeholder="請輸入密碼"
              />
            </div>

            <div v-else>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                密碼(若修改請輸入新密碼)
              </label>
              <input
                v-model="form.password"
                type="password"
                minlength="6"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-gray-900"
                placeholder="如需更改密碼請輸入新密碼"
              />
              <p class="mt-1 text-sm text-gray-500">
                顯示為原始密碼遮蔽，若需修改請輸入新密碼
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                權限等級 *
              </label>
              <select
                v-model="form.level"
                required
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-gray-900"
              >
                <option value="0">超級管理員 (Level 0) - 可編輯所有頁面</option>
                <option value="1">高級管理員 (Level 1) - 僅不可編輯管理員</option>
                <option value="2">中階管理員 (Level 2) - 僅不可編輯會員、管理員</option>
                <option value="3">一般管理員 (Level 3) - 僅可瀏覽</option>
              </select>
              <p class="mt-1 text-sm text-gray-500">
                等級為 0 ~ 3，所有等級管理員都可以查看所有頁面，只有等級3管理員不能進到管理員管理頁面
              </p>
            </div>


            <div class="flex gap-4 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="flex-1 px-4 py-2 bg-white text-gray-500 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                取消
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                <span v-if="!isSubmitting">{{ selectedUser ? '更新' : '新增' }}</span>
                <span v-else>處理中...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmModal
      v-if="showDeleteModal"
      :title="'刪除管理員'"
      :message="`確定要刪除管理員「${userToDelete?.name}」嗎？此操作無法復原。`"
      @confirm="handleDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  UserGroupIcon,
  XMarkIcon 
} from '@heroicons/vue/24/outline'
import type { User } from '@/types/auth'
import { useAuthStore } from '@/stores/auth'
import DeleteConfirmModal from '@/components/common/DeleteConfirmModal.vue'
import { userService, type AdminUser } from '@/services/user'

const authStore = useAuthStore()

const isLoading = ref(true)
const isSubmitting = ref(false)
const users = ref<AdminUser[]>([])
const showModal = ref(false)
const showDeleteModal = ref(false)
const selectedUser = ref<AdminUser | null>(null)
const userToDelete = ref<AdminUser | null>(null)
const currentUserId = ref(1) // 假設當前管理員ID為1

const form = ref({
  name: '',
  account: '',
  password: '',
  level: 1
})

onMounted(() => {
  fetchUsers()
})

const fetchUsers = async () => {
  try {
    isLoading.value = true
    const response = await userService.getAllUsers()
    
    // 檢查API回應格式：status: 200 和 data 陣列
    if (response.status === 200 && response.data && Array.isArray(response.data)) {
      users.value = response.data
    }
  } catch (error) {
    console.error('獲取管理員列表失敗:', error)
  } finally {
    isLoading.value = false
  }
}

const openCreateModal = () => {
  selectedUser.value = null
  form.value = {
    name: '',
    account: '',
    password: '',
    level: 3 // 預設為最低權限
  }
  showModal.value = true
}

const openEditModal = (user: AdminUser) => {
  selectedUser.value = { ...user } // 保留完整的用戶資料
  // 顯示原始密碼的遮蔽版本（*號）
  const maskedPassword = user.password ? '*'.repeat(user.password.length) : '******'
  form.value = {
    name: user.name,
    account: user.account,
    password: maskedPassword,
    level: user.level
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedUser.value = null
}

const handleSubmit = async () => {
  try {
    console.log('🎯 表單提交開始')
    isSubmitting.value = true
    
    let response
    if (selectedUser.value) {
      console.log('🔄 進入更新用戶流程')
      // 更新管理員 - 根據Postman格式，需要傳送所有欄位
      const originalMaskedPassword = selectedUser.value.password ? '*'.repeat(selectedUser.value.password.length) : '******'
      
      // 決定使用新密碼還是原始密碼
      let passwordToSend = selectedUser.value.password || '30678' // 使用原始密碼
      if (form.value.password && form.value.password.trim() && form.value.password !== originalMaskedPassword) {
        passwordToSend = form.value.password // 使用新密碼
      }
      
      // 調試selectedUser的結構
      console.log('🔍 調試：selectedUser完整結構:', selectedUser.value)
      console.log('🔍 調試：selectedUser.user_id:', selectedUser.value?.user_id)
      console.log('🔍 調試：selectedUser.user_id類型:', typeof selectedUser.value?.user_id)
      
      // 確保正確獲取user_id
      const userId = selectedUser.value?.user_id || selectedUser.value?.userId
      console.log('🔍 調試：提取的userId:', userId, typeof userId)
      
      if (!userId || isNaN(Number(userId))) {
        console.error('❌ 無效的用戶ID，無法更新')
        alert('無效的用戶ID，無法進行更新')
        return
      }
      
      const updateData = {
        userId: Number(userId), // 確保使用正確的數字類型
        name: form.value.name,
        password: passwordToSend,
        account: form.value.account,
        level: parseInt(form.value.level.toString())
      }
      
      console.log('✏️ 前端：準備更新用戶資料:', updateData)
      console.log('👤 前端：選中的用戶:', selectedUser.value)
      
      response = await userService.updateUser(updateData)
    } else {
      console.log('➕ 進入新增用戶流程')
      // 新增管理員
      const createData = {
        name: form.value.name,
        account: form.value.account,
        password: form.value.password,
        level: parseInt(form.value.level.toString())
      }
      console.log('📤 新增用戶資料:', createData)
      response = await userService.createUser(createData)
    }
    
    if (response.success || response.status === 200) {
      closeModal()
      fetchUsers()
    } else {
      throw new Error(response.message || '操作失敗')
    }
  } catch (error: any) {
    console.error('保存管理員失敗:', error)
    alert(error.message || '保存管理員失敗，請檢查輸入資料是否正確')
  } finally {
    isSubmitting.value = false
  }
}

const confirmDelete = (user: AdminUser) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (userToDelete.value) {
    try {
      console.log('🗑️ 前端：準備刪除用戶:', userToDelete.value)
      console.log('🔍 調試：userToDelete.value.user_id:', userToDelete.value.user_id)
      console.log('🔍 調試：userToDelete完整結構:', userToDelete.value)
      
      // 確保正確獲取user_id
      const userId = userToDelete.value.user_id || userToDelete.value.userId
      console.log('🔍 調試：提取的userId for delete:', userId, typeof userId)
      
      if (!userId || isNaN(Number(userId))) {
        console.error('❌ 無效的用戶ID，無法刪除')
        alert('無效的用戶ID，無法進行刪除')
        return
      }
      
      const response = await userService.deleteUser(Number(userId))
      
      if (response.success || response.status === 200) {
        showDeleteModal.value = false
        userToDelete.value = null
        fetchUsers()
      } else {
        throw new Error(response.message || '刪除管理員失敗')
      }
    } catch (error: any) {
      console.error('刪除管理員失敗:', error)
      alert(error.message || '刪除管理員失敗，請稍後再試')
    }
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  userToDelete.value = null
}

const getLevelText = (level: number) => {
  const levelMap = {
    0: '超級管理員',
    1: '高級管理員',
    2: '中階管理員',
    3: '一般管理員'
  }
  return levelMap[level as keyof typeof levelMap] || `Level ${level}`
}

const getLevelColor = (level: number) => {
  const colorMap = {
    0: 'bg-red-100 text-red-800',    // 超級管理員 - 紅色
    1: 'bg-purple-100 text-purple-800', // 高級管理員 - 紫色
    2: 'bg-blue-100 text-blue-800',     // 中階管理員 - 藍色
    3: 'bg-green-100 text-green-800'    // 一般管理員 - 綠色
  }
  return colorMap[level as keyof typeof colorMap] || 'bg-gray-100 text-gray-800'
}

const getLevelDescription = (level: number) => {
  const descriptionMap = {
    0: '可編輯所有頁面',
    1: '僅不可編輯管理員',
    2: '僅不可編輯會員、管理員',
    3: '僅可瀏覽'
  }
  return descriptionMap[level as keyof typeof descriptionMap] || ''
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>