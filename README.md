<h4 align="center">
  <a href="https://a876691666.github.io/visoflow/">在线演示</a>
</h4>

<div align="center">
    <h1>V isoflow</h1>
    <h1>一个用于绘制拓扑图的 Vue 组件。改编自 React版本的 <a href="https://github.com/markmanx/isoflow">isoflow</a></h1>
</div>

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

## Visoflow lib 包的使用方式

下面是以 NPM 包方式在 Vue 3 项目中使用 Visoflow 的快速指南。如果你只想看在线效果，请移步上面的“在线演示”。

### 安装

- 使用 pnpm（推荐）

```bash
pnpm add visoflow
```

- 或使用 npm

```bash
npm install visoflow
```

- 或使用 yarn

```bash
yarn add visoflow
```

注意：Visoflow 依赖 Vue 3（peerDependencies: vue >= 3.3）。

### 引入与注册

你可以以插件方式全局注册组件，或按需局部注册。

1. 全局注册（插件）

```ts
// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import VisoflowPlugin from 'visoflow';

// 可选：样式（若你的构建工具将库样式抽离到独立 CSS 文件，建议引入）
// import 'visoflow/dist/style.css';

createApp(App).use(VisoflowPlugin).mount('#app');
```

2. 局部注册（按需）

```ts
// 在需要的组件中
import { Visoflow } from 'visoflow';
// 可选：样式
// import 'visoflow/dist/style.css';
```

```vue
<template>
  <Visoflow :initialData="initialData" @modelUpdated="handleUpdated" />
  <!-- 建议容器给定尺寸，否则默认 100% 填充父容器 -->
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { InitialData } from 'visoflow';

const initialData = ref<InitialData>({
  title: 'My Diagram',
  version: '',
  icons: [],
  colors: [{ id: '__DEFAULT__', value: '#8db3ff' }],
  views: [
    {
      id: 'view-1',
      name: 'Overview',
      items: [
        {
          id: 'node-1',
          name: 'Service A',
          icon: 'block',
          tile: { x: 0, y: 0 },
          labelHeight: 80
        },
        {
          id: 'node-2',
          name: 'Service B',
          icon: 'block',
          tile: { x: 3, y: 1 },
          labelHeight: 80
        }
      ],
      connectors: [
        {
          id: 'edge-1',
          color: '__DEFAULT__',
          width: 10,
          style: 'SOLID',
          anchors: [
            { id: 'a1', ref: { item: 'node-1' } },
            { id: 'a2', ref: { item: 'node-2' } }
          ]
        }
      ],
      rectangles: [],
      textBoxes: []
    }
  ],
  fitToView: true,
  global: { scene: {} }
});

function handleUpdated(model: any) {
  console.log('model updated:', model);
}
</script>

<style scoped>
.container {
  width: 100%;
  height: 600px;
}
</style>
```

### Props（常用）

- initialData: 初始画布数据，类型为 `InitialData`。
- mainMenuOptions: 顶部菜单配置，默认包含导入/导出等项。
- width, height: 组件尺寸（number 或 string），默认 100%。
- editorMode: 编辑模式，'EDITABLE' | 'READONLY'。
- enableDebugTools: 是否开启调试工具（布尔）。
- renderer: 渲染器配置（高级用法）。

完整类型可从 `visoflow` 导入：`import type { IsoflowProps, InitialData } from 'visoflow';`

### 事件

- modelUpdated: 画布数据更新时触发。

```vue
<Visoflow :initialData="initialData" @modelUpdated="onUpdated" />
```

### 组件实例 API（通过模板 ref）

Visoflow 对外暴露 `useVisoflow()`，可访问内部 store 等能力。

```vue
<template>
  <Visoflow ref="vf" :initialData="initialData" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const vf = ref<any>();

onMounted(() => {
  const api = vf.value?.useVisoflow?.();
  // 例如访问 UI 状态或场景 store
  console.log(api?.uiState.zoom);
});
</script>
```

### 类型与工具导出

包额外导出了一些常用工具与类型（可在 Node/SSR 环境单独使用，不需要浏览器 window）：

```ts
import {
  INITIAL_DATA,
  INITIAL_SCENE_STATE,
  reducers,
  // Zod schemas & 各种类型
  connectorStyleOptions,
  type InitialData,
  type IsoflowProps,
  type Model
} from 'visoflow';
```

如果你需要配套图标集，建议使用 `@isoflow/isopacks`：

```ts
import { flattenCollections } from '@isoflow/isopacks/dist/utils';
import isoflowIsopack from '@isoflow/isopacks/dist/isoflow';

const icons = flattenCollections([isoflowIsopack]);
```

### CDN / UMD 使用

Vite 库模式下提供 UMD 构建，浏览器可直接通过 CDN 引用（需先引入 Vue 3）。

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <!-- 可选样式：若发布产物包含 dist/style.css -->
    <!-- <link rel="stylesheet" href="https://unpkg.com/visoflow/dist/style.css" /> -->
  </head>
  <body>
    <div id="app"></div>

    <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
    <script src="https://unpkg.com/visoflow/dist/index.umd.js"></script>
    <script>
      const { createApp, ref } = Vue;
      const initialData = {
        title: 'CDN Demo',
        version: '',
        icons: [],
        colors: [{ id: '__DEFAULT__', value: '#8db3ff' }],
        views: [],
        fitToView: true,
        global: { scene: {} }
      };

      const App = {
        template:
          '<div style="height:600px"><Visoflow :initialData="initialData" /></div>',
        setup() {
          return { initialData };
        }
      };

      createApp(App).use(Visoflow).mount('#app');
    </script>
  </body>
</html>
```

说明：UMD 全局名为 `Visoflow`（Vue 的全局名为 `Vue`）。

### SSR / 按需加载提示

- 组件运行依赖浏览器环境，服务端渲染时请只在客户端加载（如 Nuxt 的 `<client-only>`、或根据 `onMounted` 动态挂载）。
- 若仅在 Node/SSR 中使用类型、reducers 或 schema，可直接从包根导入（这些导出不依赖 window）。

### 常见问题

- 看不到样式？请确认是否引入了包的样式文件（如存在）：`import 'visoflow/dist/style.css';`。
- 找不到类型声明？确保使用的包版本包含 `dist/index.d.ts`（本包已通过 `vite-plugin-dts` 生成）。
