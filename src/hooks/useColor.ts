import { ref, watch } from 'vue';
import { getItemByIdOrThrow } from '@/utils';
import { useIsoflowModelStore } from '@/context/isoflowContext';

export const useColor = (colorId?: string) => {
  const modelStore = useIsoflowModelStore<any>();
  const color = ref<any>(null);

  const updateColor = () => {
    const colors = modelStore.colors || [];

    if (colorId === undefined) {
      if (colors.length > 0) {
        color.value = colors[0];
      } else {
        throw new Error('No colors available.');
      }
    } else {
      color.value = getItemByIdOrThrow(colors, colorId).value;
    }
  };

  // 监听colorId和store变化
  watch([() => colorId, () => modelStore.colors], updateColor, {
    immediate: true,
    deep: true
  });

  return color;
};
