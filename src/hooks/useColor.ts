import { computed } from 'vue'
import { getItemByIdOrThrow } from 'src/utils'
import { useScene } from 'src/hooks/useScene'

export const useColor = (colorId?: string) => {
  const { colors } = useScene()

  const color = computed(() => {
    if (colorId === undefined) {
      if (colors.value.length > 0) {
        return colors.value[0]
      }

      throw new Error('No colors available.')
    }

    return getItemByIdOrThrow(colors.value, colorId).value
  })

  return color
}