import "vue-toast-notification/dist/theme-bootstrap.css"
import { createPinia } from "pinia"
import { createApp } from "vue"
import ToastPlugin from "vue-toast-notification"
import { OhVueIcon, addIcons } from "oh-vue-icons"
import { MdHomefilled } from "oh-vue-icons/icons"
import { GiSpottedMushroom } from "oh-vue-icons/icons"

import "./styles/global.css"
import App from "./App.vue"
import router from "./router"

const app = createApp(App)

addIcons(MdHomefilled, GiSpottedMushroom)

app.use(createPinia())
app.component("v-icon", OhVueIcon)

app.use(router)
app.use(ToastPlugin, {
	position: "top",
})

app.mount("#app")
