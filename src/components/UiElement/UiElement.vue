<template>
  <div class="ui-element" :style="elementStyles">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, type CSSProperties } from 'vue';

interface Props {
  styles?: CSSProperties;
}

const props = withDefaults(defineProps<Props>(), {
  styles: () => ({})
});

const elementStyles = ref<CSSProperties>({});

const updateStyles = () => {
  elementStyles.value = {
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    border: '1px solid #999',
    backgroundColor: 'white',
    ...props.styles
  };
};

// 监听styles变化
watch(() => props.styles, updateStyles, { immediate: true, deep: true });
</script>

<style scoped>
.ui-element {
  /* UI元素基础样式 */
}
</style>
