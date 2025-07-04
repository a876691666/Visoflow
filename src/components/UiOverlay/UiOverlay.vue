<template>
  <div class="ui-overlay">
    <!-- UI overlay content will be added here -->
    <div>UiOverlay Component (Vue3 placeholder)</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUiStateStore } from 'src/stores/uiStateStore'
import { useModelStore } from 'src/stores/modelStore'

const uiStateStore = useUiStateStore()
const modelStore = useModelStore()

const editorMode = computed(() => uiStateStore.editorMode)
const enableDebugTools = computed(() => uiStateStore.enableDebugTools)
</script>

<style scoped>
.ui-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}
</style>