import { DEFAULT_BRIGHTNESS, DEFAULT_COLS, DEFAULT_HOSTNAME, DEFAULT_ROWS, IS_DEV } from "@/lib/constants.ts"
import { generateSerpentineData } from "@/lib/generate-serpentine-data.ts"
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

	const setSerpentineMode = (serpentine: boolean) => {
		const bodyParams = new URLSearchParams()
		bodyParams.append("SOMP", "1")
		bodyParams.append("PW", settings.value.cols.toString())
		bodyParams.append("PH", settings.value.rows.toString())
		bodyParams.append("MPH", "1")
		bodyParams.append("MPV", "1")
		bodyParams.append("PB", "0")
		bodyParams.append("PR", "0")
		bodyParams.append("PV", "0")
		bodyParams.append("MPC", "1")
		bodyParams.append("P0B", "0")
		bodyParams.append("P0R", "0")
		bodyParams.append("P0V", "0")
		bodyParams.append("P0W", settings.value.cols.toString())
		bodyParams.append("P0H", settings.value.rows.toString())
		bodyParams.append("P0X", "0")
		bodyParams.append("P0Y", "0")
		bodyParams.append("data", "")

		// to enable serpentine mode, we need to set P0S to "on"
		// to disable it we just need to exclude the property completely, "off" does not work
		if (serpentine) {
			bodyParams.append("P0S", "on")
		}

		// curl 'http://192.168.178.189/settings/2D' -X POST -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:138.0) Gecko/20100101 Firefox/138.0' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' -H 'Accept-Language: de-DE' -H 'Accept-Encoding: gzip, deflate' -H 'Referer: http://192.168.178.189/settings/2D' -H 'Content-Type: application/x-www-form-urlencoded' -H 'Origin: http://192.168.178.189' -H 'DNT: 1' -H 'Connection: keep-alive' -H 'Upgrade-Insecure-Requests: 1' -H 'Sec-GPC: 1' -H 'Priority: u=0, i' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' --data-raw 'SOMP=1&PW=8&PH=8&MPH=1&MPV=1&PB=0&PR=0&PV=0&MPC=1&P0B=0&P0R=0&P0V=0&P0S=on&P0W=30&P0H=30&P0X=0&P0Y=0&data='
		return fetch(`http://${settings.value.hostname}/settings/2D`, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: bodyParams.toString(),
		})
			.then((response) => response.json())
			.catch((error) => {
				console.error("Error:", error)
			})
	}

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
				i: generateSerpentineData(flatData, settings.value.rows, settings.value.cols),
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
		setSerpentineMode,
		pixelData,
		reset,
	}
})
