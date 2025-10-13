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
import { ref, watch } from 'vue';
import { useIsoflowUiStateStore } from 'src/context/isoflowContext';

// 子控制面板
import RectangleControls from './RectangleControls/RectangleControls.vue';
import ConnectorControls from './ConnectorControls/ConnectorControls.vue';
import TextBoxControls from './TextBoxControls/TextBoxControls.vue';
import NodeManager from './NodeManager/NodeManager.vue';
import ObjectManager from './ObjectManager/ObjectManager.vue';
import ObjectDetailsPanel from './ObjectManager/ObjectDetailsPanel.vue';
import ViewManager from './ViewManager/ViewManager.vue';
import GroundConfig from '../GroundConfig/GroundConfig.vue';

const uiStateStore = useIsoflowUiStateStore<any>();

// 使用 ref + watch 替代 computed
const itemControls = ref<any>(uiStateStore.itemControls);
const currentComponent = ref<any>(null);
const currentProps = ref<Record<string, any>>({});

const recompute = () => {
  const value = itemControls.value;

  // 计算组件
  let comp: any = null;
  if (value) {
    if (value.type === 'NODE_MANAGER') comp = NodeManager;
    else if (value.type === 'OBJECT_MANAGER') comp = ObjectManager;
    else if (value.type === 'VIEW_MANAGER') comp = ViewManager;
    else if (value.type === 'GROUND_CONFIG') comp = GroundConfig;
    else {
      switch (value.type) {
        case 'ITEM':
          comp = ObjectDetailsPanel;
          break;
        case 'RECTANGLE':
          comp = RectangleControls;
          break;
        case 'CONNECTOR':
          comp = ConnectorControls;
          break;
        case 'TEXTBOX':
          comp = TextBoxControls;
          break;
        default:
          comp = null;
      }
    }
  }
  currentComponent.value = comp;

  // 计算 props
  let props: Record<string, any> = {};
  if (value) {
    if (
      value.type === 'NODE_MANAGER' ||
      value.type === 'OBJECT_MANAGER' ||
      value.type === 'VIEW_MANAGER' ||
      value.type === 'GROUND_CONFIG'
    ) {
      props = {};
    } else if ('id' in value) {
      props = { id: value.id };
    }
  }
  currentProps.value = props;
};

// 监听 store 中的 itemControls 变化
watch(
  () => uiStateStore.itemControls,
  (val) => {
    itemControls.value = val;
    recompute();
  },
  { immediate: true }
);
</script>

<style scoped>
.item-controls-manager {
  /* 外层容器仅负责占位，具体样式交给各子面板的 ControlsContainer */
  width: 100%;
  height: 100%;
}
</style>
