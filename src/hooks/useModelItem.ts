import { ref, watch } from 'vue';
import type { ViewItem } from '@/types';
import { useSceneStore } from 'src/stores/provider';

export const useModelItem = (id: string) => {
  const sceneStore = useSceneStore();
  const modelItem = ref<ViewItem | null>(null);

  const updateModelItem = () => {
    modelItem.value = sceneStore.getItem(id) || null;
  };

  // 监听 id 和视图 items 变化
  watch([() => id, sceneStore.items], updateModelItem, {
    immediate: true
  });

  return modelItem;
};
