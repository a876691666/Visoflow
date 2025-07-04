<template>
  <TransformControls
    :from="transformBounds.from"
    :to="transformBounds.to"
    @anchor-mouse-down="handleAnchorMouseDown"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { ViewItem, AnchorPosition, Coords } from '@/types';
import TransformControls from './TransformControls.vue';

interface Props {
  node: ViewItem;
  onAnchorMouseDown?: (anchorPosition: AnchorPosition) => void;
}

const props = withDefaults(defineProps<Props>(), {
  onAnchorMouseDown: undefined
});

const transformBounds = ref<{ from: Coords; to: Coords }>({
  from: { x: 0, y: 0 },
  to: { x: 1, y: 1 }
});

const updateTransformBounds = () => {
  // 简化的节点边界计算
  const nodeTile = props.node.tile || { x: 0, y: 0 };

  transformBounds.value = {
    from: { x: nodeTile.x, y: nodeTile.y },
    to: { x: nodeTile.x + 1, y: nodeTile.y + 1 }
  };
};

const handleAnchorMouseDown = (anchorPosition: AnchorPosition) => {
  if (props.onAnchorMouseDown) {
    props.onAnchorMouseDown(anchorPosition);
  }
};

// 监听节点变化
watch(() => props.node, updateTransformBounds, { immediate: true, deep: true });
</script>

<style scoped>
/* NodeTransformControls 样式 */
</style>
