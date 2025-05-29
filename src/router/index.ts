import { DISABLE_WLED_EFFECTS, DISABLE_WLED_SETTINGS } from "@/lib/constants.ts"
import HomeView from "@/views/HomeView.vue"
import WLEDEffectsView from "@/views/WLEDEffectsView.vue"
import { createRouter, createWebHistory } from "vue-router"

const routerOptions = {
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			name: "home",
			component: HomeView,
		},
	],
}

if (!DISABLE_WLED_EFFECTS) {
	routerOptions.routes.push({
		path: "/effects",
		name: "effects",
		component: WLEDEffectsView,
	})
}

export default createRouter(routerOptions)
