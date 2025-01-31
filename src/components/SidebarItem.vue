<script setup lang="ts">
import ButtonItem from '@/components/ButtonItem.vue'
import FieldSet from '@/components/FieldSet.vue'
import VibrantHeadline from '@/components/VibrantHeadline.vue'

import { useLedStripStore } from '@/stores/led-strip.ts'

const ledStripStore = useLedStripStore()

const COLOR_PRESETS = [
  {
    color: '#000000',
    name: 'Black',
  },
  {
    color: '#FF0000',
    name: 'Red',
  },
  {
    color: '#00FF00',
    name: 'Green',
  },
  {
    color: '#0000FF',
    name: 'Blue',
  },
  {
    color: '#FFFFFF',
    name: 'White',
  },
]
</script>

<template>
  <div class="h-auto p-6 bg-neutral-800 overflow-y-scroll flex flex-col gap-12">
    <div class="w-full max-w-md flex flex-col justify-center items-center text-center">
      <VibrantHeadline class="w-full max-w-xs mx-auto h-40">PIXEL DIS/PLAY</VibrantHeadline>

      <p class="text-md">
        Use this tool to draw on the led display. Click on the canvas to draw pixels. Use the send
        button to send the data to the LED display.
      </p>
    </div>

    <hr />

    <div class="flex flex-col gap-6">
      <FieldSet
        id="jsonApiUrl"
        :value="ledStripStore.settings.jsonApiUrl"
        label="JSON API URL"
        type="text"
        class="font-mono"
        @change="(value) => (ledStripStore.settings.jsonApiUrl = value)"
      />

      <FieldSet
        id="brightness"
        :value="ledStripStore.settings.brightness"
        @change="(value) => (ledStripStore.settings.brightness = parseInt(value))"
        label="Brightness"
        type="range"
        min="0"
        max="255"
      />

      <div class="flex flex-col gap-2 items-center justify-center">
        <div class="w-full flex flex-row gap-2 flex-wrap">
          <div
            v-for="preset in COLOR_PRESETS"
            :key="preset.color"
            @click="ledStripStore.settings.drawingColor = preset.color"
            class="w-6 h-6 border border-neutral-500 rounded-md cursor-pointer"
            :style="{
              backgroundColor: preset.color,
            }"
          ></div>
        </div>

        <FieldSet
          class="w-full"
          id="color"
          :value="ledStripStore.settings.drawingColor"
          @change="(value) => (ledStripStore.settings.drawingColor = value)"
          label="Color"
          type="color"
        />
      </div>
    </div>

    <ButtonItem type="button" variant="danger" size="md" @click="ledStripStore.reset()"
      >Clear
    </ButtonItem>
  </div>
</template>
