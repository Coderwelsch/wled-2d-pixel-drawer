<script setup lang="ts">
import { useLedStripStore } from '@/stores/led-strip.ts'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const ledStripStore = useLedStripStore()

const isDrawing = ref(false)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const context = ref<CanvasRenderingContext2D | null>(null)

const containerRef = ref<HTMLDivElement | null>(null)

const scaleFactor = computed(() => {
  if (!containerRef.value) {
    return ledStripStore.settings.scale
  }

  return Math.min(
    containerRef.value?.clientWidth / ledStripStore.settings.cols,
    containerRef.value?.clientHeight / ledStripStore.settings.rows,
  )
})

const startDrawing = () => {
  if (context.value) {
    isDrawing.value = true
  }
}

const drawPixelGrid = () => {
  if (!context.value) {
    console.error('Context not found')
    return
  }

  for (let y = 0; y < ledStripStore.settings.rows; y++) {
    for (let x = 0; x < ledStripStore.settings.cols; x++) {
      const color = ledStripStore.pixelData[y][x]

      context.value.fillStyle = color
      context.value.fillRect(
        x * scaleFactor.value,
        y * scaleFactor.value,
        scaleFactor.value,
        scaleFactor.value,
      )
    }
  }
}

const handleDrawing = (event: MouseEvent | TouchEvent) => {
  if (!canvasRef.value) {
    console.error('Canvas not found')
    return
  }

  let offsetX = 0
  let offsetY = 0

  const isTouch = 'TouchEvent' in window && event instanceof window.TouchEvent

  if (isTouch) {
    event.preventDefault()

    if (event.touches.length > 1) {
      return
    }

    const touch = event.touches[0]

    offsetX = touch.clientX - canvasRef.value.getBoundingClientRect().left
    offsetY = touch.clientY - canvasRef.value.getBoundingClientRect().top
  } else {
    offsetX = (event as MouseEvent).offsetX
    offsetY = (event as MouseEvent).offsetY
  }

  if (isDrawing.value && context.value) {
    const x = Math.floor(offsetX / scaleFactor.value)
    const y = Math.floor(offsetY / scaleFactor.value)

    ledStripStore.setPixel(x, y)
  }
}

const clearCanvas = () => {
  if (context.value && canvasRef.value) {
    context.value.fillStyle = '#000000'
    context.value.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  }
}

const drawGridLines = () => {
  if (context.value) {
    context.value.strokeStyle = '#FFFFFF55'
    context.value.lineWidth = 1

    for (let x = 0; x <= ledStripStore.settings.cols; x++) {
      context.value.beginPath()
      context.value.moveTo(x * scaleFactor.value, 0)
      context.value.lineTo(x * scaleFactor.value, ledStripStore.settings.rows * scaleFactor.value)
      context.value.stroke()
      context.value.closePath()
    }

    for (let y = 0; y <= ledStripStore.settings.rows; y++) {
      context.value.beginPath()
      context.value.moveTo(0, y * scaleFactor.value)
      context.value.lineTo(ledStripStore.settings.cols * scaleFactor.value, y * scaleFactor.value)
      context.value.stroke()
      context.value.closePath()
    }
  } else {
    console.error('Context not found')
  }
}

const stopDrawing = () => {
  if (isDrawing.value && context.value) {
    isDrawing.value = false
  }
}

const resizeCanvasToFitView = () => {
  if (containerRef.value && canvasRef.value) {
    const containerWidth = containerRef.value.clientWidth
    const containerHeight = containerRef.value.clientHeight

    const canvasWidth = ledStripStore.settings.cols * scaleFactor.value
    const canvasHeight = ledStripStore.settings.rows * scaleFactor.value

    const scale = Math.min(containerWidth / canvasWidth, containerHeight / canvasHeight)

    canvasRef.value.style.width = `${canvasWidth * scale}px`
    canvasRef.value.style.height = `${canvasHeight * scale}px`
  }
}

const draw = () => {
  clearCanvas()
  drawPixelGrid()
  drawGridLines()

  requestAnimationFrame(draw)
}

onMounted(() => {
  if (containerRef.value) {
    resizeCanvasToFitView()
    window.addEventListener('resize', resizeCanvasToFitView)
  }

  if (canvasRef.value) {
    canvasRef.value.addEventListener('click', handleDrawing)
    canvasRef.value.addEventListener('mousedown', startDrawing)
    canvasRef.value.addEventListener('mousemove', handleDrawing)
    canvasRef.value.addEventListener('mouseup', stopDrawing)
    canvasRef.value.addEventListener('mouseleave', stopDrawing)

    // mobile events
    canvasRef.value.addEventListener('touchstart', startDrawing)
    canvasRef.value.addEventListener('touchmove', handleDrawing)
    canvasRef.value.addEventListener('touchend', stopDrawing)

    context.value = canvasRef.value.getContext('2d')

    // init render loop
    draw()
  } else {
    console.error('Canvas not found')
  }
})

onBeforeUnmount(() => {
  if (containerRef.value) {
    window.removeEventListener('resize', resizeCanvasToFitView)
  }

  if (canvasRef.value) {
    canvasRef.value.removeEventListener('mousedown', startDrawing)
    canvasRef.value.removeEventListener('mousemove', handleDrawing)
    canvasRef.value.removeEventListener('mouseup', stopDrawing)
    canvasRef.value.removeEventListener('mouseleave', stopDrawing)
  }
})
</script>

<template>
  <div
    class="flex flex-row justify-center items-center gap-4 py-8 w-full h-full"
    ref="containerRef"
  >
    <canvas
      ref="canvasRef"
      id="canvas"
      :width="ledStripStore.settings.cols * scaleFactor"
      :height="ledStripStore.settings.rows * scaleFactor"
      class="border border-black bg-black"
      :style="{
        width: ledStripStore.settings.cols * scaleFactor + 'px',
        height: ledStripStore.settings.rows * scaleFactor + 'px',
      }"
    />
  </div>
</template>
