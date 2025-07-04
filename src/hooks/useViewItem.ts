import { ref, watch } from 'vue';
import { getItemByIdOrThrow } from '@/utils';
import { useModelStore } from '@/stores/modelStore';
import { useUiStateStore } from '@/stores/uiStateStore';

export const useViewItem = (id: string) => {
  const modelStore = useModelStore();
  const uiStateStore = useUiStateStore();
  const viewItem = ref<any>(null);

  const updateViewItem = () => {
    try {
      // 获取当前视图
      const currentViewId = uiStateStore.view;
      const currentView = getItemByIdOrThrow(
        modelStore.views || [],
        currentViewId
      ).value;
      const items = currentView.items || [];

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
