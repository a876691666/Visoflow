import { ref, watch } from 'vue';
import { useIsoflowModelStore } from 'src/context/isoflowContext';
import type { Icon } from '@/types';

export const useIconFiltering = () => {
  const modelStore = useIsoflowModelStore<any>();
  const filter = ref<string>('');
  const filteredIcons = ref<Icon[] | null>(null);

  const setFilter = (newFilter: string) => {
    filter.value = newFilter;
  };

  const updateFilteredIcons = () => {
    if (filter.value === '') {
      filteredIcons.value = null;
      return;
    }

    const regex = new RegExp(filter.value, 'gi');
    const icons = modelStore.icons || [];

    filteredIcons.value = icons.filter((icon: Icon) => {
      if (!filter.value) {
        return true;
      }

      return regex.test(icon.name);
    });
  };

  // 监听filter和icons变化
  watch([filter, () => modelStore.icons], updateFilteredIcons, {
    immediate: true,
    deep: true
  });

  return {
    setFilter,
    filter,
    filteredIcons
  };
};
