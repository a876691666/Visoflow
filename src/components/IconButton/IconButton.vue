<template>
  <div
    class="icon-button-tooltip-wrapper"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
  >
    <button
      class="icon-button"
      :class="{
        'icon-button--active': isActive,
        'icon-button--disabled': disabled
      }"
      :disabled="disabled"
      @click="handleClick"
    >
      <div class="icon-wrapper">
        <slot name="icon">{{ Icon }}</slot>
      </div>
    </button>

    <!-- Simple tooltip -->
    <div
      v-if="tooltipVisible"
      class="tooltip"
      :class="`tooltip--${tooltipPosition}`"
    >
      {{ name }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  name: string;
  Icon?: string | any;
  isActive?: boolean;
  disabled?: boolean;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
  disabled: false,
  tooltipPosition: 'bottom'
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const tooltipVisible = ref(false);
let tooltipTimer: NodeJS.Timeout | null = null;

const iconColor = ref('#9e9e9e'); // grey.500

// Update icon color based on props
const updateIconColor = () => {
  if (props.isActive) {
    iconColor.value = '#e0e0e0'; // grey.200
  } else if (props.disabled) {
    iconColor.value = '#424242'; // grey.800
  } else {
    iconColor.value = '#9e9e9e'; // grey.500
  }
};

// Watch for prop changes
watch(() => [props.isActive, props.disabled], updateIconColor, {
  immediate: true
});

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event);
  }
};

const showTooltip = () => {
  tooltipTimer = setTimeout(() => {
    tooltipVisible.value = true;
  }, 1000);
};

const hideTooltip = () => {
  if (tooltipTimer) {
    clearTimeout(tooltipTimer);
    tooltipTimer = null;
  }
  tooltipVisible.value = false;
};
</script>

<style scoped>
.icon-button-tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.icon-button {
  border: none;
  border-radius: 0;
  height: 40px; /* theme.customVars.toolMenu.height */
  width: 40px;
  max-width: 100%;
  min-width: auto;
  background-color: transparent;
  padding: 0;
  margin: 0;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.icon-button:hover:not(.icon-button--disabled) {
  background-color: rgba(0, 0, 0, 0.04);
}

.icon-button--active {
  background-color: #90caf9; /* primary.light */
}

.icon-button--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: v-bind(iconColor);
}

.tooltip {
  position: absolute;
  background-color: #1976d2; /* primary.main */
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
  pointer-events: none;
}

.tooltip::after {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
}

.tooltip--bottom {
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
}

.tooltip--bottom::after {
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 0 5px 5px 5px;
  border-color: transparent transparent #1976d2 transparent;
}

.tooltip--top {
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
}

.tooltip--top::after {
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 5px 5px 0 5px;
  border-color: #1976d2 transparent transparent transparent;
}

.tooltip--left {
  right: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
}

.tooltip--left::after {
  right: -5px;
  top: 50%;
  transform: translateY(-50%);
  border-width: 5px 0 5px 5px;
  border-color: transparent transparent transparent #1976d2;
}

.tooltip--right {
  left: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
}

.tooltip--right::after {
  left: -5px;
  top: 50%;
  transform: translateY(-50%);
  border-width: 5px 5px 5px 0;
  border-color: transparent #1976d2 transparent transparent;
}
</style>
