import { Size, Coords } from 'src/types';

declare global {
  let PACKAGE_VERSION: string;
  let REPOSITORY_URL: string;

  interface Window {
    Isoflow: {
      getUnprojectedBounds: () => Size & Coords;
      fitToView: () => void;
    };
  }
}

// 声明 three/examples 中 OrbitControls 的模块类型，方便在项目中直接导入 MapControls
declare module 'three/examples/jsm/controls/OrbitControls' {
  import { Camera } from 'three';

  export class MapControls {
    constructor(object: Camera, domElement?: HTMLElement | null);
    enabled: boolean;
    screenSpacePanning: boolean;
    enableDamping: boolean;
    dampingFactor: number;
    enableRotate: boolean;
    enablePan: boolean;
    enableZoom: boolean;
    update(): void;
    dispose(): void;
  }

  export class OrbitControls extends MapControls {}

  export {};
}

export {};
