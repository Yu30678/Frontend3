<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">會員管理</h1>
        <p class="mt-1 text-sm text-gray-600">管理所有註冊會員</p>
      </div>
      <button
        v-if="authStore.canEditMembers"
        @click="openCreateModal"
        class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <PlusIcon class="-ml-1 mr-2 h-5 w-5" />
        新增會員
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            搜尋會員
          </label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="會員名稱或郵箱..."
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-gray-900"
            @input="debouncedSearch"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            註冊時間
          </label>
          <select
            v-model="filters.dateRange"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-gray-900"
            @change="currentPage = 1; applyFiltersAndPagination()"
          >
            <option value="">全部時間</option>
            <option value="7days">最近7天</option>
            <option value="30days">最近30天</option>
            <option value="90days">最近90天</option>
          </select>
        </div>
        
        <div class="flex items-end">
          <button
            @click="resetFilters"
            class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            重設篩選
          </button>
        </div>
      </div>
    </div>

    <!-- Members Table -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <span class="ml-3 text-gray-500">載入中...</span>
    </div>

    <div v-else-if="members.length === 0" class="text-center py-12">
      <UsersIcon class="mx-auto h-16 w-16 text-gray-400" />
      <h3 class="mt-4 text-lg font-medium text-gray-900">暫無會員</h3>
      <p class="mt-2 text-sm text-gray-500">尚未有會員註冊</p>
    </div>

    <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                會員資訊
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                聯絡方式
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                註冊時間
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="member in members" :key="member.member_id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span class="text-sm font-medium text-primary-600">
                        {{ member.name.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ member.name }}
                    </div>
                    <div class="text-sm text-gray-500">
                      ID: {{ member.member_id }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ member.email }}</div>
                <div class="text-sm text-gray-500">{{ member.phone || '未提供' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(member.create_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <button
                    @click="viewMemberDetails(member)"
                    class="text-primary-600 hover:text-primary-900"
                  >
                    查看詳情
                  </button>
                  <button
                    v-if="authStore.canEditMembers"
                    @click="openEditModal(member)"
                    class="text-indigo-600 hover:text-indigo-900"
                  >
                    <PencilIcon class="h-4 w-4" />
                  </button>
                  <button
                    v-if="authStore.canEditMembers"
                    @click="confirmDelete(member)"
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
      
      <!-- Pagination -->
      <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="currentPage > 1 && changePage(currentPage - 1)"
            :disabled="currentPage <= 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一頁
          </button>
          <button
            @click="currentPage < totalPages && changePage(currentPage + 1)"
            :disabled="currentPage >= totalPages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一頁
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              顯示第
              <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span>
              到
              <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, totalItems) }}</span>
              筆，共
              <span class="font-medium">{{ totalItems }}</span>
              筆會員資料
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                @click="currentPage > 1 && changePage(currentPage - 1)"
                :disabled="currentPage <= 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">上一頁</span>
                <ChevronLeftIcon class="h-5 w-5" />
              </button>
              
              <!-- Page numbers -->
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="changePage(page)"
                :class="[
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                  page === currentPage
                    ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                ]"
              >
                {{ page }}
              </button>
              
              <button
                @click="currentPage < totalPages && changePage(currentPage + 1)"
                :disabled="currentPage >= totalPages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">下一頁</span>
                <ChevronRightIcon class="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Member Details Modal -->
    <div v-if="showDetailsModal && selectedMember" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              會員詳情 - {{ selectedMember.name }}
            </h3>
            <button
              @click="closeDetailsModal"
              class="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">會員ID</label>
                <p class="text-sm text-gray-900">{{ selectedMember.member_id }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">會員名稱</label>
                <p class="text-sm text-gray-900">{{ selectedMember.name }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">電子郵件</label>
                <p class="text-sm text-gray-900">{{ selectedMember.email }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">手機號碼</label>
                <p class="text-sm text-gray-900">{{ selectedMember.phone || '未提供' }}</p>
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700">地址</label>
                <p class="text-sm text-gray-900">{{ selectedMember.address || '未提供' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">註冊時間</label>
                <p class="text-sm text-gray-900">{{ formatDate(selectedMember.create_at) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">最後更新</label>
                <p class="text-sm text-gray-900">{{ formatDate(selectedMember.updated_at || selectedMember.create_at) }}</p>
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end">
            <button
              @click="closeDetailsModal"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Member Create/Edit Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              {{ selectedMember ? '編輯會員' : '新增會員' }}
            </h3>
            <button
              @click="closeCreateModal"
              class="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                會員名稱 *
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-gray-900"
                placeholder="請輸入會員名稱"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                電子郵件 *
              </label>
              <input
                v-model="form.email"
                type="email"
                required
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-gray-900"
                placeholder="請輸入電子郵件"
              />
            </div>

            <div v-if="!selectedMember">
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

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                手機號碼
              </label>
              <input
                v-model="form.phone"
                type="tel"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-gray-900"
                placeholder="請輸入手機號碼"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                地址
              </label>
              <textarea
                v-model="form.address"
                rows="3"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-gray-900"
                placeholder="請輸入地址"
              />
            </div>

            <div class="flex gap-4 pt-4">
              <button
                type="button"
                @click="closeCreateModal"
                class="flex-1 px-4 py-2 bg-white text-gray-500 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                取消
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                <span v-if="!isSubmitting">{{ selectedMember ? '更新' : '新增' }}</span>
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
      :title="'刪除會員'"
      :message="`確定要刪除會員「${memberToDelete?.name}」嗎？此操作將同時刪除該會員的所有訂單和購物車資料，且無法復原。`"
      @confirm="handleDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { UsersIcon, XMarkIcon, PlusIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import type { Member } from '@/types/auth'
import { adminService } from '@/services/admin'
import DeleteConfirmModal from '@/components/common/DeleteConfirmModal.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const isLoading = ref(true)
const members = ref<Member[]>([])
const showDetailsModal = ref(false)
const showDeleteModal = ref(false)
const showCreateModal = ref(false)
const selectedMember = ref<Member | null>(null)
const memberToDelete = ref<Member | null>(null)
const isSubmitting = ref(false)

const form = ref({
  name: '',
  email: '',
  password: '',
  phone: '',
  address: ''
})

const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)
const allMembers = ref<Member[]>([]) // 儲存所有會員資料
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))

// 計算可見的頁碼
const visiblePages = computed(() => {
  const pages = []
  const maxVisiblePages = 5
  
  let start = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2))
  let end = Math.min(totalPages.value, start + maxVisiblePages - 1)
  
  if (end - start + 1 < maxVisiblePages) {
    start = Math.max(1, end - maxVisiblePages + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const filters = ref({
  search: '',
  dateRange: ''
})

let searchTimeout: NodeJS.Timeout | null = null

onMounted(() => {
  fetchMembers()
})

const fetchMembers = async () => {
  try {
    isLoading.value = true
    const response = await adminService.getMembers()
    
    // 檢查API回應格式：status: 200 和 data 陣列
    if (response.status === 200 && response.data && Array.isArray(response.data)) {
      // 先儲存所有會員資料
      allMembers.value = response.data
      
      // 應用篩選和分頁
      applyFiltersAndPagination()
    }
  } catch (error) {
    console.error('獲取會員列表失敗:', error)
  } finally {
    isLoading.value = false
  }
}

const applyFiltersAndPagination = () => {
  let filteredMembers = [...allMembers.value]
  
  // 搜尋篩選
  if (filters.value.search) {
    filteredMembers = filteredMembers.filter(member => 
      member.name.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      member.email.toLowerCase().includes(filters.value.search.toLowerCase())
    )
  }
  
  // 時間範圍篩選
  if (filters.value.dateRange) {
    const now = new Date()
    const days = parseInt(filters.value.dateRange.replace('days', ''))
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    
    filteredMembers = filteredMembers.filter(member => 
      new Date(member.create_at) >= cutoffDate
    )
  }
  
  // 設置總數
  totalItems.value = filteredMembers.length
  
  // 分頁
  const startIndex = (currentPage.value - 1) * itemsPerPage.value
  const endIndex = startIndex + itemsPerPage.value
  members.value = filteredMembers.slice(startIndex, endIndex)
}

const viewMemberDetails = (member: Member) => {
  selectedMember.value = member
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedMember.value = null
}

const confirmDelete = (member: Member) => {
  memberToDelete.value = member
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (memberToDelete.value) {
    try {
      await adminService.deleteMember(memberToDelete.value.member_id)
      
      showDeleteModal.value = false
      memberToDelete.value = null
      // 如果當前頁面沒有資料且不是第一頁，則回到上一頁
      fetchMembers().then(() => {
        if (members.value.length === 0 && currentPage.value > 1) {
          currentPage.value = currentPage.value - 1
          applyFiltersAndPagination()
        }
      })
    } catch (error) {
      console.error('刪除會員失敗:', error)
    }
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  memberToDelete.value = null
}

const debouncedSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    currentPage.value = 1 // 重設為第一頁
    applyFiltersAndPagination()
  }, 500)
}

const resetFilters = () => {
  filters.value = {
    search: '',
    dateRange: ''
  }
  currentPage.value = 1 // 重設為第一頁
  applyFiltersAndPagination()
}

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    applyFiltersAndPagination()
  }
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

const openCreateModal = () => {
  selectedMember.value = null
  form.value = {
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  }
  showCreateModal.value = true
}

const openEditModal = (member: Member) => {
  selectedMember.value = member
  form.value = {
    name: member.name,
    email: member.email,
    password: '',
    phone: member.phone || '',
    address: member.address || ''
  }
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
  selectedMember.value = null
}

const handleSubmit = async () => {
  try {
    isSubmitting.value = true
    
    if (selectedMember.value) {
      // 更新會員
      const updateData = {
        member_id: selectedMember.value.member_id.toString(),
        name: form.value.name,
        email: form.value.email,
        phone: form.value.phone,
        address: form.value.address,
        password: form.value.password || selectedMember.value.password // 如果沒有新密碼就用原密碼
      }
      await adminService.updateMember(updateData)
    } else {
      // 新增會員 - 按照後端SQL順序：name, password, phone, address, email
      const createData = {
        name: form.value.name,
        password: form.value.password,
        phone: form.value.phone,
        address: form.value.address,
        email: form.value.email
      }
      await adminService.createMember(createData)
    }
    
    closeCreateModal()
    fetchMembers() // 重新載入所有資料並保持當前頁面
  } catch (error) {
    console.error('保存會員失敗:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>