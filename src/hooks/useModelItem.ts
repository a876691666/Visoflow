import { ref, watch } from 'vue';
import type { ModelItem } from '@/types';
import { useIsoflowModelStore } from 'src/context/isoflowContext';
import { getItemByIdOrThrow } from '@/utils';

export const useModelItem = (id: string) => {
  const modelStore = useIsoflowModelStore<any>();
  const modelItem = ref<ModelItem | null>(null);

  const updateModelItem = () => {
    try {
      modelItem.value = getItemByIdOrThrow<ModelItem>(
        (modelStore.items || []) as ModelItem[],
        id
      ).value;
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
