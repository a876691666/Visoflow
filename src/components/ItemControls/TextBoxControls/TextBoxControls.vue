<template>
  <ControlsContainer>
    <Section>
      <!-- 新增：配置复制粘贴 -->
      <ConfigClipboard
        storageKey="visoflow.textbox.config"
        :get-config="getConfig"
        :apply-config="applyConfig"
      />
    </Section>

    <!-- 新增：顺序控制 -->
    <Section title="顺序">
      <div class="toggle-group">
        <button class="toggle-button" @click="handleMoveTop">置顶</button>
        <button class="toggle-button" @click="handleMoveUp">上移</button>
        <button class="toggle-button" @click="handleMoveDown">下移</button>
        <button class="toggle-button" @click="handleMoveBottom">置底</button>
      </div>
    </Section>

    <!-- 新增：key 字段输入 -->
    <Section>
      <div class="input-group">
        <label class="input-label">Key</label>
        <input
          class="text-input"
          :value="textBox?.key || ''"
          @input="handleKeyChange"
        />
      </div>
    </Section>

    <Section>
      <div class="input-group">
        <label class="input-label">Text Content</label>
        <textarea
          class="text-input"
          :value="textBox?.content || ''"
          @input="handleContentChange"
          rows="3"
        />
      </div>
    </Section>

    <Section title="Text size">
      <div class="slider-container">
        <input
          type="range"
          min="0.3"
          max="3"
          step="0.1"
          :value="textBox?.fontSize ?? 0.3"
          @input="handleFontSizeChange"
          class="slider"
        />
        <span class="slider-value">{{
          (textBox?.fontSize ?? 0.3).toFixed(1)
        }}</span>
      </div>
    </Section>

    <!-- 新增：文字粗细配置（拖拽条） -->
    <Section title="文字粗细">
      <div class="slider-container">
        <input
          type="range"
          min="300"
          max="900"
          step="100"
          :value="fontWeightNumber"
          @input="handleFontWeightChange"
          class="slider"
        />
        <span class="slider-value">{{ fontWeightValue }}</span>
      </div>
    </Section>

    <!-- 新增：文字颜色配置 -->
    <Section title="文字颜色">
      <PanelColorPicker
        :value="textColorHex"
        @input="handleTextColorChange"
        class="color-input"
      />
    </Section>

    <!-- 新增：文字背景色配置 -->
    <Section title="文字背景色">
      <PanelColorPicker
        :value="textBgColorHex"
        @input="handleTextBgColorChange"
        class="color-input"
      />
    </Section>

    <!-- 新增：文字背景圆角配置 -->
    <Section title="文字背景圆角">
      <div class="slider-container">
        <input
          type="range"
          min="0"
          max="32"
          step="1"
          :value="textBgRadiusNumber"
          @input="handleTextBgRadiusChange"
          class="slider"
        />
        <span class="slider-value">{{ textBgRadiusNumber }}px</span>
      </div>
    </Section>

    <!-- 新增：内边距（左右）配置，单位：px -->
    <Section title="内边距">
      <div class="slider-container">
        <input
          type="range"
          min="0"
          max="60"
          step="1"
          :value="textPaddingPx"
          @input="handleTextPaddingChange"
          class="slider"
        />
        <span class="slider-value">{{ textPaddingPx }}px</span>
      </div>
    </Section>

    <Section title="框高度">
      <div class="slider-container">
        <input
          type="range"
          min="12"
          max="500"
          step="1"
          :value="textBox?.containerStyle?.height ?? 100"
          @input="handleContainerHeightChange"
          class="slider"
        />
        <span class="slider-value">{{
          (textBox?.containerStyle?.height ?? 100).toFixed(0)
        }}</span>
      </div>
    </Section>

    <Section title="Alignment">
      <div class="toggle-group">
        <button
          class="toggle-button"
          :class="{
            active: textBox?.orientation === ProjectionOrientationEnum.X
          }"
          @click="() => handleOrientationChange(ProjectionOrientationEnum.X)"
        >
          <svg
            class="orientation-icon"
            :style="xOrientationStyles"
            viewBox="0 0 24 24"
          >
            <path
              d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
            />
          </svg>
        </button>
        <button
          class="toggle-button"
          :class="{
            active: textBox?.orientation === ProjectionOrientationEnum.Y
          }"
          @click="() => handleOrientationChange(ProjectionOrientationEnum.Y)"
        >
          <svg
            class="orientation-icon"
            :style="yOrientationStyles"
            viewBox="0 0 24 24"
          >
            <path
              d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
            />
          </svg>
        </button>
        <button
          class="toggle-button"
          :class="{
            active: textBox?.orientation === ProjectionOrientationEnum.DX
          }"
          @click="() => handleOrientationChange(ProjectionOrientationEnum.DX)"
        >
          <svg
            class="orientation-icon"
            :style="dxOrientationStyles"
            viewBox="0 0 24 24"
          >
            <path
              d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
            />
          </svg>
        </button>
        <button
          class="toggle-button"
          :class="{
            active: textBox?.orientation === ProjectionOrientationEnum.DY
          }"
          @click="() => handleOrientationChange(ProjectionOrientationEnum.DY)"
        >
          <svg
            class="orientation-icon"
            :style="dyOrientationStyles"
            viewBox="0 0 24 24"
          >
            <path
              d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
            />
          </svg>
        </button>
      </div>
    </Section>

    <Section>
      <DeleteButton @click="handleDelete" />
    </Section>
  </ControlsContainer>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';
