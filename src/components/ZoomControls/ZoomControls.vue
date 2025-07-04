<template>
  <div class="zoom-controls">
    <IconButton name="Zoom In" @click="zoomIn">
      <template #icon>
        <div class="zoom-icon">+</div>
      </template>
    </IconButton>

    <div class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</div>

    <IconButton name="Zoom Out" @click="zoomOut">
      <template #icon>
        <div class="zoom-icon">−</div>
      </template>
    </IconButton>

    <IconButton name="Fit to View" @click="fitToView">
      <template #icon>
        <div class="zoom-icon">⌂</div>
      </template>
    </IconButton>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import IconButton from '../IconButton/IconButton.vue';

const zoomLevel = ref(1.0);

const zoomIn = () => {
  zoomLevel.value = Math.min(zoomLevel.value * 1.2, 3.0);
  console.log('Zoom in:', zoomLevel.value);
};

const zoomOut = () => {
  zoomLevel.value = Math.max(zoomLevel.value / 1.2, 0.1);
  console.log('Zoom out:', zoomLevel.value);
};

const fitToView = () => {
  zoomLevel.value = 1.0;
  console.log('Fit to view');
};
</script>

<style scoped>
.zoom-controls {
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.zoom-level {
  padding: 8px 12px;
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: #666;
  border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f9f9f9;
}

.zoom-icon {
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
