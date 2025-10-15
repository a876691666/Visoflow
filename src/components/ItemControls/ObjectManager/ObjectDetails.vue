<template>
  <div class="om-form-wrap">
    <h4 class="om-form-title">{{ isEditing ? '编辑对象' : '新增对象' }}</h4>

    <!-- 新增：配置复制/粘贴工具 -->
    <div
      class="om-form-actions"
      style="justify-content: flex-end; margin-bottom: 6px"
    >
      <ConfigClipboard
        storageKey="visoflow.object.config"
        :get-config="getClipboardConfig"
        :apply-config="applyClipboardConfig"
      />
    </div>

    <form class="om-form" @submit.prevent="onSave">
      <!-- 新增：Key 输入（可选） -->
      <label class="om-label">
        <span class="om-label-text">Key（可选）</span>
        <input
          class="om-input"
          v-model="local.key"
          placeholder="用于唯一标识/搜索等"
        />
      </label>

      <label class="om-label">
        <span class="om-label-text">名称（可选）</span>
        <input
          class="om-input"
          v-model="local.name"
          placeholder="例如：Server-01"
        />
      </label>

      <!-- 新增：是否显示名称开关 -->
      <label class="om-inline">
        <input type="checkbox" v-model="local.showName" />
        <span class="om-inline-text">显示名称</span>
      </label>

      <label class="om-label">
        <span class="om-label-text">描述（可选，支持 Markdown）</span>
        <MarkdownEditor
          :value="local.description"
          @change="(t) => (local.description = t)"
        />
      </label>

      <IconPicker v-model="local.icon" />

      <div class="om-grid2">
        <label class="om-label">
          <span class="om-label-text">位置 X</span>
          <input
            class="om-input"
            type="number"
            step="1"
            v-model.number="local.tile.x"
          />
        </label>
        <label class="om-label">
          <span class="om-label-text">位置 Y</span>
          <input
            class="om-input"
            type="number"
            step="1"
            v-model.number="local.tile.y"
          />
        </label>
      </div>

      <label class="om-label">
        <span class="om-label-text">标签高度（可选）</span>
        <input
          class="om-input"
          type="number"
          step="1"
          min="0"
          v-model.number="local.labelHeight"
        />
      </label>

      <label class="om-label">
        <span class="om-label-text">图标缩放（对象级，0.5 - 10）</span>
        <div class="om-range-row">
          <input
            class="om-range"
            type="range"
            step="0.1"
            min="0.5"
            max="10"
            v-model.number="local.iconScale"
            :disabled="local.inheritIconScale"
          />
          <span class="om-hint">{{ (local.iconScale ?? 1).toFixed(2) }}x</span>
        </div>
        <label class="om-inline">
          <input type="checkbox" v-model="local.inheritIconScale" />
          <span class="om-inline-text">继承图标设置</span>
        </label>
      </label>

      <label class="om-label">
        <span class="om-label-text">图标底部偏移（对象级，px）</span>
        <div class="om-range-row">
          <input
            class="om-range"
            type="range"
            step="1"
            min="-200"
            max="500"
            v-model.number="local.iconBottom"
            :disabled="local.inheritIconBottom"
          />
          <span class="om-hint">{{ local.iconBottom ?? 0 }}px</span>
        </div>
        <label class="om-inline">
          <input type="checkbox" v-model="local.inheritIconBottom" />
          <span class="om-inline-text">继承图标设置</span>
        </label>
      </label>

      <div class="om-form-actions">
        <button type="submit" class="btn btn-primary" :disabled="!canSubmit">
          {{ isEditing ? '保存修改' : '创建对象' }}
        </button>
        <button type="button" class="btn" @click="$emit('cancel')">取消</button>
        <!-- 新增：复制按钮（仅编辑态显示） -->
        <button v-if="isEditing" type="button" class="btn" @click="onCopy">
          复制
        </button>
        <button
          v-if="isEditing"
          type="button"
          class="btn btn-danger"
          @click="onDelete"
        >
          删除
        </button>
      </div>

      <div v-if="isEditing" class="om-hint">ID：{{ local.id }}</div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, shallowRef, nextTick } from 'vue';
import type { ViewItem } from '@/types';
import MarkdownEditor from '@/components/MarkdownEditor/MarkdownEditor.vue';
import { VIEW_ITEM_DEFAULTS } from 'src/config';
import IconPicker from './IconPicker.vue';
import { useSceneStore } from 'src/stores/provider';
import { generateId } from 'src/utils';
import ConfigClipboard from '../components/ConfigClipboard.vue';

