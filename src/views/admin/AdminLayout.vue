<template>
  <div class="min-h-screen bg-gray-50">
    <div class="flex">
      <!-- Sidebar -->
      <div class="fixed inset-y-0 flex flex-col w-64">
        <div class="flex flex-col flex-grow bg-gray-800 overflow-y-auto">
          <div class="flex items-center flex-shrink-0 px-4 py-4">
            <h1 class="text-lg font-semibold text-white">管理員後台</h1>
          </div>
          <nav class="mt-5 flex-1 px-2 space-y-1">
            <router-link
              to="/admin"
              exact-active-class="bg-gray-900 text-white"
              class="text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md"
            >
              <HomeIcon class="text-gray-400 mr-3 h-6 w-6" />
              儀表板
            </router-link>
            
            <router-link
              v-if="authStore.canViewProducts"
              to="/admin/products"
              active-class="bg-gray-900 text-white"
              class="text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md"
            >
              <ShoppingBagIcon class="text-gray-400 mr-3 h-6 w-6" />
              商品管理
            </router-link>
            
            <router-link
              v-if="authStore.canViewCategories"
              to="/admin/categories"
              active-class="bg-gray-900 text-white"
              class="text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md"
            >
              <TagIcon class="text-gray-400 mr-3 h-6 w-6" />
              分類管理
            </router-link>
            
            <router-link
              v-if="authStore.canViewOrders"
              to="/admin/orders"
              active-class="bg-gray-900 text-white"
              class="text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md"
            >
              <DocumentTextIcon class="text-gray-400 mr-3 h-6 w-6" />
              訂單管理
            </router-link>
            
            <router-link
              v-if="authStore.canViewMembers"
              to="/admin/members"
              active-class="bg-gray-900 text-white"
              class="text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md"
            >
              <UsersIcon class="text-gray-400 mr-3 h-6 w-6" />
              會員管理
            </router-link>
            
            <router-link
              v-if="authStore.canAccessUsersPage"
              to="/admin/users"
              active-class="bg-gray-900 text-white"
              class="text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md"
            >
              <UserGroupIcon class="text-gray-400 mr-3 h-6 w-6" />
              管理員管理
            </router-link>
            
            <router-link
              v-if="authStore.canViewCarts"
              to="/admin/carts"
              active-class="bg-gray-900 text-white"
              class="text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md"
            >
              <ShoppingCartIcon class="text-gray-400 mr-3 h-6 w-6" />
              購物車管理
            </router-link>
          </nav>
        </div>
      </div>

      <!-- Main content -->
      <div class="pl-64 flex flex-col flex-1">
        <div class="sticky top-0 z-10 bg-white shadow">
          <div class="flex justify-between h-16 px-4">
            <div class="flex items-center">
              <h2 class="text-lg font-medium text-gray-900">
                {{ pageTitle }}
              </h2>
            </div>
            
            <div class="flex items-center space-x-4">
              <div class="relative">
                <Menu as="div" class="relative inline-block text-left">
                  <div>
                    <MenuButton class="flex items-center text-sm rounded-full bg-gray-100 p-2 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                      <UserIcon class="h-5 w-5 text-gray-500" />
                      <span class="ml-2 text-sm text-gray-700">
                        {{ authStore.user?.username || 'Admin' }}
                      </span>
                    </MenuButton>
                  </div>

                  <transition
                    enter-active-class="transition ease-out duration-100"
                    enter-from-class="transform opacity-0 scale-95"
                    enter-to-class="transform opacity-100 scale-100"
                    leave-active-class="transition ease-in duration-75"
                    leave-from-class="transform opacity-100 scale-100"
                    leave-to-class="transform opacity-0 scale-95"
                  >
                    <MenuItems class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div class="py-1">
                        <MenuItem v-slot="{ active }">
                          <router-link
                            to="/user"
                            :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']"
                          >
                            前台首頁
                          </router-link>
                        </MenuItem>
                        <MenuItem v-slot="{ active }">
                          <button
                            @click="handleLogout"
                            :class="[active ? 'bg-gray-100' : '', 'block w-full text-left px-4 py-2 text-sm text-gray-700']"
                          >
                            登出
                          </button>
                        </MenuItem>
                      </div>
                    </MenuItems>
                  </transition>
                </Menu>
              </div>
            </div>
          </div>
        </div>

        <main class="flex-1 p-6">
          <RouterView />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  TagIcon, 
  DocumentTextIcon, 
  UsersIcon,
  UserGroupIcon,
  UserIcon,
  ShoppingCartIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const pageTitle = computed(() => {
  switch (route.name) {
    case 'AdminDashboard':
      return '儀表板'
    case 'AdminProducts':
      return '商品管理'
    case 'AdminCategories':
      return '分類管理'
    case 'AdminOrders':
      return '訂單管理'
    case 'AdminMembers':
      return '會員管理'
    case 'AdminUsers':
      return '管理員管理'
    case 'AdminCarts':
      return '購物車管理'
    default:
      return '管理後台'
  }
})

const handleLogout = () => {
  authStore.logout()
  router.push('/auth/login')
}
</script>