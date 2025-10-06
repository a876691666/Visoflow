<template>
  <div class="connectors-layer">
    <Connector
      v-for="connector in reversedConnectors"
      :key="connector.id"
      :connector="connector"
      :is-selected="selectedConnectorId === connector.id"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import type { Connector as ConnectorType, SceneConnector } from '@/types';
import { useIsoflowUiStateStore } from 'src/context/isoflowContext';
import Connector from './Connector.vue';
import { useSceneStore } from 'src/stores/provider';

const uiState = useIsoflowUiStateStore<any>();

const sceneStore = useSceneStore();

// 选中逻辑：优先 mode 为 CONNECTOR，其次 itemControls 为 CONNECTOR
const selectedConnectorId = computed<string | null>(() => {
  const mode = uiState.mode;
  const itemControls = uiState.itemControls as
    | { type: 'CONNECTOR'; id: string }
    | { type: string; id?: string }
    | null;

  if (mode?.type === 'CONNECTOR') return mode.id ?? null;
  if (itemControls?.type === 'CONNECTOR') return itemControls.id ?? null;
  return null;
});

// 与 React 版本一致：反向渲染，保证后添加的在上层
const reversedConnectors = shallowRef<(ConnectorType & SceneConnector)[]>([]);

watch(
  sceneStore.connectors,
  (newVal) => {
    reversedConnectors.value = [...newVal].reverse();
  },
  { immediate: true }
);
</script>

<style scoped>
.connectors-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}
</style>
