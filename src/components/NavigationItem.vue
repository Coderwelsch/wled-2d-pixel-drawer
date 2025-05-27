<script setup lang="ts">
import type { NavigationItem } from "@/lib/navigation-items.ts"
import { useRoute, useRouter } from "vue-router"

const props = defineProps<{
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
		<div v-for="item in props.items" :key="item.path" class="relative">
			<button
				:disabled="isActive(item.path)"
				@click="
					() => {
						if (item.leaveApp) {
							// @ts-ignore
							window.location.href = item.path
							return
						}

						return router.push(item.path)
					}
				"
				:class="[
					'flex flex-row items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
					isActive(item.path)
						? 'bg-blue-500/75 text-white'
						: 'cursor-pointer bg-neutral-800 text-gray-300 hover:bg-neutral-700 hover:fill-white hover:text-white',
				]"
			>
				<v-icon
					v-if="item.icon"
					:name="item.icon"
					:class="['size-3.5', isActive(item.path) ? 'fill-grey-200' : 'fill-gray-400']"
				/>

				{{ item.name }}
			</button>
		</div>
	</nav>
</template>
