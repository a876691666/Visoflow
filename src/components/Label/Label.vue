<template>
  <div
    class="label-container"
    :style="{ position: 'absolute', width: `${maxWidth}px` }"
  >
    <!-- Connector line -->
    <svg
      v-if="(labelHeight || 0) > 0"
      :viewBox="`0 0 ${CONNECTOR_DOT_SIZE} ${labelHeight || 0}`"
      :width="CONNECTOR_DOT_SIZE"
      class="connector-line"
      :style="{
        position: 'absolute',
        top: `-${labelHeight || 0}px`,
        left: `-${CONNECTOR_DOT_SIZE / 2}px`
      }"
    >
      <line
        :x1="CONNECTOR_DOT_SIZE / 2"
        :y1="0"
        :x2="CONNECTOR_DOT_SIZE / 2"
        :y2="labelHeight || 0"
        :stroke-dasharray="`0, ${CONNECTOR_DOT_SIZE * 2}`"
        stroke="black"
        :stroke-width="CONNECTOR_DOT_SIZE"
        stroke-linecap="round"
      />
    </svg>

    <!-- Content container -->
    <div ref="contentRef" class="label-content" :style="contentStyles">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, type CSSProperties } from 'vue';

const CONNECTOR_DOT_SIZE = 3;

interface Props {
  labelHeight?: number;
  maxWidth: number;
  maxHeight?: number;
  expandDirection?: 'CENTER' | 'BOTTOM';
  styles?: CSSProperties;
}

const props = withDefaults(defineProps<Props>(), {
  labelHeight: 0,
  expandDirection: 'CENTER',
  styles: () => ({})
});

const contentRef = ref<HTMLDivElement>();
const contentStyles = ref<CSSProperties>({});

const updateContentStyles = () => {
  const transform = `translate(-50%, ${
    props.expandDirection === 'BOTTOM' ? '-100%' : '-50%'
  })`;

  contentStyles.value = {
    position: 'absolute',
    display: 'inline-block',
    backgroundColor: 'white',
    border: '1px solid #999',
    borderRadius: '8px',
    padding: '8px 12px',
    transformOrigin: 'bottom center',
    transform,
    overflow: 'hidden',
    top: `-${props.labelHeight || 0}px`,
    maxHeight: props.maxHeight ? `${props.maxHeight}px` : undefined,
    ...props.styles
  };
};

// 监听props变化
watch(
  [
    () => props.maxHeight,
    () => props.labelHeight,
    () => props.expandDirection,
    () => props.styles
  ],
  updateContentStyles,
  { immediate: true, deep: true }
);
</script>

<style scoped>
.label-container {
  /* Label container styles */
}

.connector-line {
  /* Connector line styles */
}

.label-content {
  /* Content styles */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
