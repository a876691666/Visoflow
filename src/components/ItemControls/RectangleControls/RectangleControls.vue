<template>
  <ControlsContainer>
    <Section>
      <!-- 新增：配置复制粘贴 -->
      <ConfigClipboard
        storageKey="visoflow.rectangle.config"
        :get-config="getConfig"
        :apply-config="applyConfig"
      />
    </Section>

    <!-- 新增：顺序调整按钮 -->
    <Section title="顺序">
      <div style="display: flex; flex-wrap: wrap; gap: 8px">
        <button @click="moveTop">置顶</button>
        <button @click="moveUp">上移</button>
        <button @click="moveDown">下移</button>
        <button @click="moveBottom">置底</button>
      </div>
    </Section>

    <!-- 新增：key 字段输入 -->
    <Section title="Key">
      <input
        type="text"
        :value="rectangleData.key || ''"
        style="width: 100%"
        @input="onKeyChange"
      />
    </Section>

    <!-- 单项样式配置（使用浏览器默认控件） -->
    <Section title="Fill">
      <PanelColorPicker
        :value="fillHex"
        @input="(e: any) => onColorChange(e, 'fill')"
        style="width: 100%"
        class="color-input"
      />
    </Section>

    <Section title="Fill Opacity (0-1)">
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        :value="rectangleData.style?.['fill-opacity'] ?? 1"
        style="width: 100%"
        @input="onNumberChange($event, 'fill-opacity')"
      />
    </Section>

    <Section title="Stroke">
      <PanelColorPicker
        :value="strokeHex"
        @input="(e: any) => onColorChange(e, 'stroke')"
        style="width: 100%"
        class="color-input"
      />
    </Section>

    <Section title="Stroke Width">
      <input
        type="number"
        min="0"
        step="1"
        :value="rectangleData.style?.['stroke-width'] ?? ''"
        style="width: 100%"
        @change="onNumberChange($event, 'stroke-width')"
      />
    </Section>

    <Section title="Stroke Opacity (0-1)">
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        :value="rectangleData.style?.['stroke-opacity'] ?? 1"
        style="width: 100%"
        @input="onNumberChange($event, 'stroke-opacity')"
      />
    </Section>

    <Section title="Stroke Dasharray">
      <input
        type="text"
        :value="rectangleData.style?.['stroke-dasharray'] ?? ''"
        placeholder="例如：5,5 或 0"
        style="width: 100%"
        @change="
          (e) =>
            updateStyle({
              ['stroke-dasharray']: (e.target as HTMLInputElement).value
            })
        "
      />
    </Section>

    <Section title="Corner Radius (rx)">
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        :value="rectangleData.style?.rx ?? 0"
        style="width: 100%"
        @input="onNumberChange($event, 'rx')"
      />
    </Section>

    <Section title="Style (JSON)">
      <textarea
        :value="styleText"
        @input="onStyleInput"
        rows="6"
        style="width: 100%; font-family: monospace; font-size: 12px"
      ></textarea>
      <div style="margin-top: 8px; display: flex; gap: 8px">
        <button @click="applyStyleFromText">应用</button>
        <span v-if="styleError" style="color: #d32f2f">{{ styleError }}</span>
      </div>
    </Section>

    <Section>
      <DeleteButton @click="handleDelete" />
    </Section>
  </ControlsContainer>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useIsoflowUiStateStore } from 'src/context/isoflowContext';
import { useRectangle } from 'src/hooks/useRectangle';
import ControlsContainer from '../components/ControlsContainer.vue';
import Section from '../components/Section.vue';
import DeleteButton from '../components/DeleteButton.vue';
import { useSceneStore } from 'src/stores/provider';
import ConfigClipboard from '../components/ConfigClipboard.vue';
import PanelColorPicker from 'src/components/PanelConrols/PanelColorPicker.vue';

interface Props {
  id: string;
}

const props = defineProps<Props>();

const sceneStore = useSceneStore();
const uiStateStore = useIsoflowUiStateStore<any>();

const rectangleData = ref<any>({
  id: '',
  style: {}
});

// 简化复制粘贴：仅对 style 全量复制
const getConfig = () => ({
  // 新增：包含 key
  key: rectangleData.value.key,
  ...(rectangleData.value.style ?? {})
});
const applyConfig = (cfg: any) => {
  if (!cfg || typeof cfg !== 'object') return;
  if ('key' in cfg) {
    rectangleData.value.key = cfg.key;
    sceneStore.updateRectangle(rectangleData.value.id, { key: cfg.key });
  }
  rectangleData.value.style = { ...cfg };
  sceneStore.updateRectangle(rectangleData.value.id, { style: { ...cfg } });
  styleText.value = JSON.stringify(rectangleData.value.style ?? {}, null, 2);
  styleError.value = '';
};

