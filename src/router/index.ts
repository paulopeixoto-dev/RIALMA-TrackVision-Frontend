import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/pages/LoginPage.vue'

export function createAppRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/',
        redirect: '/login',
      },
      {
        path: '/login',
        name: 'login',
        component: LoginPage,
      },
    ],
  })
}
