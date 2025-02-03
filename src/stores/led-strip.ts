import { generateSerpentineData } from '@/lib/generate-serpentine-data.ts'
import { getLocalStorage, setLocalStorage } from '@/lib/local-storage.ts'
import { useWebSocket } from '@/lib/web-socket.ts'
import { defineStore } from 'pinia'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useToast } from 'vue-toast-notification'

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
  websocketUrl: string
  drawingColor: string
}

const SETTINGS_STORAGE_KEY = 'led-strip-settings'
const PIXEL_DATA_STORAGE_KEY = 'led-strip-pixel-data'

export const useLedStripStore = defineStore('led-strip', () => {
  const baseWebSocketUrl = `ws://${window.location.hostname}:${window.location.port || '80'}/ws`

  const localStorageSettings = getLocalStorage<LedStripStore>(SETTINGS_STORAGE_KEY, {
    brightness: 30,
    websocketUrl: baseWebSocketUrl,
    drawingColor: '#FF0000',
    scale: 32,
    cols: 30,
    rows: 30,
  })

  const localStoragePixelData = getLocalStorage<GridPixelData>(PIXEL_DATA_STORAGE_KEY, {})
  const settings = ref<LedStripStore>(localStorageSettings)
  const pixelData = ref<GridPixelData>(localStoragePixelData)

  const { ws: websocket, state: wsState } = useWebSocket({
    url: settings.value.websocketUrl,
    reconnect: true,
  })
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

        pixelData.value[y][x] = '#000000'
      }
    }

    triggerSync()
  }

  const autoUpdaterTimeout = ref<number | null>(null)
  const isLoading = ref(false)

  const sendData = async () => {
    if (wsState.value !== 'OPEN') {
      console.error('WebSocket not initialized')
      return
    }

    const flatData = (
      Object.values(pixelData.value)
        .map((row) => Object.values(row))
        .flat() as string[]
    ).map((color: string) => color.replace('#', ''))

    const transformedData = generateSerpentineData(
      flatData,
      settings.value.rows,
      settings.value.cols,
    )

    const payload = {
      on: true,
      bri: settings.value.brightness,
      len: settings.value.cols * settings.value.rows,
      seg: {
        // TODO: causes {error: 9} issues when payload is too big
        // jumping back to old json api?
        i: transformedData,
      },
    }

    startTime.value = performance.now()
    websocket.value!.send(JSON.stringify(payload))

    // calculate size of data
    const size = new Blob([JSON.stringify(payload)]).size
    console.log(`Data sent to server: ${size} bytes`)
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

  onBeforeUnmount(() => {
    if (websocket.value) {
      websocket.value.close()
    }
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
