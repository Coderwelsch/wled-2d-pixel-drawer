import { DISABLE_WLED_EFFECTS, DISABLE_WLED_SETTINGS } from "@/lib/constants.ts"

export interface NavigationItem {
	name: string
	path: string
	icon?: string
	leaveApp?: boolean
}

const navigationItems: NavigationItem[] = [{ name: "Home", path: "/", icon: "md-homefilled" }]

if (!DISABLE_WLED_EFFECTS) {
	navigationItems.push({ name: "Effects", path: "/effects", icon: "gi-spotted-mushroom" })
}

if (!DISABLE_WLED_SETTINGS) {
	navigationItems.push({ name: "Settings", path: "/settings", icon: "io-settings" })
}

export { navigationItems }
