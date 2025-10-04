import { shallowRef, type ShallowRef } from 'vue';

/**
 * 深拷贝对象的辅助函数
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as T;
  }

  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }

  return obj;
}

/**
 * 创建一个 shallowRef 并提供更新函数
 */
export function createShallowState<T>(initialValue: T): {
  state: ShallowRef<T>;
  updateState: (updater: (draft: T) => void) => T;
} {
  const state = shallowRef<T>(initialValue);

  const updateState = (updater: (draft: T) => void): T => {
    const cloned = deepClone(state.value);
    updater(cloned);
    state.value = cloned;
    return cloned;
  };

  return { state, updateState };
}

/**
 * 直接更新状态的辅助函数，替代 immer 的 produce
 */
export function updateState<T>(
  currentState: T,
  updater: (draft: T) => void
): T {
  const cloned = deepClone(currentState);
  updater(cloned);
  return cloned;
}
