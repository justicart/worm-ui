import type { ComponentPropsWithoutRef, KeyboardEvent } from 'react'
import { useEffect, useState } from 'react'
import { getKeyboardStepDelta } from './stepControls'

type NativeInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  | 'className'
  | 'disabled'
  | 'max'
  | 'min'
  | 'onBlur'
  | 'onChange'
  | 'onKeyDown'
  | 'step'
  | 'type'
  | 'value'
>

type BaseInputProps = {
  ariaLabel?: string
  className?: string
  disabled?: boolean
  inputProps?: NativeInputProps
}

type TextInputProps = BaseInputProps & {
  value: string
  type?: 'text'
  min?: never
  max?: never
  step?: never
  onChange?: (value: string) => void
  onStepChange?: never
  onCommit: (value: string) => void
}

type NumberInputProps = BaseInputProps & {
  value: number
  type: 'number'
  min?: number
  max?: number
  step?: number
  onChange?: (value: number) => void
  onStepChange?: (value: number) => void
  onCommit: (value: number) => void
}

type InputProps = TextInputProps | NumberInputProps

const clamp = (value: number, min?: number, max?: number) => {
  let nextValue = value

  if (min !== undefined) {
    nextValue = Math.max(min, nextValue)
  }

  if (max !== undefined) {
    nextValue = Math.min(max, nextValue)
  }

  return nextValue
}

export function Input({
  value,
  ariaLabel,
  className,
  type = 'text',
  disabled = false,
  min,
  max,
  step,
  onChange,
  onStepChange,
  onCommit,
  inputProps,
}: InputProps) {
  const ariaLabelValue = inputProps?.['aria-label'] ?? ariaLabel

  const [inputValue, setInputValue] = useState(() => `${value}`)

  useEffect(() => {
    setInputValue(`${value}`)
  }, [value])

  const commitValue = () => {
    if (disabled) {
      setInputValue(`${value}`)
      return
    }

    if (type === 'number') {
      const parsedValue = Number(inputValue)

      if (Number.isNaN(parsedValue)) {
        setInputValue(`${value}`)
        return
      }

      onCommit(clamp(parsedValue, min, max))
      return
    }

    onCommit(inputValue)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (type === 'number') {
      const stepDelta = getKeyboardStepDelta({
        key: event.key,
        min: min ?? Number.NEGATIVE_INFINITY,
        max: max ?? Number.POSITIVE_INFINITY,
        step: step ?? 1,
        shiftKey: event.shiftKey,
      })

      if (stepDelta !== null) {
        event.preventDefault()

        const parsedValue = Number(inputValue)
        const baseValue = Number.isNaN(parsedValue) ? Number(value) : parsedValue
        const nextValue = clamp(baseValue + stepDelta, min, max)

        setInputValue(`${nextValue}`)
        if (onStepChange) {
          onStepChange(nextValue)
        } else {
          onChange?.(nextValue)
        }
        return
      }
    }

    if (event.key === 'Enter') {
      commitValue()
      event.currentTarget.blur()
    }

    if (event.key === 'Escape') {
      setInputValue(`${value}`)
      event.currentTarget.blur()
    }
  }

  return (
    <input
      {...inputProps}
      aria-label={ariaLabelValue}
      className={className}
      disabled={disabled}
      inputMode={type === 'number' ? 'numeric' : undefined}
      max={max}
      min={min}
      onBlur={commitValue}
      onChange={(event) => {
        const nextValue = event.target.value
        setInputValue(nextValue)

        if (!onChange) {
          return
        }

        if (type === 'number') {
          const parsedValue = Number(nextValue)

          if (Number.isNaN(parsedValue)) {
            return
          }

          onChange(clamp(parsedValue, min, max))
          return
        }

        onChange(nextValue)
      }}
      onKeyDown={handleKeyDown}
      step={step}
      type={type}
      value={inputValue}
    />
  )
}
