import { ref, watch, onUnmounted, type Ref } from 'vue';
import type { Size } from '@/types';

export const useResizeObserver = (
  el?: Ref<HTMLElement | null> | HTMLElement | null
) => {
  const resizeObserverRef = ref<ResizeObserver | null>(null);
  const size = ref<Size>({ width: 0, height: 0 });

  const disconnect = () => {
    if (resizeObserverRef.value) {
      resizeObserverRef.value.disconnect();
      resizeObserverRef.value = null;
    }
  };

  const observe = (element: HTMLElement) => {
    disconnect();

    resizeObserverRef.value = new ResizeObserver(() => {
      size.value = {
        width: element.clientWidth,
        height: element.clientHeight
      };
    });

    resizeObserverRef.value.observe(element);
  };

  // 清理函数
  onUnmounted(() => {
    disconnect();
  });

  // 监听元素变化
  if (el) {
    if (el instanceof HTMLElement) {
      // 直接传入HTMLElement
      observe(el);
    } else {
      // 传入Ref<HTMLElement>
      watch(
        el,
        (newEl) => {
          if (newEl) {
            observe(newEl);
          } else {
            disconnect();
          }
        },
        { immediate: true }
      );
    }
  }

  return {
    size,
    disconnect,
    observe
  };
};