const emit = defineEmits<{ (e: 'cancel'): void }>();

const props = defineProps<{ itemId?: string }>();

const store = useSceneStore();

const isEditing = shallowRef<boolean>(!!props.itemId);

// 小工具
const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));
const toNumberOr = (v: unknown, d: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? (n as number) : d;
};

const buildLocalFrom = (it: ViewItem | null): ViewItem => {
  if (!it) {
    const id = generateId();
    return {
      id,
      // 新增：key 默认为空
      key: undefined,
      name: undefined,
      description: undefined,
      icon: undefined,
      tile: { x: 0, y: 0 },
      labelHeight: VIEW_ITEM_DEFAULTS.labelHeight,
      // 新增：名称显示默认开启
      showName: true,
      // 显性继承开关（默认继承）
      ...{ inheritIconScale: true, inheritIconBottom: true }
    } as ViewItem;
  }
  return {
    id: it.id,
    // 新增：透传 key
    key: it.key,
    name: it.name,
    description: it.description,
    icon: it.icon,
    tile: { x: it.tile.x, y: it.tile.y },
    labelHeight: it.labelHeight ?? VIEW_ITEM_DEFAULTS.labelHeight,
    // 新增：沿用对象设置，缺省则默认显示
    showName: it.showName ?? true,
    ...(it.iconScale !== undefined ? { iconScale: it.iconScale } : {}),
    ...(it.iconBottom !== undefined ? { iconBottom: it.iconBottom } : {}),
    // 同级显性属性；基于是否存在对象级设置推导初值
    ...{
      inheritIconScale: it.inheritIconScale ?? it.iconScale === undefined,
      inheritIconBottom: it.inheritIconBottom ?? it.iconBottom === undefined
    }
  } as ViewItem;
};

const resolveTargetItem = () =>
  props.itemId ? (store.getItem(props.itemId) ?? null) : null;

const local = reactive<ViewItem>(buildLocalFrom(resolveTargetItem()));

// 根据外部 props.itemId 变化，刷新编辑态与本地数据
watch(
  () => props.itemId,
  () => {
    isEditing.value = !!props.itemId;
    const v = resolveTargetItem();
    const next = buildLocalFrom(v);
    // 覆盖 local 的各字段（保持引用不变）
    local.id = next.id;
    // 同步 key（修复：切换对象时 key 未更新）
    local.key = next.key;
    local.name = next.name;
    local.description = next.description;
    local.icon = next.icon;
    local.tile = { ...next.tile };
    local.labelHeight = next.labelHeight;
    // 新增：同步 showName
    local.showName = next.showName;
    // 值部分
    if (next.iconScale !== undefined) local.iconScale = next.iconScale;
    else delete local.iconScale;
    if (next.iconBottom !== undefined) local.iconBottom = next.iconBottom;
    else delete local.iconBottom;
    // 显性继承开关
    local.inheritIconScale = next.inheritIconScale;
    local.inheritIconBottom = next.inheritIconBottom;
  },
  { immediate: true }
);

// 当关闭继承时，如无值则给予默认；当开启继承时，清理数值字段以回退到链路继承
const syncInheritedNumber = <K extends 'iconScale' | 'iconBottom'>(
  inheritFlag: boolean | undefined,
  key: K,
  fallback: number
) => {
  if (inheritFlag === false && local[key] === undefined) {
    local[key] = fallback;
  }
  if (inheritFlag === true && local[key] !== undefined) {
    delete local[key];
  }
};
watch(
  () => local.inheritIconScale,
  (v) => syncInheritedNumber(v, 'iconScale', 1)
);
watch(
  () => local.inheritIconBottom,
  (v) => syncInheritedNumber(v, 'iconBottom', 0)
);
const canSubmit = shallowRef<boolean>(false);
watch(
  [
    () => local.id,
    () => store.view.value // 依赖当前视图 ID
  ],
  () => {
    canSubmit.value = !!local.id && !!store.getCurrentView();
  },
  { immediate: true }
);

