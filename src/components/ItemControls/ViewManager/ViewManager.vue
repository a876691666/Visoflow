<template>
  <ControlsContainer header>
    <template #header>
      <Section :styles="headerSectionStyles">
        <div class="header-stack" :style="stackStyles">
          <div class="header-actions">
            <button
              class="btn btn-primary"
              :style="btnPrimaryStyles"
              @click="startCreateFromHeader"
            >
              新建视图
            </button>
          </div>
        </div>
      </Section>
    </template>

    <Section>
      <div class="manage-panel" :style="managePanelStyles">
        <!-- 模式一：详情页，仅在新建/编辑时显示 -->
        <ViewDetailsForm
          v-if="showDetails"
          ref="detailsRef"
          @close="showDetails = false"
        />
        <!-- 模式二：列表+统计，默认显示 -->
        <ViewListPanel
          v-else
          @select="selectView"
          @edit="onEdit"
          @delete="confirmDelete"
          @duplicate="duplicateView"
        />
      </div>
    </Section>
  </ControlsContainer>
</template>

<script setup lang="ts">
import { ref, type CSSProperties, nextTick } from 'vue';
import type { View } from '@/types';
import { useSceneStore } from 'src/stores/provider';
import { generateId } from 'src/utils';
import ControlsContainer from '../components/ControlsContainer.vue';
import Section from '../components/Section.vue';
import ViewDetailsForm from './ViewDetailsForm.vue';
import ViewListPanel from './ViewListPanel.vue';

const store = useSceneStore();

// 详情页显示开关（默认仅显示列表与统计）
const showDetails = ref(false);

// 引用子表单组件实例
const detailsRef = ref<InstanceType<typeof ViewDetailsForm>>();

// 顶部按钮：新建视图 -> 交给子表单并显示详情
const startCreateFromHeader = async () => {
  showDetails.value = true;
  await nextTick();
  detailsRef.value?.startCreate();
};

// 列表交互
const selectView = (id: string) => {
  store.setCurrentView(id);
};
const onEdit = async (v: View) => {
  showDetails.value = true;
  await nextTick();
  detailsRef.value?.startEdit(v);
};
const confirmDelete = (id: string) => {
  const ok = window.confirm('删除该视图？');
  if (!ok) return;
  store.removeView(id);
  // 删除后返回列表视图
  showDetails.value = false;
  detailsRef.value?.cancelEdit?.();
};
const duplicateView = async (id: string) => {
  const src = store.getView(id);
  if (!src) return;
  const newId = generateId();
  const clone: View = JSON.parse(JSON.stringify(src));
  clone.id = newId;
  clone.name = `${src.name} - 副本`;
  clone.lastUpdated = new Date().toISOString();
  store.addView(clone);
  store.setCurrentView(newId);
  // 复制后进入详情编辑
  showDetails.value = true;
  await nextTick();
  detailsRef.value?.startEdit(clone);
};

// 样式（仅保留父容器与按钮样式）
const headerSectionStyles = ref<CSSProperties>({
  position: 'sticky',
  top: '0',
  zIndex: 2,
  background:
    'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.8))',
  backdropFilter: 'saturate(120%) blur(2px)',
  paddingTop: '48px',
  paddingBottom: '16px',
  borderBottom: '1px solid #f0f0f0'
});
const stackStyles = ref<CSSProperties>({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
});
const btnStyles = ref<CSSProperties>({
  border: '1px solid #d0d7de',
  background: '#fff',
  color: '#24292f',
  borderRadius: '6px',
  padding: '6px 10px',
  fontSize: '12px',
  cursor: 'pointer'
});
const btnPrimaryStyles = ref<CSSProperties>({
  ...btnStyles.value,
  background: '#1976d2',
  color: '#fff',
  border: '1px solid #1976d2'
});
// 默认单列布局以符合“初始只显示列表/详情单页切换”
const managePanelStyles = ref<CSSProperties>({ display: 'block' });
</script>

<style scoped>
.header-stack {
  display: flex;
  flex-direction: column;
}
.header-actions {
  display: flex;
  gap: 8px;
}
.manage-panel {
  width: 100%;
}
</style>
