import { DEFAULT_BRIGHTNESS, DEFAULT_COLS, DEFAULT_HOSTNAME, DEFAULT_ROWS, IS_DEV } from "@/lib/constants.ts"
import { getLocalStorage, setLocalStorage } from "@/lib/local-storage.ts"
import { defineStore } from "pinia"
import { ref, watch } from "vue"

export interface GridPixelData {
	[y: number]: {
		[x: number]: string
	}
}

interface LedStripStore {
	scale: number
	cols: number
	rows: number
	brightness: number
	hostname: string
	drawingColor: string
	effect: number | null
}

const SETTINGS_STORAGE_KEY = "led-strip-settings"
const PIXEL_DATA_STORAGE_KEY = "led-strip-pixel-data"

export const useLedStripStore = defineStore("led-strip", () => {
	const localStorageSettings = getLocalStorage<LedStripStore>(SETTINGS_STORAGE_KEY, {
		brightness: DEFAULT_BRIGHTNESS,
		hostname: DEFAULT_HOSTNAME,
		drawingColor: "#FF0000",
		scale: 32,
		cols: DEFAULT_COLS,
		rows: DEFAULT_ROWS,
		effect: null,
	})

	const localStoragePixelData = getLocalStorage<GridPixelData>(PIXEL_DATA_STORAGE_KEY, {})
	const settings = ref<LedStripStore>(localStorageSettings)
	const pixelData = ref<GridPixelData>(localStoragePixelData)

	const isLoading = ref(false)
	const startTime = ref(performance.now())

	const setPixel = (x: number, y: number, color?: string) => {
		if (!pixelData.value[y]) {
			pixelData.value[y] = {}
		}

		pixelData.value[y][x] = color || settings.value.drawingColor || "#000000"

		setLocalStorage(PIXEL_DATA_STORAGE_KEY, pixelData.value)
		triggerSync()
	}

	const reset = () => {
		pixelData.value = {}
		settings.value.effect = null

		for (let y = 0; y < settings.value.rows; y++) {
			for (let x = 0; x < settings.value.cols; x++) {
				if (!pixelData.value[y]) {
					pixelData.value[y] = {}
				}

				pixelData.value[y][x] = "#000000"
			}
		}

		setLocalStorage(PIXEL_DATA_STORAGE_KEY, pixelData.value)
		triggerSync()
	}

	const autoUpdaterTimeout = ref<number | null>(null)

	const updateLedStrip = async (payload: unknown): Promise<unknown> => {
		if (isLoading.value) {
			console.log("Json Api busy", isLoading.value)
			return Promise.reject()
		}

		startTime.value = performance.now()
		isLoading.value = true

		const apiUrl = `http://${settings.value.hostname}/json`

		return fetch(apiUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			signal: AbortSignal.timeout(1000),
			body: JSON.stringify(payload),
		})
			.then((response) => response.json())
			.catch((error) => {
				console.error("Error:", error)
			})
			.finally(() => {
				isLoading.value = false

				if (IS_DEV) {
					const size = new Blob([JSON.stringify(payload)]).size
					console.log(`Sent ${size} bytes to server in ${performance.now() - startTime.value}ms`)
				}
			})
	}

	const sendPixelData = async () => {
		if (isLoading.value) {
			console.log("Json Api busy", isLoading.value)
			return
		}

		if (settings.value.effect) {
			// if effect is set, we don't need to send pixel data
			return
		}

		const flatData = (
			Object.values(pixelData.value)
				.map((row) => Object.values(row))
				.flat() as string[]
		).map((color: string) => color.replace("#", ""))

		const payload = {
			on: true,
			bri: settings.value.brightness,
			len: settings.value.cols * settings.value.rows,
			seg: {
				i: flatData,
			},
		}

		return updateLedStrip(payload)
	}

	const triggerSync = () => {
		if (autoUpdaterTimeout.value) {
			clearTimeout(autoUpdaterTimeout.value)
		}

		if (isLoading.value) {
			autoUpdaterTimeout.value = setTimeout(() => {
				sendPixelData().catch(() => {
					console.error("Error sending pixel data")
				})
			}, 50) as unknown as number
		} else {
			sendPixelData().catch(() => {
				console.error("Error sending pixel data")
			})
		}
	}

	const setEffect = async (effect: number | null) => {
		// when effect is null, we will only update the state, not the strip
		if (effect === null) {
			settings.value.effect = effect
			return
		}

		// "restart" the strip to remove pixelData
		// to switch to effect mode
		if (!settings.value.effect) {
			await updateLedStrip({
				on: false,
			})
		}

		settings.value.effect = effect

		await updateLedStrip({
			// turn on strip in any case
			on: true,
			seg: {
				fx: effect,
			},
		})
	}

	watch(settings.value, () => {
		setLocalStorage(SETTINGS_STORAGE_KEY, settings.value)
		triggerSync()
	})

	return {
		isLoading,
		settings,
		setPixel,
		setEffect,
		pixelData,
		reset,
	}
})
