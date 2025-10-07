<template>
  <ControlsContainer header>
    <template #header>
      <div class="odp-header">
        <div class="odp-title">对象详情</div>
      </div>
    </template>
    <ObjectDetails
      v-if="item"
      :value="item"
      :is-editing="true"
      @save="onSave"
      @cancel="onCancel"
      @delete="onDelete"
    />
    <div v-else class="odp-empty">未找到对象。</div>
  </ControlsContainer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ControlsContainer from '../components/ControlsContainer.vue';
import ObjectDetails from './ObjectDetails.vue';
import { useModelItem } from 'src/hooks/useModelItem';
import { useSceneStore } from 'src/stores/provider';
import { useIsoflowUiStateStore } from 'src/context/isoflowContext';
import type { ViewItem } from '@/types';

interface Props {
  id: string;
}
const props = defineProps<Props>();

const scene = useSceneStore();
const ui = useIsoflowUiStateStore<any>();
const modelItem = useModelItem(props.id);
const item = computed<ViewItem | null>(() => modelItem.value);

const onSave = (value: ViewItem) => {
  scene.updateItem(value.id, value);
};

const onDelete = () => {
  scene.removeItem(props.id);
  ui.setItemControls(null);
};

const onCancel = () => {
  // 选中对象详情面板取消操作：保持选择，什么也不做或可选择关闭
};
</script>

<style scoped>
.odp-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}
.odp-title {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}
.odp-empty {
  padding: 16px;
  color: #64748b;
  font-size: 13px;
}
</style>
