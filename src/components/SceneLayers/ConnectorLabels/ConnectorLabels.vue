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
import { computed } from 'vue';
import { useScene } from '@/hooks/useScene';
import ConnectorLabel from './ConnectorLabel.vue';

interface ConnectorWithPath {
  id: string;
  description?: string;
  path?: {
    tiles: Array<{ x: number; y: number }>;
    rectangle: {
      from: { x: number; y: number };
      to: { x: number; y: number };
    };
  };
}

interface Props {
  connectors?: Record<string, any>;
}

const props = defineProps<Props>();

const scene = useScene();

// 获取可见的连接器（有description且有path的）
const visibleConnectors = computed(() => {
  const sourceConnectors = props.connectors || scene.connectors.value || [];

  // 将对象或数组转换为数组
  const connectorsArray = Array.isArray(sourceConnectors)
    ? sourceConnectors
    : Object.values(sourceConnectors);

  // 过滤出有描述和路径的连接器
  return connectorsArray.filter((connector: ConnectorWithPath) => {
    return (
      connector.description &&
      connector.description.trim() !== '' &&
      connector.path &&
      connector.path.tiles &&
      connector.path.tiles.length > 0
    );
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
