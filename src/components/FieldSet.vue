<script setup lang="ts">
import { ref, defineProps, defineEmits } from "vue"
import { ColorPicker } from "vue-accessible-color-picker"

const baseStyles =
	"border-none text-neutral-50 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"

const inputStyles: Record<"text" | string, string> = {
	text: "bg-neutral-100/10 focus:bg-neutral-100/20 text-neutral-50",
	file: "bg-neutral-100/10 focus:bg-neutral-100/20 text-neutral-50",
}

const props = defineProps({
	id: {
		type: String,
		required: true,
	},
	label: {
		type: String,
		required: true,
	},
	value: {
		type: [String, Number, File, null],
		required: true,
	},
	type: {
		type: String,
		default: "text",
	},
	min: {
		type: [String, Number],
		default: 0,
	},
	max: {
		type: [String, Number],
		default: 100,
	},
	readOnly: {
		type: Boolean,
		default: false,
	},
	class: {
		type: String,
		default: "",
	},
})

const emit = defineEmits<{
	(e: "change", value: string | File | FileList, event: Event): void
}>()

const inputValue = ref(props.value)

const handleChange = (event: Event) => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	emit("change", event.target?.value, event)
}
</script>

<template>
	<fieldset
		:class="{
			'flex flex-col gap-1.5 border-none': true,
			[props.class]: true,
		}"
	>
		<template v-if="type !== 'color' && type !== 'file'">
			<label :for="id" class="text-sm font-bold tracking-widest text-neutral-400 uppercase">
				{{ label }}
			</label>

			<input
				v-if="type !== 'color' && type !== 'file'"
				v-model="inputValue"
				:id="id"
				:type="type"
				:min="min"
				:max="max"
				:readonly="readOnly"
				@change="handleChange"
				@input="handleChange"
				:class="{
					[baseStyles]: true,
					[inputStyles[type]]: true,
				}"
			/>
		</template>

		<template v-if="type === 'file'">
			<label class="text-sm font-bold tracking-widest text-neutral-400 uppercase" :for="id">
				{{ label }}
			</label>

			<input
				type="file"
				:id="id"
				@change="(event) => handleChange(event)"
				:class="{
					[baseStyles]: true,
					[inputStyles.file]: true,
				}"
			/>
		</template>

		<ColorPicker
			v-if="type === 'color'"
			alpha-channel="hide"
			:color="value + 'ff'"
			@color-change="
				(event) => {
					const hexWithoutAlpha = event.colors.hex.slice(0, -2)

					handleChange({
						target: {
							value: hexWithoutAlpha,
						},
					} as unknown as Event)
				}
			"
		/>
	</fieldset>
</template>

<style>
@import url("vue-accessible-color-picker/styles");

:root {
	--vacp-color-background: transparent;
	--vacp-width-color-space: 100%;
	--vacp-slider-track-height: 0.5rem;
}

/* Restyle / hide ColorPicker components */
.vacp-color-space {
	border-radius: 0.25rem;
}

.vacp-color-picker {
	width: 100%;
	padding: 0;

	color: var(--color-neutral-400);
}

.vacp-range-input-label.vacp-range-input-label--alpha,
.vacp-color-inputs,
.vacp-copy-button {
	display: none;
}
</style>
