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
		<slot />
	</button>
</template>

<script setup lang="ts">
import { defineEmits, defineProps } from "vue"

const baseClasses =
	"inline-flex items-center justify-center focus:outline-none transition ease-in-out duration-150 rounded-lg font-bold cursor-pointer"

const sizeClasses = {
	sm: "px-2.5 py-1.5 text-xs",
	md: "px-4 py-2 text-sm",
	lg: "yxpx-6 py-3 text-lg",
}
const variantClasses = {
	primary: "bg-blue-500 text-white hover:bg-blue-600",
	secondary: "bg-gray-500 text-white hover:bg-gray-600",
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
