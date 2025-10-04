import { ref, watch } from 'vue';
import { getItemByIdOrThrow } from '@/utils';
import {
  useIsoflowModelStore,
  useIsoflowUiStateStore
} from 'src/context/isoflowContext';

export const useRectangle = (id: string) => {
  const modelStore = useIsoflowModelStore<any>();
  const uiStateStore = useIsoflowUiStateStore<any>();
  const rectangle = ref<any>(null);

  const updateRectangle = () => {
    try {
      // 获取当前视图的矩形
      const currentViewId = uiStateStore.view;
      const currentView = getItemByIdOrThrow(
        modelStore.views || [],
        currentViewId
      ).value;
      const rectangles = (currentView as any).rectangles || [];

      rectangle.value = getItemByIdOrThrow(rectangles, id).value;
    } catch (error) {
      console.warn(`Rectangle with id ${id} not found`);
      rectangle.value = null;
    }
  };

  // 监听id和相关状态变化
  watch(
    [() => id, () => uiStateStore.view, () => modelStore.views],
    updateRectangle,
    {
      immediate: true,
      deep: true
    }
  );

  return rectangle;
};
