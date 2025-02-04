<script setup lang="ts">
import MobileActionsBar from "@/components/MobileActionsBar.vue"
import SidebarItem from "@/components/SidebarItem.vue"
import WledCanvasDrawer from "@/components/WledCanvasDrawer.vue"
</script>

<template>
	<div class="flex w-full flex-col-reverse overflow-hidden pb-16 md:h-screen md:pb-0 lg:flex-row">
		<div class="w-full p-6 md:items-center md:justify-center">
			<WledCanvasDrawer />
		</div>

		<SidebarItem />

		<MobileActionsBar />
	</div>
</template>
