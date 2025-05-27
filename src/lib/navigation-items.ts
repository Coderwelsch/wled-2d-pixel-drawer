export interface NavigationItem {
	name: string
	path: string
	icon?: string
}

export const navigationItems: NavigationItem[] = [
	{ name: "Home", path: "/", icon: "md-homefilled" },
	{ name: "Effects", path: "/effects", icon: "gi-spotted-mushroom" },
]
