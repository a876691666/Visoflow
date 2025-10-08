<template>
  <ControlsContainer header>
    <template #header>
      <div class="odp-header">
        <div class="odp-title">对象详情</div>
      </div>
    </template>
    <ObjectDetails v-if="item" :item-id="props.id" @cancel="onCancel" />
    <div v-else class="odp-empty">未找到对象。</div>
  </ControlsContainer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ControlsContainer from '../components/ControlsContainer.vue';
import ObjectDetails from './ObjectDetails.vue';
import { useModelItem } from 'src/hooks/useModelItem';
import { useIsoflowUiStateStore } from 'src/context/isoflowContext';

interface Props {
  id: string;
}
const props = defineProps<Props>();

const ui = useIsoflowUiStateStore<any>();
const modelItem = useModelItem(props.id);
const item = computed(() => modelItem.value);

const onCancel = () => {
  // 详情面板取消或删除后关闭面板
  ui.setItemControls(null);
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
