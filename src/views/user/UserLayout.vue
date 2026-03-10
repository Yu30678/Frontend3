<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-900">購物商城</h1>
            </div>
            <nav class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link
                to="/user"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium"
                :class="$route.name === 'UserHome' 
                  ? 'border-primary-500 text-gray-900 border-b-2' 
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'"
              >
                首頁
              </router-link>
              <router-link
                to="/user/products"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium"
                :class="$route.name === 'UserProducts' 
                  ? 'border-primary-500 text-gray-900 border-b-2' 
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'"
              >
                商品列表
              </router-link>
              <router-link
                to="/user/minio"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium"
                :class="$route.name === 'UserMiniO'
                  ? 'border-primary-500 text-gray-900 border-b-2'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'"
              >
                MiniO
              </router-link>
            </nav>
          </div>
          
          <div class="flex items-center space-x-4">
            <router-link
              v-if="authStore.isAuthenticated"
              to="/user/cart"
              class="relative p-2 text-gray-500 hover:text-gray-700"
            >
              <ShoppingCartIcon class="h-6 w-6" />
              <span
                v-if="cartStore.itemCount > 0"
                class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
              >
                {{ cartStore.itemCount }}
              </span>
            </router-link>

            <div v-if="authStore.isAuthenticated" class="relative">
              <Menu as="div" class="relative inline-block text-left">
                <div>
                  <MenuButton class="flex items-center text-sm rounded-full bg-gray-100 p-2 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    <UserIcon class="h-5 w-5 text-gray-500" />
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
                  <MenuItems class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div class="py-1">
                      <MenuItem v-slot="{ active }">
                        <router-link
                          to="/user/profile"
                          :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']"
                        >
                          個人資料
                        </router-link>
                      </MenuItem>
                      <MenuItem v-slot="{ active }">
                        <router-link
                          to="/user/orders"
                          :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']"
                        >
                          訂單記錄
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

            <div v-else class="space-x-2">
              <router-link
                to="/auth/login"
                class="text-primary-600 hover:text-primary-500 text-sm font-medium"
              >
                登入
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { ShoppingCartIcon, UserIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

onMounted(() => {
  if (authStore.isAuthenticated && authStore.isMember) {
    cartStore.fetchCart()
  }
})

const handleLogout = () => {
  authStore.logout()
  router.push('/auth/login')
}
</script>