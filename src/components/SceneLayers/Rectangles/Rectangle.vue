<template>
  <IsoTileArea
    :from="from"
    :to="to"
    :fill="fillColor"
    :corner-radius="22"
    :stroke="strokeConfig"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useColor } from 'src/hooks/useColor';
import IsoTileArea from '@/components/IsoTileArea/IsoTileArea.vue';
import type { Coords } from '@/types';

interface Props {
  from: Coords;
  to: Coords;
  color: string;
}

const props = defineProps<Props>();

const fillColor = ref('');
const strokeConfig = ref<any>({});

const updateColors = () => {
  const color = useColor(props.color);
  if (color.value) {
    fillColor.value = color.value.value;

    // 生成深色变体作为描边颜色
    const baseColor = color.value.value;
    let strokeColor = baseColor;

    // 简单的颜色变暗逻辑
    if (baseColor.startsWith('#')) {
      const hex = baseColor.slice(1);
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);

      const darkerR = Math.max(0, r - 40);
      const darkerG = Math.max(0, g - 40);
      const darkerB = Math.max(0, b - 40);

      strokeColor = `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`;
    }

    strokeConfig.value = {
      color: strokeColor,
      width: 1
    };
  }
};

// 监听颜色变化
watch(() => props.color, updateColors, { immediate: true });
</script>

<style scoped>
/* Rectangle组件样式 */
</style>
