<template>
  <ControlsContainer header>
    <template #header>
      <Section :styles="headerSectionStyles">
        <div class="header-stack" :style="stackStyles">
          <div class="header-actions">
            <button
              class="btn btn-primary"
              :style="btnPrimaryStyles"
              @click="startAddIcon"
            >
              新增图标
            </button>
          </div>
        </div>
      </Section>
    </template>

    <Section>
      <div class="manage-panel" :style="managePanelStyles">
        <div class="form-card" :style="formCardStyles">
          <div class="form-header">
            <h4 :style="formTitleStyles">{{ formModeTitle }}</h4>
          </div>
          <form
            class="icon-form"
            :style="formStyles"
            @submit.prevent="saveIcon"
          >
            <label :style="labelStyles">
              <span :style="labelTextStyles">名称</span>
              <input
                :style="inputStyles"
                v-model="iconForm.name"
                placeholder="例如：Server"
                required
              />
            </label>
            <label :style="labelStyles">
              <span :style="labelTextStyles">图片 URL</span>
              <input
                :style="inputStyles"
                v-model="iconForm.url"
                placeholder="https://...png"
                required
              />
            </label>
            <label :style="labelStyles">
              <span :style="labelTextStyles"
                >或上传图片（自动转为 base64）</span
              >
              <input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
                @change="onFileSelected"
              />
              <div v-if="uploadError" :style="errorStyles">
                {{ uploadError }}
              </div>
            </label>
            <div v-if="iconForm.url" :style="previewWrapStyles">
              <span :style="labelTextStyles">预览</span>
              <div :style="previewBoxStyles">
                <img
                  :src="iconForm.url"
                  alt="preview"
                  :style="previewImgStyles"
                />
              </div>
            </div>
            <label :style="labelStyles">
              <span :style="labelTextStyles">分组（可选）</span>
              <input
                :style="inputStyles"
                v-model="iconForm.collection"
                placeholder="例如：network"
              />
            </label>
            <label :style="checkboxLabelStyles">
              <input type="checkbox" v-model="iconForm.isIsometric" />
              <span :style="checkboxTextStyles">Isometric</span>
            </label>

            <div class="form-actions" :style="formActionsStyles">
              <button
                type="submit"
                class="btn btn-primary"
                :style="btnPrimaryStyles"
              >
                {{ isEditing ? '保存修改' : '创建图标' }}
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
                @click="deleteIcon"
              >
                删除
              </button>
            </div>
            <div v-if="isEditing" :style="hintStyles">
              ID：{{ iconForm.id }}
            </div>
          </form>
        </div>

        <div class="manage-list" :style="manageListStyles">
          <div class="list-header" :style="listHeaderStyles">
            图标列表（{{ adminIcons.length }}）
          </div>
          <div class="list" :style="listStyles">
            <div
              v-for="icon in adminIcons"
              :key="icon.id"
              class="list-item"
              :style="listItemStyles"
            >
              <div class="list-item-info" :style="listItemInfoStyles">
                <img :src="icon.url" alt="" :style="thumbStyles" />
                <div :style="listItemTextStyles">
                  <div :style="listItemTitleStyles">{{ icon.name }}</div>
                  <div :style="listItemDescStyles">
                    {{ icon.collection || '未分组' }}
                  </div>
                </div>
              </div>
              <div class="list-item-actions" :style="listItemActionsStyles">
                <button
                  class="btn"
                  :style="btnSmallStyles"
                  @click="startEditIcon(icon)"
                >
                  编辑
                </button>
                <button
                  class="btn btn-danger"
                  :style="btnSmallDangerStyles"
                  @click="confirmDelete(icon)"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  </ControlsContainer>
</template>

<script setup lang="ts">
import { ref, computed, type CSSProperties } from 'vue';
import type { Icon } from '@/types';
import { useSceneStore } from 'src/stores/provider';
import { generateId } from 'src/utils';
import ControlsContainer from '../components/ControlsContainer.vue';
import Section from '../components/Section.vue';
const sceneStore = useSceneStore();

// 仅保留图标增删改查所需的状态

