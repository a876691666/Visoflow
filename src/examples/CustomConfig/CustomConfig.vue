<template>
  <Isoflow
    :initial-data="customInitialData"
    :main-menu-options="customMenuOptions"
    :renderer="customRenderer"
    :width="'100%'"
    :height="'100%'"
    @model-updated="onModelUpdated"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Isoflow from '@/Isoflow.vue';
import { initialData } from '../initialData';
import type { MainMenuOptions } from '@/types';
import type { RendererProps } from '@/types/rendererProps';

// 自定义初始数据
const customInitialData = ref({
  ...initialData,
  title: 'Isoflow 自定义配置示例',
  fitToView: true,
  // 自定义颜色方案
  colors: [
    { id: 'custom1', value: '#FF6B6B' }, // 珊瑚红
    { id: 'custom2', value: '#4ECDC4' }, // 青绿色
    { id: 'custom3', value: '#45B7D1' }, // 天蓝色
    { id: 'custom4', value: '#96CEB4' }, // 薄荷绿
    { id: 'custom5', value: '#FFEAA7' }, // 温暖黄
    { id: 'custom6', value: '#DDA0DD' }, // 淡紫色
    { id: 'custom7', value: '#98D8C8' } // 海绿色
  ]
});

// 自定义主菜单选项 - 使用正确的类型
const customMenuOptions: MainMenuOptions = [
  'ACTION.OPEN',
  'EXPORT.JSON',
  'EXPORT.PNG',
  'ACTION.CLEAR_CANVAS',
  'LINK.GITHUB',
  'LINK.DISCORD',
  'VERSION'
];

// 自定义渲染器配置 - 使用正确的类型
const customRenderer: RendererProps = {
  showGrid: true,
  backgroundColor: '#F8F9FA'
};

// 模型更新处理
const onModelUpdated = (model: any) => {
  console.log('自定义配置示例 - 模型已更新:', model);

  // 可以在这里添加自定义的模型处理逻辑
  // 例如：自动保存、数据验证、统计信息更新等

  // 示例：统计节点数量
  const nodeCount =
    model.items?.filter((item: any) => item.type === 'node')?.length || 0;
  const connectorCount =
    model.items?.filter((item: any) => item.type === 'connector')?.length || 0;

  console.log(`当前图表包含 ${nodeCount} 个节点和 ${connectorCount} 个连接器`);
};
</script>

<style scoped>
/* 自定义配置示例的特定样式 */
:deep(.isoflow-container) {
  /* 自定义容器样式 */
  border: 2px solid #4ecdc4;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(78, 205, 196, 0.15);
}

:deep(.isoflow-theme) {
  /* 自定义主题样式 */
  --primary-color: #4ecdc4;
  --secondary-color: #45b7d1;
  --background-color: #f8f9fa;
  --text-color: #212529;
  --border-color: #e9ecef;
}

/* 自定义工具栏样式 */
:deep(.tool-menu) {
  background: linear-gradient(135deg, #4ecdc4, #45b7d1);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* 自定义节点样式 */
:deep(.node) {
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15));
  transition: all 0.3s ease;
}

:deep(.node:hover) {
  transform: scale(1.05);
  filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.25));
}

/* 自定义连接器样式 */
:deep(.connector) {
  stroke-width: 3;
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.1));
}

/* 自定义网格样式 */
:deep(.grid) {
  opacity: 0.4;
}

/* 自定义选择框样式 */
:deep(.selection-box) {
  stroke: #4ecdc4;
  stroke-width: 2;
  fill: rgba(78, 205, 196, 0.1);
  stroke-dasharray: 5, 5;
}
</style>
