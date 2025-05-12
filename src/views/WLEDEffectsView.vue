<script setup lang="ts">
import ButtonItem from "@/components/ButtonItem.vue"
import HorizontalDivider from "@/components/HorizontalDivider.vue"
import NavigationItem from "@/components/NavigationItem.vue"
import VibrantHeadline from "@/components/VibrantHeadline.vue"
import { navigationItems } from "@/lib/navigation-items.ts"
import { WLED_EFFECTS_2D } from "@/lib/wled-effects-2d.ts"
import { useLedStripStore } from "@/stores/led-strip.ts"
import { computed, onMounted } from "vue"

const ledStripStore = useLedStripStore()

// reset effect to null on mount
onMounted(() => {
	ledStripStore.setEffect(null)
})

const selectedEffectName = computed(() => {
	return WLED_EFFECTS_2D.find((effect) => effect.id === ledStripStore.settings.effect)?.name
})
</script>

<template>
	<div class="flex flex-col gap-6 p-6 md:h-auto md:overflow-y-scroll md:bg-neutral-800">
		<div class="mx-auto flex w-full max-w-md flex-col items-center justify-center text-center">
			<VibrantHeadline class="mx-auto -mb-4 w-full max-w-xs">PIXEL DIS/PLAY</VibrantHeadline>

			<NavigationItem :items="navigationItems" />
		</div>

		<HorizontalDivider />

		<p
			v-if="ledStripStore.settings.effect === null"
			class="sticky top-0 bg-neutral-900 py-2 text-center text-sm text-neutral-400"
		>
			Select an effect
		</p>
		<p v-else class="sticky top-0 bg-neutral-900 py-2 text-center text-sm text-neutral-400">
			Effect: <span class="font-semibold">{{ selectedEffectName }}</span>
		</p>

		<div class="flex flex-col gap-3">
			<ButtonItem
				v-for="(item, index) in WLED_EFFECTS_2D"
				:key="index"
				type="button"
				size="md"
				:variant="ledStripStore.settings.effect === item.id ? 'primary' : 'minimal'"
				@click="ledStripStore.setEffect(item.id)"
			>
				{{ item.name }}
			</ButtonItem>
		</div>
	</div>
</template>
