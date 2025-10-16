<template>
  <ControlsContainer>
    <Section>
      <!-- 新增：配置复制粘贴 -->
      <ConfigClipboard
        storageKey="visoflow.connector.config"
        :get-config="getConfig"
        :apply-config="applyConfig"
      />
    </Section>

    <!-- 新增：key 字段输入 -->
    <Section>
      <div class="input-group">
        <label class="input-label" :style="labelStyles">Key</label>
        <input
          class="text-input"
          :style="inputStyles"
          :value="connectorData.key || ''"
          @input="handleKeyChange"
        />
      </div>
    </Section>

    <Section>
      <div class="input-group">
        <label class="input-label" :style="labelStyles">描述</label>
        <input
          class="text-input"
          :style="inputStyles"
          :value="connectorData.description"
          @input="handleDescriptionChange"
        />
      </div>
    </Section>

    <Section>
      <PanelColorPicker
        :value="connectorData.color || '#000000'"
        @input="handleColorChange"
        class="color-input"
      />
    </Section>

    <Section title="背景描边颜色">
      <PanelColorPicker
        :value="connectorData.backgroundColor || '#ffffff'"
        @input="handleBackgroundColorChange"
        class="color-input"
      />
    </Section>

    <!-- 新增：整体偏移（像素） -->
    <Section title="横向偏移">
      <div class="slider-container">
        <input
          type="range"
          min="-20"
          max="20"
          step="1"
          :value="connectorData.offsetX || 0"
          @input="handleOffsetXChange"
          class="slider"
          :style="sliderStyles"
        />
        <span class="slider-value">{{ connectorData.offsetX || 0 }}px</span>
      </div>
    </Section>

    <Section title="纵向偏移">
      <div class="slider-container">
        <input
          type="range"
          min="-20"
          max="20"
          step="1"
          :value="connectorData.offsetY || 0"
          @input="handleOffsetYChange"
          class="slider"
          :style="sliderStyles"
        />
        <span class="slider-value">{{ connectorData.offsetY || 0 }}px</span>
      </div>
    </Section>

    <!-- 显示边框（背景线条） -->
    <Section title="显示边框">
      <label>
        <input
          type="checkbox"
          :checked="connectorData.showBorder !== false"
          @input="handleShowBorderChange"
        />
        开启
      </label>
    </Section>

    <!-- 新增：是否直线 -->
    <Section title="直线连接">
      <label>
        <input
          type="checkbox"
          :checked="!!connectorData.isStraight"
          @input="handleIsStraightChange"
        />
        开启
      </label>
    </Section>

    <Section title="宽度">
      <div class="slider-container">
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          :value="connectorData.width"
          @input="handleWidthChange"
          class="slider"
          :style="sliderStyles"
        />
        <span class="slider-value">{{ connectorData.width }}px</span>
      </div>
    </Section>

    <Section title="样式">
      <select
        class="select-input"
        :style="selectStyles"
        :value="connectorData.style"
        @change="handleStyleChange"
      >
        <option v-for="style in styleOptions" :key="style" :value="style">
          {{ style }}
        </option>
      </select>
    </Section>

    <Section title="虚线段长度">
      <div class="slider-container">
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          :value="connectorData.dashLength ?? 0"
          @input="handleDashLengthChange"
          class="slider"
          :style="sliderStyles"
        />
        <span class="slider-value">{{
          connectorData.dashLength ?? '默认'
        }}</span>
      </div>
    </Section>

    <Section title="虚线段间隔">
      <div class="slider-container">
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          :value="connectorData.dashGap ?? 0"
          @input="handleDashGapChange"
          class="slider"
          :style="sliderStyles"
        />
        <span class="slider-value">{{ connectorData.dashGap ?? '默认' }}</span>
      </div>
    </Section>

    <!-- 显示流光开关 -->
    <Section title="显示流光">
      <label>
        <input
          type="checkbox"
          :checked="connectorData.showFlow !== false"
          @input="handleShowFlowChange"
        />
        开启
      </label>
    </Section>

    <!-- 流光渐变颜色 -->
    <Section title="流光渐变颜色">
      <div
        class="input-group"
        style="display: flex; gap: 12px; align-items: center"
      >
        <div>
          <div class="input-label" :style="labelStyles">头部颜色</div>
          <PanelColorPicker
            :value="
              connectorData.flowHeadColor || connectorData.color || '#000000'
            "
            @input="handleFlowHeadColorChange"
            class="color-input"
          />
        </div>
        <div>
          <div class="input-label" :style="labelStyles">尾部颜色</div>
          <PanelColorPicker
            :value="
              connectorData.flowTailColor || connectorData.color || '#000000'
            "
            @input="handleFlowTailColorChange"
            class="color-input"
          />
        </div>
      </div>
    </Section>

    <!-- 流光长度 -->
    <Section title="流光长度">
      <div class="slider-container">
        <input
          type="range"
          min="0"
          max="500"
          step="1"
          :value="connectorData.flowLength ?? 100"
          @input="handleFlowLengthChange"
          class="slider"
          :style="sliderStyles"
        />
        <span class="slider-value">{{ connectorData.flowLength ?? 100 }}</span>
      </div>
    </Section>

    <!-- 新增：流光速度（周期时长） -->
    <Section title="流光速度">
      <div class="slider-container">
        <input
          type="range"
          min="0.5"
          max="10"
          step="0.1"
          :value="connectorData.flowDuration ?? 2"
          @input="handleFlowDurationChange"
          class="slider"
          :style="sliderStyles"
        />
        <span class="slider-value"
          >{{ (connectorData.flowDuration ?? 2).toFixed(1) }}s</span
        >
      </div>
    </Section>

    <!-- 指引箭头显示开关 -->
    <Section title="显示指引箭头">
      <label>
        <input
          type="checkbox"
          :checked="connectorData.showDirectionArrow !== false"
          @input="handleShowDirectionArrowChange"
        />
        开启
      </label>
    </Section>

    <!-- 新增：倒转线条方向按钮 -->
    <Section title="倒转线条方向">
      <button
        class="action-button"
        :disabled="!canReverseAnchors"
        @click="handleReverseAnchors"
      >
        倒转
      </button>
    </Section>

    <Section>
      <DeleteButton @click="handleDelete" />
    </Section>
  </ControlsContainer>
