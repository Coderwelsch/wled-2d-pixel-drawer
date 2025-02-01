<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { ref, defineProps, defineEmits } from 'vue'
import { ColorPicker } from 'vue-accessible-color-picker'

const baseStyles =
  'border-none rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50'

const inputStyles: Record<'text' | string, string> = {
  text: 'bg-neutral-100/10 focus:bg-neutral-100/20',
}

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  type: {
    type: String,
    default: 'text',
  },
  min: {
    type: [String, Number],
    default: 0,
  },
  max: {
    type: [String, Number],
    default: 100,
  },
  class: {
    type: String,
    default: '',
  },
})

const emit = defineEmits<{
  (e: 'change', value: string): void
}>()

const inputValue = ref(props.value)

const handleChange = (event: {
  target: {
    value: string
  }
}) => {
  emit('change', event.target.value)
}
</script>

<template>
  <fieldset
    :class="{
      'border-none flex flex-col gap-1.5': true,
      [props.class]: true,
    }"
  >
    <label
      v-if="type !== 'color'"
      :for="id"
      class="font-bold text-neutral-50 uppercase text-sm tracking-widest"
    >
      {{ label }}
    </label>

    <input
      v-if="type !== 'color'"
      :id="id"
      v-model="inputValue"
      :type="type"
      :min="min"
      :max="max"
      @change="handleChange"
      @input="handleChange"
      :class="{
        [baseStyles]: true,
        [inputStyles[type]]: true,
      }"
    />
    <ColorPicker
      v-if="type === 'color'"
      alpha-channel="hide"
      :color="inputValue as string"
      @color-change="
        (event) => {
          const hexWithoutAlpha = event.colors.hex.slice(0, -2)

          handleChange({
            target: {
              value: hexWithoutAlpha,
            },
          })
        }
      "
    />
  </fieldset>
</template>

<style>
@import url('vue-accessible-color-picker/styles');

:root {
  --vacp-color-background: transparent;
  --vacp-width-color-space: 100%;
  --vacp-slider-track-height: 0.5rem;
}

/* Restyle / hide ColorPicker components */
.vacp-color-space {
  border-radius: 0.25rem;
}

.vacp-color-picker {
  width: 100%;
}

.vacp-color-picker {
  padding: 0;
}

.vacp-range-input-label.vacp-range-input-label--alpha,
.vacp-color-inputs,
.vacp-copy-button {
  display: none;
}
</style>
