export const setLocalStorage = <Type>(key: string, value: Type) => {
	localStorage.setItem(key, JSON.stringify(value))
}

export const getLocalStorage = <Type>(key: string, defaultValue: Type): Type => {
	const value = localStorage.getItem(key)

	if (!value) {
		return defaultValue
	}

	const parsedValue = JSON.parse(value)

	return {
		...defaultValue,
		...parsedValue,
	}
}

export const isLocalStorageAvailable = () => {
	if (typeof window === "undefined") {
		return false
	}

	return "localStorage" in window
}
