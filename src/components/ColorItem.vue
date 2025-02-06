<script setup lang="ts">
import { getHighContrastColor } from "@/lib/color-helpers.ts"
import { useLedStripStore } from "@/stores/led-strip.ts"
import { computed } from "vue"

const ledStripStore = useLedStripStore()

const props = defineProps<{
	color: string
	active?: boolean
	name?: string
}>()

const drawingColor = computed(() => ledStripStore.settings.drawingColor)
const currentColor = computed(() => props.color)
const highContrastColor = computed(() => getHighContrastColor(currentColor.value))
</script>

<template>
	<div
		@click="ledStripStore.settings.drawingColor = currentColor"
		:class="{
			'flex h-8 shrink-0 cursor-pointer flex-row items-center gap-1 rounded-md border-2 px-2': true,
			'w-8': !props.active,
			'border-neutral-200/50': currentColor !== drawingColor,
			'border-blue-500': currentColor === drawingColor,
		}"
		:style="{
			backgroundColor: currentColor,
		}"
	>
		<span
			v-if="props.active"
			class="font-mono text-sm leading-3"
			:style="{
				color: highContrastColor,
			}"
		>
			{{ drawingColor }}
		</span>
	</div>
</template>
