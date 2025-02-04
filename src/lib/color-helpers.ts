const hexToRgb = (hex: string) => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)

	if (!result) {
		return null
	}

	return {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16),
	}
}

export const getHighContrastColor = (color: string) => {
	const rgb = hexToRgb(color)

	if (!rgb) {
		return "#FFFFFF"
	}

	const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
	return yiq >= 128 ? "#000000" : "#FFFFFF"
}
