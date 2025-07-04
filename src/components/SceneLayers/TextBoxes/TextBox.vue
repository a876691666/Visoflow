<template>
  <div class="text-box" :style="cssStyles">
    <div class="text-box-content" :style="contentStyles">
      <div class="text-box-text" :style="fontStyles">
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

const cssStyles = ref<CSSProperties>({});
const contentStyles = ref<CSSProperties>({});
const fontStyles = ref<CSSProperties>({});
const paddingX = ref(0);

// 计算样式的函数
const updateStyles = () => {
  const { paddingX: px, fontProps } = useTextBoxProps(props.textBox);
  paddingX.value = px;
  fontStyles.value = fontProps;

  const to = CoordsUtils.add(props.textBox.tile, {
    x: props.textBox.size.width,
    y: 0
  });

  const { css } = useIsoProjection({
    from: props.textBox.tile,
    to,
    orientation: props.textBox.orientation
  });

  cssStyles.value = css;
  contentStyles.value = {
    position: 'absolute',
    top: '0',
    left: '0',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    paddingLeft: toPx(paddingX.value),
    paddingRight: toPx(paddingX.value)
  };
};

// 监听textBox变化
watch(() => props.textBox, updateStyles, { immediate: true, deep: true });
</script>

<style scoped>
.text-box {
  /* TextBox base styles */
}

.text-box-content {
  /* Content container styles */
}

.text-box-text {
  /* Text styles */
}
</style>
