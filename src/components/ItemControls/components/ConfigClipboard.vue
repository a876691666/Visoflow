<template>
  <div class="clipboard" :style="containerStyles">
    <button class="btn" :style="btnStyles" @click="onCopy">复制</button>
    <button class="btn" :style="btnStyles" @click="onPaste">粘贴</button>
    <span v-if="tip" class="tip" :style="tipStyles">{{ tip }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, type CSSProperties } from 'vue';

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
