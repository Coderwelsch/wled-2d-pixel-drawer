import 'vue-toast-notification/dist/theme-bootstrap.css'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import ToastPlugin from 'vue-toast-notification'

import './assets/main.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ToastPlugin, {
  position: 'top',
})

app.mount('#app')
