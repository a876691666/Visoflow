// This file will be exported as it's own bundle (separate to the main bundle).  This is because the main
// bundle requires `window` to be present and so can't be imported into a Node environment.
import packageJson from '../package.json';

export const version = packageJson.version;
export * as reducers from 'src/stores/reducers';
export { INITIAL_DATA, INITIAL_SCENE_STATE } from 'src/config';
export * from 'src/schemas';
export type { IsoflowProps, InitialData } from 'src/types';
export type * from 'src/types/model';
