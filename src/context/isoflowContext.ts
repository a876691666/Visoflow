import { inject, provide, type InjectionKey } from 'vue';
// Fallbacks to Pinia stores when context isn't provided (e.g., same-component usage)
import { useUiStateStore } from 'src/stores/uiStateStore';

// Minimal context shape; we intentionally keep loose types so it can wrap Pinia stores
export interface IsoflowContext {
  uiStateStore: any;
}

export const IsoflowContextKey: InjectionKey<IsoflowContext> =
  Symbol('IsoflowContext');

export function provideIsoflow(context: IsoflowContext) {
  provide(IsoflowContextKey, context);
}

export function useIsoflowContext(): IsoflowContext | null {
  return inject(IsoflowContextKey, null);
}

export function useIsoflowUiStateStore<T = any>(): T {
  const ctx = useIsoflowContext();
  if (ctx && ctx.uiStateStore) return ctx.uiStateStore as T;
  return useUiStateStore() as unknown as T;
}