// 表单/管理
const iconForm = ref<Icon>({
  id: '',
  name: '',
  url: '',
  collection: undefined,
  isIsometric: false
});
const isEditing = ref(false);
const formModeTitle = computed(() =>
  isEditing.value ? '编辑图标' : '新增图标'
);
const adminIcons = computed<Icon[]>(() => sceneStore.icons.value);

// 样式
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

// 样式

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
const checkboxLabelStyles = ref<CSSProperties>({
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
});
const checkboxTextStyles = ref<CSSProperties>({
  fontSize: '13px',
  color: '#334155'
});
const formActionsStyles = ref<CSSProperties>({
  display: 'flex',
  gap: '8px',
  marginTop: '4px'
});
const hintStyles = ref<CSSProperties>({ fontSize: '12px', color: '#64748b' });
const errorStyles = ref<CSSProperties>({ fontSize: '12px', color: '#d32f2f' });

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
const listItemInfoStyles = ref<CSSProperties>({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  minWidth: 0
});
const thumbStyles = ref<CSSProperties>({
  width: '28px',
  height: '28px',
  objectFit: 'contain',
  borderRadius: '4px',
  background: '#f8fafc'
});
const previewWrapStyles = ref<CSSProperties>({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
});
const previewBoxStyles = ref<CSSProperties>({
  border: '1px solid #f1f5f9',
  borderRadius: '8px',
  padding: '8px',
  background: '#f8fafc',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '120px',
  height: '120px',
  overflow: 'hidden'
});
const previewImgStyles = ref<CSSProperties>({
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain'
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

// 无筛选/搜索逻辑，仅保留 CRUD

const startAddIcon = () => {
  isEditing.value = false;
  iconForm.value = {
    id: generateId(),
    name: '',
    url: '',
    collection: undefined,
    isIsometric: false
  } as Icon;
};

const startEditIcon = (icon: Icon) => {
  isEditing.value = true;
  iconForm.value = { ...icon } as Icon;
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
};

const saveIcon = () => {
  const payload: Icon = {
    id: iconForm.value.id || generateId(),
    name: iconForm.value.name?.trim(),
    url: iconForm.value.url?.trim(),
    collection: iconForm.value.collection?.trim() || undefined,
    isIsometric: !!iconForm.value.isIsometric
  } as Icon;

  const exists = !!sceneStore.getIcon(payload.id);
  if (exists) {
    sceneStore.updateIcon(payload.id, payload);
  } else {
    sceneStore.addIcon(payload);
  }
  // 不退出管理模式，便于连续编辑
  isEditing.value = true;
  iconForm.value = { ...payload } as Icon;
};

const deleteIcon = () => {
  if (!isEditing.value || !iconForm.value.id) return;
  const ok = window.confirm('确定要删除该图标吗？此操作不可撤销。');
  if (!ok) return;
  sceneStore.removeIcon(iconForm.value.id);
  cancelEdit();
};

const confirmDelete = (icon: Icon) => {
  const ok = window.confirm(`删除图标 “${icon.name}”？`);
  if (!ok) return;
  sceneStore.removeIcon(icon.id);
  if (isEditing.value && iconForm.value.id === icon.id) cancelEdit();
};

// 上传并转 base64
const ACCEPTED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/svg+xml',
  'image/webp',
  'image/gif'
];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const uploadError = ref<string | null>(null);

const readFileAsDataURL = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const onFileSelected = async (e: Event) => {
  uploadError.value = null;
  const input = e.target as HTMLInputElement;
  const file = input.files && input.files[0];
  if (!file) return;

  if (!ACCEPTED_TYPES.includes(file.type)) {
    uploadError.value = '不支持的图片类型，请选择 PNG/JPEG/SVG/WebP/GIF。';
    input.value = '';
    return;
  }
  if (file.size > MAX_FILE_SIZE) {
    uploadError.value = '图片过大，请选择不超过 2MB 的文件。';
    input.value = '';
    return;
  }

  try {
    const dataUrl = await readFileAsDataURL(file);
    iconForm.value.url = dataUrl;
    if (!iconForm.value.name) {
      const base = file.name.replace(/\.[^/.]+$/, '');
      iconForm.value.name = base;
    }
  } catch (err) {
    console.error(err);
    uploadError.value = '读取文件失败，请重试。';
  } finally {
    // 允许重复选择相同文件
    input.value = '';
  }
};
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
