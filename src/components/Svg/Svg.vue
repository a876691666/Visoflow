<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :style="style"
    :viewBox="viewBox"
    :width="width"
    :height="height"
    v-bind="$attrs"
  >
    <slot />
  </svg>
</template>

<script setup lang="ts">
import { ref, watch, type CSSProperties } from 'vue';
import type { Size } from '@/types';

interface Props {
  style?: CSSProperties;
  viewboxSize?: Size;
}

const props = withDefaults(defineProps<Props>(), {
  style: () => ({}),
  viewboxSize: undefined
});

const viewBox = ref();
const width = ref();
const height = ref();

// 更新尺寸属性
const updateDimensions = () => {
  if (props.viewboxSize) {
    viewBox.value = `0 0 ${props.viewboxSize.width} ${props.viewboxSize.height}`;
    width.value = `${props.viewboxSize.width}px`;
    height.value = `${props.viewboxSize.height}px`;
  } else {
    viewBox.value = undefined;
    width.value = undefined;
    height.value = undefined;
  }
};

// 监听viewboxSize变化
watch(() => props.viewboxSize, updateDimensions, {
  immediate: true,
  deep: true
});
</script>

<style scoped>
/* SVG组件样式 */
</style>
