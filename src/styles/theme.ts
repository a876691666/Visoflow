// Vue 3 主题配置文件
// 移除Material-UI依赖，使用纯CSS变量和TypeScript类型

export interface CustomThemeVars {
  appPadding: {
    x: number;
    y: number;
  };
  toolMenu: {
    height: number;
  };
  customPalette: {
    [key in string]: string;
  };
  shadows: string[];
  typography: {
    h2: CSSStyleDeclaration;
    h5: CSSStyleDeclaration;
    body1: CSSStyleDeclaration;
    body2: CSSStyleDeclaration;
  };
  palette: {
    secondary: {
      main: string;
    };
    primary: {
      main: string;
    };
    background: {
      default: string;
      paper: string;
    };
    text: {
      primary: string;
      secondary: string;
    };
  };
  components: {
    card: CSSStyleDeclaration;
    button: CSSStyleDeclaration;
    input: CSSStyleDeclaration;
    toolbar: CSSStyleDeclaration;
  };
}

export const customVars: CustomThemeVars = {
  appPadding: {
    x: 40,
    y: 40
  },
  toolMenu: {
    height: 40
  },
  customPalette: {
    diagramBg: '#f6faff',
    defaultColor: '#a5b8f3',
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    light: '#f8f9fa',
    dark: '#343a40'
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0,0,0,0.1)',
    '0px 4px 8px rgba(0,0,0,0.15)',
    '0px 6px 12px rgba(0,0,0,0.2)',
    '0px 8px 16px rgba(0,0,0,0.25)',
    '0px 10px 20px rgba(0,0,0,0.3)',
    '0px 12px 24px rgba(0,0,0,0.35)',
    '0px 14px 28px rgba(0,0,0,0.4)',
    '0px 16px 32px rgba(0,0,0,0.45)',
    '0px 18px 36px rgba(0,0,0,0.5)'
  ],
  typography: {
    h2: {
      fontSize: '4em',
      fontWeight: 'bold',
      lineHeight: '1.2',
      margin: '0'
    } as CSSStyleDeclaration,
    h5: {
      fontSize: '1.3em',
      lineHeight: '1.2',
      fontWeight: '600',
      margin: '0'
    } as CSSStyleDeclaration,
    body1: {
      fontSize: '0.85em',
      lineHeight: '1.2',
      fontWeight: 'normal'
    } as CSSStyleDeclaration,
    body2: {
      fontSize: '0.75em',
      lineHeight: '1.2',
      fontWeight: 'normal'
    } as CSSStyleDeclaration
  },
  palette: {
    primary: {
      main: '#007bff'
    },
    secondary: {
      main: '#df004c'
    },
    background: {
      default: '#ffffff',
      paper: '#f8f9fa'
    },
    text: {
      primary: '#212529',
      secondary: '#6c757d'
    }
  },
  components: {
    card: {
      backgroundColor: 'white',
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
      padding: '16px'
    } as CSSStyleDeclaration,
    button: {
      textTransform: 'none',
      borderRadius: '6px',
      padding: '8px 16px',
      fontWeight: '500',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.15s ease-in-out'
    } as CSSStyleDeclaration,
    input: {
      border: '1px solid #ced4da',
      borderRadius: '6px',
      padding: '8px 12px',
      fontSize: '14px',
      transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
    } as CSSStyleDeclaration,
    toolbar: {
      backgroundColor: 'white',
      borderBottom: '1px solid #e9ecef',
      padding: '8px 16px',
      minHeight: '48px'
    } as CSSStyleDeclaration
  }
};

// 生成CSS变量字符串，用于在Vue组件中应用主题
export const generateCSSVariables = (theme: CustomThemeVars): string => {
  return `
    --app-padding-x: ${theme.appPadding.x}px;
    --app-padding-y: ${theme.appPadding.y}px;
    --tool-menu-height: ${theme.toolMenu.height}px;
    
    --color-diagram-bg: ${theme.customPalette.diagramBg};
    --color-default: ${theme.customPalette.defaultColor};
    --color-primary: ${theme.palette.primary.main};
    --color-secondary: ${theme.palette.secondary.main};
    
    --bg-default: ${theme.palette.background.default};
    --bg-paper: ${theme.palette.background.paper};
    --text-primary: ${theme.palette.text.primary};
    --text-secondary: ${theme.palette.text.secondary};
    
    --shadow-sm: ${theme.shadows[1]};
    --shadow-md: ${theme.shadows[3]};
    --shadow-lg: ${theme.shadows[5]};
    
    --font-size-h2: ${theme.typography.h2.fontSize};
    --font-size-h5: ${theme.typography.h5.fontSize};
    --font-size-body1: ${theme.typography.body1.fontSize};
    --font-size-body2: ${theme.typography.body2.fontSize};
  `;
};

// 导出主题实例
export const theme = customVars;

// 导出CSS变量字符串
export const themeCSS = generateCSSVariables(customVars);

// 工具函数：在Vue组件中应用主题
export const applyTheme = (element: HTMLElement) => {
  element.style.cssText += themeCSS;
};

// 主题类型导出，供其他文件使用
export type Theme = CustomThemeVars;
