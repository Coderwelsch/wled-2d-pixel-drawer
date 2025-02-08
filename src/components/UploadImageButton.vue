<script setup lang="ts">
import ButtonItem from "@/components/ButtonItem.vue"
import IconRoundDriverFolderUpload from "@/components/icons/IconRoundDriverFolderUpload.vue"
import { rgbToHex } from "@/lib/color-helpers.ts"
import { useLedStripStore } from "@/stores/led-strip.ts"

const props = defineProps<{
	class?: string
}>()

const ledStripStore = useLedStripStore()

const handleImageChange = (event: Event) => {
	const reader = new FileReader()
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	const file = event.target?.files?.[0]

	reader.onload = (event) => {
		const image = new Image()

		image.onload = () => {
			const tempCanvas = document.createElement("canvas")
			const tempContext = tempCanvas.getContext("2d")

			if (!tempContext) {
				console.error("Context not found")
				return
			}

			tempCanvas.width = ledStripStore.settings.cols
			tempCanvas.height = ledStripStore.settings.rows

			tempContext.drawImage(image, 0, 0, tempCanvas.width, tempCanvas.height)

			const imageData = tempContext.getImageData(0, 0, tempCanvas.width, tempCanvas.height)

			for (let y = 0; y < ledStripStore.settings.rows; y++) {
				for (let x = 0; x < ledStripStore.settings.cols; x++) {
					const index = (y * ledStripStore.settings.cols + x) * 4
					const r = imageData.data[index]
					const g = imageData.data[index + 1]
					const b = imageData.data[index + 2]

					ledStripStore.setPixel(x, y, rgbToHex(r, g, b))
				}
			}
		}

		image.src = event.target?.result as string
	}

	reader.readAsDataURL(file)
}

const handleImageFileUploadButtonClick = () => {
	const input = document.createElement("input")
	input.type = "file"
	input.accept = "image/*"
	input.click()

	input.addEventListener("change", handleImageChange)
}
</script>

<template>
	<ButtonItem
		:class="props.class"
		type="button"
		variant="primary"
		size="md"
		@click="handleImageFileUploadButtonClick"
	>
		<slot name="iconBefore">
			<IconRoundDriverFolderUpload class="h-4 w-4" />
		</slot>

		<slot name="default">Upload image</slot>
	</ButtonItem>
</template>
