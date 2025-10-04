<template>
  <div class="text-box" :style="containerStyle">
    <div class="text-box-content" :style="contentStyle">
      <div class="text-box-text" :style="textStyle">
        {{ textBox.content }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, type CSSProperties } from 'vue';
import { toPx, CoordsUtils } from '@/utils';
import { useIsoProjection } from '@/hooks/useIsoProjection';
import { useTextBoxProps } from '@/hooks/useTextBoxProps';
import type { TextBox, SceneTextBox } from '@/types';

interface Props {
  textBox: TextBox & SceneTextBox;
}

const props = defineProps<Props>();

// 响应式样式状态
const containerStyle = ref<CSSProperties>({});
const contentStyle = ref<CSSProperties>({});
const textStyle = ref<CSSProperties>({});

// 缓存的属性值
const { paddingX, fontProps } = useTextBoxProps(props.textBox);
const projectionCSS = ref<CSSProperties>({});

// 更新等距投影
const updateProjection = () => {
  if (!props.textBox?.tile || !props.textBox?.size) return;

  const toCoords = CoordsUtils.add(props.textBox.tile, {
    x: props.textBox.size.width,
    y: 0
  });

  const { css } = useIsoProjection({
    from: props.textBox.tile,
    to: toCoords,
    orientation: props.textBox.orientation
  });

  projectionCSS.value = css.value;
};

// 更新容器样式
const updateContainerStyle = () => {
  containerStyle.value = {
    ...projectionCSS.value,
    pointerEvents: 'none',
    userSelect: 'none'
  };
};

// 更新内容样式
const updateContentStyle = () => {
  contentStyle.value = {
    position: 'absolute',
    top: '0',
    left: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    height: '100%',
    paddingLeft: toPx(paddingX.value),
    paddingRight: toPx(paddingX.value),
    boxSizing: 'border-box'
  };
};

// 更新文本样式
const updateTextStyle = () => {
  textStyle.value = {
    ...fontProps.value,
    margin: 0,
    padding: 0,
    lineHeight: '1',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: 'inherit'
  };
};

// 监听textBox变化并更新所有样式
const updateAllStyles = () => {
  updateProjection();
  updateContainerStyle();
  updateContentStyle();
  updateTextStyle();
};

// 监听props.textBox的变化
watch(
  () => props.textBox,
  () => {
    updateAllStyles();
  },
  {
    immediate: true,
    deep: true
  }
);

// 监听特定属性变化以优化性能
watch(
  () => props.textBox?.tile,
  () => {
    updateProjection();
    updateContainerStyle();
  },
  { deep: true, immediate: true }
);

watch(
  () => props.textBox?.size,
  () => {
    updateProjection();
    updateContainerStyle();
  },
  { deep: true }
);

watch(
  () => props.textBox?.fontSize,
  () => {
    updateTextStyle();
  }
);

watch(
  () => props.textBox?.orientation,
  () => {
    updateProjection();
    updateContainerStyle();
  }
);

watch(
  () => paddingX.value,
  () => {
    updateContentStyle();
  }
);

watch(
  () => fontProps.value,
  () => {
    updateTextStyle();
  },
  { deep: true }
);
</script>

<style scoped>
/* Styles are handled dynamically through the component's reactive style objects */
</style>
