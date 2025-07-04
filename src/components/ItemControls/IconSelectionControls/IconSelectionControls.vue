<template>
  <ControlsContainer>
    <template #header>
      <Section :styles="headerSectionStyles">
        <div class="header-stack" :style="stackStyles">
          <Searchbox :value="filter" @change="handleFilterChange" />
          <div class="alert" :style="alertStyles">
            <span class="alert-text"
              >You can drag and drop any item below onto the canvas.</span
            >
          </div>
        </div>
      </Section>
    </template>

    <Section v-if="filteredIcons">
      <IconGrid :icons="filteredIcons" @mouse-down="handleIconMouseDown" />
    </Section>

    <Icons
      v-else
      :icon-categories="iconCategories"
      @mouse-down="handleIconMouseDown"
    />
  </ControlsContainer>
</template>

<script setup lang="ts">
import { ref, watch, type CSSProperties } from 'vue';
import { useUiStateStore } from '@/stores/uiStateStore';
import { useIconFiltering } from 'src/hooks/useIconFiltering';
import { useIconCategories } from 'src/hooks/useIconCategories';
import type { Icon } from '@/types';
import ControlsContainer from '../components/ControlsContainer.vue';
import Section from '../components/Section.vue';
import Searchbox from './Searchbox.vue';
import Icons from './Icons.vue';
import IconGrid from './IconGrid.vue';

const uiStateStore = useUiStateStore();

// 状态管理
const mode = ref<any>(null);
const filter = ref('');
const filteredIcons = ref<Icon[] | null>(null);
const iconCategories = ref<any[]>([]);

// 样式
const headerSectionStyles = ref<CSSProperties>({
  position: 'sticky',
  top: '0',
  paddingTop: '48px',
  paddingBottom: '24px'
});

const stackStyles = ref<CSSProperties>({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
});

const alertStyles = ref<CSSProperties>({
  padding: '12px 16px',
  backgroundColor: '#e3f2fd',
  borderLeft: '4px solid #2196f3',
  borderRadius: '4px',
  fontSize: '14px',
  color: '#1976d2'
});

// Composables
const {
  setFilter,
  filteredIcons: filteredIconsFromHook,
  filter: filterFromHook
} = useIconFiltering();
const { iconCategories: iconCategoriesFromHook } = useIconCategories();

const updateMode = () => {
  mode.value = uiStateStore.mode;
};

const updateFilter = () => {
  filter.value = filterFromHook.value;
};

const updateFilteredIcons = () => {
  filteredIcons.value = filteredIconsFromHook.value;
};

const updateIconCategories = () => {
  iconCategories.value = iconCategoriesFromHook.value;
};

const handleFilterChange = (newFilter: string) => {
  setFilter(newFilter);
};

const handleIconMouseDown = (icon: Icon) => {
  if (mode.value?.type !== 'PLACE_ICON') return;

  uiStateStore.setMode({
    type: 'PLACE_ICON',
    showCursor: true,
    id: icon.id
  });
};

// 监听状态变化
watch(() => uiStateStore.mode, updateMode, { immediate: true, deep: true });
watch(() => filterFromHook.value, updateFilter, { immediate: true });
watch(() => filteredIconsFromHook.value, updateFilteredIcons, {
  immediate: true,
  deep: true
});
watch(() => iconCategoriesFromHook.value, updateIconCategories, {
  immediate: true,
  deep: true
});
</script>

<style scoped>
.header-stack {
  /* 头部堆栈样式 */
}

.alert {
  /* 警告框样式 */
}

.alert-text {
  /* 警告文本样式 */
}
</style>
