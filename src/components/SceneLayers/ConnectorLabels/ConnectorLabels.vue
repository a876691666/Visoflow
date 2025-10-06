<template>
  <div class="connector-labels-layer">
    <ConnectorLabel
      v-for="connector in visibleConnectors"
      :key="connector.id"
      :connector="connector"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import type { Connector as ConnectorType, SceneConnector } from '@/types';
import { useSceneStore } from 'src/stores/provider';
import ConnectorLabel from './ConnectorLabel.vue';
const sceneStore = useSceneStore();

// 与 Connectors.vue 一致：反向渲染，保证后添加的在上层
const reversedConnectors = shallowRef<(ConnectorType & SceneConnector)[]>([]);

watch(
  sceneStore.connectors,
  (newVal) => {
    reversedConnectors.value = [...newVal].reverse();
  },
  { immediate: true }
);

// 获取可见的连接器（有 description 且有 path 的）
const visibleConnectors = computed(() => {
  return reversedConnectors.value.filter((connector) => {
    const hasDesc =
      !!connector.description && connector.description.trim() !== '';
    const hasPath =
      !!connector.path &&
      !!connector.path.tiles &&
      connector.path.tiles.length > 0;
    return hasDesc && hasPath;
  });
});
</script>

<style scoped>
.connector-labels-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 3;
}
</style>
