<template>
  <TransformControls
    :from="rect.from"
    :to="rect.to"
    :onAnchorMouseDown="handleAnchorMouseDown"
  />
  <!-- 注意：TransformControls 自身负责渲染外框与锚点 -->
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Rectangle, AnchorPosition } from 'src/types';
import { useRectangle } from 'src/hooks/useRectangle';
import { useIsoflowUiStateStore } from 'src/context/isoflowContext';
import TransformControls from './TransformControls.vue';

interface Props {
  // 二选一：传入 id 使用 hook 获取矩形；或直接传入 rectangle
  id?: string;
  rectangle?: Rectangle;
  onAnchorMouseDown?: (anchorPosition: AnchorPosition) => void;
}

const props = withDefaults(defineProps<Props>(), {
  id: undefined,
  rectangle: undefined,
  onAnchorMouseDown: undefined
});

const uiState = useIsoflowUiStateStore<any>();

// 当提供 id 时，使用 hook 获取矩形；否则使用 props.rectangle
const rectFromHook = computed(() => (props.id ? useRectangle(props.id) : null));

// 提供一个兜底的矩形，避免空值导致子组件报错
const defaultRect: Rectangle = {
  id: props.id ?? props.rectangle?.id ?? '',
  from: { x: 0, y: 0 },
  to: { x: 1, y: 1 }
} as Rectangle;

const rect = computed<Rectangle>(() => {
  const hookRef = rectFromHook.value as any;
  const r: Rectangle | undefined = hookRef?.value ?? props.rectangle;
  return r ?? defaultRect;
});

const handleAnchorMouseDown = (anchorPosition: AnchorPosition) => {
  // 优先使用外部回调；否则默认设置到 uiState 的变换模式
  if (props.onAnchorMouseDown) {
    props.onAnchorMouseDown(anchorPosition);
    return;
  }

  // 与 React 版本对齐的默认行为
  const rectId = props.id ?? rect.value.id;
  if (rectId) {
    uiState.setMode({
      type: 'RECTANGLE.TRANSFORM',
      id: rectId,
      selectedAnchor: anchorPosition,
      showCursor: true
    });
  }
};
</script>

<style scoped>
/* RectangleTransformControls 样式 */
</style>
