<template>
  <ControlsContainer header>
    <template #header>
      <Section>
        <div class="header-stack">
          <div class="header-actions">
            <template v-if="mode === 'LIST'">
              <button class="btn btn-primary" @click="startAddIcon">
                新增图标
              </button>
            </template>
            <template v-else>
              <button class="btn" @click="backToList">返回列表</button>
            </template>
          </div>
        </div>
      </Section>
    </template>

    <Section>
      <IconDetails
        v-if="mode === 'EDIT'"
        :value="iconForm as any"
        :is-editing="isEditing"
        @save="saveIconFromChild"
        @cancel="cancelEdit"
        @delete="deleteIconFromChild"
      />
      <IconList
        v-else
        :icons="adminIcons"
        @add="startAddIcon"
        @edit="startEditIcon"
        @delete="confirmDelete"
      />
    </Section>
  </ControlsContainer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Icon } from '@/types';
import { useSceneStore } from 'src/stores/provider';
import { generateId } from 'src/utils';
import ControlsContainer from '../components/ControlsContainer.vue';
import Section from '../components/Section.vue';
import IconList from './IconList.vue';
import IconDetails from './IconDetails.vue';
const sceneStore = useSceneStore();

// 仅保留图标增删改查所需的状态

const iconForm = ref<Icon>({
  id: '',
  name: '',
  url: '',
  collection: undefined,
  isIsometric: false
});
const isEditing = ref(false);
const adminIcons = computed<Icon[]>(() => sceneStore.icons.value);

// 样式迁移至 <style scoped>，此处不再保留 CSSProperties 对象

type Mode = 'LIST' | 'EDIT';
const mode = ref<Mode>('LIST');

const startAddIcon = () => {
  isEditing.value = false;
  iconForm.value = {
    id: generateId(),
    name: '',
    url: '',
    collection: undefined,
    isIsometric: false
  } as Icon;
  mode.value = 'EDIT';
};

const startEditIcon = (icon: Icon) => {
  isEditing.value = true;
  iconForm.value = { ...icon } as Icon;
  mode.value = 'EDIT';
};

const cancelEdit = () => {
  isEditing.value = false;
  iconForm.value = {
    id: '',
    name: '',
    url: '',
    collection: undefined,
    isIsometric: false
  } as Icon;
  mode.value = 'LIST';
};

const saveIconFromChild = (payload: Icon) => {
  const id = payload.id || generateId();
  const next: any = { ...payload, id };
  const exists = !!sceneStore.getIcon(id);
  if (exists) {
    sceneStore.updateIcon(id, next);
  } else {
    sceneStore.addIcon(next);
  }
  isEditing.value = true;
  iconForm.value = { ...next } as Icon;
};

const deleteIconFromChild = (icon: Icon) => {
  if (!icon?.id) return;
  const ok = window.confirm('确定要删除该图标吗？此操作不可撤销。');
  if (!ok) return;
  sceneStore.removeIcon(icon.id);
  cancelEdit();
};

const confirmDelete = (icon: Icon) => {
  const ok = window.confirm(`删除图标 “${icon.name}”？`);
  if (!ok) return;
  sceneStore.removeIcon(icon.id);
  if (isEditing.value && iconForm.value.id === icon.id) cancelEdit();
};

const backToList = () => {
  mode.value = 'LIST';
};

// 文件上传逻辑已移入 IconDetails
</script>

<style scoped>
.header-section :deep(.section) {
  position: sticky;
  top: 0;
  z-index: 2;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.95),
    rgba(255, 255, 255, 0.8)
  );
  -webkit-backdrop-filter: saturate(120%) blur(2px);
  backdrop-filter: saturate(120%) blur(2px);
  padding-top: 48px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.header-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.manage-panel {
  width: 100%;
}

.form-card {
  box-sizing: border-box;
}

.manage-list {
  box-sizing: border-box;
}

/* 通用按钮样式（优先使用全局，但这里兜底一份） */
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
  border-color: #1976d2;
}
</style>
