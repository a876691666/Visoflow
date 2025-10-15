<template>
  <div class="form-card" :style="formCardStyles">
    <div class="form-header">
      <h4 :style="formTitleStyles">{{ formModeTitle }}</h4>
    </div>
    <form :style="formStyles" @submit.prevent="saveView">
      <label :style="labelStyles">
        <span :style="labelTextStyles">名称</span>
        <input
          :style="inputStyles"
          v-model="form.name"
          placeholder="例如：业务架构图"
          required
        />
      </label>
      <label :style="labelStyles">
        <span :style="labelTextStyles">描述（可选）</span>
        <input
          :style="inputStyles"
          v-model="form.description"
          placeholder="备注信息"
        />
      </label>

      <div class="form-actions" :style="formActionsStyles">
        <button type="submit" class="btn btn-primary" :style="btnPrimaryStyles">
          {{ isEditing ? '保存修改' : '创建视图' }}
        </button>
        <button type="button" class="btn" :style="btnStyles" @click="onCancel">
          取消
        </button>
        <button
          v-if="isEditing"
          type="button"
          class="btn btn-danger"
          :style="btnDangerStyles"
          @click="onDelete"
        >
          删除
        </button>
      </div>
      <div v-if="isEditing" :style="hintStyles">ID：{{ form.id }}</div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type CSSProperties } from 'vue';
import type { View } from '@/types';
import { useSceneStore } from 'src/stores/provider';
import { generateId } from 'src/utils';

const emit = defineEmits<{ (e: 'close'): void }>();

const store = useSceneStore();

// 表单
type ViewForm = Pick<View, 'id' | 'name' | 'description'>;
const form = ref<ViewForm>({ id: '', name: '', description: '' });
const isEditing = ref(false);
const formModeTitle = computed(() =>
  isEditing.value ? '编辑视图' : '新增视图'
);

// 暴露给父组件的方法
function startCreate() {
  isEditing.value = false;
  form.value = { id: generateId(), name: '', description: '' };
}
function startEdit(v: View) {
  isEditing.value = true;
  form.value = {
    id: v.id,
    name: v.name,
    description: v.description
  } as ViewForm;
}
function cancelEdit() {
  isEditing.value = false;
  form.value = { id: '', name: '', description: '' };
}

function onCancel() {
  cancelEdit();
  emit('close');
}

function saveView() {
  const payload: View = {
    id: form.value.id || generateId(),
    name: form.value.name?.trim() || '未命名视图',
    description: form.value.description?.trim() || undefined,
    lastUpdated: new Date().toISOString(),
    items: [],
    connectors: [],
    rectangles: [],
    textBoxes: []
  };

  const exists = !!store.getView(payload.id);
  if (exists) {
    const old = store.getView(payload.id)!;
    store.updateView(payload.id, {
      ...old,
      name: payload.name,
      description: payload.description,
      lastUpdated: payload.lastUpdated
    } as View);
  } else {
    store.addView(payload);
    store.setCurrentView(payload.id);
  }
  isEditing.value = true;
  form.value = {
    id: payload.id,
    name: payload.name,
    description: payload.description
  } as ViewForm;
  // 创建/保存后不自动关闭，保持编辑态
}

function deleteCurrent() {
  if (!isEditing.value || !form.value.id) return;
  const ok = window.confirm('确定删除该视图吗？此操作不可撤销。');
  if (!ok) return;
  store.removeView(form.value.id);
  cancelEdit();
}

function onDelete() {
  deleteCurrent();
  emit('close');
}

defineExpose({ startCreate, startEdit, cancelEdit });

// 样式（沿用原有样式）
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
const btnDangerStyles = ref<CSSProperties>({
  ...btnStyles.value,
  background: '#d32f2f',
  color: '#fff',
  border: '1px solid #d32f2f'
});
const formCardStyles = ref<CSSProperties>({
  border: '1px solid #eee',
  borderRadius: '8px',
  padding: '12px',
  background: '#fff',
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
});
const formTitleStyles = ref<CSSProperties>({
  margin: '0 0 8px',
  fontSize: '14px',
  color: '#0f172a'
});
const formStyles = ref<CSSProperties>({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px'
});
const labelStyles = ref<CSSProperties>({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
});
const labelTextStyles = ref<CSSProperties>({
  fontSize: '12px',
  color: '#475569'
});
const inputStyles = ref<CSSProperties>({
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  padding: '8px 10px',
  fontSize: '13px'
});
const formActionsStyles = ref<CSSProperties>({
  display: 'flex',
  gap: '8px',
  marginTop: '4px'
});
const hintStyles = ref<CSSProperties>({ fontSize: '12px', color: '#64748b' });
</script>

<style scoped>
.form-card {
  box-sizing: border-box;
}
</style>
