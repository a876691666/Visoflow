import { Model } from 'src/types'

export const useView = () => {
  const changeView = (viewId: string, model: Model) => {
    // Simplified implementation for now
    // TODO: Implement full view changing logic
    console.log('Changing view to:', viewId)
  }

  return {
    changeView
  }
}
