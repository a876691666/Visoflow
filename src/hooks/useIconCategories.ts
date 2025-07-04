import { computed } from 'vue'
import { IconCollectionStateWithIcons } from 'src/types'
import { useUiStateStore } from 'src/stores/uiStateStore'
import { useModelStore } from 'src/stores/modelStore'

export const useIconCategories = () => {
  const modelStore = useModelStore()
  const uiStateStore = useUiStateStore()

  const iconCategories = computed<IconCollectionStateWithIcons[]>(() => {
    const icons = modelStore.icons || []
    const iconCategoriesState = uiStateStore.iconCategoriesState || []
    
    return iconCategoriesState.map((collection) => {
      return {
        ...collection,
        icons: icons.filter((icon: any) => {
          return icon.collection === collection.id
        })
      }
    })
  })

  return {
    iconCategories
  }
}