<template>
  <ControlsContainer>
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
      <input
        type="color"
        :value="connectorData.color || '#000000'"
        @input="handleColorChange"
        class="color-input"
      />
    </Section>

    <Section title="背景描边颜色">
      <input
        type="color"
        :value="connectorData.backgroundColor || '#ffffff'"
        @input="handleBackgroundColorChange"
        class="color-input"
      />
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
          <input
            type="color"
            :value="
              connectorData.flowHeadColor || connectorData.color || '#000000'
            "
            @input="handleFlowHeadColorChange"
            class="color-input"
          />
        </div>
        <div>
          <div class="input-label" :style="labelStyles">尾部颜色</div>
          <input
            type="color"
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

    <Section>
      <DeleteButton @click="handleDelete" />
    </Section>
  </ControlsContainer>
</template>

<script setup lang="ts">
import { ref, watch, type CSSProperties } from 'vue';
import { useIsoflowUiStateStore } from 'src/context/isoflowContext';
import ControlsContainer from '../components/ControlsContainer.vue';
import Section from '../components/Section.vue';
import DeleteButton from '../components/DeleteButton.vue';
import { useSceneStore } from 'src/stores/provider';

interface Props {
  id: string;
}

const props = defineProps<Props>();

const sceneStore = useSceneStore();
const uiStateStore = useIsoflowUiStateStore<any>();

const connectorData = ref<any>({
  description: '',
  color: '',
  backgroundColor: '',
  width: 20,
  style: 'SOLID',
  dashLength: undefined,
  dashGap: undefined,
  // 新增默认值
  showBorder: false,
  showFlow: false,
  flowHeadColor: '',
  flowTailColor: '',
  flowLength: 100,
  showDirectionArrow: true
});

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

const handleShowDirectionArrowChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  updateConnector({ showDirectionArrow: !!target.checked });
};

const updateConnector = (updates: any) => {
  connectorData.value = {
    ...connectorData.value,
    ...updates,
    anchors: connectorData.value.anchors
  };

  sceneStore.updateConnector(props.id, connectorData.value);
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
</style>
