import { ref, onMounted, onUnmounted, Ref } from 'vue'

export const useResizeObserver = (target: Ref<HTMLElement | null> | HTMLElement | null) => {
  const size = ref({ width: 0, height: 0 })
  let observer: ResizeObserver | null = null

  const updateSize = () => {
    const element = target && 'value' in target ? target.value : target
    if (element) {
      const rect = element.getBoundingClientRect()
      size.value = {
        width: rect.width,
        height: rect.height
      }
    }
  }

  onMounted(() => {
    const element = target && 'value' in target ? target.value : target
    if (element && window.ResizeObserver) {
      observer = new ResizeObserver(() => {
        updateSize()
      })
      observer.observe(element)
      updateSize() // Initial size
    }
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  return {
    size
  }
}