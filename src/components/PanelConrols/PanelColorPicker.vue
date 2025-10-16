<template>
  <div class="panel-color-picker" :class="$attrs.class">
    <button
      type="button"
      class="swatch"
      :style="{ background: displayColor }"
      @click="toggle = !toggle"
    />
    <div v-if="toggle" class="popover" @click.stop>
      <ColorPicker
        :color="displayColor"
        theme="dark"
        @changeColor="onChangeColor"
      />
      <div class="actions">
        <button class="btn" @click="toggle = false">确定</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  watch,
  computed,
  getCurrentInstance,
  onMounted,
  onBeforeUnmount
} from 'vue';
import { ColorPicker } from 'vue-color-kit';
import 'vue-color-kit/dist/vue-color-kit.css';

interface Emits {
  (e: 'update:modelValue', v: string): void;
  // 兼容原 input 使用方式
  (e: 'input', event: Event): void;
  (e: 'change', v: string): void;
}
const emit = defineEmits<Emits>();

interface Props {
  modelValue?: string;
  value?: string; // 兼容 :value 传参
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  value: undefined
});

const toggle = ref(false);
const color = ref<string>(props.modelValue ?? props.value ?? '#000000');

watch(
  () => [props.modelValue, props.value] as const,
  ([mv, v]) => {
    const next = (mv ?? v ?? '').toString() || '#000000';
    if (next && next !== color.value) color.value = next;
  }
);

// 在 UI 与 ColorPicker 中使用 rgba(...)，内部存储与对外输出为 #RRGGBBAA
const displayColor = computed(() => toCssRgba(color.value));

function clamp01(n: number) {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}
function toHex2(n: number) {
  const v = Math.min(255, Math.max(0, Math.round(n)));
  return v.toString(16).padStart(2, '0');
}
function parseHexToRgba(
  s: string
): { r: number; g: number; b: number; a: number } | null {
  const m = s.trim().match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);
  if (!m) return null;
  let body = m[1].toLowerCase();
  if (body.length === 3) {
    body = `${body[0]}${body[0]}${body[1]}${body[1]}${body[2]}${body[2]}`;
  }
  let aHex = 'ff';
  if (body.length === 8) {
    aHex = body.slice(6, 8);
    body = body.slice(0, 6);
  }
  const r = parseInt(body.slice(0, 2), 16);
  const g = parseInt(body.slice(2, 4), 16);
  const b = parseInt(body.slice(4, 6), 16);
  const a = parseInt(aHex, 16) / 255;
  return { r, g, b, a };
}
function parseRgbaString(
  s: string
): { r: number; g: number; b: number; a: number } | null {
  const m = s
    .trim()
    .match(
      /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i
    );
  if (!m) return null;
  const r = Math.round(parseFloat(m[1]));
  const g = Math.round(parseFloat(m[2]));
  const b = Math.round(parseFloat(m[3]));
  const a = m[4] !== undefined ? clamp01(parseFloat(m[4])) : 1;
  return { r, g, b, a };
}

// 统一转换为 #RRGGBBAA
function normalizeHex8(input: any): string {
  if (!input) return '#000000ff';
  if (typeof input === 'string') {
    const fromRgba = parseRgbaString(input);
    if (fromRgba) {
      const { r, g, b, a } = fromRgba;
      return `#${toHex2(r)}${toHex2(g)}${toHex2(b)}${toHex2(Math.round(clamp01(a) * 255))}`;
    }
    const fromHex = parseHexToRgba(input);
    if (fromHex) {
      const { r, g, b, a } = fromHex;
      return `#${toHex2(r)}${toHex2(g)}${toHex2(b)}${toHex2(Math.round(clamp01(a) * 255))}`;
    }
    return '#000000ff';
  }
  if (typeof input === 'object') {
    const r = Number(input.r ?? 0);
    const g = Number(input.g ?? 0);
    const b = Number(input.b ?? 0);
    const a = clamp01(Number(input.a ?? 1));
    return `#${toHex2(r)}${toHex2(g)}${toHex2(b)}${toHex2(Math.round(a * 255))}`;
  }
  return '#000000ff';
}

function toCssRgba(input: any): string {
  let rgba =
    typeof input === 'string'
      ? parseRgbaString(input) || parseHexToRgba(input)
      : input && typeof input === 'object'
        ? { r: input.r, g: input.g, b: input.b, a: clamp01(input.a ?? 1) }
        : null;
  if (!rgba) rgba = { r: 0, g: 0, b: 0, a: 1 };
  const a = clamp01(Number(rgba.a ?? 1));
  return `rgba(${Math.round(rgba.r)}, ${Math.round(rgba.g)}, ${Math.round(rgba.b)}, ${+a.toFixed(3)})`;
}

function onChangeColor(payload: {
  rgba: { r: number; g: number; b: number; a: number };
}) {
  const hex8 = normalizeHex8(payload?.rgba || color.value);
  color.value = hex8;
  // v-model 输出 hex8
  emit('update:modelValue', hex8);
  emit('change', hex8);
  // 兼容原本 @input 处理器签名
  const evt = new Event('input');
  Object.defineProperty(evt, 'target', {
    value: { value: hex8 },
    writable: false
  });
  emit('input', evt);
}

// 点击外部关闭
function onDocClick(e: MouseEvent) {
  const el = (e.target as HTMLElement) || null;
  // 简单外点检测：若点击的不是当前根元素内，则关闭
  const root = (getCurrentInstance() as any)?.proxy?.$el as
    | HTMLElement
    | undefined;
  if (toggle.value && root && el && !root.contains(el)) toggle.value = false;
}

onMounted(() => document.addEventListener('click', onDocClick));
onBeforeUnmount(() => document.removeEventListener('click', onDocClick));
</script>

<style scoped>
.panel-color-picker {
  position: relative;
  display: inline-block;
}

.swatch {
  width: 48px;
  height: 32px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.popover {
  position: absolute;
  z-index: 1000;
  top: calc(100% + 8px);
  left: 0;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
  padding: 8px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.btn {
  padding: 4px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}

.btn:hover {
  background: #f5f5f5;
}
</style>
<style>
.popover .hu-color-picker {
  box-sizing: content-box;
}
</style>
