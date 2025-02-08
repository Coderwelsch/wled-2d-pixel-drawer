<script setup lang="ts">
import ButtonItem from "@/components/ButtonItem.vue"
import ColorPaletteChooser from "@/components/ColorPaletteChooser.vue"
import FieldSet from "@/components/FieldSet.vue"
import IconTrashBinSharp from "@/components/icons/IconTrashBinSharp.vue"
import UploadImageButton from "@/components/UploadImageButton.vue"
import { useLedStripStore } from "@/stores/led-strip.ts"
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"

const devicePixelRatio = window.devicePixelRatio || 1
const ledStripStore = useLedStripStore()

const drawingColor = computed(() => ledStripStore.settings.drawingColor)
const pixelData = computed(() => ledStripStore.pixelData)

const isDrawing = ref(false)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const context = ref<CanvasRenderingContext2D | null>(null)

const containerRef = ref<HTMLDivElement | null>(null)

const scaleFactor = computed(() => {
	if (!containerRef.value) {
		return ledStripStore.settings.scale
	}

	return Math.min(
		containerRef.value.clientWidth / ledStripStore.settings.cols,
		containerRef.value.clientHeight / ledStripStore.settings.rows,
	)
})

const startDrawing = () => {
	if (context.value) {
		isDrawing.value = true
	}
}

const drawPixelGrid = () => {
	if (!context.value) {
		console.error("Context not found")
		return
	}

	for (let y = 0; y < ledStripStore.settings.rows; y++) {
		for (let x = 0; x < ledStripStore.settings.cols; x++) {
			if (!ledStripStore.pixelData[y] || !ledStripStore.pixelData[y][x]) {
				continue
			}

			const color = ledStripStore.pixelData[y][x]

			context.value.fillStyle = color
			context.value.fillRect(
				x * scaleFactor.value * devicePixelRatio,
				y * scaleFactor.value * devicePixelRatio,
				scaleFactor.value * devicePixelRatio,
				scaleFactor.value * devicePixelRatio,
			)
		}
	}
}

const handleDrawing = (event: MouseEvent | TouchEvent) => {
	if (!canvasRef.value) {
		console.error("Canvas not found")
		return
	}

	let offsetX = 0
	let offsetY = 0

	const isTouch = "TouchEvent" in window && event instanceof window.TouchEvent

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
		context.value.fillStyle = "#000000"
		context.value.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)
	}
}

const drawGridLines = () => {
	if (context.value) {
		context.value.strokeStyle = "#FFFFFF55"
		context.value.lineWidth = 1

		for (let x = 0; x <= ledStripStore.settings.cols; x++) {
			context.value.beginPath()
			context.value.moveTo(x * scaleFactor.value * devicePixelRatio, 0)
			context.value.lineTo(
				x * scaleFactor.value * devicePixelRatio,
				ledStripStore.settings.rows * scaleFactor.value * devicePixelRatio,
			)
			context.value.stroke()
			context.value.closePath()
		}

		for (let y = 0; y <= ledStripStore.settings.rows; y++) {
			context.value.beginPath()
			context.value.moveTo(0, y * scaleFactor.value * devicePixelRatio)
			context.value.lineTo(
				ledStripStore.settings.cols * scaleFactor.value * devicePixelRatio,
				y * scaleFactor.value * devicePixelRatio,
			)
			context.value.stroke()
			context.value.closePath()
		}
	} else {
		console.error("Context not found")
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

const animationFrame = ref<number | null>(null)

const draw = () => {
	clearCanvas()
	drawPixelGrid()
	drawGridLines()

	if (animationFrame.value) {
		cancelAnimationFrame(animationFrame.value)
	}

	animationFrame.value = requestAnimationFrame(draw)
}

watch(
	pixelData.value,
	() => {
		if (context.value) {
			console.log("update canvas due to pixelData change")
			draw()
		} else {
			console.error("Context not found")
		}
	},
	{ deep: true },
)

onMounted(() => {
	if (containerRef.value) {
		resizeCanvasToFitView()
		window.addEventListener("resize", resizeCanvasToFitView)
	}

	if (canvasRef.value) {
		canvasRef.value.addEventListener("click", handleDrawing)
		canvasRef.value.addEventListener("mousedown", startDrawing)
		canvasRef.value.addEventListener("mousemove", handleDrawing)
		canvasRef.value.addEventListener("mouseup", stopDrawing)
		canvasRef.value.addEventListener("mouseleave", stopDrawing)

		// mobile events
		canvasRef.value.addEventListener("touchstart", startDrawing)
		canvasRef.value.addEventListener("touchmove", handleDrawing)
		canvasRef.value.addEventListener("touchend", stopDrawing)

		context.value = canvasRef.value.getContext("2d")

		if (context.value) {
			context.value.scale(devicePixelRatio, devicePixelRatio)
		}

		// init render loop
		draw()
	} else {
		console.error("Canvas not found")
	}
})

onBeforeUnmount(() => {
	if (containerRef.value) {
		window.removeEventListener("resize", resizeCanvasToFitView)
	}

	if (canvasRef.value) {
		canvasRef.value.removeEventListener("mousedown", startDrawing)
		canvasRef.value.removeEventListener("mousemove", handleDrawing)
		canvasRef.value.removeEventListener("mouseup", stopDrawing)
		canvasRef.value.removeEventListener("mouseleave", stopDrawing)
	}
})
</script>

<template>
	<div class="flex w-full flex-col items-center justify-center gap-6 md:h-full" ref="containerRef">
		<div class="flex w-full flex-col gap-3 py-2 md:hidden">
			<FieldSet
				class="mobile-color-picker w-full"
				:value="drawingColor"
				id="color"
				label="Color"
				type="color"
				@change="(value) => (ledStripStore.settings.drawingColor = value as string)"
			/>

			<ColorPaletteChooser />
		</div>

		<hr class="w-full border-neutral-700 md:hidden" />

		<canvas
			ref="canvasRef"
			id="canvas"
			:width="ledStripStore.settings.cols * scaleFactor * devicePixelRatio"
			:height="ledStripStore.settings.rows * scaleFactor * devicePixelRatio"
			class="border border-neutral-500 bg-black"
			:style="{
				width: ledStripStore.settings.cols * scaleFactor + 'px',
				height: ledStripStore.settings.rows * scaleFactor + 'px',
			}"
		/>

		<hr class="w-full border-neutral-700 md:hidden" />

		<div class="flex w-full flex-col justify-between gap-4 sm:flex-row sm:items-center md:hidden">
			<UploadImageButton />

			<ButtonItem type="button" variant="danger" size="md" @click="ledStripStore.reset()">
				<slot name="iconBefore">
					<IconTrashBinSharp class="h-4 w-4" />
				</slot>
				<slot name="default">Clear</slot>
			</ButtonItem>
		</div>
	</div>
</template>

<style>
.mobile-color-picker .vacp-color-space {
	aspect-ratio: 1 / 0.2;
}
</style>
