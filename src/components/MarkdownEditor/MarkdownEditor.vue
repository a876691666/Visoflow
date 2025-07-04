<template>
  <div class="markdown-editor" :style="editorStyles">
    <div v-if="!readOnly" class="toolbar">
      <button
        v-for="tool in tools"
        :key="tool"
        class="toolbar-button"
        @click="applyFormat(tool)"
      >
        {{ getToolLabel(tool) }}
      </button>
    </div>
    <div
      ref="editorRef"
      class="editor-content"
      :contenteditable="!readOnly"
      :style="contentStyles"
      @input="handleInput"
      v-html="htmlContent"
    />
  </div>
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

const emit = defineEmits<{
  change: [value: string];
}>();

const tools = ['bold', 'italic', 'underline', 'strike', 'link'];
const editorRef = ref<HTMLDivElement>();
const htmlContent = ref('');
const editorStyles = ref<CSSProperties>({});
const contentStyles = ref<CSSProperties>({});

// 更新编辑器样式
const updateStyles = () => {
  editorStyles.value = {
    border: props.readOnly ? 'none' : '1px solid #ddd',
    borderRadius: '6px',
    ...props.styles
  };

  contentStyles.value = {
    height: `${props.height}px`,
    padding: props.readOnly ? '0' : '8px',
    overflow: 'auto',
    outline: 'none',
    color: '#666',
    backgroundColor: props.readOnly ? 'transparent' : '#fff'
  };
};

// 处理输入
const handleInput = (event: Event) => {
  const target = event.target as HTMLDivElement;
  emit('change', target.innerHTML);
};

// 应用格式
const applyFormat = (format: string) => {
  if (props.readOnly) return;

  document.execCommand(format, false);
  if (editorRef.value) {
    emit('change', editorRef.value.innerHTML);
  }
};

// 获取工具标签
const getToolLabel = (tool: string): string => {
  const labels: Record<string, string> = {
    bold: 'B',
    italic: 'I',
    underline: 'U',
    strike: 'S',
    link: 'Link'
  };
  return labels[tool] || tool;
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
}

.toolbar {
  display: flex;
  gap: 4px;
  padding: 8px 0;
  border-bottom: 1px solid #ddd;
}

.toolbar-button {
  padding: 4px 8px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
}

.toolbar-button:hover {
  background: #f5f5f5;
}

.editor-content {
  word-wrap: break-word;
  line-height: 1.4;
}

.editor-content:focus {
  outline: 2px solid #1976d2;
  outline-offset: 1px;
}
</style>
