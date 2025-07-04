<template>
  <div class="color-picker">
    <input
      type="color"
      :value="value"
      @input="handleColorChange"
      class="hidden-input"
    />
    <ColorSwatch :hex="value || '#000000'" @click="openColorPicker" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ColorSwatch from './ColorSwatch.vue';

interface Props {
  value?: string;
  onChange?: (color: string) => void;
}

const props = withDefaults(defineProps<Props>(), {
  value: '#000000',
  onChange: undefined
});

const emit = defineEmits<{
  change: [color: string];
}>();

const handleColorChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const color = target.value;

  if (props.onChange) {
    props.onChange(color);
  }
  emit('change', color);
};

const openColorPicker = () => {
  const input = document.querySelector('.hidden-input') as HTMLInputElement;
  if (input) {
    input.click();
  }
};
</script>

<style scoped>
.color-picker {
  position: relative;
  display: inline-block;
}

.hidden-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}
</style>