import { useIsoflowUiStateStore } from 'src/context/isoflowContext';
import { useTextBox } from 'src/hooks/useTextBox';
import { getIsoProjectionCss } from 'src/utils';
import { ProjectionOrientationEnum } from 'src/types';
import ControlsContainer from '../components/ControlsContainer.vue';
import Section from '../components/Section.vue';
import DeleteButton from '../components/DeleteButton.vue';
import { useSceneStore } from 'src/stores/provider';
import { syncTextBox } from 'src/stores/reducers/textBox';
import { TEXTBOX_FONT_WEIGHT } from 'src/config';
import ConfigClipboard from '../components/ConfigClipboard.vue';
import PanelColorPicker from 'src/components/PanelConrols/PanelColorPicker.vue';

interface Props {
  id: string;
}

const props = defineProps<Props>();
const uiStateStore = useIsoflowUiStateStore<any>();
const sceneStore = useSceneStore();
const textBoxRef = useTextBox(() => props.id);

const textBox = computed(() => textBoxRef.value);

// 复制粘贴仅针对样式与尺寸/布局字段
const getConfig = () => {
  const tb = textBox.value;
  if (!tb) return {};
  const cfg = {
    // 新增：包含 key 字段
    key: tb.key,
    fontSize: tb.fontSize,
    textStyle: { ...(tb.textStyle ?? {}) },
    containerStyle: { ...(tb.containerStyle ?? {}) },
    // 新增：包含 contentStyle 以复制粘贴 padding
    contentStyle: { ...(tb.contentStyle ?? {}) },
    orientation: tb.orientation
  };
  return cfg;
};

const applyConfig = (cfg: any) => {
  const tb = textBox.value;
  if (!tb || !cfg || typeof cfg !== 'object') return;
  // 新增：应用 key
  if ('key' in cfg) sceneStore.updateTextBox(tb.id, { key: cfg.key });
  if ('fontSize' in cfg)
    sceneStore.updateTextBox(tb.id, { fontSize: cfg.fontSize });
  if ('textStyle' in cfg)
    sceneStore.updateTextBox(tb.id, {
      textStyle: { ...(tb.textStyle ?? {}), ...(cfg.textStyle ?? {}) }
    });
  if ('containerStyle' in cfg)
    sceneStore.updateTextBox(tb.id, {
      containerStyle: {
        ...(tb.containerStyle ?? {}),
        ...(cfg.containerStyle ?? {})
      }
    });
  // 新增：应用 contentStyle
  if ('contentStyle' in cfg)
    sceneStore.updateTextBox(tb.id, {
      contentStyle: {
        ...(tb.contentStyle ?? {}),
        ...(cfg.contentStyle ?? {})
      }
    });
  if ('orientation' in cfg)
    sceneStore.updateTextBox(tb.id, { orientation: cfg.orientation });
  syncTextBox(tb.id, sceneStore);
};

