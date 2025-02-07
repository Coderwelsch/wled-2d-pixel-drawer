<script setup lang="ts">
import ColorItem from "@/components/ColorItem.vue"
import { COLOR_PRESETS } from "@/lib/constants.ts"
import { useLedStripStore } from "@/stores/led-strip.ts"
import { computed } from "vue"

const props = defineProps<{
	class?: string
}>()

const ledStripStore = useLedStripStore()
const drawingColor = computed(() => ledStripStore.settings.drawingColor)
</script>

<template>
	<div
		:class="{
			'vertical-scroll-fade-container w-full': true,
			[props.class || '']: !!props.class,
		}"
	>
		<div class="flex w-full flex-row flex-nowrap gap-2 overflow-x-scroll">
			<ColorItem :color="drawingColor" :name="drawingColor" active />

			<ColorItem v-for="preset in COLOR_PRESETS" :key="preset.color" :color="preset.color" :name="preset.name" />
		</div>
	</div>
</template>

<style>
.vertical-scroll-fade-container {
	position: relative;

	&::after {
		position: absolute;
		top: 0;
		right: 0;
		z-index: 1;

		content: "";

		width: 2rem;
		height: 100%;
		background: linear-gradient(to right, rgba(23, 23, 23, 0), #171717);
	}
}
</style>
