<template>
  <div class="connectors-layer">
    <Connector
      v-for="connector in currentConnectors"
      :key="connector.id"
      :connector="connector"
      :is-selected="isConnectorSelected(connector.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Connector as ConnectorType } from '@/types';
import { useSceneStore } from '@/stores/sceneStore';
import { useScene } from '@/hooks/useScene';
import { getConnectorPath } from '@/utils';
import Connector from './Connector.vue';

interface Props {
  connectors?: Record<string, any>;
}

const props = defineProps<Props>();

const sceneStore = useSceneStore();
const scene = useScene();

// 获取当前视图的连接器
const currentConnectors = computed(() => {
  // 优先使用传入的 connectors，否则使用当前视图的连接器
  const sourceConnectors =
    props.connectors || scene.currentView.value?.connectors || [];

  if (Array.isArray(sourceConnectors)) {
    // 如果是数组，为每个连接器计算路径数据
    return sourceConnectors.map((connector: ConnectorType) => {
      try {
        const path = getConnectorPath({
          anchors: connector.anchors,
          view: scene.currentView.value
        });

        // 将路径数据添加到场景存储
        sceneStore.addConnector(connector.id, { path });

        return {
          ...connector,
          path
        };
      } catch (error) {
        console.warn(
          `Failed to calculate path for connector ${connector.id}:`,
          error
        );
        return connector;
      }
    });
  } else {
    // 如果是对象，转换为数组
    return Object.values(sourceConnectors).map((connector: any) => {
      try {
        const path = getConnectorPath({
          anchors: connector.anchors,
          view: scene.currentView.value
        });

        sceneStore.addConnector(connector.id, { path });

        return {
          ...connector,
          path
        };
      } catch (error) {
        console.warn(
          `Failed to calculate path for connector ${connector.id}:`,
          error
        );
        return connector;
      }
    });
  }
});

// 检查连接器是否被选中
const isConnectorSelected = (_connectorId: string): boolean => {
  // 简化的选择逻辑，在完整实现中应该使用实际的选择状态
  return false;
};
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
