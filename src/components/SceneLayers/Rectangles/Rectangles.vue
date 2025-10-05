<template>
  <div class="rectangles-layer">
    <Rectangle
      v-for="rectangle in reversedRectangles"
      :key="rectangle.id"
      :from="rectangle.from"
      :to="rectangle.to"
      :style="rectangle.style"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Rectangle from './Rectangle.vue';
import type { Rectangle as RectangleType } from 'src/types';

interface Props {
  rectangles: RectangleType[];
}

const props = defineProps<Props>();

// 反转rectangles数组以匹配React组件的行为
const reversedRectangles = computed(() => {
  return [...props.rectangles].reverse();
});
</script>

<style scoped>
.rectangles-layer {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
