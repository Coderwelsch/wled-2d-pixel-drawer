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

const highContrastColor = computed(() => getHighContrastColor(props.color))
</script>

<template>
	<div
		@click="ledStripStore.settings.drawingColor = props.color"
		:class="{
			'flex h-8 cursor-pointer flex-row items-center gap-1 rounded-md border-2 px-2': true,
			'w-8': !props.active,
			'border-neutral-200/50': props.color !== ledStripStore.settings.drawingColor,
			'border-blue-500': props.color === ledStripStore.settings.drawingColor,
		}"
		:style="{
			backgroundColor: props.color,
		}"
	>
		<span
			v-if="props.active"
			class="font-mono text-sm leading-3"
			:style="{
				color: highContrastColor,
			}"
		>
			{{ ledStripStore.settings.drawingColor }}
		</span>
	</div>
</template>
