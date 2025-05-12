<script setup lang="ts">
import { useRoute, useRouter } from "vue-router"

interface NavigationItem {
	name: string
	path: string
	icon?: string
}

defineProps<{
	items?: NavigationItem[]
}>()

const route = useRoute()
const router = useRouter()

const isActive = (path: string) => {
	return route.path === path
}
</script>

<template>
	<nav class="flex w-full items-center justify-center gap-2">
		<div v-for="item in items" :key="item.path" class="relative">
			<button
				@click="router.push(item.path)"
				:class="[
					'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
					isActive(item.path)
						? 'bg-blue-500/75 text-white'
						: 'bg-neutral-800 text-gray-300 hover:bg-neutral-700 hover:text-white',
				]"
			>
				{{ item.name }}
			</button>
		</div>
	</nav>
</template>
