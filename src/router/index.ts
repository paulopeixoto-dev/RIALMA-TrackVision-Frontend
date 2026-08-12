import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/pages/LoginPage.vue'
import { useAuthStore } from '@/stores/authStore'

const dashboardRoute = { template: '<main><h1>Dashboard</h1></main>' }
const usersRoute = { template: '<main><h1>Usuarios</h1></main>' }
const rolesRoute = { template: '<main><h1>Roles</h1></main>' }
const permissionsRoute = { template: '<main><h1>Permissoes</h1></main>' }
const vehiclesRoute = { template: '<main><h1>Veiculos</h1></main>' }
const locationsRoute = { template: '<main><h1>Locais</h1></main>' }
const edgeNodesRoute = { template: '<main><h1>Edge Nodes</h1></main>' }
const camerasRoute = { template: '<main><h1>Cameras</h1></main>' }
const cameraPairsRoute = { template: '<main><h1>Pares de Cameras</h1></main>' }
const forbiddenRoute = { template: '<main><h1>Acesso negado</h1></main>' }
const notFoundRoute = { template: '<main><h1>Pagina nao encontrada</h1></main>' }

export function createAppRouter() {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/',
        redirect: '/dashboard',
      },
      {
        path: '/login',
        name: 'login',
        component: LoginPage,
      },
      {
        path: '/dashboard',
        name: 'dashboard',
        component: dashboardRoute,
        meta: { requiresAuth: true },
      },
      {
        path: '/users',
        name: 'users',
        component: usersRoute,
        meta: { requiresAuth: true, permission: 'users.manage' },
      },
      {
        path: '/roles',
        name: 'roles',
        component: rolesRoute,
        meta: { requiresAuth: true, permission: 'permissions.manage' },
      },
      {
        path: '/permissions',
        name: 'permissions',
        component: permissionsRoute,
        meta: { requiresAuth: true, permission: 'permissions.manage' },
      },
      {
        path: '/vehicles',
        name: 'vehicles',
        component: vehiclesRoute,
        meta: { requiresAuth: true, permission: 'vehicles.manage' },
      },
      {
        path: '/locations',
        name: 'locations',
        component: locationsRoute,
        meta: { requiresAuth: true, permission: 'cameras.manage' },
      },
      {
        path: '/edge-nodes',
        name: 'edge-nodes',
        component: edgeNodesRoute,
        meta: { requiresAuth: true, permission: 'cameras.manage' },
      },
      {
        path: '/cameras',
        name: 'cameras',
        component: camerasRoute,
        meta: { requiresAuth: true, permission: 'cameras.manage' },
      },
      {
        path: '/camera-pairs',
        name: 'camera-pairs',
        component: cameraPairsRoute,
        meta: { requiresAuth: true, permission: 'cameras.manage' },
      },
      {
        path: '/forbidden',
        name: 'forbidden',
        component: forbiddenRoute,
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: notFoundRoute,
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
