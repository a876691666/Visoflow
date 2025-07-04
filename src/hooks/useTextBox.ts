import { computed } from 'vue'
import { getItemByIdOrThrow } from 'src/utils'
import { useScene } from 'src/hooks/useScene'

export const useTextBox = (id: string) => {
  const { textBoxes } = useScene()

  const textBox = computed(() => {
    return getItemByIdOrThrow(textBoxes.value, id).value
  })

  return textBox
}