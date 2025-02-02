import { generateSerpentineData } from '@/lib/generate-serpentine-data.ts'
import { getLocalStorage, setLocalStorage } from '@/lib/local-storage.ts'
import { useWebSocket } from '@/lib/web-socket.ts'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { defineStore } from 'pinia'
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
  const baseWebSocketUrl = `http://${window.location.hostname}:${window.location.port || '80'}`

  const localStorageSettings = getLocalStorage<LedStripStore>(SETTINGS_STORAGE_KEY, {
    brightness: 30,
    websocketUrl: baseWebSocketUrl,
    drawingColor: '#FF0000',
    scale: 32,
    cols: 7,
    rows: 12,
  })

  const localStoragePixelData = getLocalStorage<GridPixelData>(PIXEL_DATA_STORAGE_KEY, {})
  const settings = ref<LedStripStore>(localStorageSettings)
  const pixelData = ref<GridPixelData>(localStoragePixelData)

  const { ws: websocket } = useWebSocket(settings.value.websocketUrl, true)
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
    if (!websocket.value || websocket.value.readyState !== WebSocket.OPEN) {
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
        // TODO: remove
        i: transformedData.slice(0, 40),
      },
    }

    isLoading.value = true
    startTime.value = performance.now()
    websocket.value.send(JSON.stringify(payload))

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

  const initWebSocket = () => {
    const hostname = settings.value.websocketUrl.replace('http://', '').replace('https://', '')

    websocket.value = new WebSocket(`ws://${hostname}/ws`)

    websocket.value.onopen = () => {
      console.log('WebSocket Opened')
    }

    websocket.value.onmessage = (event) => {
      isLoading.value = false

      const data = JSON.parse(event.data)

      if (data.error) {
        toast.error(`Error: ${data.error}`, {
          position: 'top',
        })
      }

      console.log('Time taken to send data:', performance.now() - startTime.value)
    }

    websocket.value.onerror = (error) => {
      isLoading.value = false

      console.error('WebSocket Error:', error)
      toast.error('WebSocket connection error. Reconnecting …', {
        position: 'top',
      })
    }

    websocket.value.onclose = () => {
      isLoading.value = false

      console.log('WebSocket Closed')

      toast.error('WebSocket connection closed. Reconnecting …', {
        position: 'top',
      })
    }
  }

  onMounted(() => {
    reset()
    initWebSocket()
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
