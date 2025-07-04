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
      :node="currentViewItem"
      @model-item-updated="handleModelItemUpdate"
      @view-item-updated="handleViewItemUpdate"
      @deleted="handleDeleted"
    />

    <Icons
      v-if="mode === 'CHANGE_ICON'"
      :key="props.id"
      :icon-categories="currentIconCategories"
      @click="handleIconSelect"
    />
  </ControlsContainer>
</template>

<script setup lang="ts">
import { ref, watch, type CSSProperties } from 'vue';
import { useSceneStore } from '@/stores/sceneStore';
import { useUiStateStore } from '@/stores/uiStateStore';
import ControlsContainer from '../components/ControlsContainer.vue';
import Section from '../components/Section.vue';
import NodeSettings from './NodeSettings/NodeSettings.vue';
import Icons from '../IconSelectionControls/Icons.vue';

interface Props {
  id: string;
}

const props = defineProps<Props>();

type Mode = 'SETTINGS' | 'CHANGE_ICON';

const sceneStore = useSceneStore();
const uiStateStore = useUiStateStore();

const mode = ref<Mode>('SETTINGS');
const currentViewItem = ref<any>({});
const currentModelItem = ref<any>({});
const iconUrl = ref<string>('');
const currentIconCategories = ref<any[]>([]);

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

const updateData = () => {
  // 从store获取数据，而不是使用composables
  currentViewItem.value = sceneStore.viewItems?.[props.id] || {};
  currentModelItem.value = sceneStore.modelItems?.[props.id] || {};

  // 设置默认图标URL
  iconUrl.value = 'https://via.placeholder.com/70x70?text=Icon';

  // 设置默认图标分类
  currentIconCategories.value = [];
};

const switchToChangeIcon = () => {
  mode.value = 'CHANGE_ICON';
};

const switchToSettings = () => {
  mode.value = 'SETTINGS';
};

const handleModelItemUpdate = (updates: any) => {
  // 这些方法需要在store中实现
  console.log('Model item update:', updates);
};

const handleViewItemUpdate = (updates: any) => {
  console.log('View item update:', updates);
};

const handleDeleted = () => {
  uiStateStore.setItemControls(null);
  console.log('Delete item:', props.id);
};

const handleIconSelect = (iconItem: any) => {
  console.log('Icon select:', iconItem);
};

// 监听ID变化
watch(() => props.id, updateData, { immediate: true });

// 初始化样式
updateStyles();
</script>

<style scoped>
.node-header {
  /* 节点头部样式 */
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
}

.mode-button {
  /* 模式切换按钮样式 */
}

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
