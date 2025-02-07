<script setup lang="ts">
import ButtonItem from "@/components/ButtonItem.vue"
import ColorPaletteChooser from "@/components/ColorPaletteChooser.vue"
import FieldSet from "@/components/FieldSet.vue"
import IconTrashBinSharp from "@/components/icons/IconTrashBinSharp.vue"
import UploadImageButton from "@/components/UploadImageButton.vue"
import VibrantHeadline from "@/components/VibrantHeadline.vue"
import { classNames } from "@/lib/class-names.ts"
import { DISABLE_BRIGHTNESS_CHANGE, DISABLE_HOSTNAME_CHANGE } from "@/lib/constants.ts"

import { useLedStripStore } from "@/stores/led-strip.ts"

const ledStripStore = useLedStripStore()
</script>

<template>
	<div class="flex flex-col gap-12 p-6 md:h-auto md:overflow-y-scroll md:bg-neutral-800">
		<div class="mx-auto flex w-full max-w-md flex-col items-center justify-center text-center">
			<VibrantHeadline class="mx-auto h-40 w-full max-w-xs">PIXEL DIS/PLAY</VibrantHeadline>

			<p class="text-md text-neutral-200">Write something on the canvas and see it displayed on the LED strip.</p>
		</div>

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
				max="255"
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

		<div class="flex flex-col gap-4">
			<UploadImageButton />

			<ButtonItem class="hidden md:flex" type="button" variant="danger" size="md" @click="ledStripStore.reset()">
				<slot name="iconBefore">
					<IconTrashBinSharp class="h-4 w-4" />
				</slot>

				<slot name="default">Clear</slot>
			</ButtonItem>
		</div>
	</div>
</template>
