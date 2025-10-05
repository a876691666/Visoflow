<template>
  <TransformControls
    :from="rectangleData.from"
    :to="rectangleData.to"
    :onAnchorMouseDown="handleAnchorMouseDown"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Rectangle, AnchorPosition } from '@/types';
import TransformControls from './TransformControls.vue';

interface Props {
  rectangle: Rectangle;
  onAnchorMouseDown?: (anchorPosition: AnchorPosition) => void;
}

const props = withDefaults(defineProps<Props>(), {
  onAnchorMouseDown: undefined
});

const rectangleData = ref<Rectangle>({
  id: '',
  from: { x: 0, y: 0 },
  to: { x: 1, y: 1 }
});

const updateRectangleData = () => {
  rectangleData.value = { ...props.rectangle };
};

const handleAnchorMouseDown = (anchorPosition: AnchorPosition) => {
  if (props.onAnchorMouseDown) {
    props.onAnchorMouseDown(anchorPosition);
  }
};

// 监听矩形变化
watch(() => props.rectangle, updateRectangleData, {
  immediate: true,
  deep: true
});
</script>

<style scoped>
/* RectangleTransformControls 样式 */
</style>
