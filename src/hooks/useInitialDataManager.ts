import { ref } from 'vue';
import { InitialData, IconCollectionState } from 'src/types';
import { INITIAL_DATA, INITIAL_SCENE_STATE } from 'src/config';
import {
  getFitToViewParams,
  CoordsUtils,
  categoriseIcons,
  generateId,
  getItemByIdOrThrow
} from 'src/utils';
import * as reducers from 'src/stores/reducers';
import { useIsoflowUiStateStore } from 'src/context/isoflowContext';
import { modelSchema } from 'src/schemas/model';
import { useSceneStore } from 'src/stores/provider';

export const useInitialDataManager = (
  sceneStore: ReturnType<typeof useSceneStore>
) => {
  const isReady = ref(false);
  const prevInitialData = ref<InitialData>();

  const uiStateStore = useIsoflowUiStateStore<any>();

  const load = (_initialData: InitialData) => {
    if (!_initialData || prevInitialData.value === _initialData) return;

    isReady.value = false;

    const validationResult = modelSchema.safeParse(_initialData);

    if (!validationResult.success) {
      // TODO: let's get better at reporting error messages here (starting with how we present them to users)
      // - not in console but in a modal
      console.log(validationResult.error.errors);
      window.alert('There is an error in your model.');
      return;
    }

    const initialData = _initialData;

    if (initialData.views.length === 0) {
      const updates = reducers.view({
        action: 'CREATE_VIEW',
        payload: {},
        ctx: {
          state: { model: initialData, scene: INITIAL_SCENE_STATE },
          viewId: generateId()
        }
      });

      Object.assign(initialData, updates.model);
    }

    prevInitialData.value = initialData;

    const view = getItemByIdOrThrow(
      initialData.views,
      initialData.view ?? initialData.views[0].id
    );

    sceneStore.updateModel(initialData);
    sceneStore.setCurrentView(view.value.id);

    uiStateStore.setView(view.value.id);

    if (initialData.fitToView) {
      const rendererSize = uiStateStore.rendererEl?.getBoundingClientRect();

      const { zoom, scroll } = getFitToViewParams(view.value, {
        width: rendererSize?.width ?? 0,
        height: rendererSize?.height ?? 0
      });

      uiStateStore.setScroll({
        position: scroll,
        offset: CoordsUtils.zero()
      });

      uiStateStore.setZoom(zoom);
    }

    const categoriesState: IconCollectionState[] = categoriseIcons(
      initialData.icons
    ).map((collection) => {
      return {
        id: collection.name,
        isExpanded: false
      };
    });

    uiStateStore.setIconCategoriesState(categoriesState);

    isReady.value = true;
  };

  const clear = () => {
    load({
      ...INITIAL_DATA
    });
    uiStateStore.resetUiState();
  };

  return {
    load,
    clear,
    isReady
  };
};
