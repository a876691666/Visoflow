import { computed } from 'vue'
import { getItemByIdOrThrow } from 'src/utils'
import { useScene } from 'src/hooks/useScene'

export const useViewItem = (id: string) => {
  const { items } = useScene()

  const viewItem = computed(() => {
    return getItemByIdOrThrow(items.value, id).value
  })

  return viewItem
}