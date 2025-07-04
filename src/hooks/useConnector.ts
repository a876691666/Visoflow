import { computed } from 'vue'
import { getItemByIdOrThrow } from 'src/utils'
import { useScene } from 'src/hooks/useScene'

export const useConnector = (id: string) => {
  const { connectors } = useScene()

  const connector = computed(() => {
    return getItemByIdOrThrow(connectors.value, id).value
  })

  return connector
}