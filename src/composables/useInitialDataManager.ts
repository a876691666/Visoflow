import { ref, computed } from 'vue'
import { InitialData, IconCollectionState } from 'src/types'
import { INITIAL_DATA, INITIAL_SCENE_STATE } from 'src/config'
import {
  getFitToViewParams,
  CoordsUtils,
  categoriseIcons,
  generateId,
  getItemByIdOrThrow
} from 'src/utils'
import * as reducers from 'src/stores/reducers'
import { useModelStore } from 'src/stores/modelStore'
import { useView } from 'src/composables/useView'
import { useUiStateStore } from 'src/stores/uiStateStore'
import { modelSchema } from 'src/schemas/model'

export const useInitialDataManager = () => {
  const isReady = ref(false)
  const prevInitialData = ref<InitialData>()
  
  const modelStore = useModelStore()
  const uiStateStore = useUiStateStore()
  const { changeView } = useView()

  const load = (_initialData: InitialData) => {
    if (!_initialData || prevInitialData.value === _initialData) return

    isReady.value = false

    const validationResult = modelSchema.safeParse(_initialData)

    if (!validationResult.success) {
      console.log(validationResult.error.errors)
      window.alert('There is an error in your model.')
      return
    }

    const initialData = _initialData

    if (initialData.views.length === 0) {
      const updates = reducers.view({
        action: 'CREATE_VIEW',
        payload: {},
        ctx: {
          state: { model: initialData, scene: INITIAL_SCENE_STATE },
          viewId: generateId()
        }
      })

      Object.assign(initialData, updates.model)
    }

    prevInitialData.value = initialData
    modelStore.updateState(initialData)

    const view = getItemByIdOrThrow(
      initialData.views,
      initialData.view ?? initialData.views[0].id
    )

    changeView(view.value.id, initialData)

    if (initialData.fitToView) {
      const rendererSize = uiStateStore.rendererEl?.getBoundingClientRect()

      const { zoom, scroll } = getFitToViewParams(view.value, {
        width: rendererSize?.width ?? 0,
        height: rendererSize?.height ?? 0
      })

      uiStateStore.setScroll({
        position: scroll,
        offset: CoordsUtils.zero()
      })

      uiStateStore.setZoom(zoom)
    }

    const categoriesState: IconCollectionState[] = categoriseIcons(
      initialData.icons
    ).map((collection) => {
      return {
        id: collection.name,
        isExpanded: false
      }
    })

    uiStateStore.setIconCategoriesState(categoriesState)

    isReady.value = true
  }

  const clear = () => {
    load({ 
      ...INITIAL_DATA, 
      icons: modelStore.icons, 
      colors: modelStore.colors 
    })
    uiStateStore.resetUiState()
  }

  return {
    load,
    clear,
    isReady: computed(() => isReady.value)
  }
}