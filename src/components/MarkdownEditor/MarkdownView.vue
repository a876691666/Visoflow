<template>
  <div class="markdown-editor" :style="editorStyles" v-html="htmlContent"></div>
</template>

<script setup lang="ts">
import { ref, watch, type CSSProperties } from 'vue';

interface Props {
  value?: string;
  readOnly?: boolean;
  height?: number;
  styles?: CSSProperties;
}

const props = withDefaults(defineProps<Props>(), {
  value: '',
  readOnly: false,
  height: 120,
  styles: () => ({})
});

const htmlContent = ref('');
const editorStyles = ref<CSSProperties>({});

// 更新编辑器样式
const updateStyles = () => {
  editorStyles.value = {
    border: props.readOnly ? 'none' : '1px solid #ddd',
    borderRadius: '6px',
    ...props.styles
  };
};

// 监听value变化
watch(
  () => props.value,
  (newValue) => {
    htmlContent.value = newValue || '';
  },
  { immediate: true }
);

// 监听样式变化
watch(
  [() => props.styles, () => props.height, () => props.readOnly],
  updateStyles,
  { immediate: true, deep: true }
);
</script>

<style scoped>
.markdown-editor {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  white-space: pre-wrap;
}
</style>
