<template>
  <div
    ref="containerRef"
    class="renderer-container"
    tabindex="0"
    @keydown.space.prevent="onSpaceDown"
    @keyup.space.prevent="onSpaceUp"
    :style="{
      backgroundColor: backgroundColor || '#f5f5f5'
    }"
    @mousedown="onContainerMouseDown"
    @mouseup="onContainerMouseUp"
  >
    <!-- Grid -->
    <div v-if="isShowGrid" class="grid-container">
      <SceneLayer>
        <Grid :style="gridStyle" />
      </SceneLayer>
    </div>

    <!-- Cursor -->
    <SceneLayer v-if="uiStateStore.mode.showCursor">
      <Cursor />
    </SceneLayer>

    <!-- Interaction layer for events -->
    <div ref="interactionsRef" class="interactions-layer" />

    <!-- Background rectangles -->
    <SceneLayer :order="5">
      <Rectangles />
    </SceneLayer>

    <!-- Connectors -->
    <SceneLayer :order="5">
      <Connectors />
    </SceneLayer>

    <!-- Text Boxes -->
    <SceneLayer :order="5">
      <TextBoxes />
    </SceneLayer>

    <!-- Connector Labels -->
    <SceneLayer :order="5">
      <ConnectorLabels />
    </SceneLayer>

    <!-- Debug Size Indicator -->
    <SceneLayer :order="5" v-if="uiStateStore.enableDebugTools">
      <SizeIndicator />
    </SceneLayer>

    <!-- Nodes/Items -->
    <SceneLayer :order="5">
      <Nodes />
    </SceneLayer>

    <!-- Transform Controls -->
    <SceneLayer :order="5">
      <TransformControlsManager />
    </SceneLayer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useIsoflowUiStateStore } from 'src/context/isoflowContext';
import { useInteractionManager } from 'src/interaction/useInteractionManager';
import type { RendererProps } from 'src/types/rendererProps';

// Import components
import Grid from 'src/components/Grid/Grid.vue';
import Cursor from 'src/components/Cursor/Cursor.vue';
import Nodes from 'src/components/SceneLayers/Nodes/Nodes.vue';
import Rectangles from 'src/components/SceneLayers/Rectangles/Rectangles.vue';
import Connectors from 'src/components/SceneLayers/Connectors/Connectors.vue';
import ConnectorLabels from 'src/components/SceneLayers/ConnectorLabels/ConnectorLabels.vue';
import TextBoxes from 'src/components/SceneLayers/TextBoxes/TextBoxes.vue';
import SizeIndicator from 'src/components/DebugUtils/SizeIndicator.vue';
import SceneLayer from 'src/components/SceneLayer/SceneLayer.vue';
import TransformControlsManager from 'src/components/TransformControlsManager/TransformControlsManager.vue';
import { useSceneStore } from 'src/stores/provider';

const { model } = useSceneStore();
const sceneStore = useSceneStore();

interface Props {
  showGrid?: RendererProps['showGrid'];
  backgroundColor?: RendererProps['backgroundColor'];
}

const props = withDefaults(defineProps<Props>(), {
  showGrid: true
});

// Template refs
const containerRef = ref<HTMLDivElement>();
const interactionsRef = ref<HTMLDivElement>();

// Stores and hooks
const uiStateStore = useIsoflowUiStateStore<any>();
const { setInteractionsElement } = useInteractionManager();

// Show grid reactive value
const isShowGrid = ref(true);

// 按住空格切换到移动（PAN）模式
const isSpacePanActive = ref(false);
const prevModeRef = ref<any>(null);

const onSpaceDown = () => {
  if (isSpacePanActive.value) return;
  isSpacePanActive.value = true;
  prevModeRef.value = uiStateStore.mode;
  if (uiStateStore.mode.type !== 'PAN') {
    uiStateStore.setMode({ type: 'PAN', showCursor: false } as any);
    uiStateStore.setItemControls(null);
  }
};

const onSpaceUp = () => {
  if (!isSpacePanActive.value) return;
  isSpacePanActive.value = false;
  if (uiStateStore.mode.type === 'PAN' && prevModeRef.value) {
    uiStateStore.setMode(prevModeRef.value as any);
  }
  prevModeRef.value = null;
};

// Computed grid style that merges model config with scene store ground config
const gridStyle = computed(() => {
  const modelGridStyle = model.value?.global?.scene || {};
  const sceneGroundConfig = sceneStore.getGroundConfig() || {};

  // Scene ground config takes precedence over model config
  return {
    ...modelGridStyle,
    ...sceneGroundConfig
  };
});

const updateShowGrid = () => {
  isShowGrid.value = props.showGrid === undefined || props.showGrid;
};

const domSelectActive = ref(false);

// 仅在 CURSOR 模式下，使用 e.target.closest 通过 DOM 标记选择 ITEM / RECTANGLE / TEXTBOX
const onContainerMouseDown = (e: MouseEvent) => {
  // 点击时主动聚焦，确保容器能接收键盘事件（空格切换移动）
  containerRef.value?.focus();

  if (uiStateStore.mode?.type !== 'CURSOR') return;

  const target = e.target as HTMLElement | null;
  if (!target) return;

  const targetEl = target.closest('[data-item-id]') as HTMLElement | null;
  if (!targetEl) return; // 未命中标记，交由原交互（含 Connector）

  const id = targetEl.getAttribute('data-item-id');
  const type = targetEl.getAttribute('data-item-type') as
    | 'ITEM'
    | 'RECTANGLE'
    | 'TEXTBOX'
    | null;

  if (!id || !type) return;

  // 命中 DOM 标记，记录一次 DOM 选择开始
  domSelectActive.value = true;

  // 同步选中与拖拽初始状态（不打断全局交互流）
  uiStateStore.setItemControls({ type, id } as any);
  uiStateStore.setMode({
    type: 'CURSOR',
    showCursor: true,
    mousedownItem: { type, id } as any
  } as any);
};

// 鼠标抬起时恢复为 CURSOR，并清空 mousedownItem（仅对 DOM 选择路径生效）
const onContainerMouseUp = () => {
  if (!domSelectActive.value) return;
  domSelectActive.value = false;
  uiStateStore.setMode({
    type: 'CURSOR',
    showCursor: true,
    mousedownItem: null
  } as any);
};

// Watch for showGrid prop changes
watch(() => props.showGrid, updateShowGrid, { immediate: true });

onMounted(() => {
  if (!containerRef.value || !interactionsRef.value) return;

  setInteractionsElement(interactionsRef.value);
  uiStateStore.setRendererEl(containerRef.value);
});
</script>

<style scoped>
.renderer-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  outline: none;
}

.grid-container {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.interactions-layer {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 4;
}
</style>
