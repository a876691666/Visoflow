<template>
  <div class="zoom-controls">
    <IconButton name="Zoom In" @click="zoomIn">
      <template #icon>
        <svg
          class="zoom-icon-svg"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="6" />
          <path d="M16 16l5 5" />
          <path d="M11 8v6" />
          <path d="M8 11h6" />
        </svg>
      </template>
    </IconButton>

    <div class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</div>

    <IconButton name="Zoom Out" @click="zoomOut">
      <template #icon>
        <svg
          class="zoom-icon-svg"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="6" />
          <path d="M16 16l5 5" />
          <path d="M8 11h6" />
        </svg>
      </template>
    </IconButton>

    <IconButton name="Fit to View" @click="fitToView">
      <template #icon>
        <svg
          class="zoom-icon-svg"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <!-- home icon outline -->
          <path d="M3 10L12 3l9 7" />
          <path d="M5 12v9h5v-6h4v6h5v-9" />
        </svg>
      </template>
    </IconButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import IconButton from '../IconButton/IconButton.vue';
import { useIsoflowUiStateStore } from 'src/context/isoflowContext';
import { useDiagramUtils } from 'src/hooks/useDiagramUtils';

const uiStateStore = useIsoflowUiStateStore<any>();
const { fitToView } = useDiagramUtils();

const zoomLevel = computed(() => uiStateStore.zoom);

const zoomIn = () => {
  uiStateStore.incrementZoom();
};

const zoomOut = () => {
  uiStateStore.decrementZoom();
};

// fitToView 已从 composable 注入
</script>

<style scoped>
.zoom-controls {
  position: fixed;
  left: 16px;
  bottom: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
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
  border-left: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
  background-color: #f9f9f9;
}

/* SVG icons inherit color from IconButton wrapper */
.zoom-icon-svg {
  display: block;
}
</style>
