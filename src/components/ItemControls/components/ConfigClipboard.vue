<template>
  <div class="clipboard" :style="containerStyles">
    <button
      class="btn"
      :style="btnStyles"
      @click="onCopy"
      title="将配置保存到本地存储"
    >
      复制
    </button>
    <button
      class="btn"
      :style="btnStyles"
      @click="onPaste"
      title="从本地存储读取配置，快捷键 Ctrl+Q"
    >
      粘贴 (Ctrl+Q)
    </button>
    <span v-if="tip" class="tip" :style="tipStyles">{{ tip }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, type CSSProperties, onMounted, onBeforeUnmount } from 'vue';

interface Props {
  storageKey: string;
  getConfig: () => any;
  applyConfig: (cfg: any) => void;
}

const props = defineProps<Props>();

const tip = ref('');
let timer: number | undefined;

const showTip = (text: string) => {
  tip.value = text;
  if (timer) window.clearTimeout(timer);
  timer = window.setTimeout(() => (tip.value = ''), 1200);
};

const onCopy = () => {
  try {
    const data = props.getConfig?.();
    window.localStorage.setItem(props.storageKey, JSON.stringify(data ?? {}));
    showTip('已复制');
  } catch (e) {
    console.error(e);
    showTip('复制失败');
  }
};

const onPaste = () => {
  try {
    const raw = window.localStorage.getItem(props.storageKey);
    if (!raw) return showTip('无可用配置');
    const data = JSON.parse(raw);
    props.applyConfig?.(data);
    showTip('已粘贴');
  } catch (e) {
    console.error(e);
    showTip('粘贴失败');
  }
};

// 绑定 Ctrl+Q 快捷键触发粘贴
const onKeydown = (e: KeyboardEvent) => {
  // 避免在输入框/可编辑区域内触发
  const target = e.target as HTMLElement | null;
  const isEditable =
    !!target &&
    (target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      (target as HTMLElement).isContentEditable);
  if (isEditable) return;

  if (e.ctrlKey && e.key.toLowerCase() === 'q') {
    e.preventDefault(); // 阻止浏览器默认行为
    e.stopPropagation();
    onPaste();
  }
};

onMounted(() => {
  window.addEventListener('keydown', onKeydown, { capture: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown, { capture: true } as any);
});

const containerStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const btnStyles: CSSProperties = {
  padding: '6px 10px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  background: '#fff',
  cursor: 'pointer',
  fontSize: '12px'
};

const tipStyles: CSSProperties = {
  fontSize: '12px',
  color: '#666',
  marginLeft: '4px'
};
</script>

<style scoped>
.btn:hover {
  background-color: #f5f5f5;
}
</style>
