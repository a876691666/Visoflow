import { ref, watch } from 'vue';
import type { IconCollectionStateWithIcons } from '@/types';
import {
  useIsoflowModelStore,
  useIsoflowUiStateStore
} from 'src/context/isoflowContext';

export const useIconCategories = () => {
  const modelStore = useIsoflowModelStore<any>();
  const uiStateStore = useIsoflowUiStateStore<any>();
  const iconCategories = ref<IconCollectionStateWithIcons[]>([]);

  const updateIconCategories = () => {
    const icons = modelStore.icons || [];
    const iconCategoriesState = uiStateStore.iconCategoriesState || [];

    iconCategories.value = iconCategoriesState.map((collection: any) => {
      return {
        ...collection,
        icons: icons.filter((icon: any) => {
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
