import { ref, watch } from 'vue';
import type { TextBox } from '@/types';
import {
  UNPROJECTED_TILE_SIZE,
  DEFAULT_FONT_FAMILY,
  TEXTBOX_DEFAULTS,
  TEXTBOX_FONT_WEIGHT,
  TEXTBOX_PADDING
} from '@/config';

export const useTextBoxProps = (textBox: TextBox) => {
  const fontProps = ref({
    fontSize: `${UNPROJECTED_TILE_SIZE * TEXTBOX_DEFAULTS.fontSize}px`,
    fontFamily: DEFAULT_FONT_FAMILY,
    fontWeight: TEXTBOX_FONT_WEIGHT
  });

  const paddingX = ref(UNPROJECTED_TILE_SIZE * TEXTBOX_PADDING);

  // 更新字体属性
  const updateFontProps = () => {
    const fontSize = textBox.fontSize ?? TEXTBOX_DEFAULTS.fontSize;
    fontProps.value = {
      fontSize: `${UNPROJECTED_TILE_SIZE * fontSize}px`,
      fontFamily: DEFAULT_FONT_FAMILY,
      fontWeight: TEXTBOX_FONT_WEIGHT
    };
  };

  // 监听textBox.fontSize变化
  watch(() => textBox.fontSize, updateFontProps, { immediate: true });

  return {
    paddingX,
    fontProps
  };
};
