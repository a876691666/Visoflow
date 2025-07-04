import { computed, Ref } from 'vue'
import { TextBox } from 'src/types'
import {
  UNPROJECTED_TILE_SIZE,
  DEFAULT_FONT_FAMILY,
  TEXTBOX_DEFAULTS,
  TEXTBOX_FONT_WEIGHT,
  TEXTBOX_PADDING
} from 'src/config'

export const useTextBoxProps = (textBox: TextBox | Ref<TextBox>) => {
  const fontProps = computed(() => {
    const textBoxValue = typeof textBox === 'object' && 'value' in textBox ? textBox.value : textBox
    
    return {
      fontSize:
        UNPROJECTED_TILE_SIZE * (textBoxValue.fontSize ?? TEXTBOX_DEFAULTS.fontSize),
      fontFamily: DEFAULT_FONT_FAMILY,
      fontWeight: TEXTBOX_FONT_WEIGHT
    }
  })

  const paddingX = computed(() => {
    return UNPROJECTED_TILE_SIZE * TEXTBOX_PADDING
  })

  return { paddingX, fontProps }
}