const styleText = ref('');
const styleError = ref('');

// 将任意 CSS 颜色字符串转换为 #RRGGBB，供 <input type="color"> 使用
const toHexColor = (color?: string): string => {
  if (!color) return '#000000';
  // 已是 #RGB 或 #RRGGBB
  const hexMatch = color.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (hexMatch) {
    const v = hexMatch[1];
    if (v.length === 3) {
      // #abc -> #aabbcc
      return `#${v[0]}${v[0]}${v[1]}${v[1]}${v[2]}${v[2]}`.toLowerCase();
    }
    return `#${v.toLowerCase()}`;
  }
  // 尝试通过浏览器解析 (rgb/rgba/named color 等)
  try {
    const el = document.createElement('div');
    el.style.color = color;
    document.body.appendChild(el);
    const rgb = getComputedStyle(el).color; // 如 "rgb(255, 0, 0)"
    document.body.removeChild(el);
    const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (m) {
      const r = Number(m[1]).toString(16).padStart(2, '0');
      const g = Number(m[2]).toString(16).padStart(2, '0');
      const b = Number(m[3]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
  } catch {}
  return '#000000';
};

const fillHex = computed(() => toHexColor(rectangleData.value.style?.fill));
const strokeHex = computed(() => toHexColor(rectangleData.value.style?.stroke));

const updateRectangleData = () => {
  // 从store获取矩形数据
  const rect = sceneStore.rectangles.value.find((r) => r.id === props.id);
  if (rect) {
    rectangleData.value = { ...rect };
  } else {
    // 使用composable获取数据
    const rectangleRef = useRectangle(props.id);
    if (rectangleRef.value) {
      rectangleData.value = rectangleRef.value as any;
    }
  }
  // 同步 style 文本
  styleText.value = JSON.stringify(rectangleData.value.style ?? {}, null, 2);
  styleError.value = '';
};

const onStyleInput = (e: Event) => {
  const value = (e.target as HTMLTextAreaElement).value;
  styleText.value = value;
  styleError.value = '';
};

const applyStyleFromText = () => {
  try {
    const parsed = JSON.parse(styleText.value || '{}');
    rectangleData.value.style = parsed;
    sceneStore.updateRectangle(rectangleData.value.id, { style: parsed });
    styleError.value = '';
  } catch (err: any) {
    styleError.value = '无效的 JSON';
  }
};

const onColorChange = (e: Event, key: 'fill' | 'stroke') => {
  const value = (e.target as HTMLInputElement).value; // 总是 #RRGGBB
  updateStyle({ [key]: value });
};

// 更新 style 的工具方法
const updateStyle = (updates: Record<string, any>) => {
  const current = (rectangleData.value.style ?? {}) as Record<string, any>;
  const next = { ...current } as Record<string, any>;
  Object.entries(updates).forEach(([k, v]) => {
    if (v === '' || v === null || v === undefined) delete next[k];
    else next[k] = v;
  });
  rectangleData.value.style = next;
  sceneStore.updateRectangle(rectangleData.value.id, { style: next });
  styleText.value = JSON.stringify(next, null, 2);
};

const onNumberChange = (e: Event, key: string) => {
  const raw = (e.target as HTMLInputElement).value;
  if (raw === '') {
    updateStyle({ [key]: '' });
    return;
  }
  const num = Number(raw);
  if (!Number.isNaN(num)) updateStyle({ [key]: num });
};

const handleDelete = () => {
  uiStateStore.setItemControls(null);
  sceneStore.removeRectangle(rectangleData.value.id);
};

const onKeyChange = (e: Event) => {
  const value = (e.target as HTMLInputElement).value;
  rectangleData.value.key = value;
  sceneStore.updateRectangle(rectangleData.value.id, { key: value });
};

// 新增：顺序调整处理函数
const moveUp = () => sceneStore.moveRectangle(rectangleData.value.id, 'up');
const moveDown = () => sceneStore.moveRectangle(rectangleData.value.id, 'down');
const moveTop = () => sceneStore.moveRectangle(rectangleData.value.id, 'top');
const moveBottom = () =>
  sceneStore.moveRectangle(rectangleData.value.id, 'bottom');

// 监听ID变化
watch(() => props.id, updateRectangleData, { immediate: true });
</script>

<style scoped>
/* RectangleControls组件样式 */
</style>
