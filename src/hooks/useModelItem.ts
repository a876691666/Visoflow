import { ref, watch } from 'vue';
import type { ModelItem } from '@/types';
import { useSceneStore } from 'src/stores/provider';

export const useModelItem = (id: string) => {
  const sceneStore = useSceneStore();
  const modelItem = ref<ModelItem | null>(null);

  const updateModelItem = () => {
    modelItem.value = sceneStore.getItem(id) || null;
  };

  // 监听id和model.items变化
  watch([() => id, sceneStore.items], updateModelItem, {
    immediate: true
  });

  return modelItem;
};
