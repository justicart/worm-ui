export type ComponentItem = {
  name: string
  path: string
  status: 'ready' | 'soon'
}

export type ComponentGroup = {
  name: string
  items: ComponentItem[]
}

export const componentGroups: ComponentGroup[] = [
  {
    name: 'Inputs',
    items: [
      { name: 'Range', path: '/components/range', status: 'ready' },
      { name: 'Input', path: '/components/input', status: 'ready' },
      { name: 'Switch', path: '/components/switch', status: 'ready' },
      { name: 'Text Field', path: '/components/text-field', status: 'soon' },
    ],
  },
  {
    name: 'Feedback',
    items: [
      { name: 'Toast', path: '/components/toast', status: 'soon' },
      { name: 'Progress', path: '/components/progress', status: 'soon' },
    ],
  },
  {
    name: 'Navigation',
    items: [
      { name: 'Tabs', path: '/components/tabs', status: 'soon' },
      { name: 'Breadcrumbs', path: '/components/breadcrumbs', status: 'soon' },
    ],
  },
]
