export const getLargeStep = (min: number, max: number, step: number) => {
  const range = Math.max(max - min, step)
  const largeStep = range * 0.1
  const snappedLargeStep = Math.round(largeStep / step) * step
  const normalizedLargeStep = Math.max(step, Number(snappedLargeStep.toFixed(4)))

  if (normalizedLargeStep <= step) {
    return Math.min(range, Number((step * 2).toFixed(4)))
  }

  return normalizedLargeStep
}

export const getKeyboardStepDelta = ({
  key,
  min,
  max,
  step,
  shiftKey,
}: {
  key: string
  min: number
  max: number
  step: number
  shiftKey: boolean
}) => {
  const largeStep = getLargeStep(min, max, step)
  const stepAmount = shiftKey ? largeStep : step

  switch (key) {
    case 'ArrowRight':
    case 'ArrowUp':
      return stepAmount
    case 'ArrowLeft':
    case 'ArrowDown':
      return -stepAmount
    case 'PageUp':
      return largeStep
    case 'PageDown':
      return -largeStep
    default:
      return null
  }
}
