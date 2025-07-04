<template>
  <circle :cx="tile.x" :cy="tile.y" :r="radius" v-bind="$attrs" />
</template>

<script setup lang="ts">
import type { Coords } from '@/types';

interface Props {
  tile: Coords;
  radius?: number;
}

const props = withDefaults(defineProps<Props>(), {
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
