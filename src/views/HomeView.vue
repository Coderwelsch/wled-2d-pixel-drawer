<script setup lang="ts">
import SidebarItem from "@/components/SidebarItem.vue"
import WledCanvasDrawer from "@/components/WledCanvasDrawer.vue"
import { useLedStripStore } from "@/stores/led-strip.ts"
import { onMounted } from "vue"

const ledStripStore = useLedStripStore()

onMounted(() => {
	ledStripStore.setEffect(null)
	ledStripStore.setSerpentineMode(false)
})
</script>

<template>
	<div class="flex w-full flex-col-reverse overflow-hidden pb-16 md:pb-0 lg:h-screen lg:flex-row">
		<div class="w-full p-6 md:items-center md:justify-center">
			<WledCanvasDrawer />
		</div>

		<SidebarItem />
	</div>
</template>
