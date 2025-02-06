<template>
	<button
		:class="{
			// dirty way to merge classes
			[props.class || '']: !!props.class,
			[baseClasses]: true,
			[sizeClasses[props.size]]: true,
			[variantClasses[props.variant]]: true,
			'cursor-not-allowed opacity-50': props.disabled,
		}"
		:disabled="disabled"
		@click="handleClick"
	>
		<span v-if="Boolean(slots.iconBefore)">
			<slot name="iconBefore" class="h-4 w-4" />
		</span>

		<slot name="default" />

		<span v-if="Boolean(slots.iconAfter)">
			<slot name="iconAfter" class="h-4 w-4" />
		</span>
	</button>
</template>

<script setup lang="ts">
import { defineEmits, defineProps } from "vue"

const baseClasses =
	"flex items-center justify-center gap-1.5 focus:outline-none transition ease-in-out duration-150 rounded-lg font-bold cursor-pointer"

const sizeClasses = {
	sm: "px-2.5 py-1.5 text-xs",
	md: "px-3 py-2 text-sm",
	lg: "px-6 py-3 text-lg",
}
const variantClasses = {
	primary: "bg-blue-500 text-white hover:bg-blue-600",
	secondary: "bg-gray-500 text-white hover:bg-gray-600",
	minimal: "bg-transparent text-gray-200 hover:text-gray-400",
	danger: "bg-red-500 text-white hover:bg-red-600",
}

interface ButtonProps {
	class?: string
	type: string
	variant: keyof typeof variantClasses
	size: keyof typeof sizeClasses
	disabled?: boolean
}

const props = defineProps<ButtonProps>()

const slots = defineSlots<{
	default: void
	iconBefore: void
	iconAfter: void
}>()

const emit = defineEmits<{
	(e: "click", event: Event): void
}>()

const handleClick = (event: Event) => {
	if (!props.disabled) {
		emit("click", event)
	}
}
</script>

<style scoped>
/* Add any additional styles if needed */
</style>
