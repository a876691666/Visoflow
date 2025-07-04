import { computed } from 'vue'
import { ModelItem } from 'src/types'
import { useModelStore } from 'src/stores/modelStore'
import { getItemByIdOrThrow } from 'src/utils'

export const useModelItem = (id: string) => {
  const modelStore = useModelStore()

  const modelItem = computed((): ModelItem => {
    return getItemByIdOrThrow(modelStore.items, id).value
  })

  return modelItem
}