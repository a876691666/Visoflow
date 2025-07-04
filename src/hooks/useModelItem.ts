import { ref, watch } from 'vue';
import type { ModelItem } from '@/types';
import { useModelStore } from '@/stores/modelStore';
import { getItemByIdOrThrow } from '@/utils';

export const useModelItem = (id: string) => {
  const modelStore = useModelStore();
  const modelItem = ref<ModelItem | null>(null);

  const updateModelItem = () => {
    try {
      modelItem.value = getItemByIdOrThrow(modelStore.items || [], id).value;
    } catch (error) {
      console.warn(`ModelItem with id ${id} not found`);
      modelItem.value = null;
    }
  };

  // 监听id和model.items变化
  watch([() => id, () => modelStore.items], updateModelItem, {
    immediate: true,
    deep: true
  });

  return modelItem;
};
