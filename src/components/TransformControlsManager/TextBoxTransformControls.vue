<template>
  <TransformControls v-if="textBox && to" :from="textBox.tile" :to="to" />
  <!-- 若数据未就绪则不渲染 -->
</template>

<script setup lang="ts">
import { computed } from 'vue';
import TransformControls from './TransformControls.vue';
import { useTextBox } from 'src/hooks/useTextBox';
import { getTextBoxEndTile } from 'src/utils';

interface Props {
  id: string;
}

const props = defineProps<Props>();

// 从 store/composable 获取文本框实时数据
const textBox = useTextBox(props.id);

// 依据真实工具函数计算文本框终点瓦片坐标
const to = computed(() => {
  if (!textBox.value || !textBox.value.size) return null;
  return getTextBoxEndTile(textBox.value, textBox.value.size);
});
</script>

<style scoped>
/* TextBoxTransformControls 样式 */
</style>
