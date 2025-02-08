<script setup lang="ts">
import { classNames } from "@/lib/class-names.ts"

const props = defineProps<{
	class?: string
}>()
</script>

<template>
	<hr :class="classNames('w-full border-neutral-700', props.class)" />
</template>

<style scoped></style>