</template>

<script setup lang="ts">
import { ref, watch, type CSSProperties, computed } from 'vue';
import { useIsoflowUiStateStore } from 'src/context/isoflowContext';
import ControlsContainer from '../components/ControlsContainer.vue';
import Section from '../components/Section.vue';
import DeleteButton from '../components/DeleteButton.vue';
import { useSceneStore } from 'src/stores/provider';
import ConfigClipboard from '../components/ConfigClipboard.vue';
import { syncConnector } from 'src/stores/reducers/connector';
import PanelColorPicker from 'src/components/PanelConrols/PanelColorPicker.vue';

interface Props {
  id: string;
}

const props = defineProps<Props>();

const sceneStore = useSceneStore();
const uiStateStore = useIsoflowUiStateStore<any>();

const connectorData = ref<any>({
  // 新增默认 key
  key: '',
  description: '',
  color: '',
  backgroundColor: '',
  // 新增：整体偏移（像素）
  offsetX: 0,
  offsetY: 0,
  width: 20,
  style: 'SOLID',
  dashLength: undefined,
  dashGap: undefined,
  // 新增默认值
  showBorder: false,
  // 新增：直线
  isStraight: false,
  showFlow: false,
  flowHeadColor: '',
  flowTailColor: '',
  flowLength: 100,
  // 新增：流光速度（秒）
  flowDuration: 2,
  showDirectionArrow: true
});