// 简化：仅支持 #RGB / #RRGGBB，其他情况回退为指定默认值
const normalizeHex = (color?: string, fallback = '#000000'): string => {
  if (!color) return fallback;
  const m = color.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (!m) return fallback;
  const v = m[1];
  if (v.length === 3) {
    return `#${v[0]}${v[0]}${v[1]}${v[1]}${v[2]}${v[2]}`.toLowerCase();
  }
  return `#${v.toLowerCase()}`;
};

const textColorHex = computed(() =>
  normalizeHex(textBox.value?.textStyle?.color as string | undefined)
);

// 新增：背景色的 hex 值（默认白色）
const textBgColorHex = computed(() =>
  normalizeHex(
    (textBox.value?.textStyle as any)?.backgroundColor as string | undefined,
    '#ffffff'
  )
);

// 计算当前字体粗细显示值（字符串形式 300-900），兼容 normal/bold
const fontWeightValue = computed(() => {
  const fw =
    (textBox.value?.textStyle as any)?.fontWeight ?? TEXTBOX_FONT_WEIGHT;
  if (typeof fw === 'number') return String(fw);
  if (fw === 'bold') return '700';
  if (fw === 'normal') return '400';
  const n = parseInt(String(fw), 10);
  return Number.isFinite(n) ? String(n) : '400';
});

// 数字形式，供 range 绑定
const fontWeightNumber = computed(() => parseInt(fontWeightValue.value, 10));

// 新增：背景圆角（px）数值
const textBgRadiusNumber = computed(() => {
  const br = (textBox.value?.textStyle as any)?.borderRadius as
    | string
    | number
    | undefined;
  if (typeof br === 'number') return br;
  if (typeof br === 'string') {
    const m = br.trim().match(/^(\d+)(px)?$/i);
    if (m) return parseInt(m[1], 10);
  }
  return 0;
});

const parsePx = (v: any): number | undefined => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const m = v.trim().match(/^(\d+)(px)?$/i);
    if (m) return parseInt(m[1], 10);
  }
  return undefined;
};

// 新增：读取当前左右内边距（px）
const textPaddingPx = computed(() => {
  const cs: any = textBox.value?.textStyle ?? {};
  // 优先取单侧
  const padding = parsePx(cs.padding);
  return padding !== undefined ? padding : 0;
});

const xOrientationStyles = computed<CSSProperties>(() => ({
  transform: getIsoProjectionCss(ProjectionOrientationEnum.X),
  width: '16px',
  height: '16px',
  fill: 'currentColor'
}));

const yOrientationStyles = computed<CSSProperties>(() => ({
  transform: getIsoProjectionCss(ProjectionOrientationEnum.Y),
  width: '16px',
  height: '16px',
  fill: 'currentColor'
}));
const dxOrientationStyles = computed<CSSProperties>(() => ({
  transform: getIsoProjectionCss(ProjectionOrientationEnum.DX).replace(
    '-100%',
    '0%'
  ),
  width: '16px',
  height: '16px',
  fill: 'currentColor'
}));
const dyOrientationStyles = computed<CSSProperties>(() => ({
  transform: getIsoProjectionCss(ProjectionOrientationEnum.DY).replace(
    '-100%',
    '0%'
  ),
  width: '16px',
  height: '16px',
  fill: 'currentColor'
}));

const handleContentChange = (event: Event) => {
  if (!textBox.value) return;
  const target = event.target as HTMLTextAreaElement;
  const content = target.value;
  sceneStore.updateTextBox(textBox.value.id, { content });
  syncTextBox(textBox.value.id, sceneStore);
};

const handleFontSizeChange = (event: Event) => {
  if (!textBox.value) return;
  const target = event.target as HTMLInputElement;
  const fontSize = parseFloat(target.value);
  sceneStore.updateTextBox(textBox.value.id, { fontSize });
  syncTextBox(textBox.value.id, sceneStore);
};

// 新增：处理文字颜色变化
const handleTextColorChange = (event: Event) => {
  if (!textBox.value) return;
  const target = event.target as HTMLInputElement;
  const color = target.value;
  sceneStore.updateTextBox(textBox.value.id, {
    textStyle: {
      ...(textBox.value.textStyle ?? {}),
      color
    }
  });
};

