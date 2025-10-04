import { inject, provide, type InjectionKey } from 'vue';
// Fallbacks to Pinia stores when context isn't provided (e.g., same-component usage)
import { useModelStore } from 'src/stores/modelStore';
import { useSceneStore } from 'src/stores/sceneStore';
import { useUiStateStore } from 'src/stores/uiStateStore';

// Minimal context shape; we intentionally keep loose types so it can wrap Pinia stores
export interface IsoflowContext {
  modelStore: any;
  sceneStore: any;
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

export function useIsoflowModelStore<T = any>(): T {
  const ctx = useIsoflowContext();
  if (ctx && ctx.modelStore) return ctx.modelStore as T;
  // Graceful fallback: use Pinia store directly if no provider (same-component access)
  // Note: This assumes Pinia has been installed in the app (see src/main.ts)
  return useModelStore() as unknown as T;
}

export function useIsoflowSceneStore<T = any>(): T {
  const ctx = useIsoflowContext();
  if (ctx && ctx.sceneStore) return ctx.sceneStore as T;
  return useSceneStore() as unknown as T;
}

export function useIsoflowUiStateStore<T = any>(): T {
  const ctx = useIsoflowContext();
  if (ctx && ctx.uiStateStore) return ctx.uiStateStore as T;
  return useUiStateStore() as unknown as T;
}
