import { computed } from 'vue'
import { getItemByIdOrThrow } from 'src/utils'
import { useScene } from 'src/hooks/useScene'

export const useRectangle = (id: string) => {
  const { rectangles } = useScene()

  const rectangle = computed(() => {
    return getItemByIdOrThrow(rectangles.value, id).value
  })

  return rectangle
}