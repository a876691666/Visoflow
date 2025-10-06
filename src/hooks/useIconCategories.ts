import { ref, watch } from 'vue';
import type { IconCollectionStateWithIcons } from '@/types';
import { useIsoflowUiStateStore } from 'src/context/isoflowContext';
import { useSceneStore } from 'src/stores/provider';

export const useIconCategories = () => {
  const model = useSceneStore().model;
  const uiStateStore = useIsoflowUiStateStore<any>();
  const iconCategories = ref<IconCollectionStateWithIcons[]>([]);

  const updateIconCategories = () => {
    const icons = model.value.icons || [];
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
    [() => model.value.icons, () => uiStateStore.iconCategoriesState],
    updateIconCategories,
    {
      immediate: true
    }
  );

  return {
    iconCategories
  };
};
