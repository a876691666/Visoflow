<template>
  <ControlsContainer header>
    <template #header>
      <div class="om-header">
        <div class="om-header-left">
          <div class="om-title">对象管理</div>
          <div class="om-subtitle">当前视图：{{ currentViewName }}</div>
        </div>
        <div class="om-header-right">
          <button
            v-if="mode === 'LIST'"
            class="btn btn-primary"
            :disabled="!currentView"
            @click="startCreate"
          >
            新增对象
          </button>
          <button v-else class="btn" @click="backToList">返回列表</button>
        </div>
      </div>
      <div v-if="!currentView" class="om-hint">
        尚未选择视图，请先在“视图管理”中新建或选择一个视图。
      </div>
    </template>

    <!-- 列表层 -->
    <ObjectList
      v-if="mode === 'LIST'"
      :items="items"
      @edit="startEdit"
      @delete="confirmDelete"
    />

    <!-- 编辑层 -->
    <ObjectDetails
      v-else
      :item-id="editingItemId || undefined"
      @cancel="backToList"
    />
  </ControlsContainer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { View, ViewItem } from '@/types';
import { useSceneStore } from 'src/stores/provider';
// ObjectDetails 负责保存与删除逻辑，此处无需工具与默认值常量
import ControlsContainer from '../components/ControlsContainer.vue';
import ObjectList from './ObjectList.vue';
import ObjectDetails from './ObjectDetails.vue';

const store = useSceneStore();

// 视图
const currentViewId = computed(() => store.view.value);
const currentView = computed<View | null>(
  () => store.getView(currentViewId.value) || null
);
const currentViewName = computed(() => currentView.value?.name || '未选择视图');

// 列表数据（当前视图 items 来自 store.items）
const items = computed<ViewItem[]>(() => store.items.value);

// 编辑状态由子组件管理，这里仅保留当前编辑的对象 ID（为空表示新建）
const editingItemId = ref<string | null>(null);
type Mode = 'LIST' | 'EDIT';
const mode = ref<Mode>('LIST');

// 逻辑

const startCreate = () => {
  editingItemId.value = null; // 由子组件自行生成 ID 与管理默认值
  mode.value = 'EDIT';
};

const startEdit = (it: ViewItem) => {
  editingItemId.value = it.id;
  mode.value = 'EDIT';
};

// 由子组件负责保存/删除；这里仅在子组件触发取消时返回列表

// 交互逻辑（保存/删除）迁移至 ObjectDetails

const confirmDelete = (it: ViewItem) => {
  const ok = window.confirm(`删除对象（${it.name || it.id}）？`);
  if (!ok) return;
  store.removeItem(it.id);
  // 如果当前正编辑该对象，也返回列表
  if (mode.value === 'EDIT' && editingItemId.value === it.id) backToList();
};

const backToList = () => {
  mode.value = 'LIST';
  editingItemId.value = null;
};

// 描述编辑改由子组件处理
</script>

<style scoped>
/* Header */
.om-header {
  position: sticky;
  top: 0;
  z-index: 2;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.95),
    rgba(255, 255, 255, 0.8)
  );
  backdrop-filter: saturate(120%) blur(2px);
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.om-title {
  font-size: 14px;
  color: #0f172a;
  font-weight: 600;
}
.om-subtitle {
  font-size: 12px;
  color: #475569;
}
.om-header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.om-header-right {
  display: flex;
  gap: 8px;
}
.om-hint {
  font-size: 12px;
  color: #64748b;
  padding: 8px 16px 0;
}

/* Buttons */
.btn {
  border: 1px solid #d0d7de;
  background: #fff;
  color: #24292f;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
}
.btn-primary {
  background: #1976d2;
  color: #fff;
  border: 1px solid #1976d2;
}
.btn-danger {
  background: #d32f2f;
  color: #fff;
  border: 1px solid #d32f2f;
}

/* List */
.om-list-wrap {
  padding: 16px;
}
.om-list-header {
  font-size: 12px;
  color: #475569;
  padding-bottom: 8px;
}
.om-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.om-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  padding: 8px 10px;
  background: #fff;
}
.om-item-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.om-item-text {
  min-width: 0;
}
.om-item-title {
  font-size: 13px;
  color: #0f172a;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 240px;
}
.om-item-desc {
  font-size: 12px;
  color: #64748b;
}
.om-item-actions {
  display: flex;
  gap: 6px;
}
.om-avatar {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  overflow: hidden;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #eef2f7;
}
.om-avatar img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.om-avatar-fallback {
  font-size: 12px;
  color: #94a3b8;
}

/* Form */
.om-form-wrap {
  padding: 16px;
}
.om-form-title {
  margin: 0 0 8px;
  font-size: 14px;
  color: #0f172a;
}
.om-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.om-label {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.om-label-text {
  font-size: 12px;
  color: #475569;
}
.om-input {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 13px;
}
.om-grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.om-form-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}
.om-hint {
  font-size: 12px;
  color: #64748b;
}
</style>
