// Vue3 theme configuration (replacing Material-UI)
export const themeConfig = {
  spacing: (multiplier: number) => `${multiplier * 8}px`,
  customVars: {
    appPadding: {
      x: 16,
      y: 16
    },
    customPalette: {
      diagramBg: '#f5f5f5'
    }
  }
}

export const theme = themeConfig
