import { ref, computed } from 'vue'
import { useModelStore } from 'src/stores/modelStore'
import { Icon } from 'src/types'

export const useIconFiltering = () => {
  const filter = ref<string>('')
  const modelStore = useModelStore()

  const setFilter = (newFilter: string) => {
    filter.value = newFilter
  }

  const filteredIcons = computed(() => {
    if (filter.value === '') return null

    const regex = new RegExp(filter.value, 'gi')
    const icons = modelStore.icons || []

    return icons.filter((icon: Icon) => {
      if (!filter.value) {
        return true
      }

      return regex.test(icon.name)
    })
  })

  return {
    setFilter,
    filter,
    filteredIcons
  }
}