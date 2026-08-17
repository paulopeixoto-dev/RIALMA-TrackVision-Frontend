import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createVuestic } from 'vuestic-ui'
import 'vuestic-ui/css'
import App from './App.vue'
import { vuesticGlobalConfig } from './app/vuestic'
import { createAppRouter } from './router'
import { useAuthStore } from './stores/authStore'
import './styles/main.css'

const app = createApp(App)
const pinia = createPinia()
const router = createAppRouter()

app.use(pinia)
window.addEventListener('trackvision:unauthorized', () => {
  const authStore = useAuthStore()
  authStore.clearSession()

  if (router.currentRoute.value.name !== 'login') {
    void router.replace({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
  }
})
app.use(router)
app.use(createVuestic(vuesticGlobalConfig))
app.mount('#app')
