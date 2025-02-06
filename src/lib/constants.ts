export const IS_DEV = import.meta.env.DEV || false

export const DISABLE_BRIGHTNESS_CHANGE = import.meta.env.VITE_DISABLE_BRIGHTNESS_CHANGE === "true" || false
export const DEFAULT_BRIGHTNESS = import.meta.env.VITE_DEFAUT_BRIGHTNESS || 30

export const DISABLE_HOSTNAME_CHANGE = import.meta.env.VITE_DISABLE_HOSTNAME_CHANGE === "true" || false
export const DEFAULT_HOSTNAME = import.meta.env.VITE_DEFAULT_HOSTNAME || window.location.hostname

export const DEFAULT_COLS = import.meta.env.VITE_MATRIX_WIDTH || 30
export const DEFAULT_ROWS = import.meta.env.VITE_MATRIX_HEIGHT || 30

export const COLOR_PRESETS = [
	{
		color: "#000000",
		name: "Black",
	},
	{
		color: "#FF0000",
		name: "Red",
	},
	{
		color: "#FFA500",
		name: "Orange",
	},
	{
		color: "#FFFF00",
		name: "Yellow",
	},
	{
		color: "#00FF00",
		name: "Green",
	},
	{
		color: "#00FFFF",
		name: "Cyan",
	},
	{
		color: "#0000FF",
		name: "Blue",
	},
	{
		color: "#FF00FF",
		name: "Magenta",
	},
	{
		color: "#FFC0CB",
		name: "Pink",
	},
	{
		color: "#FFFFFF",
		name: "White",
	},
]
