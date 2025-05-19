<script setup lang="ts">
import ButtonItem from "@/components/ButtonItem.vue"
import HorizontalDivider from "@/components/HorizontalDivider.vue"
import NavigationItem from "@/components/NavigationItem.vue"
import VibrantHeadline from "@/components/VibrantHeadline.vue"
import { navigationItems } from "@/lib/navigation-items.ts"
import { IGNORED_EFFECTS_2D, WLED_EFFECTS_2D } from "@/lib/wled-effects-2d.ts"
import { useLedStripStore } from "@/stores/led-strip.ts"
import { computed, onMounted, ref } from "vue"

const ledStripStore = useLedStripStore()

// reset effect to null on mount
onMounted(() => {
	ledStripStore.setEffect(null)
	ledStripStore.setSerpentineMode(true)
})

const selectedEffectName = computed(() => {
	return WLED_EFFECTS_2D.find((effect) => effect.id === ledStripStore.settings.effect)?.name
})

const fetchEffects = async (): Promise<string[]> => {
	try {
		const response = await fetch(`http://${ledStripStore.settings.hostname}/json/effects`)

		if (!response.ok) {
			throw new Error("Network response was not ok")
		}

		const data = (await response.json()) as string[]
		return data
	} catch (error) {
		console.error("Error fetching effects:", error)
	}

	return [] as string[]
}

const fetchedEffects = ref<typeof WLED_EFFECTS_2D | null>(null)

onMounted(async () => {
	const effects = await fetchEffects()

	const reducedEffects = WLED_EFFECTS_2D.reduce(
		(acc, curr) => {
			const foundEffect = curr.id < effects.length && effects[curr.id]
			const isIgnored = IGNORED_EFFECTS_2D.includes(curr.id)

			if (isIgnored) {
				return acc
			}

			if (foundEffect) {
				acc.push(curr)
			}

			return acc
		},
		[] as typeof WLED_EFFECTS_2D,
	)

	fetchedEffects.value = reducedEffects
})
</script>

<template>
	<div class="flex h-full flex-col gap-6 p-6 md:h-full md:overflow-y-scroll md:bg-neutral-800">
		<div class="mx-auto flex w-full max-w-md flex-col items-center justify-center text-center">
			<VibrantHeadline class="mx-auto -mb-4 w-full max-w-xs">PIXEL DIS/PLAY</VibrantHeadline>

			<NavigationItem :items="navigationItems" />
		</div>

		<HorizontalDivider />

		<p v-if="ledStripStore.settings.effect === null" class="sticky top-0 py-2 text-center text-sm text-neutral-400">
			Select an effect
		</p>
		<p v-else class="sticky top-0 bg-neutral-900 py-2 text-center text-sm text-neutral-400">
			Effect: <span class="font-semibold">{{ selectedEffectName }}</span>
		</p>

		<div v-if="fetchedEffects?.length" class="flex flex-col gap-3">
			<ButtonItem
				v-for="effect in fetchedEffects"
				:key="effect.id"
				type="button"
				size="md"
				:variant="ledStripStore.settings.effect === effect.id ? 'primary' : 'minimal'"
				@click="ledStripStore.setEffect(effect.id)"
			>
				{{ effect.name }}
			</ButtonItem>
		</div>
		<div
			v-else-if="fetchedEffects?.length === 0"
			class="flex w-full items-center justify-center text-center text-neutral-400"
		>
			<p class="text-sm">No effects found</p>
		</div>
		<div v-else class="flex w-full items-center justify-center text-center text-neutral-400">
			<p class="text-sm">Loading effects …</p>

			<svg
				class="h-5 w-5 animate-spin text-neutral-400"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path
					class="opacity-25"
					fill="currentColor"
					d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 2a6 6 0 1 1 0 12A6 6 0 0 1 12 6z"
				/>
				<path
					class="opacity-75"
					fill="currentColor"
					d="M12.04 3.5a8.5 8.5 0 1 1-.08.01A8.5 8.5 0 0 1 12.04 3.5z"
				/>
			</svg>
		</div>
	</div>
</template>
