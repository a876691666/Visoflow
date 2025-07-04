import { ref, watch } from 'vue';
import type { IconCollectionStateWithIcons } from '@/types';
import { useUiStateStore } from '@/stores/uiStateStore';
import { useModelStore } from '@/stores/modelStore';

export const useIconCategories = () => {
  const modelStore = useModelStore();
  const uiStateStore = useUiStateStore();
  const iconCategories = ref<IconCollectionStateWithIcons[]>([]);

  const updateIconCategories = () => {
    const icons = modelStore.icons || [];
    const iconCategoriesState = uiStateStore.iconCategoriesState || [];

    iconCategories.value = iconCategoriesState.map((collection) => {
      return {
        ...collection,
        icons: icons.filter((icon) => {
          return icon.collection === collection.id;
        })
      };
    });
  };

  // 监听icons和iconCategoriesState变化
  watch(
    [() => modelStore.icons, () => uiStateStore.iconCategoriesState],
    updateIconCategories,
    {
      immediate: true,
      deep: true
    }
  );

  return {
    iconCategories
  };
};
