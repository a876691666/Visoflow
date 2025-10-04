<template>
  <circle :="$props" :cx="tile.x" :cy="tile.y" :r="radius" />
</template>

<script setup lang="ts">
import type { Coords } from '@/types';

interface Props {
  tile: Coords;
  radius?: number;
  [key: string]: any; // 允许传递其他SVG属性
}

withDefaults(defineProps<Props>(), {
  radius: 5
});

// 继承所有SVG属性
defineOptions({
  inheritAttrs: false
});
</script>

<style scoped>
/* Circle组件样式 */
</style>
