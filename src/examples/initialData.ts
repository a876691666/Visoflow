/* eslint-disable import/no-extraneous-dependencies */
import { Colors, Icons, InitialData } from 'src/Isoflow';
import { flattenCollections } from '@isoflow/isopacks/dist/utils';
import isoflowIsopack from '@isoflow/isopacks/dist/isoflow';
import awsIsopack from '@isoflow/isopacks/dist/aws';
import gcpIsopack from '@isoflow/isopacks/dist/gcp';
import azureIsopack from '@isoflow/isopacks/dist/azure';
import kubernetesIsopack from '@isoflow/isopacks/dist/kubernetes';
import { generateId } from 'src/utils';

const isopacks = flattenCollections([
  isoflowIsopack,
  awsIsopack,
  azureIsopack,
  gcpIsopack,
  kubernetesIsopack
]);

export const colors: Colors = [
  {
    id: 'color1',
    value: '#a5b8f3'
  },
  {
    id: 'color2',
    value: '#bbadfb'
  },
  {
    id: 'color3',
    value: '#f4eb8e'
  },
  {
    id: 'color4',
    value: '#f0aca9'
  },
  {
    id: 'color5',
    value: '#fad6ac'
  },
  {
    id: 'color6',
    value: '#a8dc9d'
  },
  {
    id: 'color7',
    value: '#b3e5e3'
  }
];

export const icons: Icons = isopacks;

// 示例图标数据
const sampleIcons = [
  {
    id: 'server',
    name: '服务器',
    collection: 'infrastructure',
    isIsometric: true,
    url: 'https://example.com/server.svg'
  },
  {
    id: 'database',
    name: '数据库',
    collection: 'infrastructure',
    isIsometric: true,
    url: 'https://example.com/database.svg'
  },
  {
    id: 'laptop',
    name: '笔记本电脑',
    collection: 'devices',
    isIsometric: true,
    url: 'https://example.com/laptop.svg'
  },
  {
    id: 'router',
    name: '路由器',
    collection: 'network',
    isIsometric: true,
    url: 'https://example.com/router.svg'
  }
];

// 示例颜色方案
const sampleColors = [
  { id: 'primary', value: '#6366f1' },
  { id: 'success', value: '#10b981' },
  { id: 'warning', value: '#f59e0b' },
  { id: 'danger', value: '#ef4444' },
  { id: 'info', value: '#3b82f6' }
];

// 示例模型项
const sampleItems = [
  {
    id: generateId(),
    name: 'Web 服务器',
    description: '处理HTTP请求的主要服务器',
    icon: 'server'
  },
  {
    id: generateId(),
    name: '数据库服务器',
    description: 'MySQL数据库实例',
    icon: 'database'
  },
  {
    id: generateId(),
    name: '用户设备',
    description: '客户端笔记本电脑',
    icon: 'laptop'
  },
  {
    id: generateId(),
    name: '网络路由器',
    description: '核心网络设备',
    icon: 'router'
  }
];

// 创建视图项
const createViewItems = () => {
  return sampleItems.map((item, index) => ({
    id: item.id,
    tile: { 
      x: (index % 2) * 3, 
      y: Math.floor(index / 2) * 3 
    },
    labelHeight: 80
  }));
};

// 创建连接器
const createConnectors = () => {
  if (sampleItems.length >= 4) {
    return [
      {
        id: generateId(),
        description: 'HTTP 连接',
        width: 8,
        color: 'primary',
        style: 'SOLID' as const,
        anchors: [
          {
            id: generateId(),
            ref: { item: sampleItems[2].id } // 用户设备
          },
          {
            id: generateId(),
            ref: { item: sampleItems[0].id } // Web服务器
          }
        ]
      },
      {
        id: generateId(),
        description: '数据库连接',
        width: 6,
        color: 'success',
        style: 'DASHED' as const,
        anchors: [
          {
            id: generateId(),
            ref: { item: sampleItems[0].id } // Web服务器
          },
          {
            id: generateId(),
            ref: { item: sampleItems[1].id } // 数据库
          }
        ]
      }
    ];
  }
  return [];
};

// 创建文本框
const createTextBoxes = () => {
  return [
    {
      id: generateId(),
      tile: { x: 1, y: -2 },
      content: '🌐 Web 应用架构示例',
      fontSize: 0.8,
      orientation: 'X' as const
    },
    {
      id: generateId(),
      tile: { x: 4, y: 1 },
      content: '💾 数据存储层',
      fontSize: 0.6,
      orientation: 'X' as const
    }
  ];
};

// 创建矩形区域
const createRectangles = () => {
  return [
    {
      id: generateId(),
      from: { x: -1, y: -1 },
      to: { x: 4, y: 4 },
      color: 'info'
    }
  ];
};

// 创建示例视图
const createSampleView = () => {
  const viewItems = createViewItems();
  const connectors = createConnectors();
  const textBoxes = createTextBoxes();
  const rectangles = createRectangles();

  return {
    id: generateId(),
    name: '示例网络架构',
    description: '展示基本的Web应用架构',
    lastUpdated: new Date().toISOString(),
    items: viewItems,
    connectors,
    textBoxes,
    rectangles
  };
};

export const initialData: InitialData = {
  title: 'Isoflow Vue 3 演示项目',
  version: '1.0.0',
  description: '从React迁移到Vue 3的Isoflow演示',
  icons: sampleIcons,
  colors: sampleColors,
  items: sampleItems,
  views: [createSampleView()],
  fitToView: true
};
