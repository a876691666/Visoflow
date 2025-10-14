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

## 简介

本项目 99% 的代码来自 Copilot 生成, 开发人员在项目中担任了架构师和测试员的角色, 主要负责代码的组织和功能的验证。

相比 `isoflow` 原版，`visoflow` 主要有以下改动：

- 🤖🤖🤖🤖👨 Vue3重写：TypeScript + Setup Api2
- 🤖🤖👨👨👨 更高效的状态管理: Ref + Watch 替代 Redux
- 🤖🤖🤖🤖👨 经过修复的拖拽与缩放交互: 随鼠标交互与中心视点
- 🤖🤖🤖🤖👨 调整的数据结构：将items下沉到views中, 去掉外键关联
- 🤖🤖🤖🤖👨 合理的鼠标点击交互：基于dom事件冒泡，而不是tile坐标计算
- 🤖🤖🤖🤖👨 更多的编辑模式便携式交互: 复制粘贴属性，复制节点等
- 🤖🤖🤖🤖👨 更灵活的图标支持: 支持自定义图标
- 🤖🤖🤖🤖👨 更多的配置属性: 全局配置，渲染元素配置等
- 🤖🤖🤖🤖👨 更无脑的代码: AI生成的Vue代码
- 🤖🤖🤖🤖👨 线条编辑模式

## Visoflow lib 包的使用方式

下面是以 NPM 包方式在 Vue 3 项目中使用 Visoflow 的快速指南。

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

如果你需要配套图标集，建议使用 `@isoflow/isopacks`：

```ts
import { flattenCollections } from '@isoflow/isopacks/dist/utils';
import isoflowIsopack from '@isoflow/isopacks/dist/isoflow';

const icons = flattenCollections([isoflowIsopack]);
```
