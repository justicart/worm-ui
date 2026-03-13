import { Navigate, useParams } from 'react-router-dom'
import { InputExample } from '../components/__examples__/InputExample'
import { RangeExample } from '../components/__examples__/RangeExample'
import { SwitchExample } from '../components/__examples__/SwitchExample'
import { ComponentPlaceholder } from '../components/ComponentPlaceholder'
import { componentGroups } from '../data/catalog'

const componentEntries = componentGroups.flatMap((group) =>
  group.items.map((item) => ({
    ...item,
    category: group.name,
    slug: item.path.split('/').pop() ?? '',
  })),
)

export function ComponentPage() {
  const { componentName } = useParams<{ componentName: string }>()
  const component = componentEntries.find((entry) => entry.slug === componentName)

  if (!componentName) {
    return <Navigate replace to="/components/range" />
  }

  if (!component) {
    return <Navigate replace to="/components/range" />
  }

  if (component.slug === 'range') {
    return <RangeExample />
  }

  if (component.slug === 'input') {
    return <InputExample />
  }

  if (component.slug === 'switch') {
    return <SwitchExample />
  }

  return <ComponentPlaceholder category={component.category} title={component.name} />
}
