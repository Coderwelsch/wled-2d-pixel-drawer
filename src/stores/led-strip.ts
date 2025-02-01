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
  const baseJsonApiUrl = `http://${window.location.hostname}:${window.location.port || '80'}/json`

  const settings = ref<LedStripStore>({
    brightness: 30,
    jsonApiUrl: baseJsonApiUrl,
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

  const autoUpdaterTimeout = ref<number | null>(null)
  const isLoading = ref(false)

  const sendData = async () => {
    const transformedData = generateSerpentineData(
      (
        Object.values(pixelData.value)
          .map((row) => Object.values(row))
          .flat() as string[]
      ).map((color: string) => color.replace('#', '')),
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

    await fetch(settings.value.jsonApiUrl, {
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
    }, 150) as unknown as number
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
    isLoading,
    settings,
    setPixel,
    pixelData,
    reset,
  }
})
