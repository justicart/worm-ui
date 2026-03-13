import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type {
  ComponentPropsWithoutRef,
  KeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from 'react'
import { createContourPath } from './contourPath'
import { Input } from './Input'
import { getKeyboardStepDelta } from './stepControls'

type NativeInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  | 'className'
  | 'disabled'
  | 'id'
  | 'max'
  | 'min'
  | 'onChange'
  | 'onKeyDown'
  | 'ref'
  | 'step'
  | 'type'
  | 'value'
>

type RangeProps = {
  value?: number
  defaultValue?: number
  min: number
  max: number
  step?: number
  dataset?: readonly unknown[]
  showInput?: boolean
  disabled?: boolean
  onChange?: (value: number) => void
  ariaLabel?: string
  label?: string
  inputProps?: NativeInputProps
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const snapValue = (value: number, min: number, max: number, step: number) => {
  const snapped = Math.round((value - min) / step) * step + min
  return clamp(Number(snapped.toFixed(4)), min, max)
}
const HIT_SLOP_Y = 12

const formatTickNumber = (value: number) => {
  if (!Number.isFinite(value)) {
    return ''
  }

  return value.toFixed(2).replace(/\.?0+$/, '')
}

const getTickLabel = (item: unknown) => {
  if (typeof item === 'number') {
    return formatTickNumber(item)
  }

  if (typeof item === 'string') {
    const numericValue = Number(item)
    return Number.isFinite(numericValue) ? formatTickNumber(numericValue) : item
  }

  if (typeof item === 'object' && item !== null && 'label' in item) {
    const label = item.label

    if (typeof label === 'number') {
      return formatTickNumber(label)
    }

    if (typeof label === 'string') {
      const numericValue = Number(label)
      return Number.isFinite(numericValue) ? formatTickNumber(numericValue) : label
    }
  }

  return ''
}

export function Range({
  value,
  defaultValue,
  min,
  max,
  step = 1,
  dataset,
  showInput = false,
  disabled = false,
  onChange,
  ariaLabel,
  label,
  inputProps,
}: RangeProps) {
  const ariaLabelValue = inputProps?.['aria-label'] ?? ariaLabel ?? label

  const trackRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const pathRef = useRef<SVGPathElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const animationTargetRef = useRef<number | null>(null)
  const animationTimestampRef = useRef<number | null>(null)
  const activePointerIdRef = useRef<number | null>(null)
  const isAnimatingRef = useRef(false)
  const inputId = useId()
  const [isActive, setIsActive] = useState(false)
  const [isHoverInteractive, setIsHoverInteractive] = useState(false)
  const [pathLength, setPathLength] = useState(0)
  const [trackWidth, setTrackWidth] = useState(612)
  const [trimRange, setTrimRange] = useState({ start: 0, fillEnd: 0, end: 0 })
  const [tickPoints, setTickPoints] = useState<Array<{ filled: boolean; x: number; y: number }>>([])
  const [uncontrolledValue, setUncontrolledValue] = useState(() =>
    snapValue(defaultValue ?? min, min, max, step),
  )
  const currentValue =
    value === undefined ? uncontrolledValue : snapValue(value, min, max, step)
  const currentValueRef = useRef(currentValue)
  const visualValueRef = useRef(currentValue)
  const [visualValue, setVisualValue] = useState(currentValue)
  currentValueRef.current = currentValue
  visualValueRef.current = visualValue

  const range = Math.max(max - min, 1)
  const percentage = (visualValue - min) / range
  const svgWidth = Math.max(trackWidth, 240)
  const svgHeight = 56
  const viewBoxTop = 6
  const viewBoxHeight = 28
  const padding = 6
  const centerY = 28
  const crestHalfWidth = 32
  const crestHeight = 17
  const thumbRadius = 7
  const thumbY = centerY
  const minX = padding
  const maxX = svgWidth - padding
  const thumbX = minX + percentage * (maxX - minX)
  const overshoot = 96
  const tickLabels = dataset?.map(getTickLabel) ?? []
  const tickCount = dataset?.length ?? 0
  const visibleLength = Math.max(trimRange.end - trimRange.start, 0)
  const filledLength =
    currentValue <= min ? 0 : Math.max(trimRange.fillEnd - trimRange.start, 0)
  const pathData = createContourPath({
    width: svgWidth,
    padding,
    overshoot,
    centerY,
    crestHalfWidth,
    crestHeight,
    thumbX,
  })

  const stopAnimation = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    animationTargetRef.current = null
    animationTimestampRef.current = null
    isAnimatingRef.current = false
  }

  const focusNativeInput = () => {
    requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true })
    })
  }

  const animateVisualValue = (nextValue: number) => {
    if (disabled) {
      animationTargetRef.current = null
      animationTimestampRef.current = null
      visualValueRef.current = nextValue
      setVisualValue(nextValue)
      return
    }

    animationTargetRef.current = nextValue

    if (Math.abs(nextValue - visualValueRef.current) < 0.001) {
      animationTargetRef.current = null
      animationTimestampRef.current = null
      visualValueRef.current = nextValue
      setVisualValue(nextValue)
      return
    }

    if (animationFrameRef.current !== null) {
      return
    }

    isAnimatingRef.current = true

    const stepAnimation = (timestamp: number) => {
      const lastTimestamp = animationTimestampRef.current ?? timestamp
      const elapsed = Math.max(timestamp - lastTimestamp, 0)
      const targetValue = animationTargetRef.current ?? visualValueRef.current
      const distance = targetValue - visualValueRef.current

      animationTimestampRef.current = timestamp

      if (Math.abs(distance) < 0.001) {
        isAnimatingRef.current = false
        animationFrameRef.current = null
        animationTargetRef.current = null
        animationTimestampRef.current = null
        visualValueRef.current = targetValue
        setVisualValue(targetValue)
        return
      }

      // Smoothly approach the latest target so repeated key presses update the destination
      // instead of restarting the easing curve from scratch.
      const alpha = 1 - Math.exp(-elapsed / 45)
      const nextVisualValue = visualValueRef.current + distance * alpha

      visualValueRef.current = nextVisualValue
      setVisualValue(nextVisualValue)

      animationFrameRef.current = requestAnimationFrame(stepAnimation)
    }

    animationFrameRef.current = requestAnimationFrame(stepAnimation)
  }

  const getValueFromPointer = (clientX: number, clientY: number, enforceVerticalBounds = true) => {
    if (disabled) return null

    const track = trackRef.current
    if (!track) return null

    const bounds = track.getBoundingClientRect()
    const visualCenterY = bounds.top + (centerY / svgHeight) * bounds.height
    const distanceFromTrack = Math.abs(clientY - visualCenterY)

    if (enforceVerticalBounds && distanceFromTrack > HIT_SLOP_Y) {
      return null
    }

    const visibleStart = bounds.left + padding
    const visibleEnd = bounds.right - padding
    const visibleWidth = Math.max(visibleEnd - visibleStart, 1)
    const ratio = clamp((clientX - visibleStart) / visibleWidth, 0, 1)
    return min + ratio * range
  }

  const isPointerWithinHitZone = (clientY: number) => {
    const track = trackRef.current
    if (!track) return false

    const bounds = track.getBoundingClientRect()
    const visualCenterY = bounds.top + (centerY / svgHeight) * bounds.height
    return Math.abs(clientY - visualCenterY) <= HIT_SLOP_Y
  }

  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return

    const updateWidth = () => {
      setTrackWidth(track.getBoundingClientRect().width)
    }

    updateWidth()

    const resizeObserver = new ResizeObserver(() => {
      updateWidth()
    })

    resizeObserver.observe(track)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  useLayoutEffect(() => {
    if (!pathRef.current) return
    const path = pathRef.current
    const totalLength = path.getTotalLength()

    const findLengthAtX = (targetX: number) => {
      let start = 0
      let end = totalLength

      for (let index = 0; index < 18; index += 1) {
        const middle = (start + end) / 2
        const point = path.getPointAtLength(middle)

        if (point.x < targetX) {
          start = middle
        } else {
          end = middle
        }
      }

      return (start + end) / 2
    }

    const findFillEndLength = () => {
      let bestLength = 0
      let bestY = Number.POSITIVE_INFINITY

      for (let index = 0; index <= 80; index += 1) {
        const sampleLength = (totalLength * index) / 80
        const point = path.getPointAtLength(sampleLength)

        if (point.y < bestY) {
          bestY = point.y
          bestLength = sampleLength
        }
      }

      let start = Math.max(0, bestLength - totalLength / 40)
      let end = Math.min(totalLength, bestLength + totalLength / 40)

      for (let index = 0; index < 18; index += 1) {
        const firstThird = start + (end - start) / 3
        const secondThird = end - (end - start) / 3
        const firstPoint = path.getPointAtLength(firstThird)
        const secondPoint = path.getPointAtLength(secondThird)

        if (firstPoint.y < secondPoint.y) {
          end = secondThird
        } else {
          start = firstThird
        }
      }

      return (start + end) / 2
    }

    setPathLength(totalLength)
    const nextTrimRange = {
      start: findLengthAtX(padding),
      fillEnd: findFillEndLength(),
      end: findLengthAtX(svgWidth - padding),
    }
    setTrimRange(nextTrimRange)

    if (tickCount > 0) {
      const nextTickPoints = Array.from({ length: tickCount }, (_, index) => {
        const position = tickCount > 1 ? index / (tickCount - 1) : 0.5
        const targetX = minX + position * (maxX - minX)
        const sampleLength = findLengthAtX(targetX)
        const point = path.getPointAtLength(sampleLength)

        return {
          filled: sampleLength <= nextTrimRange.fillEnd,
          x: point.x,
          y: point.y,
        }
      })

      setTickPoints(nextTickPoints)
      return
    }

    setTickPoints([])
  }, [maxX, minX, pathData, tickCount, svgWidth])

  useEffect(() => {
    if (disabled) {
      activePointerIdRef.current = null
      setIsActive(false)
      setIsHoverInteractive(false)
    }
  }, [disabled])

  useEffect(() => {
    if (isActive || isAnimatingRef.current) return
    currentValueRef.current = currentValue
    visualValueRef.current = currentValue
    setVisualValue(currentValue)
  }, [currentValue, isActive, disabled])

  useEffect(() => {
    return () => {
      stopAnimation()
    }
  }, [])

  const updateValue = (nextValue: number, options?: { animate?: boolean; immediateVisual?: boolean }) => {
    if (disabled) {
      return
    }

    const snappedValue = snapValue(nextValue, min, max, step)
    currentValueRef.current = snappedValue

    if (options?.immediateVisual) {
      stopAnimation()
      visualValueRef.current = snappedValue
      setVisualValue(snappedValue)
    } else if (options?.animate) {
      animateVisualValue(snappedValue)
    }

    if (value === undefined) {
      setUncontrolledValue(snappedValue)
    }

    onChange?.(snappedValue)
  }

  useEffect(() => {
    if (!isActive) return

    const handlePointerMove = (event: PointerEvent) => {
      if (activePointerIdRef.current !== null && event.pointerId !== activePointerIdRef.current) {
        return
      }

      const nextValue = getValueFromPointer(event.clientX, event.clientY, false)

      if (nextValue === null) {
        return
      }

      updateValue(nextValue, { immediateVisual: true })
    }

    const handlePointerUp = (event: PointerEvent) => {
      if (activePointerIdRef.current !== null && event.pointerId !== activePointerIdRef.current) {
        return
      }

      const track = trackRef.current

      if (track && activePointerIdRef.current !== null && track.hasPointerCapture(activePointerIdRef.current)) {
        track.releasePointerCapture(activePointerIdRef.current)
      }

      activePointerIdRef.current = null
      setIsActive(false)
    }

    const handlePointerCancel = (event: PointerEvent) => {
      if (activePointerIdRef.current !== null && event.pointerId !== activePointerIdRef.current) {
        return
      }

      activePointerIdRef.current = null
      setIsActive(false)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerCancel)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerCancel)
    }
  }, [isActive, disabled])

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || disabled) {
      return
    }

    event.preventDefault()
    const nextValue = getValueFromPointer(event.clientX, event.clientY, true)

    if (nextValue === null) {
      return
    }

    activePointerIdRef.current = event.pointerId
    event.currentTarget.setPointerCapture(event.pointerId)
    updateValue(nextValue, { animate: true })
    setIsActive(true)
    focusNativeInput()
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || isActive) {
      return
    }

    setIsHoverInteractive(isPointerWithinHitZone(event.clientY))
  }

  const handlePointerLeave = () => {
    if (isActive) {
      return
    }

    setIsHoverInteractive(false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) {
      return
    }

    const stepDelta = getKeyboardStepDelta({
      key: event.key,
      min,
      max,
      step,
      shiftKey: event.shiftKey,
    })

    if (stepDelta !== null) {
      event.preventDefault()
      updateValue(
        currentValueRef.current + stepDelta,
        Math.abs(stepDelta) > step ? { animate: true } : undefined,
      )
      return
    }

    let nextValue = currentValueRef.current

    switch (event.key) {
      case 'Home':
        nextValue = min
        break
      case 'End':
        nextValue = max
        break
      default:
        return
    }

    event.preventDefault()
    updateValue(nextValue, { animate: true })
  }

  return (
    <div
      className={
        disabled
          ? 'slider slider--disabled'
          : isActive
            ? 'slider slider--active'
            : isHoverInteractive
              ? 'slider slider--hover-interactive'
              : 'slider'
      }
    >
      {label ? (
        <label className="slider__label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}

      <div className="slider__row">
        <div className="slider__control-wrap">
          <input
            {...inputProps}
            aria-label={label ? undefined : ariaLabelValue}
            className="slider__native"
            disabled={disabled}
            id={inputId}
            max={max}
            min={min}
            onChange={(event) => {
              updateValue(Number(event.target.value))
            }}
            onKeyDown={handleKeyDown}
            ref={inputRef}
            step={step}
            type="range"
            value={currentValue}
          />

          <div
            className="slider__control"
            onPointerDown={handlePointerDown}
            onPointerLeave={handlePointerLeave}
            onPointerMove={handlePointerMove}
            ref={trackRef}
          >
            <svg
              aria-hidden="true"
              className="slider__graphic slider__graphic--base"
              viewBox={`0 ${viewBoxTop} ${svgWidth} ${viewBoxHeight}`}
            >
              <path
                className="slider__path slider__path--base"
                d={pathData}
                ref={pathRef}
                strokeDasharray={pathLength > 0 ? `${visibleLength} ${pathLength}` : undefined}
                strokeDashoffset={pathLength > 0 ? -trimRange.start : undefined}
              />
              {currentValue > min ? (
                <path
                  className="slider__path slider__path--fill"
                  d={pathData}
                  strokeDasharray={pathLength > 0 ? `${filledLength} ${pathLength}` : undefined}
                  strokeDashoffset={pathLength > 0 ? -trimRange.start : undefined}
                />
              ) : null}
              {tickPoints.map((tickPoint, index) => (
                <circle
                  className={
                    tickPoint.filled
                      ? 'slider__tick-dot slider__tick-dot--fill'
                      : 'slider__tick-dot slider__tick-dot--base'
                  }
                  cx={tickPoint.x}
                  cy={tickPoint.y}
                  key={`${tickPoint.x}-${index}`}
                  r={2.125}
                />
              ))}
            </svg>
            <svg
              aria-hidden="true"
              className="slider__graphic slider__graphic--thumb"
              viewBox={`0 ${viewBoxTop} ${svgWidth} ${viewBoxHeight}`}
            >
              <circle className="slider__thumb-halo" cx={thumbX} cy={thumbY} r={8} />
              <circle className="slider__thumb-dot" cx={thumbX} cy={thumbY} r={thumbRadius} />
            </svg>
          </div>
          {tickLabels.length > 0 ? (
            <div aria-hidden="true" className="slider__tick-labels">
              {tickLabels.map((tickLabel, index) => {
                const tickPoint = tickPoints[index]

                if (!tickPoint) {
                  return null
                }

                return (
                  <span
                    className="slider__tick-label"
                    key={`${tickLabel}-${index}`}
                    style={{ left: `${(tickPoint.x / svgWidth) * 100}%` }}
                  >
                    {tickLabel}
                  </span>
                )
              })}
            </div>
          ) : null}
        </div>

        {showInput ? (
          <Input
            ariaLabel={ariaLabelValue ? `${ariaLabelValue} value` : undefined}
            className="slider__input"
            disabled={disabled}
            max={max}
            onChange={(nextValue) => {
              updateValue(Number(nextValue), { immediateVisual: true })
            }}
            onStepChange={(nextValue) => {
              updateValue(Number(nextValue), { animate: true })
            }}
            min={min}
            onCommit={(value) => updateValue(Number(value))}
            step={step}
            type="number"
            value={currentValue}
          />
        ) : null}
      </div>
    </div>
  )
}
