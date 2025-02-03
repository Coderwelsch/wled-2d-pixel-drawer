<script setup lang="ts">
import SidebarItem from "@/components/SidebarItem.vue"
import WledCanvasDrawer from "@/components/WledCanvasDrawer.vue"
</script>

<template>
	<div class="flex h-screen w-screen flex-col-reverse gap-6 overflow-hidden lg:flex-row lg:gap-0">
		<div class="w-full items-center justify-center">
			<WledCanvasDrawer />
		</div>

		<SidebarItem />
	</div>
</template>
