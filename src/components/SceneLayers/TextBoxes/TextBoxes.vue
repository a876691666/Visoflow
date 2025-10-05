<template>
  <div class="textboxes-layer">
    <TextBox
      v-for="textBox in reversedTextBoxes"
      :key="textBox.id"
      :textBox="textBox"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import TextBox from './TextBox.vue';
import type { TextBox as TextBoxType, SceneTextBox } from '@/types';

interface Props {
  // 已与 Scene 合并后的文本框数组
  textBoxes: Array<TextBoxType & SceneTextBox>;
}
const props = defineProps<Props>();

// 与 React 版本保持一致：反向渲染，确保后创建的在更上层
const reversedTextBoxes = computed(() => {
  return [...props.textBoxes].reverse();
});
</script>

<style scoped>
.textboxes-layer {
  position: relative;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
