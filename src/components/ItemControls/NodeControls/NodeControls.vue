<template>
  <ControlsContainer>
    <div class="node-header" :style="headerStyles">
      <Section :styles="{ paddingTop: '16px', paddingBottom: '16px' }">
        <div class="header-content">
          <img :src="iconUrl" :style="iconStyles" alt="Node icon" />
          <button
            v-if="mode === 'SETTINGS'"
            class="mode-button"
            :style="buttonStyles"
            @click="switchToChangeIcon"
          >
            Update icon
            <svg class="chevron-right" viewBox="0 0 24 24">
              <path
                d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"
              />
            </svg>
          </button>
          <button
            v-if="mode === 'CHANGE_ICON'"
            class="mode-button"
            :style="buttonStyles"
            @click="switchToSettings"
          >
            <svg class="chevron-left" viewBox="0 0 24 24">
              <path
                d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"
              />
            </svg>
            Settings
          </button>
        </div>
      </Section>
    </div>

    <NodeSettings
      v-if="mode === 'SETTINGS'"
      :key="props.id"
      :node="nodeView"
      :on-model-item-updated="handleModelItemUpdate"
      :on-view-item-updated="handleViewItemUpdate"
      :on-deleted="handleDeleted"
    />
  </ControlsContainer>
</template>

<script setup lang="ts">
import { ref, watch, computed, type CSSProperties } from 'vue';
import { useIsoflowUiStateStore } from 'src/context/isoflowContext';
import ControlsContainer from '../components/ControlsContainer.vue';
import Section from '../components/Section.vue';
import NodeSettings from './NodeSettings/NodeSettings.vue';
import { useSceneStore } from 'src/stores/provider';
import { DEFAULT_ICON } from 'src/config';
import type { ViewItem } from '@/types';

interface Props {
  id: string;
}

const props = defineProps<Props>();

type Mode = 'SETTINGS' | 'CHANGE_ICON';

const sceneStore = useSceneStore();
const uiStateStore = useIsoflowUiStateStore<any>();

const mode = ref<Mode>('SETTINGS');
const currentItem = ref<any>(null);

// 提供给 NodeSettings 的视图数据（最少字段）
const nodeView = computed<ViewItem>(() => ({
  id: currentItem.value?.id ?? props.id,
  tile: currentItem.value?.tile ?? { x: 0, y: 0 },
  labelHeight: currentItem.value?.labelHeight ?? 120
}));

// 当前图标 URL（来自模型 icons）
const iconUrl = computed<string>(() => {
  const iconId = currentItem.value?.icon as string | undefined;
  if (!iconId) return DEFAULT_ICON.url;
  const icon = sceneStore.getIcon(iconId) || DEFAULT_ICON;
  return icon.url || DEFAULT_ICON.url;
});

const headerStyles = ref<CSSProperties>({});
const iconStyles = ref<CSSProperties>({});
const buttonStyles = ref<CSSProperties>({});

const updateStyles = () => {
  headerStyles.value = {
    backgroundColor: '#f5f5f5'
  };

  iconStyles.value = {
    width: '70px',
    height: '70px'
  };

  buttonStyles.value = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#1976d2'
  };
};

const updateCurrentItem = () => {
  currentItem.value = sceneStore.getItem(props.id) || null;
};

const switchToChangeIcon = () => {
  mode.value = 'CHANGE_ICON';
};

const switchToSettings = () => {
  mode.value = 'SETTINGS';
};

const handleModelItemUpdate = (updates: any) => {
  // 更新模型相关字段（name/description/icon 等）
  sceneStore.updateItem(props.id, { ...updates });
  // 同步本地状态
  updateCurrentItem();
};

const handleViewItemUpdate = (updates: any) => {
  // 更新视图相关字段（例如 labelHeight 等）
  sceneStore.updateItem(props.id, { ...updates });
  updateCurrentItem();
};

const handleDeleted = () => {
  uiStateStore.setItemControls(null);
  sceneStore.removeItem(props.id);
};

// 监听ID变化
watch([() => props.id, sceneStore.items], updateCurrentItem, {
  immediate: true
});

// 初始化样式
updateStyles();
</script>

<style scoped>
/* .node-header styles are applied via inline style objects */

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
}

/* .mode-button styles are applied via inline style objects */

.mode-button:hover {
  background-color: rgba(25, 118, 210, 0.04);
}

.chevron-right,
.chevron-left {
  width: 16px;
  height: 16px;
  fill: currentColor;
}
</style>