// 简化的复制/粘贴 API
const getConfig = () => {
  const {
    key,
    description,
    color,
    backgroundColor,
    // 偏移
    offsetX,
    offsetY,
    width,
    style,
    dashLength,
    dashGap,
    showBorder,
    // include isStraight
    isStraight,
    showFlow,
    flowHeadColor,
    flowTailColor,
    flowLength,
    // include flowDuration
    flowDuration,
    showDirectionArrow
  } = connectorData.value || {};
  return {
    key,
    description,
    color,
    backgroundColor,
    offsetX,
    offsetY,
    width,
    style,
    dashLength,
    dashGap,
    showBorder,
    isStraight,
    showFlow,
    flowHeadColor,
    flowTailColor,
    flowLength,
    flowDuration,
    showDirectionArrow
  };
};

const applyConfig = (cfg: any) => {
  if (!cfg || typeof cfg !== 'object') return;
  updateConnector({
    key: cfg.key ?? connectorData.value.key,
    description: cfg.description ?? connectorData.value.description,
    color: cfg.color ?? connectorData.value.color,
    backgroundColor: cfg.backgroundColor ?? connectorData.value.backgroundColor,
    // 偏移
    offsetX: cfg.offsetX ?? connectorData.value.offsetX,
    offsetY: cfg.offsetY ?? connectorData.value.offsetY,
    width: cfg.width ?? connectorData.value.width,
    style: cfg.style ?? connectorData.value.style,
    dashLength: cfg.dashLength ?? connectorData.value.dashLength,
    dashGap: cfg.dashGap ?? connectorData.value.dashGap,
    showBorder: cfg.showBorder ?? connectorData.value.showBorder,
    // apply isStraight
    isStraight: cfg.isStraight ?? connectorData.value.isStraight,
    showFlow: cfg.showFlow ?? connectorData.value.showFlow,
    flowHeadColor: cfg.flowHeadColor ?? connectorData.value.flowHeadColor,
    flowTailColor: cfg.flowTailColor ?? connectorData.value.flowTailColor,
    flowLength: cfg.flowLength ?? connectorData.value.flowLength,
    // apply flowDuration
    flowDuration: cfg.flowDuration ?? connectorData.value.flowDuration,
    showDirectionArrow:
      cfg.showDirectionArrow ?? connectorData.value.showDirectionArrow
  });
};

const styleOptions = ref(['SOLID', 'DASHED', 'DOTTED']);

const labelStyles = ref<CSSProperties>({});
const inputStyles = ref<CSSProperties>({});
const sliderStyles = ref<CSSProperties>({});
const selectStyles = ref<CSSProperties>({});

const updateStyles = () => {
  labelStyles.value = {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
    display: 'block'
  };

  inputStyles.value = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  };

  sliderStyles.value = {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    background: '#ddd',
    outline: 'none'
  };

  selectStyles.value = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: 'white'
  };
};

const updateConnectorData = () => {
  connectorData.value = sceneStore.getConnector(props.id);
  if (!connectorData.value) {
    debugger;
  }
};

const handleDescriptionChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const description = target.value;
  updateConnector({ description });
};

const handleKeyChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const key = target.value;
  updateConnector({ key });
};

const handleColorChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const color = target.value;
  updateConnector({ color });
};

const handleBackgroundColorChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const backgroundColor = target.value;
  updateConnector({ backgroundColor });
};

// 偏移
const handleOffsetXChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const val = parseInt(target.value, 10);
  updateConnector({ offsetX: isNaN(val) ? 0 : val });
};
const handleOffsetYChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const val = parseInt(target.value, 10);
  updateConnector({ offsetY: isNaN(val) ? 0 : val });
};

const handleWidthChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const width = parseInt(target.value);
  updateConnector({ width });
};

const handleStyleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const style = target.value as 'SOLID' | 'DASHED' | 'DOTTED';
  updateConnector({ style });
};

const handleDashLengthChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const dashLength = parseInt(target.value);
  updateConnector({ dashLength: isNaN(dashLength) ? undefined : dashLength });
};

const handleDashGapChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const dashGap = parseInt(target.value);
  updateConnector({ dashGap: isNaN(dashGap) ? undefined : dashGap });
};

// 新增 handlers
const handleShowBorderChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  updateConnector({ showBorder: !!target.checked });
};

const handleIsStraightChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const nextIsStraight = !!target.checked;

  // 当开启直线时，清空中间锚点，仅保留起点与终点
  if (nextIsStraight && Array.isArray(connectorData.value?.anchors)) {
    const anchors = connectorData.value.anchors;
    if (anchors.length > 2) {
      const trimmed = [anchors[0], anchors[anchors.length - 1]];
      updateConnector(
        { isStraight: true, anchors: trimmed },
        { resyncPath: true }
      );
      return;
    }
  }

  // 其它情况正常更新
  updateConnector({ isStraight: nextIsStraight }, { resyncPath: true });
};

const handleShowFlowChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  updateConnector({ showFlow: !!target.checked });
};

const handleFlowHeadColorChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  updateConnector({ flowHeadColor: target.value });
};

const handleFlowTailColorChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  updateConnector({ flowTailColor: target.value });
};

const handleFlowLengthChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const flowLength = parseInt(target.value);
  updateConnector({ flowLength: isNaN(flowLength) ? 100 : flowLength });
};

// 新增：流光速度（周期时长）
const handleFlowDurationChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  let sec = parseFloat(target.value);
  if (isNaN(sec)) sec = 2;
  // 范围限制 0.5s - 10s
  sec = Math.min(10, Math.max(0.5, sec));
  updateConnector({ flowDuration: sec });
};

const handleShowDirectionArrowChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  updateConnector({ showDirectionArrow: !!target.checked });
};

const canReverseAnchors = computed(() => {
  const anchors = connectorData.value?.anchors;
  return Array.isArray(anchors) && anchors.length > 1;
});

const handleReverseAnchors = () => {
  const anchors = connectorData.value?.anchors;
  if (!Array.isArray(anchors) || anchors.length <= 1) return;
  const reversed = [...anchors].reverse();
  updateConnector({ anchors: reversed }, { resyncPath: true });
};

const updateConnector = (updates: any, options?: { resyncPath?: boolean }) => {
  // 允许外部显式传入 anchors；否则基于当前值。
  let nextAnchors = connectorData.value?.anchors;

  if (updates && Object.prototype.hasOwnProperty.call(updates, 'anchors')) {
    nextAnchors = updates.anchors;
  } else if (
    Object.prototype.hasOwnProperty.call(updates || {}, 'isStraight') &&
    updates.isStraight === true &&
    Array.isArray(connectorData.value?.anchors) &&
    connectorData.value.anchors.length > 1
  ) {
    // 当开启直线且未显式传入 anchors 时，自动裁剪为首尾锚点
    const first = connectorData.value.anchors[0];
    const last =
      connectorData.value.anchors[connectorData.value.anchors.length - 1];
    nextAnchors = first && last ? [first, last] : connectorData.value.anchors;
  }

  connectorData.value = {
    ...connectorData.value,
    ...updates,
    anchors: nextAnchors
  };

  sceneStore.updateConnector(props.id, connectorData.value);

  // 如果需要，触发路径重算
  if (
    options?.resyncPath ||
    Object.prototype.hasOwnProperty.call(updates, 'isStraight')
  ) {
    try {
      syncConnector(props.id, sceneStore as any);
    } catch (e) {
      // noop
    }
  }
};

const handleDelete = () => {
  uiStateStore.setItemControls(null);
  sceneStore.removeConnector(props.id);
};

// 监听ID变化
watch([() => props.id, sceneStore.connectors], updateConnectorData, {
  immediate: true
});

// 初始化样式
updateStyles();
</script>

<style scoped>
.input-group {
  margin-bottom: 16px;
}

/* .input-label styles are applied inline */

/* .text-input styles are applied inline */

.text-input:focus {
  border-color: #1976d2;
  outline: none;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* .slider styles are applied inline */

.slider-value {
  font-size: 14px;
  color: #666;
  min-width: 40px;
}

/* .select-input styles are applied inline */

.select-input:focus {
  border-color: #1976d2;
  outline: none;
}

.color-input {
  width: 48px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
}

.action-button {
  padding: 6px 12px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  cursor: pointer;
}
.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
