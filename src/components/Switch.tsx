import type { ComponentPropsWithoutRef } from 'react'
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createContourPath } from './contourPath'

type NativeInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  | 'checked'
  | 'defaultChecked'
  | 'disabled'
  | 'id'
  | 'onBlur'
  | 'onChange'
  | 'onFocus'
  | 'role'
  | 'type'
>

type SwitchProps = {
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  label?: string
  ariaLabel?: string
  onChange?: (checked: boolean) => void
  inputProps?: NativeInputProps
}

const easeOutCubic = (progress: number) => 1 - (1 - progress) ** 3

export function Switch({
  checked,
  defaultChecked = false,
  disabled = false,
  label,
  ariaLabel,
  onChange,
  inputProps,
}: SwitchProps) {
  const ariaLabelValue = inputProps?.['aria-label'] ?? ariaLabel ?? label

  const animationFrameRef = useRef<number | null>(null)
  const isAnimatingRef = useRef(false)
  const pathRef = useRef<SVGPathElement | null>(null)
  const inputId = useId()
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked)
  const isChecked = checked === undefined ? uncontrolledChecked : checked
  const [visualProgress, setVisualProgress] = useState(isChecked ? 1 : 0)
  const [isFocused, setIsFocused] = useState(false)
  const [pathLength, setPathLength] = useState(0)
  const [trimRange, setTrimRange] = useState({ start: 0, end: 0 })

  const svgWidth = 58
  const svgHeight = 56
  const centerY = svgHeight / 2
  const viewBoxTop = centerY - 22
  const viewBoxHeight = 28
  const padding = 6
  const crestHalfWidth = 32
  const crestHeight = 17
  const thumbRadius = 7
  const thumbY = centerY
  const overshoot = 56
  const minX = padding
  const maxX = svgWidth - padding
  const thumbX = minX + visualProgress * (maxX - minX)
  const pathData = createContourPath({
    width: svgWidth,
    padding,
    overshoot,
    centerY,
    crestHalfWidth,
    crestHeight,
    thumbX,
  })
  const visibleLength = Math.max(trimRange.end - trimRange.start, 0)

  const stopAnimation = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    isAnimatingRef.current = false
  }

  const animateProgress = (nextProgress: number) => {
    if (disabled) {
      setVisualProgress(nextProgress)
      return
    }

    stopAnimation()

    const startValue = visualProgress
    if (Math.abs(nextProgress - startValue) < 0.001) {
      setVisualProgress(nextProgress)
      return
    }

    isAnimatingRef.current = true
    const startedAt = performance.now()
    const duration = 220

    const stepAnimation = (timestamp: number) => {
      const progress = Math.min((timestamp - startedAt) / duration, 1)
      const easedProgress = easeOutCubic(progress)
      setVisualProgress(startValue + (nextProgress - startValue) * easedProgress)

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(stepAnimation)
        return
      }

      isAnimatingRef.current = false
      animationFrameRef.current = null
      setVisualProgress(nextProgress)
    }

    animationFrameRef.current = requestAnimationFrame(stepAnimation)
  }

  useEffect(() => {
    if (isAnimatingRef.current) return
    setVisualProgress(isChecked ? 1 : 0)
  }, [isChecked])

  useEffect(() => {
    return () => {
      stopAnimation()
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

    setPathLength(totalLength)
    setTrimRange({
      start: findLengthAtX(padding),
      end: findLengthAtX(svgWidth - padding),
    })
  }, [pathData, padding, svgWidth])

  const updateChecked = (nextChecked: boolean) => {
    if (disabled) return

    animateProgress(nextChecked ? 1 : 0)

    if (checked === undefined) {
      setUncontrolledChecked(nextChecked)
    }

    onChange?.(nextChecked)
  }

  return (
    <div
      className={
        disabled ? 'toggle toggle--disabled' : isFocused ? 'toggle toggle--focused' : 'toggle'
      }
    >
      {label ? (
        <label
          className="toggle__label"
          htmlFor={inputId}
        >
          {label}
        </label>
      ) : null}

      <div className="toggle__control-wrap">
        <input
          {...inputProps}
          aria-label={label ? undefined : ariaLabelValue}
          checked={isChecked}
          className="toggle__input"
          disabled={disabled}
          id={inputId}
          onBlur={() => {
            setIsFocused(false)
          }}
          onChange={(event) => {
            updateChecked(event.target.checked)
          }}
          onFocus={() => {
            setIsFocused(true)
          }}
          role="switch"
          type="checkbox"
        />
        <label
          aria-hidden="true"
          className={isChecked ? 'toggle__control toggle__control--checked' : 'toggle__control'}
          htmlFor={inputId}
        >
          <svg
            className="toggle__graphic"
            viewBox={`0 ${viewBoxTop} ${svgWidth} ${viewBoxHeight}`}
          >
            <path
              ref={pathRef}
              className={isChecked ? 'toggle__path toggle__path--on' : 'toggle__path toggle__path--off'}
              d={pathData}
              pathLength={pathLength || undefined}
              style={
                pathLength > 0
                  ? {
                      strokeDasharray: `${visibleLength} ${pathLength}`,
                      strokeDashoffset: `${-trimRange.start}`,
                    }
                  : undefined
              }
            />
            <circle className="toggle__thumb-halo" cx={thumbX} cy={thumbY} r={8} />
            <circle className="toggle__thumb" cx={thumbX} cy={thumbY} r={thumbRadius} />
          </svg>
        </label>
      </div>
    </div>
  )
}
