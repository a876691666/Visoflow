import { ref, watch } from 'vue';
import { getItemByIdOrThrow } from '@/utils';
import {
  useIsoflowModelStore,
  useIsoflowUiStateStore
} from 'src/context/isoflowContext';

export const useViewItem = (id: string) => {
  const modelStore = useIsoflowModelStore<any>();
  const uiStateStore = useIsoflowUiStateStore<any>();
  const viewItem = ref<any>(null);

  const updateViewItem = () => {
    try {
      // 获取当前视图
      const currentViewId = uiStateStore.view;
      const currentView = getItemByIdOrThrow(
        modelStore.views || [],
        currentViewId
      ).value;
      const items = (currentView as any).items || [];

      viewItem.value = getItemByIdOrThrow(items, id).value;
    } catch (error) {
      console.warn(`ViewItem with id ${id} not found`);
      viewItem.value = null;
    }
  };

  // 监听id和相关状态变化
  watch(
    [() => id, () => uiStateStore.view, () => modelStore.views],
    updateViewItem,
    {
      immediate: true,
      deep: true
    }
  );

  return viewItem;
};
