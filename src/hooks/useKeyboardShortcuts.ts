import { onMounted, onUnmounted } from 'vue'
import { useUiStateStore } from 'src/stores/uiStateStore'
import { useScene } from 'src/hooks/useScene'

export interface KeyboardShortcut {
  key: string
  metaKey?: boolean
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  description: string
  action: () => void
  disabled?: boolean
}

export function useKeyboardShortcuts() {
  const uiStateStore = useUiStateStore()
  const scene = useScene()

  const shortcuts: KeyboardShortcut[] = [
    // 视图控制
    {
      key: '=',
      ctrlKey: true,
      description: '放大',
      action: () => {
        const currentZoom = uiStateStore.zoom
        uiStateStore.setZoom(Math.min(currentZoom * 1.2, 5))
      }
    },
    {
      key: '-',
      ctrlKey: true,
      description: '缩小',
      action: () => {
        const currentZoom = uiStateStore.zoom
        uiStateStore.setZoom(Math.max(currentZoom / 1.2, 0.1))
      }
    },
    {
      key: '0',
      ctrlKey: true,
      description: '重置缩放',
      action: () => {
        uiStateStore.setZoom(1)
        uiStateStore.setScroll({ 
          position: { x: 0, y: 0 }, 
          offset: { x: 0, y: 0 } 
        })
      }
    },
    
    // 模式切换
    {
      key: 'Escape',
      description: '取消选择/退出当前模式',
      action: () => {
        uiStateStore.setSelectedItems([])
        uiStateStore.setMode({
          type: 'CURSOR',
          showCursor: true,
          mousedownItem: null
        })
      }
    },
    {
      key: 'v',
      description: '导航模式',
      action: () => uiStateStore.setMode({
        type: 'CURSOR',
        showCursor: true,
        mousedownItem: null
      })
    },
    {
      key: 'p',
      description: '平移模式',
      action: () => uiStateStore.setMode({
        type: 'PAN',
        showCursor: true
      })
    },
    {
      key: 'c',
      description: '连接模式',
      action: () => uiStateStore.setMode({
        type: 'CONNECTOR',
        showCursor: true,
        id: null
      })
    },
    {
      key: 't',
      description: '文本模式',
      action: () => uiStateStore.setMode({
        type: 'TEXTBOX',
        showCursor: true,
        id: null
      })
    },
    
    // 操作快捷键
    {
      key: 'Delete',
      description: '删除选中项',
      action: () => {
        const selectedItems = uiStateStore.selectedItems
        selectedItems.forEach((itemId: string) => {
          // 尝试删除不同类型的项目
          try {
            scene.deleteViewItem(itemId)
          } catch {}
          try {
            scene.deleteConnector(itemId)
          } catch {}
          try {
            scene.deleteTextBox(itemId)
          } catch {}
          try {
            scene.deleteRectangle(itemId)
          } catch {}
        })
        uiStateStore.setSelectedItems([])
      }
    },
    {
      key: 'Backspace',
      description: '删除选中项',
      action: () => {
        const selectedItems = uiStateStore.selectedItems
        selectedItems.forEach((itemId: string) => {
          // 尝试删除不同类型的项目
          try {
            scene.deleteViewItem(itemId)
          } catch {}
          try {
            scene.deleteConnector(itemId)
          } catch {}
          try {
            scene.deleteTextBox(itemId)
          } catch {}
          try {
            scene.deleteRectangle(itemId)
          } catch {}
        })
        uiStateStore.setSelectedItems([])
      }
    },
    {
      key: 'a',
      ctrlKey: true,
      description: '全选',
      action: () => {
        const allItemIds: string[] = []
        // 收集所有项目ID
        scene.items.value.forEach((item: any) => allItemIds.push(item.id))
        scene.connectors.value.forEach((item: any) => allItemIds.push(item.id))
        scene.textBoxes.value.forEach((item: any) => allItemIds.push(item.id))
        scene.rectangles.value.forEach((item: any) => allItemIds.push(item.id))
        uiStateStore.setSelectedItems(allItemIds)
      }
    },
    
    // 视图快捷键
    {
      key: 'f',
      description: '适应视图',
      action: () => {
        // 计算所有元素的边界并适应视图
        const items = scene.items.value
        if (items.length > 0) {
          const bounds = items.reduce((acc: any, item: any) => {
            return {
              minX: Math.min(acc.minX, item.x),
              minY: Math.min(acc.minY, item.y),
              maxX: Math.max(acc.maxX, item.x + (item.width || 100)),
              maxY: Math.max(acc.maxY, item.y + (item.height || 100))
            }
          }, {
            minX: Infinity,
            minY: Infinity,
            maxX: -Infinity,
            maxY: -Infinity
          })
          
          const centerX = (bounds.minX + bounds.maxX) / 2
          const centerY = (bounds.minY + bounds.maxY) / 2
          
          uiStateStore.setScroll({ 
            position: { x: -centerX + 400, y: -centerY + 300 },
            offset: { x: 0, y: 0 }
          })
          uiStateStore.setZoom(0.8)
        }
      }
    },
    
    // 调试功能
    {
      key: 'F12',
      description: '切换调试信息',
      action: () => {
        uiStateStore.setShowDebugInfo(!uiStateStore.showDebugInfo)
      }
    },
    {
      key: 'h',
      ctrlKey: true,
      description: '显示/隐藏快捷键帮助',
      action: () => {
        uiStateStore.setShowShortcutsGuide(!uiStateStore.showShortcutsGuide)
      }
    },
    {
      key: 'r',
      ctrlKey: true,
      description: '刷新视图',
      action: () => {
        // 重置UI状态
        uiStateStore.resetUiState()
      }
    }
  ]

  const handleKeyDown = (event: KeyboardEvent) => {
    // 如果在输入框中，不处理快捷键
    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return
    }

    for (const shortcut of shortcuts) {
      if (shortcut.disabled) continue

      const keyMatches = event.key === shortcut.key || event.code === shortcut.key
      const metaMatches = !!shortcut.metaKey === event.metaKey
      const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey
      const altMatches = !!shortcut.altKey === event.altKey
      const shiftMatches = !!shortcut.shiftKey === event.shiftKey

      if (keyMatches && metaMatches && ctrlMatches && altMatches && shiftMatches) {
        event.preventDefault()
        event.stopPropagation()
        shortcut.action()
        break
      }
    }
  }

  const getShortcutString = (shortcut: KeyboardShortcut): string => {
    const parts: string[] = []
    if (shortcut.metaKey) parts.push('⌘')
    if (shortcut.ctrlKey) parts.push('Ctrl')
    if (shortcut.altKey) parts.push('Alt')
    if (shortcut.shiftKey) parts.push('Shift')
    parts.push(shortcut.key)
    return parts.join(' + ')
  }

  const registerShortcut = (shortcut: KeyboardShortcut) => {
    shortcuts.push(shortcut)
  }

  const unregisterShortcut = (key: string) => {
    const index = shortcuts.findIndex(s => s.key === key)
    if (index !== -1) {
      shortcuts.splice(index, 1)
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })

  return {
    shortcuts,
    registerShortcut,
    unregisterShortcut,
    getShortcutString
  }
}