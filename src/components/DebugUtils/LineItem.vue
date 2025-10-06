<template>
  <div class="line-item" :style="lineItemStyles">
    <div class="title-section" :style="titleSectionStyles">
      <span class="title-text">{{ title }}</span>
    </div>
    <div class="value-section" :style="valueSectionStyles">
      <Value :value="value.toString()" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type CSSProperties } from 'vue';
import Value from './Value.vue';

interface Props {
  title: string;
  value: string | number;
}

defineProps<Props>();

const lineItemStyles = ref<CSSProperties>({
  display: 'flex',
  width: '100%',
  padding: '8px 0',
  borderBottom: '1px solid #e0e0e0'
});

const titleSectionStyles = ref<CSSProperties>({
  width: '100px'
});

const valueSectionStyles = ref<CSSProperties>({
  flexGrow: '1'
});
</script>

<style scoped>
.line-item {
  /* 行项样式 */
}

.title-section {
  /* 标题区域样式 */
}

.value-section {
  /* 值区域样式 */
}

.title-text {
  font-size: 14px;
  color: #333;
}
</style>
