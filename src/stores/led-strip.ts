import { generateSerpentineData } from "@/lib/generate-serpentine-data.ts"
import { getLocalStorage, setLocalStorage } from "@/lib/local-storage.ts"
import { defineStore } from "pinia"
import { onMounted, ref, watch } from "vue"
import { useToast } from "vue-toast-notification"

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
}

const SETTINGS_STORAGE_KEY = "led-strip-settings"
const PIXEL_DATA_STORAGE_KEY = "led-strip-pixel-data"

export const useLedStripStore = defineStore("led-strip", () => {
	const localStorageSettings = getLocalStorage<LedStripStore>(SETTINGS_STORAGE_KEY, {
		brightness: 30,
		hostname: window.location.hostname,
		drawingColor: "#FF0000",
		scale: 32,
		cols: 30,
		rows: 30,
	})

	const localStoragePixelData = getLocalStorage<GridPixelData>(PIXEL_DATA_STORAGE_KEY, {})
	const settings = ref<LedStripStore>(localStorageSettings)
	const pixelData = ref<GridPixelData>(localStoragePixelData)

	const isLoading = ref(false)
	const startTime = ref(performance.now())

	const toast = useToast()

	const setPixel = (x: number, y: number) => {
		if (!pixelData.value[y]) {
			pixelData.value[y] = {}
		}

		pixelData.value[y][x] = settings.value.drawingColor

		setLocalStorage(PIXEL_DATA_STORAGE_KEY, pixelData.value)
		triggerSync()
	}

	const reset = () => {
		pixelData.value = {}

		for (let y = 0; y < settings.value.rows; y++) {
			for (let x = 0; x < settings.value.cols; x++) {
				if (!pixelData.value[y]) {
					pixelData.value[y] = {}
				}

				pixelData.value[y][x] = "#000000"
			}
		}

		triggerSync()
	}

	const autoUpdaterTimeout = ref<number | null>(null)

	const sendData = async () => {
		if (isLoading.value) {
			console.log("Json Api busy", isLoading.value)
			return
		}

		const apiUrl = `http://${settings.value.hostname}/json`

		const flatData = (
			Object.values(pixelData.value)
				.map((row) => Object.values(row))
				.flat() as string[]
		).map((color: string) => color.replace("#", ""))

		const transformedData = generateSerpentineData(flatData, settings.value.rows, settings.value.cols)

		const payload = {
			on: true,
			bri: settings.value.brightness,
			len: settings.value.cols * settings.value.rows,
			seg: {
				i: transformedData,
			},
		}

		startTime.value = performance.now()
		isLoading.value = true

		await fetch(apiUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then((response) => response.json())
			.catch((error) => {
				console.error("Error:", error)
				toast.error(`Error: ${error}`, {
					position: "top",
				})
			})
			.finally(() => {
				isLoading.value = false

				const size = new Blob([JSON.stringify(payload)]).size
				console.log(`Sent ${size} bytes to server in ${performance.now() - startTime.value}ms`)
			})
	}

	const triggerSync = () => {
		if (autoUpdaterTimeout.value) {
			clearTimeout(autoUpdaterTimeout.value)
		}

		if (isLoading.value) {
			autoUpdaterTimeout.value = setTimeout(() => {
				sendData()
			}, 50) as unknown as number
		} else {
			sendData()
		}
	}

	onMounted(() => {
		reset()
	})

	watch(settings.value, () => {
		setLocalStorage(SETTINGS_STORAGE_KEY, settings.value)
		triggerSync()
	})

	return {
		isLoading,
		settings,
		setPixel,
		pixelData,
		reset,
	}
})
