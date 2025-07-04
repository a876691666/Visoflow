<template>
  <TransformControls
    :from="textBoxBounds.from"
    :to="textBoxBounds.to"
    @anchor-mouse-down="handleAnchorMouseDown"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { TextBox, AnchorPosition, Coords } from '@/types';
import TransformControls from './TransformControls.vue';

interface Props {
  textBox: TextBox;
  onAnchorMouseDown?: (anchorPosition: AnchorPosition) => void;
}

const props = withDefaults(defineProps<Props>(), {
  onAnchorMouseDown: undefined
});

const textBoxBounds = ref<{ from: Coords; to: Coords }>({
  from: { x: 0, y: 0 },
  to: { x: 1, y: 1 }
});

const updateTextBoxBounds = () => {
  // 简化的文本框边界计算
  const textBoxTile = props.textBox.tile || { x: 0, y: 0 };

  // 根据文本框内容计算大小
  const width = Math.max(
    1,
    Math.ceil((props.textBox.content?.length || 1) / 10)
  );
  const height = 1;

  textBoxBounds.value = {
    from: { x: textBoxTile.x, y: textBoxTile.y },
    to: { x: textBoxTile.x + width, y: textBoxTile.y + height }
  };
};

const handleAnchorMouseDown = (anchorPosition: AnchorPosition) => {
  if (props.onAnchorMouseDown) {
    props.onAnchorMouseDown(anchorPosition);
  }
};

// 监听文本框变化
watch(() => props.textBox, updateTextBoxBounds, {
  immediate: true,
  deep: true
});
</script>

<style scoped>
/* TextBoxTransformControls 样式 */
</style>
