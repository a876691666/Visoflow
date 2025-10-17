<template>
  <div
    class="text-box"
    :class="textBox.class"
    :style="containerStyle"
    :data-item-id="textBox.id"
    data-item-type="TEXTBOX"
  >
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
const { fontProps, update } = useTextBoxProps(props.textBox);

const { css, update: updateProjectionHooks } = useIsoProjection();
// 更新等距投影
const updateProjection = () => {
  if (!props.textBox?.tile || !props.textBox?.size) return;

  const toCoords = CoordsUtils.add(props.textBox.tile, {
    x: props.textBox.size.width,
    y: 0
  });

  updateProjectionHooks({
    from: props.textBox.tile,
    to: toCoords,
    orientation: props.textBox.orientation
  });
};

// 更新容器样式
const updateContainerStyle = () => {
  updateProjection();
  containerStyle.value = {
    ...css.value,
    userSelect: 'none',
    ...(props.textBox.containerStyle
      ? {
          height: toPx(props.textBox.containerStyle.height)
        }
      : {})
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
    boxSizing: 'border-box',
    ...(props.textBox.contentStyle ?? {})
  };
};

// 更新文本样式
const updateTextStyle = () => {
  update(props.textBox);

  textStyle.value = {
    ...fontProps.value,
    margin: 0,
    padding: 0,
    lineHeight: '1',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: 'inherit',
    ...(props.textBox.textStyle ?? {})
  };
};

// 监听textBox变化并更新所有样式
const updateAllStyles = () => {
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
    immediate: true
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
</script>

<style scoped>
/* Styles are handled dynamically through the component's reactive style objects */
</style>
