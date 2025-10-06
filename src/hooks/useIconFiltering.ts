import { ref, watch } from 'vue';
import type { Icon } from '@/types';
import { useSceneStore } from 'src/stores/provider';

export const useIconFiltering = () => {
  const icons = useSceneStore().icons;
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

    filteredIcons.value = icons.value.filter((icon: Icon) => {
      if (!filter.value) {
        return true;
      }

      return regex.test(icon.name);
    });
  };

  // 监听filter和icons变化
  watch([filter, icons], updateFilteredIcons, {
    immediate: true
  });

  return {
    setFilter,
    filter,
    filteredIcons
  };
};
