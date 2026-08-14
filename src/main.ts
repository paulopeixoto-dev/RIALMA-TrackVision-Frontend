import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createVuestic } from 'vuestic-ui'
import 'vuestic-ui/css'
import App from './App.vue'
import { vuesticGlobalConfig } from './app/vuestic'
import { createAppRouter } from './router'
import './styles/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(createAppRouter())
app.use(createVuestic(vuesticGlobalConfig))
app.mount('#app')
