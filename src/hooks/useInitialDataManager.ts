import { ref } from 'vue'
import { InitialData } from 'src/types'
import { INITIAL_DATA } from 'src/config'

export const useInitialDataManager = () => {
  const isReady = ref(false)

  const load = async (_initialData: InitialData) => {
    if (!_initialData) return

    isReady.value = false

    // Simplified loading logic for now
    // TODO: Implement full loading logic similar to React version
    
    isReady.value = true
  }

  const clear = () => {
    load(INITIAL_DATA)
  }

  return {
    load,
    clear,
    isReady
  }
}
