export interface NavigationItem {
	name: string
	path: string
	icon?: string
	leaveApp?: boolean
}

export const navigationItems: NavigationItem[] = [
	{ name: "Home", path: "/", icon: "md-homefilled" },
	{ name: "Effects", path: "/effects", icon: "gi-spotted-mushroom" },
	{ name: "Settings", path: "/settings", icon: "io-settings", leaveApp: true },
]
