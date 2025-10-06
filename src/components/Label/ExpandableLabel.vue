<template>
  <Label
    :label-height="labelHeight"
    :max-width="effectiveMaxWidth"
    :max-height="containerMaxHeight"
    :expand-direction="expandDirection"
    :styles="labelStyles"
  >
    <div
      ref="contentRef"
      class="content-container"
      :style="contentContainerStyles"
    >
      <slot />

      <!-- Gradient overlay for truncated content -->
      <Gradient
        v-if="isContentTruncated"
        :styles="{
          position: 'absolute',
          width: '100%',
          height: '50px',
          bottom: '0',
          left: '0'
        }"
      />
    </div>

    <!-- Expand/Collapse button -->
    <ExpandButton
      v-if="(!isExpanded && isContentTruncated) || isExpanded"
      :is-expanded="isExpanded"
      :styles="{
        position: 'absolute',
        bottom: '0',
        right: '0',
        margin: '4px'
      }"
      @click="handleToggleExpand"
    />
  </Label>
</template>

<script setup lang="ts">
import { ref, watch, type CSSProperties } from 'vue';
import { useResizeObserver } from 'src/hooks/useResizeObserver';
import Gradient from '@/components/Gradient/Gradient.vue';
import ExpandButton from './ExpandButton.vue';
import Label from './Label.vue';

const STANDARD_LABEL_HEIGHT = 80;

interface Props {
  labelHeight?: number;
  maxWidth: number;
  expandDirection?: 'CENTER' | 'BOTTOM';
  styles?: CSSProperties;
}

const props = withDefaults(defineProps<Props>(), {
  labelHeight: 0,
  expandDirection: 'CENTER',
  styles: () => ({})
});

const emit = defineEmits<{
  'toggle-expand': [isExpanded: boolean];
}>();

// Reactive state
const isExpanded = ref(false);
const contentRef = ref<HTMLDivElement>();
const containerMaxHeight = ref<number | undefined>(STANDARD_LABEL_HEIGHT);
const isContentTruncated = ref(false);
const effectiveMaxWidth = ref(props.maxWidth);
const contentContainerStyles = ref<CSSProperties>({});
const labelStyles = ref<CSSProperties>({});

// Use resize observer
const { size: contentSize } = useResizeObserver(contentRef as any);

// Update container max height
const updateContainerMaxHeight = () => {
  containerMaxHeight.value = isExpanded.value
    ? undefined
    : STANDARD_LABEL_HEIGHT;
};

// Update content truncation status
const updateContentTruncation = () => {
  isContentTruncated.value =
    !isExpanded.value && contentSize.value.height >= STANDARD_LABEL_HEIGHT - 10;
};

// Update effective max width
const updateEffectiveMaxWidth = () => {
  effectiveMaxWidth.value = isExpanded.value
    ? props.maxWidth * 1.5
    : props.maxWidth;
};

// Update content container styles
const updateContentContainerStyles = () => {
  contentContainerStyles.value = {
    overflowY: isExpanded.value ? 'scroll' : 'hidden',
    maxHeight: containerMaxHeight.value
      ? `${containerMaxHeight.value}px`
      : undefined,
    scrollbarWidth: 'none', // Firefox
    msOverflowStyle: 'none', // IE/Edge
    // @ts-ignore
    '&::-webkit-scrollbar': {
      display: 'none' // Chrome/Safari
    }
  };
};

// Update label styles
const updateLabelStyles = () => {
  labelStyles.value = {
    ...props.styles
  };
};

// Handle toggle expand
const handleToggleExpand = () => {
  isExpanded.value = !isExpanded.value;

  // Scroll to top when expanding/collapsing
  if (contentRef.value) {
    contentRef.value.scrollTo({ top: 0 });
  }

  emit('toggle-expand', isExpanded.value);
};

// Watch for changes
watch(
  isExpanded,
  () => {
    updateContainerMaxHeight();
    updateEffectiveMaxWidth();
    updateContentContainerStyles();
  },
  { immediate: true }
);

watch([isExpanded, () => contentSize.value.height], updateContentTruncation, {
  immediate: true
});

watch(() => props.styles, updateLabelStyles, { immediate: true, deep: true });
</script>

<style scoped>
.content-container {
  position: relative;
}

/* Hide scrollbars in different browsers */
.content-container::-webkit-scrollbar {
  display: none;
}

.content-container {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