// 新增：处理文字背景色变化
const handleTextBgColorChange = (event: Event) => {
  if (!textBox.value) return;
  const target = event.target as HTMLInputElement;
  const color = target.value;
  sceneStore.updateTextBox(textBox.value.id, {
    textStyle: {
      ...(textBox.value.textStyle ?? {}),
      backgroundColor: color
    }
  });
};

// 新增：背景圆角变化（px）
const handleTextBgRadiusChange = (event: Event) => {
  if (!textBox.value) return;
  const target = event.target as HTMLInputElement;
  const radius = parseInt(target.value, 10);
  sceneStore.updateTextBox(textBox.value.id, {
    textStyle: {
      ...(textBox.value.textStyle ?? {}),
      borderRadius: `${Number.isFinite(radius) ? radius : 0}px`
    }
  });
};

// 更新：拖拽条改变字体粗细
const handleFontWeightChange = (event: Event) => {
  if (!textBox.value) return;
  const target = event.target as HTMLInputElement;
  const weight = parseInt(target.value, 10);
  sceneStore.updateTextBox(textBox.value.id, {
    textStyle: {
      ...(textBox.value.textStyle ?? {}),
      fontWeight: Number.isFinite(weight) ? weight : 400
    }
  });
};

// 新增：变更左右内边距（同步写入两侧）
const handleTextPaddingChange = (event: Event) => {
  if (!textBox.value) return;
  const target = event.target as HTMLInputElement;
  const px = parseInt(target.value, 10);
  const padding = Number.isFinite(px) ? px : 0;
  sceneStore.updateTextBox(textBox.value.id, {
    textStyle: {
      ...(textBox.value.textStyle ?? {}),
      padding: `${padding}px`
    }
  });
  // 尺寸受 padding 影响，需同步
  syncTextBox(textBox.value.id, sceneStore);
};

const handleContainerHeightChange = (event: Event) => {
  if (!textBox.value) return;
  const target = event.target as HTMLInputElement;
  const containerHeight = parseFloat(target.value);
  sceneStore.updateTextBox(textBox.value.id, {
    containerStyle: {
      ...textBox.value.containerStyle,
      height: containerHeight
    }
  });
  syncTextBox(textBox.value.id, sceneStore);
};

const handleOrientationChange = (
  orientation: keyof typeof ProjectionOrientationEnum
) => {
  if (!textBox.value) return;
  if (textBox.value.orientation === orientation) return;
  sceneStore.updateTextBox(textBox.value.id, { orientation });
  syncTextBox(textBox.value.id, sceneStore);
};

const handleKeyChange = (event: Event) => {
  if (!textBox.value) return;
  const target = event.target as HTMLInputElement;
  const keyVal = target.value;
  sceneStore.updateTextBox(textBox.value.id, { key: keyVal });
};

// 新增：顺序控制处理函数
const handleMoveTop = () => {
  if (!textBox.value) return;
  sceneStore.moveTextBox(textBox.value.id, 'top');
};
const handleMoveUp = () => {
  if (!textBox.value) return;
  sceneStore.moveTextBox(textBox.value.id, 'up');
};
const handleMoveDown = () => {
  if (!textBox.value) return;
  sceneStore.moveTextBox(textBox.value.id, 'down');
};
const handleMoveBottom = () => {
  if (!textBox.value) return;
  sceneStore.moveTextBox(textBox.value.id, 'bottom');
};

const handleDelete = () => {
  if (!textBox.value) return;
  uiStateStore.setItemControls(null);
  sceneStore.removeTextBox(textBox.value.id);
};
</script>

<style scoped>
.input-group {
  margin-bottom: 16px;
}

.input-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  display: block;
}

.text-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  min-height: 60px;
}

.text-input:focus {
  border-color: #1976d2;
  outline: none;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #ddd;
  outline: none;
}

.slider-value {
  font-size: 14px;
  color: #666;
  min-width: 40px;
}

/* 新增：颜色选择器样式 */
.color-input {
  width: 48px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
}

/* 新增：下拉选择样式 */
.select {
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
}

.toggle-group {
  display: flex;
  gap: 8px;
}

.toggle-button {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-button:hover {
  background-color: #f5f5f5;
}

.toggle-button.active {
  background-color: #1976d2;
  color: white;
  border-color: #1976d2;
}

/* .orientation-icon intentionally inherits styles declared inline */
.orientation-label {
  font-size: 12px;
  font-weight: 600;
}
</style>
