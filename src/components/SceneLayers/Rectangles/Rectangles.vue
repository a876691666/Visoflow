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
import { shallowRef } from 'vue';
import Rectangle from './Rectangle.vue';
import type { Rectangle as RectangleType } from 'src/types';
import { watch } from 'vue';
import { useSceneStore } from 'src/stores/provider';

const sceneStore = useSceneStore();

const reversedRectangles = shallowRef<RectangleType[]>([]);

watch(
  sceneStore.rectangles,
  (newRectangles) => {
    reversedRectangles.value = [...newRectangles].reverse();
  },
  { immediate: true }
);
</script>

<style scoped>
.rectangles-layer {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
