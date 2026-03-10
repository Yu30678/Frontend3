import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/user'
    },
    {
      path: '/auth',
      name: 'Auth',
      component: () => import('@/views/auth/AuthLayout.vue'),
      children: [
        {
          path: 'login',
          name: 'Login',
          component: () => import('@/views/auth/LoginView.vue')
        },
        {
          path: 'register',
          name: 'Register',
          component: () => import('@/views/auth/RegisterView.vue')
        }
      ]
    },
    {
      path: '/user',
      name: 'User',
      component: () => import('@/views/user/UserLayout.vue'),
      children: [
        {
          path: '',
          name: 'UserHome',
          component: () => import('@/views/user/HomeView.vue')
        },
        {
          path: 'products',
          name: 'UserProducts',
          component: () => import('@/views/user/ProductsView.vue')
        },
        {
          path: 'minio',
          name: 'UserMiniO',
          component: () => import('@/views/user/MiniOView.vue')
        },
        {
          path: 'cart',
          name: 'UserCart',
          component: () => import('@/views/user/CartView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'orders',
          name: 'UserOrders',
          component: () => import('@/views/user/OrdersView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'profile',
          name: 'UserProfile',
          component: () => import('@/views/user/ProfileView.vue'),
          meta: { requiresAuth: true }
        }
      ]
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('@/views/admin/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'AdminDashboard',
          component: () => import('@/views/admin/DashboardView.vue')
        },
        {
          path: 'products',
          name: 'AdminProducts',
          component: () => import('@/views/admin/ProductsView.vue'),
          meta: { requiresPermission: 'canViewProducts' }
        },
        {
          path: 'categories',
          name: 'AdminCategories',
          component: () => import('@/views/admin/CategoriesView.vue'),
          meta: { requiresPermission: 'canViewCategories' }
        },
        {
          path: 'orders',
          name: 'AdminOrders',
          component: () => import('@/views/admin/OrdersView.vue'),
          meta: { requiresPermission: 'canViewOrders' }
        },
        {
          path: 'members',
          name: 'AdminMembers',
          component: () => import('@/views/admin/MembersView.vue'),
          meta: { requiresPermission: 'canViewMembers' }
        },
        {
          path: 'users',
          name: 'AdminUsers',
          component: () => import('@/views/admin/UsersView.vue'),
          meta: { requiresPermission: 'canAccessUsersPage' }
        },
        {
          path: 'carts',
          name: 'AdminCarts',
          component: () => import('@/views/admin/CartsView.vue'),
          meta: { requiresPermission: 'canViewCarts' }
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 初始化認證狀態
  authStore.initAuth()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/auth/login')
    return
  }
  
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/user')
    return
  }
  
  // 檢查特定權限
  if (to.meta.requiresPermission && authStore.isAdmin) {
    const permissionKey = to.meta.requiresPermission as keyof typeof authStore
    const hasPermission = authStore[permissionKey]
    
    if (!hasPermission) {
      // 沒有權限，重定向到儀表板
      next('/admin')
      return
    }
  }
  
  if (to.path === '/auth/login' && authStore.isAuthenticated) {
    next(authStore.isAdmin ? '/admin' : '/user')
    return
  }
  
  next()
})

export default router