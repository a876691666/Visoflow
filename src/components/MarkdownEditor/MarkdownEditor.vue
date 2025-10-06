<template>
  <div class="markdown-editor" :class="{ 'read-only': props.readOnly }">
    <div ref="editorRef" :style="containerStyle"></div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type CSSProperties
} from 'vue';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

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

const editorRef = ref<HTMLDivElement | null>(null);
let quill: Quill | null = null;

const tools = ['bold', 'italic', 'underline', 'strike', 'link'] as const;

const initQuill = (initialHtml?: string) => {
  if (!editorRef.value) return;

  quill = new Quill(editorRef.value, {
    theme: 'snow',
    readOnly: props.readOnly,
    formats: [...tools],
    modules: {
      toolbar: props.readOnly ? false : [...tools]
    }
  });

  // 初始化内容
  const initial = initialHtml ?? props.value ?? '';
  quill.clipboard.dangerouslyPasteHTML(initial);

  // 同步内容到外部
  quill.on('text-change', () => {
    if (!quill) return;
    const html = editorRef.value?.querySelector('.ql-editor')?.innerHTML ?? '';
    emit('change', html);
  });
};

onMounted(async () => {
  await nextTick();
  initQuill();
});

onBeforeUnmount(() => {
  quill = null;
});

// 外部 value 变化时更新 Quill（避免循环更新）
watch(
  () => props.value,
  (val) => {
    if (!quill) return;
    const current =
      editorRef.value?.querySelector('.ql-editor')?.innerHTML ?? '';
    const next = val ?? '';
    if (current !== next) {
      const sel = quill.getSelection();
      quill.clipboard.dangerouslyPasteHTML(next);
      if (sel) quill.setSelection(sel.index, sel.length ?? 0);
    }
  }
);

// 只读切换（禁用输入 + 隐藏工具栏）
watch(
  () => props.readOnly,
  async (ro) => {
    if (!quill) return;
    quill.enable(!ro);

    const toolbar = editorRef.value
      ?.previousElementSibling as HTMLElement | null;
    if (toolbar && toolbar.classList.contains('ql-toolbar')) {
      toolbar.style.display = ro ? 'none' : '';
    }

    // 从只读切换到可编辑，且当前没有工具栏，则重建 Quill 以启用 toolbar
    const hasToolbar = !!(
      editorRef.value?.previousElementSibling &&
      (
        editorRef.value?.previousElementSibling as HTMLElement
      ).classList?.contains('ql-toolbar')
    );
    if (!ro && !hasToolbar) {
      const currentHtml =
        editorRef.value?.querySelector('.ql-editor')?.innerHTML ?? '';
      // 清空并重新挂载
      if (editorRef.value) {
        const parent = editorRef.value.parentElement;
        const fresh = document.createElement('div');
        if (parent) parent.replaceChild(fresh, editorRef.value);
        editorRef.value = fresh;
        quill = null;
        await nextTick();
        initQuill(currentHtml);
      }
    }
  }
);

// 容器样式（对齐 React 版本的 MUI sx）
const containerStyle = computed<CSSProperties>(() => {
  const base: CSSProperties = {
    border: props.readOnly ? 'none' : '1px solid #e0e0e0', // grey.300 近似
    borderRadius: '12px', // MUI 1.5 * 8 = 12px 近似
    height: `${props.height}px`,
    color: '#6b7280' // text.secondary 近似
  };
  return { ...base, ...(props.styles || {}) };
});
</script>

<style scoped>
/* 对齐 React 版本的样式调整 */
.markdown-editor :deep(.ql-toolbar.ql-snow) {
  border: none;
  padding: 0; /* pt:0, px:0 */
}

/* Quill 在 toolbar 后创建 .ql-container（此处为 editorRef 本身） */
/* 只读时移除编辑区域 padding，保持与 React 版一致 */
.markdown-editor.read-only :deep(.ql-editor) {
  padding: 0;
}

/* 基本文字样式（延续原组件） */
.markdown-editor :deep(.ql-editor) {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  white-space: pre-wrap;
}
</style>
