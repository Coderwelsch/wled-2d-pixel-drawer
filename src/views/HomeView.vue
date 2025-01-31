<script setup lang="ts">
import SidebarItem from '@/components/SidebarItem.vue'
import WledCanvasDrawer from '@/components/WledCanvasDrawer.vue'
</script>

<template>
  <div class="w-screen h-screen overflow-hidden flex flex-row">
    <div class="w-full justify-center items-center">
      <WledCanvasDrawer />
    </div>

    <SidebarItem />
  </div>
</template>
