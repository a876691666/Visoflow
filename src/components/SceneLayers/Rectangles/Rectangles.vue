<template>
  <div class="rectangles-layer">
    <div v-for="(rectangle, id) in rectangles" :key="id" class="rectangle-item">
      <!-- Rectangle rendering will be implemented here -->
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  rectangles: Record<string, any>;
}

const props = defineProps<Props>();
</script>

<style scoped>
.rectangles-layer {
  position: relative;
  width: 100%;
  height: 100%;
}

.rectangle-item {
  position: absolute;
  border: 2px solid #333;
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
