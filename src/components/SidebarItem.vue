<script setup lang="ts">
import ButtonItem from "@/components/ButtonItem.vue"
import ColorItem from "@/components/ColorItem.vue"
import FieldSet from "@/components/FieldSet.vue"
import VibrantHeadline from "@/components/VibrantHeadline.vue"
import { COLOR_PRESETS } from "@/lib/constants.ts"

import { useLedStripStore } from "@/stores/led-strip.ts"

const ledStripStore = useLedStripStore()
</script>

<template>
	<div class="flex flex-col gap-12 p-6 md:h-auto md:overflow-y-scroll md:bg-neutral-800">
		<div class="flex w-full max-w-md flex-col items-center justify-center text-center">
			<VibrantHeadline class="mx-auto h-40 w-full max-w-xs">PIXEL DIS/PLAY</VibrantHeadline>

			<p class="text-md text-neutral-200">Write something on the canvas and see it displayed on the LED strip.</p>
		</div>

		<hr />

		<div class="flex flex-col gap-6">
			<FieldSet
				id="jsonApiUrl"
				:value="ledStripStore.settings.hostname"
				label="IP Address"
				type="text"
				class="font-mono"
				@change="(value) => (ledStripStore.settings.hostname = value)"
			/>

			<FieldSet
				id="brightness"
				:value="ledStripStore.settings.brightness"
				@change="(value) => (ledStripStore.settings.brightness = parseInt(value))"
				label="Brightness"
				type="range"
				min="0"
				max="255"
			/>

			<div class="flex flex-col items-center justify-center gap-2">
				<div class="flex w-full flex-row flex-wrap gap-2">
					<!-- current color -->
					<ColorItem
						:color="ledStripStore.settings.drawingColor"
						:name="ledStripStore.settings.drawingColor"
						active
					/>

					<ColorItem
						v-for="preset in COLOR_PRESETS"
						:key="preset.color"
						:color="preset.color"
						:name="preset.name"
					/>
				</div>

				<FieldSet
					class="hidden w-full md:block"
					id="color"
					:value="ledStripStore.settings.drawingColor"
					@change="(value) => (ledStripStore.settings.drawingColor = value)"
					label="Color"
					type="color"
				/>
			</div>
		</div>

		<ButtonItem class="hidden md:flex" type="button" variant="danger" size="md" @click="ledStripStore.reset()">
			Clear
		</ButtonItem>
	</div>
</template>
