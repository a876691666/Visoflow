<template>
  <div class="transform-controls-manager">
    <!-- 矩形优先：变换模式或选中矩形 -->
    <RectangleTransformControls
      v-if="currentRectangle"
      :rectangle="currentRectangle!"
      :onAnchorMouseDown="
        (a) => startRectangleTransform(currentRectangle!.id, a)
      "
    />

    <!-- 其次：节点 -->
    <NodeTransformControls v-else-if="currentNode" :id="currentNode.id" />

    <!-- 最后：文本框 -->
    <TextBoxTransformControls
      v-else-if="currentTextBox"
      :id="currentTextBox.id"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useIsoflowUiStateStore } from 'src/context/isoflowContext';
import { useScene } from 'src/hooks/useScene';
import type { AnchorPosition } from 'src/types';

import NodeTransformControls from './NodeTransformControls.vue';
import RectangleTransformControls from './RectangleTransformControls.vue';
import TextBoxTransformControls from './TextBoxTransformControls.vue';

const uiStateStore = useIsoflowUiStateStore<any>();
const scene = useScene();

// 在矩形变换时更新模式中的 selectedAnchor
const startRectangleTransform = (
  rectangleId: string,
  anchor: AnchorPosition
) => {
  uiStateStore.setMode({
    type: 'RECTANGLE.TRANSFORM',
    showCursor: true,
    id: rectangleId,
    selectedAnchor: anchor
  });
};

// 选中/模式解析
const itemControls = computed(() => uiStateStore.itemControls as any);
const mode = computed(() => uiStateStore.mode as any);

const currentRectangle = computed(() => {
  const rectId =
    mode.value?.type === 'RECTANGLE.TRANSFORM'
      ? mode.value.id
      : itemControls.value?.type === 'RECTANGLE'
        ? itemControls.value.id
        : null;
  if (!rectId) return null;
  return scene.rectangles.value.find((r: any) => r.id === rectId) ?? null;
});

const currentNode = computed(() => {
  const nodeId =
    itemControls.value?.type === 'ITEM' ? itemControls.value.id : null;
  if (!nodeId) return null;
  return scene.items.value.find((n: any) => n.id === nodeId) ?? null;
});

const currentTextBox = computed(() => {
  const tbId =
    itemControls.value?.type === 'TEXTBOX' ? itemControls.value.id : null;
  if (!tbId) return null;
  return scene.textBoxes.value.find((t: any) => t.id === tbId) ?? null;
});
</script>

<style scoped>
.transform-controls-manager {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* 注意：不能禁用 pointer-events，否则锚点无法响应 */
}
</style>
