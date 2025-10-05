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
import { computed } from 'vue';
import type { Connector as ConnectorType, SceneConnector } from '@/types';
import { useIsoflowUiStateStore } from 'src/context/isoflowContext';
import { useScene } from '@/hooks/useScene';
import Connector from './Connector.vue';

interface Props {
  // From useScene().connectors (already merged with SceneConnector.path)
  connectors?: (ConnectorType & SceneConnector)[];
}

const props = defineProps<Props>();
const uiState = useIsoflowUiStateStore<any>();
const scene = useScene();

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

// 渲染的连接器数据：优先使用传入的 props.connectors，否则从 useScene 拿
const sourceConnectors = computed<(ConnectorType & SceneConnector)[]>(() => {
  return (props.connectors as any) ?? (scene.connectors.value as any) ?? [];
});

// 与 React 版本一致：反向渲染，保证后添加的在上层
const reversedConnectors = computed<(ConnectorType & SceneConnector)[]>(() => {
  return [...sourceConnectors.value].reverse();
});
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
