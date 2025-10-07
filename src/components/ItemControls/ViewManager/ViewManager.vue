<template>
  <ControlsContainer header>
    <template #header>
      <Section :styles="headerSectionStyles">
        <div class="header-stack" :style="stackStyles">
          <div class="header-actions">
            <button
              class="btn btn-primary"
              :style="btnPrimaryStyles"
              @click="startCreate"
            >
              新建视图
            </button>
          </div>
        </div>
      </Section>
    </template>

    <Section>
      <div class="manage-panel" :style="managePanelStyles">
        <!-- 左侧：视图表单 -->
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
              <button
                type="submit"
                class="btn btn-primary"
                :style="btnPrimaryStyles"
              >
                {{ isEditing ? '保存修改' : '创建视图' }}
              </button>
              <button
                type="button"
                class="btn"
                :style="btnStyles"
                @click="cancelEdit"
              >
                取消
              </button>
              <button
                v-if="isEditing"
                type="button"
                class="btn btn-danger"
                :style="btnDangerStyles"
                @click="deleteCurrent"
              >
                删除
              </button>
            </div>
            <div v-if="isEditing" :style="hintStyles">ID：{{ form.id }}</div>
          </form>
        </div>

        <!-- 右侧：视图列表 + 统计 -->
        <div class="manage-list" :style="manageListStyles">
          <div class="list-header" :style="listHeaderStyles">
            视图列表（{{ allViews.length }}）
          </div>
          <div class="list" :style="listStyles">
            <div
              v-for="v in allViews"
              :key="v.id"
              class="list-item"
              :style="[
                listItemStyles,
                v.id === currentViewId ? selectedItemStyles : {}
              ]"
            >
              <div class="list-item-info" :style="listItemInfoStyles">
                <div :style="listItemTextStyles">
                  <div :style="listItemTitleStyles">{{ v.name }}</div>
                  <div :style="listItemDescStyles">
                    {{ v.description || '—' }}
                  </div>
                </div>
              </div>
              <div class="list-item-actions" :style="listItemActionsStyles">
                <button
                  class="btn"
                  :style="btnSmallStyles"
                  @click="selectView(v.id)"
                >
                  切换
                </button>
                <button
                  class="btn"
                  :style="btnSmallStyles"
                  @click="startEdit(v)"
                >
                  编辑
                </button>
                <button
                  class="btn btn-danger"
                  :style="btnSmallDangerStyles"
                  @click="confirmDelete(v.id)"
                >
                  删除
                </button>
              </div>
            </div>
          </div>

          <div class="divider" style="margin: 8px 0"></div>
          <div class="list-header" :style="listHeaderStyles">
            当前视图要素对象分类统计
          </div>
          <div class="stats" :style="statsListStyles">
            <div v-if="categoryStats.length === 0" :style="emptyStyles">
              暂无要素
            </div>
            <div
              v-for="s in categoryStats"
              :key="s.key"
              :style="statItemStyles"
            >
              <span :style="statKeyStyles">{{ s.label }}</span>
              <span :style="statValStyles">{{ s.count }}</span>
            </div>
          </div>

          <div class="divider" style="margin: 8px 0"></div>
          <div class="list-header" :style="listHeaderStyles">
            当前视图要素类型统计
          </div>
          <div class="stats" :style="statsListStyles">
            <div
              v-for="s in elementTypeStats"
              :key="s.key"
              :style="statItemStyles"
            >
              <span :style="statKeyStyles">{{ s.label }}</span>
              <span :style="statValStyles">{{ s.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  </ControlsContainer>
</template>

<script setup lang="ts">
import { ref, computed, type CSSProperties } from 'vue';
import type { View } from '@/types';
import { useSceneStore } from 'src/stores/provider';
import { generateId } from 'src/utils';
import ControlsContainer from '../components/ControlsContainer.vue';
import Section from '../components/Section.vue';

const store = useSceneStore();

// 基本状态
const currentViewId = computed(() => store.view.value);
const allViews = computed<View[]>(() => store.views.value);

// 表单
type ViewForm = Pick<View, 'id' | 'name' | 'description'>;
const form = ref<ViewForm>({ id: '', name: '', description: '' });
const isEditing = ref(false);
const formModeTitle = computed(() =>
  isEditing.value ? '编辑视图' : '新增视图'
);

const startCreate = () => {
  isEditing.value = false;
  form.value = { id: generateId(), name: '', description: '' };
};

const startEdit = (v: View) => {
  isEditing.value = true;
  form.value = {
    id: v.id,
    name: v.name,
    description: v.description
  } as ViewForm;
};

const cancelEdit = () => {
  isEditing.value = false;
  form.value = { id: '', name: '', description: '' };
};

const saveView = () => {
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
    // 仅更新元信息，保留原有 items/rectangles/connectors/textBoxes
    const old = store.getView(payload.id)!;
    store.updateView(payload.id, {
      ...old,
      name: payload.name,
      description: payload.description,
      lastUpdated: payload.lastUpdated
    } as View);
  } else {
    store.addView(payload);
    // 选中新建视图
    store.setCurrentView(payload.id);
  }
  isEditing.value = true;
  form.value = {
    id: payload.id,
    name: payload.name,
    description: payload.description
  } as ViewForm;
};

const deleteCurrent = () => {
  if (!isEditing.value || !form.value.id) return;
  const ok = window.confirm('确定删除该视图吗？此操作不可撤销。');
  if (!ok) return;
  store.removeView(form.value.id);
  cancelEdit();
};

const confirmDelete = (id: string) => {
  const ok = window.confirm('删除该视图？');
  if (!ok) return;
  store.removeView(id);
  if (isEditing.value && form.value.id === id) cancelEdit();
};

const selectView = (id: string) => {
  store.setCurrentView(id);
};

// 统计当前视图要素：按图标的 collection 分组计数
const categoryStats = computed(() => {
  const cur = store.getCurrentView();
  if (!cur) return [] as { key: string; label: string; count: number }[];

  const iconsIndex = new Map(store.icons.value.map((i) => [i.id, i]));
  const map = new Map<string, number>();

  for (const it of cur.items) {
    const icon = it.icon ? iconsIndex.get(it.icon) : undefined;
    const collection = icon?.collection || '未分组';
    map.set(collection, (map.get(collection) || 0) + 1);
  }

  return Array.from(map.entries()).map(([key, count]) => ({
    key,
    label: key,
    count
  }));
});

// 统计要素类型（节点/连接/矩形/文本）数量
const elementTypeStats = computed(() => {
  const cur = store.getCurrentView();
  const items = cur?.items?.length || 0;
  const connectors = cur?.connectors?.length || 0;
  const rectangles = cur?.rectangles?.length || 0;
  const textBoxes = cur?.textBoxes?.length || 0;
  return [
    { key: 'items', label: '对象', count: items },
    { key: 'connectors', label: '连线', count: connectors },
    { key: 'rectangles', label: '区块', count: rectangles },
    { key: 'textBoxes', label: '文本', count: textBoxes }
  ];
});

// 样式（复用 NodeManager 的风格）
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
const btnDangerStyles = ref<CSSProperties>({
  ...btnStyles.value,
  background: '#d32f2f',
  color: '#fff',
  border: '1px solid #d32f2f'
});
const btnSmallStyles = ref<CSSProperties>({
  ...btnStyles.value,
  padding: '4px 8px',
  fontSize: '12px'
});
const btnSmallDangerStyles = ref<CSSProperties>({
  ...btnDangerStyles.value,
  padding: '4px 8px',
  fontSize: '12px'
});

const managePanelStyles = ref<CSSProperties>({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px'
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

const manageListStyles = ref<CSSProperties>({
  border: '1px solid #eee',
  borderRadius: '8px',
  padding: '8px',
  background: '#fff',
  maxHeight: '420px',
  overflow: 'auto'
});
const listHeaderStyles = ref<CSSProperties>({
  fontSize: '12px',
  color: '#475569',
  padding: '4px 6px'
});
const listStyles = ref<CSSProperties>({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
});
const listItemStyles = ref<CSSProperties>({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
  border: '1px solid #f1f5f9',
  borderRadius: '8px',
  padding: '6px 8px'
});
const selectedItemStyles = ref<CSSProperties>({
  borderColor: '#1976d2',
  boxShadow: '0 0 0 2px rgba(25,118,210,0.08)'
});
const listItemInfoStyles = ref<CSSProperties>({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  minWidth: 0
});
const listItemTextStyles = ref<CSSProperties>({ minWidth: 0 });
const listItemTitleStyles = ref<CSSProperties>({
  fontSize: '13px',
  color: '#0f172a',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  maxWidth: '240px'
});
const listItemDescStyles = ref<CSSProperties>({
  fontSize: '12px',
  color: '#64748b'
});
const listItemActionsStyles = ref<CSSProperties>({
  display: 'flex',
  gap: '6px'
});

const statsListStyles = ref<CSSProperties>({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  padding: '4px 6px'
});
const emptyStyles = ref<CSSProperties>({ fontSize: '12px', color: '#94a3b8' });
const statItemStyles = ref<CSSProperties>({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  border: '1px dashed #e2e8f0',
  borderRadius: '8px',
  padding: '6px 8px'
});
const statKeyStyles = ref<CSSProperties>({
  fontSize: '12px',
  color: '#334155'
});
const statValStyles = ref<CSSProperties>({
  fontSize: '12px',
  color: '#0f172a',
  fontWeight: 600
});
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
.form-card {
  box-sizing: border-box;
}
.manage-list {
  box-sizing: border-box;
}
</style>
