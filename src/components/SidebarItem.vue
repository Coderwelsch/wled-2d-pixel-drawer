<script setup lang="ts">
import ButtonItem from "@/components/ButtonItem.vue"
import ColorPaletteChooser from "@/components/ColorPaletteChooser.vue"
import FieldSet from "@/components/FieldSet.vue"
import HorizontalDivider from "@/components/HorizontalDivider.vue"
import IconTrashBinSharp from "@/components/icons/IconTrashBinSharp.vue"
import NavigationItem from "@/components/NavigationItem.vue"
import UploadImageButton from "@/components/UploadImageButton.vue"
import VibrantHeadline from "@/components/VibrantHeadline.vue"
import { classNames } from "@/lib/class-names.ts"
import { DISABLE_BRIGHTNESS_CHANGE, DISABLE_HOSTNAME_CHANGE } from "@/lib/constants.ts"
import { generateSerpentineData } from "@/lib/generate-serpentine-data.ts"
import { navigationItems } from "@/lib/navigation-items.ts"

import { useLedStripStore } from "@/stores/led-strip.ts"
import { computed } from "vue"

const ledStripStore = useLedStripStore()

const convertedPixelData = computed(() => {
	const flatData = (
		Object.values(ledStripStore.pixelData)
			.map((row) => Object.values(row))
			.flat() as string[]
	).map((color: string) => color.replace("#", ""))

	return generateSerpentineData(flatData, ledStripStore.settings.rows, ledStripStore.settings.cols)
})
</script>

<template>
	<div class="flex flex-col gap-6 p-6 md:bg-neutral-800 lg:h-auto lg:overflow-y-scroll">
		<div class="mx-auto flex w-full max-w-md flex-col items-center justify-center text-center">
			<VibrantHeadline class="mx-auto -mb-4 w-full max-w-xs">PIXEL DIS/PLAY</VibrantHeadline>

			<NavigationItem :items="navigationItems" />
		</div>

		<HorizontalDivider
			:class="classNames(DISABLE_HOSTNAME_CHANGE && DISABLE_BRIGHTNESS_CHANGE ? 'hidden' : null)"
		/>

		<p class="text-md text-center text-neutral-200">
			Write something on the canvas and see it displayed on the LED strip.
		</p>

		<HorizontalDivider />

		<div
			:class="
				classNames(
					'flex flex-col gap-6',
					DISABLE_HOSTNAME_CHANGE && DISABLE_BRIGHTNESS_CHANGE ? 'hidden md:flex' : null,
				)
			"
		>
			<FieldSet
				v-if="DISABLE_HOSTNAME_CHANGE === false"
				id="jsonApiUrl"
				:value="ledStripStore.settings.hostname"
				label="IP Address"
				type="text"
				class="font-mono"
				@change="(value) => (ledStripStore.settings.hostname = value as string)"
			/>

			<FieldSet
				v-if="DISABLE_BRIGHTNESS_CHANGE === false"
				id="brightness"
				:value="ledStripStore.settings.brightness"
				@change="(value) => (ledStripStore.settings.brightness = parseInt(value as string))"
				label="Brightness"
				type="range"
				min="0"
				max="100"
			/>

			<div class="hidden flex-col items-center justify-center gap-2 md:flex">
				<ColorPaletteChooser class="hidden md:flex" />

				<FieldSet
					class="hidden w-full md:block"
					id="color"
					:value="ledStripStore.settings.drawingColor"
					@change="(value) => (ledStripStore.settings.drawingColor = value as string)"
					label="Color"
					type="color"
				/>
			</div>
		</div>

		<HorizontalDivider class="hidden md:block" />

		<div class="hidden flex-col gap-4 md:flex">
			<UploadImageButton />

			<ButtonItem type="button" variant="danger" size="md" @click="ledStripStore.reset()">
				<slot name="iconBefore">
					<IconTrashBinSharp class="h-4 w-4" />
				</slot>

				<slot name="default">Clear</slot>
			</ButtonItem>
		</div>

		<!--	show pixel data for debugging	-->
		<div
			class="code flex h-36 shrink-0 flex-col gap-4 overflow-y-scroll rounded-lg border border-neutral-700 bg-neutral-900 p-4 text-sm whitespace-pre text-neutral-400"
		>
			{{ JSON.stringify(convertedPixelData, null, 4) }}
		</div>
	</div>
</template>