// 提取：从本地表单构建用于保存/复制的 payload（处理继承与数值裁剪）
const buildPayloadFromLocal = (): Partial<ViewItem> => {
  const base: Partial<ViewItem> = {
    id: local.id,
    // 新增：携带 key
    ...(typeof local.key === 'string' && local.key ? { key: local.key } : {}),
    name: local.name?.toString().trim() || undefined,
    description: local.description?.toString().trim() || undefined,
    icon: local.icon || undefined,
    tile: { x: toNumberOr(local.tile.x, 0), y: toNumberOr(local.tile.y, 0) },
    labelHeight:
      typeof local.labelHeight === 'number'
        ? local.labelHeight
        : VIEW_ITEM_DEFAULTS.labelHeight,
    showName: !!local.showName
  };

  const payload: any = { ...base };
  // 图标缩放
  if (local.inheritIconScale) {
    payload.inheritIconScale = true;
    delete payload.iconScale;
  } else {
    payload.inheritIconScale = false;
    payload.iconScale = clamp(toNumberOr(local.iconScale, 1), 0.5, 10);
  }
  // 图标底部偏移
  if (local.inheritIconBottom) {
    payload.inheritIconBottom = true;
    delete payload.iconBottom;
  } else {
    payload.inheritIconBottom = false;
    payload.iconBottom = toNumberOr(local.iconBottom, 0);
  }
  return payload as Partial<ViewItem>;
};

// 新增：导出到剪贴板组件的配置（localStorage）
const getClipboardConfig = () => {
  const p = buildPayloadFromLocal();
  return {
    // 新增：包含 key
    key: p.key,
    showName: p.showName,
    labelHeight: p.labelHeight,
    inheritIconScale: p.inheritIconScale,
    ...(p.inheritIconScale ? {} : { iconScale: p.iconScale }),
    inheritIconBottom: p.inheritIconBottom,
    ...(p.inheritIconBottom ? {} : { iconBottom: p.iconBottom })
  };
};

const applyClipboardConfig = (cfg: any) => {
  if (!cfg || typeof cfg !== 'object') return;
  // 允许粘贴 key（可选）
  if ('key' in cfg) local.key = cfg.key;
  // 仅应用：显示名称、标签高度、图标缩放/偏移以及继承开关
  if ('showName' in cfg) local.showName = !!cfg.showName;
  if ('labelHeight' in cfg)
    local.labelHeight = toNumberOr(
      cfg.labelHeight,
      local.labelHeight as number
    );

  if ('inheritIconScale' in cfg)
    local.inheritIconScale = !!cfg.inheritIconScale;
  if ('iconScale' in cfg || 'inheritIconScale' in cfg) {
    if (local.inheritIconScale) delete local.iconScale;
    else local.iconScale = clamp(toNumberOr(cfg.iconScale, 1), 0.5, 10);
  }

  if ('inheritIconBottom' in cfg)
    local.inheritIconBottom = !!cfg.inheritIconBottom;
  if ('iconBottom' in cfg || 'inheritIconBottom' in cfg) {
    if (local.inheritIconBottom) delete local.iconBottom;
    else local.iconBottom = toNumberOr(cfg.iconBottom, 0);
  }

  // 粘贴后自动保存：等待响应式更新完成再保存
  nextTick(() => {
    if (canSubmit.value) onSave();
  });
};

const onSave = () => {
  const payload = buildPayloadFromLocal();

  if (isEditing.value) {
    store.updateItem(payload.id as string, payload as ViewItem);
  } else {
    // 确保 id 唯一（简单重试）
    let id = (payload.id as string) || generateId();
    while (store.getItem(id)) id = generateId();
    payload.id = id;
    store.addItem(payload as ViewItem);
    // 切换为编辑态并刷新本地 id
    local.id = id;
  }
};

// 新增：复制当前对象（编辑态）
const onCopy = () => {
  if (!isEditing.value) return;
  const payload = buildPayloadFromLocal();
  // 生成新 ID，避免冲突
  let id = generateId();
  while (store.getItem(id)) id = generateId();
  payload.id = id;
  // 名称附加“副本”标识（若有名称）
  if (payload.name) payload.name = `${payload.name} 副本`;
  // 可选：略微平移，避免完全重叠
  payload.tile = {
    x: toNumberOr(local.tile.x, 0) + 1,
    y: toNumberOr(local.tile.y, 0) + 1
  };
  store.addItem(payload as ViewItem);
  // 复制后仍保持当前编辑对象，不切换到新对象
};

const onDelete = () => {
  if (!isEditing.value) return;
  const ok = window.confirm('确定删除该对象吗？此操作不可撤销。');
  if (!ok) return;
  store.removeItem(local.id);
  emit('cancel');
};
</script>

<style scoped>
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
.om-inline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
}
.om-inline-text {
  font-size: 12px;
  color: #475569;
}
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
.om-range {
  width: 100%;
}
</style>
