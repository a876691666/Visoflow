<template>
  <div class="drag-and-drop" :style="dragStyle">
    <div class="drag-preview">
      <!-- Drag preview content -->
      <div class="drag-icon">📦 {{ iconId }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { getTilePosition } from 'src/utils/renderer';

interface Props {
  iconId: string;
  tile: { x: number; y: number };
}

const props = defineProps<Props>();

const dragStyle = ref({
  position: 'absolute' as const,
  left: '0px',
  top: '0px',
  pointerEvents: 'none' as const,
  zIndex: 1000
});

// Update position based on tile coordinates
watch(
  () => props.tile,
  (newTile) => {
    const pos = getTilePosition({ tile: newTile, origin: 'LEFT' });
    dragStyle.value.left = `${pos.x}px`;
    dragStyle.value.top = `${pos.y}px`;
  },
  { immediate: true, deep: true }
);
</script>

<style scoped>
.drag-and-drop {
  position: absolute;
  pointer-events: none;
  z-index: 1000;
}

.drag-preview {
  background-color: white;
  border: 2px dashed #1976d2;
  border-radius: 4px;
  padding: 8px;
  opacity: 0.8;
  transform: scale(0.9);
}

.drag-icon {
  font-size: 14px;
  text-align: center;
  color: #1976d2;
  font-weight: 500;
}
</style>
