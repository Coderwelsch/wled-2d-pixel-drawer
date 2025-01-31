import { onMounted, ref, watch } from 'vue'
import { defineStore } from 'pinia'

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
  jsonApiUrl: string
  drawingColor: string
}

export const useLedStripStore = defineStore('led-strip', () => {
  const settings = ref<LedStripStore>({
    brightness: 30,
    jsonApiUrl: 'http://192.168.178.156/json',
    drawingColor: '#FF0000',
    scale: 32,
    cols: 7,
    rows: 12,
  })

  const pixelData = ref<GridPixelData>({})

  const setPixel = (x: number, y: number) => {
    if (!pixelData.value[y]) {
      pixelData.value[y] = {}
    }

    pixelData.value[y][x] = settings.value.drawingColor

    triggerSync()
  }

  const generateSerpentineData = (colors: string[]) => {
    const data = []

    for (let y = 0; y < settings.value.rows; y++) {
      const row = []

      for (let x = 0; x < settings.value.cols; x++) {
        const color =
          colors[y * settings.value.cols + (y % 2 === 0 ? x : settings.value.cols - x - 1)]
        row.push(color ? color : '#000000')
      }

      data.push(row)
    }

    return data.flat()
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

  const autoUpdaterTimeout = ref<NodeJS.Timeout | null>(null)
  const isLoading = ref(false)

  const sendData = async () => {
    const transformedData = generateSerpentineData(
      Object.values(pixelData.value)
        .map((row) => Object.values(row))
        .flat()
        .map((color) => color.replace('#', '')),
    )

    const payload = {
      on: true,
      bri: settings.value.brightness,
      len: settings.value.cols * settings.value.rows,
      seg: {
        i: transformedData,
      },
    }

    isLoading.value = true

    await fetch(jsonApiUrl.value, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).finally(() => {
      isLoading.value = false
    })
  }

  const triggerSync = () => {
    if (autoUpdaterTimeout.value) {
      clearTimeout(autoUpdaterTimeout.value)
    }

    autoUpdaterTimeout.value = setTimeout(() => {
      sendData()
    }, 150)
  }

  onMounted(() => {
    reset()
  })

  watch(settings.value, () => {
    triggerSync()
  })

  watch(pixelData.value, () => {
    triggerSync()
  })

  return {
    settings,
    setPixel,
    pixelData,
    reset,
  }
})
