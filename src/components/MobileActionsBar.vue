<script setup lang="ts">
import ButtonItem from "@/components/ButtonItem.vue"
import FieldSet from "@/components/FieldSet.vue"
import IconTrashBinSharp from "@/components/icons/IconTrashBinSharp.vue"
import { useLedStripStore } from "@/stores/led-strip.ts"
import { onMounted, ref } from "vue"

const ledStripStore = useLedStripStore()

const popupContainer = ref<HTMLDivElement | null>(null)
const isColorPickerVisible = ref(false)
const buttonItemRef = ref<HTMLButtonElement | null>(null)

const toggleColorPicker = (event: MouseEvent) => {
	event.preventDefault()

	isColorPickerVisible.value = !isColorPickerVisible.value
}

const handleClickOutside = (event: MouseEvent) => {
	if (!popupContainer.value) {
		return
	}

	if (!buttonItemRef.value) {
		return
	}

	const buttonElem = document.getElementById("colorButton")
	const popupElem = document.getElementById("colorPicker")

	if (event.target === buttonElem) {
		return
	}

	if (popupElem && !popupElem.contains(event.target as Node)) {
		isColorPickerVisible.value = false
	}
}

onMounted(() => {
	// check if click is outside of popup to close it
	window.addEventListener("click", handleClickOutside)

	return () => {
		window.removeEventListener("click", handleClickOutside)
	}
})
</script>

<template>
	<div
		v-if="isColorPickerVisible"
		id="colorPicker"
		class="fixed right-0 bottom-24 left-0 z-[99999] flex h-full max-h-[10rem] flex-col items-center justify-center rounded-md px-2 pb-6"
		ref="popupContainer"
	>
		<div class="w-full rounded-md border-1 border-neutral-400 bg-neutral-900 p-2">
			<FieldSet
				class="w-full"
				id="color"
				:value="ledStripStore.settings.drawingColor"
				@change="(value) => (ledStripStore.settings.drawingColor = value)"
				label="Color"
				type="color"
			/>
		</div>
	</div>

	<div class="fixed right-0 bottom-0 left-0 z-50 flex flex-row justify-center gap-4 bg-neutral-900 p-4 md:hidden">
		<ButtonItem type="button" variant="danger" size="md" @click="ledStripStore.reset()">
			<slot name="iconBefore">
				<IconTrashBinSharp class="h-4 w-4" />
			</slot>
			<slot name="default">Clear</slot>
		</ButtonItem>

		<ButtonItem
			id="colorButton"
			ref="buttonItemRef"
			type="text"
			variant="primary"
			size="md"
			@click="toggleColorPicker"
		>
			Color
		</ButtonItem>
	</div>
</template>
