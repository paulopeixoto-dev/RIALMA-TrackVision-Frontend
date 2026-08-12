import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import DashboardPage from '@/pages/DashboardPage.vue'
import EdgeNodesPage from '@/pages/EdgeNodesPage.vue'
import ForbiddenPage from '@/pages/ForbiddenPage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import LocationsPage from '@/pages/LocationsPage.vue'
import NotFoundPage from '@/pages/NotFoundPage.vue'
import PermissionsPage from '@/pages/PermissionsPage.vue'
import RolesPage from '@/pages/RolesPage.vue'
import UsersPage from '@/pages/UsersPage.vue'
import VehiclesPage from '@/pages/VehiclesPage.vue'
import { useAuthStore } from '@/stores/authStore'

const camerasRoute = { template: '<section><h1>Cameras</h1></section>' }
const cameraPairsRoute = { template: '<section><h1>Pares de Cameras</h1></section>' }

export function createAppRouter() {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/login',
        name: 'login',
        component: LoginPage,
      },
      {
        path: '/',
        component: AdminLayout,
        meta: { requiresAuth: true },
        children: [
          {
            path: '',
            redirect: '/dashboard',
          },
          {
            path: 'dashboard',
            name: 'dashboard',
            component: DashboardPage,
          },
          {
            path: 'users',
            name: 'users',
            component: UsersPage,
            meta: { permission: 'users.manage' },
          },
          {
            path: 'roles',
            name: 'roles',
            component: RolesPage,
            meta: { permission: 'permissions.manage' },
          },
          {
            path: 'permissions',
            name: 'permissions',
            component: PermissionsPage,
            meta: { permission: 'permissions.manage' },
          },
          {
            path: 'vehicles',
            name: 'vehicles',
            component: VehiclesPage,
            meta: { permission: 'vehicles.manage' },
          },
          {
            path: 'locations',
            name: 'locations',
            component: LocationsPage,
            meta: { permission: 'cameras.manage' },
          },
          {
            path: 'edge-nodes',
            name: 'edge-nodes',
            component: EdgeNodesPage,
            meta: { permission: 'cameras.manage' },
          },
          {
            path: 'cameras',
            name: 'cameras',
            component: camerasRoute,
            meta: { permission: 'cameras.manage' },
          },
          {
            path: 'camera-pairs',
            name: 'camera-pairs',
            component: cameraPairsRoute,
            meta: { permission: 'cameras.manage' },
          },
        ],
      },
      {
        path: '/forbidden',
        name: 'forbidden',
        component: ForbiddenPage,
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: NotFoundPage,
      },
    ],
  })

  router.beforeEach((to) => {
    const authStore = useAuthStore()
    authStore.restoreSession()

    if (to.name === 'login' && authStore.isAuthenticated) {
      return { name: 'dashboard' }
    }

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }

    const permission = to.meta.permission as string | undefined
    if (permission && !authStore.can(permission)) {
      return { name: 'forbidden' }
    }

    return true
  })

  return router
}
