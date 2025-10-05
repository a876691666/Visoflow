<template>
  <div class="item-controls-manager">
    <!-- 根据当前选中项/模式渲染对应的控制面板 -->
    <component
      v-if="itemControls"
      :is="currentComponent"
      v-bind="currentProps"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useIsoflowUiStateStore } from 'src/context/isoflowContext';

// 子控制面板
import NodeControls from './NodeControls/NodeControls.vue';
import RectangleControls from './RectangleControls/RectangleControls.vue';
import ConnectorControls from './ConnectorControls/ConnectorControls.vue';
import TextBoxControls from './TextBoxControls/TextBoxControls.vue';
import IconSelectionControls from './IconSelectionControls/IconSelectionControls.vue';

const uiStateStore = useIsoflowUiStateStore<any>();

// 当前 itemControls（来自交互模式/选择）
const itemControls = computed(() => uiStateStore.itemControls);

// 选择要渲染的组件
const currentComponent = computed(() => {
  const value = itemControls.value;
  if (!value) return null;

  // Add-item 面板（图标选择）
  if (value.type === 'ADD_ITEM') return IconSelectionControls;

  // 具体对象的控制面板
  switch (value.type) {
    case 'ITEM':
      return NodeControls;
    case 'RECTANGLE':
      return RectangleControls;
    case 'CONNECTOR':
      return ConnectorControls;
    case 'TEXTBOX':
      return TextBoxControls;
    default:
      return null;
  }
});

// 传递到子组件的 props（部分面板需要 id）
const currentProps = computed(() => {
  const value = itemControls.value as any;
  if (!value) return {};
  if (value.type === 'ADD_ITEM') return {};
  if ('id' in value) return { id: value.id };
  return {};
});
</script>

<style scoped>
.item-controls-manager {
  /* 外层容器仅负责占位，具体样式交给各子面板的 ControlsContainer */
  width: 100%;
  height: 100%;
}
</style>
