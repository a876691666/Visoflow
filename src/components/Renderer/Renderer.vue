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
    :class="{ 'only-line': lineMode }"
    @mousedown="onContainerMouseDown"
    @mouseup="onContainerMouseUp"
    @mousemove="onContainerMouseMove"
    @mouseleave="onContainerMouseLeave"
    @click="onContainerClick"
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
    <SceneLayer :order="5" :style="lineModeLayerStyle">
      <Rectangles />
    </SceneLayer>

    <!-- Connectors -->
    <SceneLayer :order="5">
      <Connectors />
    </SceneLayer>

    <ConnectorsThree />

    <!-- Connector Labels -->
    <SceneLayer :order="5">
      <ConnectorLabels />
    </SceneLayer>

    <!-- Debug Size Indicator -->
    <SceneLayer :order="5" v-if="uiStateStore.enableDebugTools">
      <SizeIndicator />
    </SceneLayer>

    <!-- Nodes/Items -->
    <SceneLayer :order="5" :style="lineModeLayerStyle">
      <Nodes />
    </SceneLayer>

    <!-- Text Boxes -->
    <SceneLayer :order="5" :style="lineModeLayerStyle">
      <TextBoxes />
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
import ConnectorsThree from '../SceneLayers/Connectors/Connectors.three.vue';

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

// 线条模式下用于禁用选择与半透明的层样式
const lineModeLayerStyle = computed(() =>
  sceneStore.getLineMode() ? { opacity: 0.4, pointerEvents: 'none' } : {}
);

const lineMode = computed(() => sceneStore.getLineMode());

// 按住空格切换到移动（PAN）模式
const isSpacePanActive = ref(false);
const prevModeRef = ref<any>(null);

const onSpaceDown = () => {
  if (isSpacePanActive.value) return;
  isSpacePanActive.value = true;
  prevModeRef.value = uiStateStore.mode;
  if (uiStateStore.mode.type !== 'PAN') {
    uiStateStore.setMode({ type: 'PAN', showCursor: false });
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

// 仅在 CURSOR 模式下，使用 e.target.closest 通过 DOM 标记选择 ITEM / RECTANGLE / TEXTBOX / CONNECTOR
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
    | 'CONNECTOR'
    | null;

  if (!id || !type) return;

  // 线条模式下不允许选择 ITEM/RECTANGLE/TEXTBOX（保留对 CONNECTOR 的可选中）
  if (
    sceneStore.getLineMode() &&
    (type === 'ITEM' || type === 'RECTANGLE' || type === 'TEXTBOX')
  ) {
    return;
  }

  // 命中 DOM 标记，记录一次 DOM 选择开始
  domSelectActive.value = true;
  const item = { type, id };
  // 同步选中与拖拽初始状态（不打断全局交互流）
  uiStateStore.setItemControls(item);
  uiStateStore.setMode({
    type: 'CURSOR',
    showCursor: true,
    mousedownItem: item
  });
};

// 鼠标抬起时恢复为 CURSOR，并清空 mousedownItem（仅对 DOM 选择路径生效）
const onContainerMouseUp = () => {
  if (!domSelectActive.value) return;
  domSelectActive.value = false;
  uiStateStore.setMode({
    type: 'CURSOR',
    showCursor: true,
    mousedownItem: null
  });
};

// ========== Hover / Click 交互（基于 containerRef）==========

type HoverableType = 'ITEM' | 'RECTANGLE' | 'TEXTBOX' | 'CONNECTOR';
interface ItemEventPayload {
  id: string;
  type: HoverableType;
  data: any; // 具体对象：ViewItem/Rectangle/TextBox/Connector(含 scene 数据)
}

const hoveredTarget = ref<ItemEventPayload | null>(null);

const isTypeAllowed = (type: HoverableType) => {
  // 线条模式下仅允许 CONNECTOR 交互
  if (sceneStore.getLineMode()) return type === 'CONNECTOR';
  return true;
};

const getPayloadByType = (
  id: string,
  type: HoverableType
): ItemEventPayload => {
  let data: any = null;
  switch (type) {
    case 'ITEM':
      data = sceneStore.getItem(id) || null;
      break;
    case 'RECTANGLE':
      data = sceneStore.getRectangle(id) || null;
      break;
    case 'TEXTBOX':
      data = sceneStore.getTextBox(id) || null;
      break;
  }
  return { id, type, data };
};

const pickTargetFromEvent = (e: MouseEvent): ItemEventPayload | null => {
  const el = (e.target as HTMLElement | null)?.closest(
    '[data-item-id]'
  ) as HTMLElement | null;
  if (!el) return null;
  const id = el.getAttribute('data-item-id') || '';
  const type = (el.getAttribute('data-item-type') || '') as HoverableType;
  if (!id || !type) return null;
  if (!isTypeAllowed(type)) return null;
  return getPayloadByType(id, type);
};

// 允许触发 DOM 悬浮/点击事件的模式（CURSOR 或 INTERACTIONS_DISABLED）
const allowPassiveDomEvents = () =>
  uiStateStore.mode?.type === 'CURSOR' ||
  uiStateStore.mode?.type === 'INTERACTIONS_DISABLED';

const onContainerMouseMove = (e: MouseEvent) => {
  // 仅在允许的模式下触发悬浮事件
  if (!allowPassiveDomEvents()) return;

  const next = pickTargetFromEvent(e);

  // 未命中任何对象
  if (!next) {
    if (hoveredTarget.value) {
      sceneStore.eventBus.emit('unhoverItem', hoveredTarget.value);
      hoveredTarget.value = null;
    }
    return;
  }

  // 命中对象且与当前不同（或不同类型）
  if (
    !hoveredTarget.value ||
    hoveredTarget.value.id !== next.id ||
    hoveredTarget.value.type !== next.type
  ) {
    if (hoveredTarget.value) {
      sceneStore.eventBus.emit('unhoverItem', hoveredTarget.value);
    }
    hoveredTarget.value = next;
    sceneStore.eventBus.emit('hoverItem', next);
  }
};

const onContainerMouseLeave = () => {
  if (hoveredTarget.value) {
    sceneStore.eventBus.emit('unhoverItem', hoveredTarget.value);
    hoveredTarget.value = null;
  }
};

const onContainerClick = (e: MouseEvent) => {
  if (!allowPassiveDomEvents()) return;
  const target = pickTargetFromEvent(e);
  if (target) {
    sceneStore.eventBus.emit('clickItem', target);
  } else {
    sceneStore.eventBus.emit('clickCanvas', e);
  }
};

onMounted(() => {
  if (!containerRef.value || !interactionsRef.value) return;

  setInteractionsElement(interactionsRef.value);
  uiStateStore.setRendererEl(containerRef.value);
});

// Watch for showGrid prop changes
watch(() => props.showGrid, updateShowGrid, { immediate: true });

watch(lineMode, (val) => {
  if (val && hoveredTarget.value && hoveredTarget.value.type !== 'CONNECTOR') {
    sceneStore.eventBus.emit('unhoverItem', hoveredTarget.value);
    hoveredTarget.value = null;
  }
});

watch(
  () => uiStateStore.mode?.type,
  (t) => {
    if (
      t !== 'CURSOR' &&
      t !== 'INTERACTIONS_DISABLED' &&
      hoveredTarget.value
    ) {
      sceneStore.eventBus.emit('unhoverItem', hoveredTarget.value);
      hoveredTarget.value = null;
    }
  }
);
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
<style>
.renderer-container .node {
  pointer-events: auto;
}
.renderer-container.only-line .node {
  pointer-events: none;
}
</style>
