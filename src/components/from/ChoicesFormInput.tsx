'use client'
import Choices, { type Options as ChoiceOption } from 'choices.js'
import { type HTMLAttributes, type ReactElement, useEffect, useRef } from 'react'

export type ChoiceProps = HTMLAttributes<HTMLInputElement> &
  HTMLAttributes<HTMLSelectElement> & {
    multiple?: boolean
    className?: string
    options?: Partial<ChoiceOption>
    onChange?: (text: string) => void
  } & (
    | {
        allowInput?: false
        children: ReactElement[]
      }
    | { allowInput?: true }
  )

const ChoicesFormInput = ({ children, multiple, className, onChange, allowInput, options, ...props }: ChoiceProps) => {
  const choicesRef = useRef<HTMLInputElement & HTMLSelectElement>(null)

  useEffect(() => {
    if (choicesRef.current) {
      const choices = new Choices(choicesRef.current, {
        ...options,
        placeholder: true,
        allowHTML: true,
        shouldSort: false,
      })
      choices.passedElement.element.addEventListener('change', (e: Event) => {
        if (!(e.target instanceof HTMLSelectElement)) return
        if (onChange) {
          onChange(e.target.value)
        }
      })
    }
  }, [choicesRef])

  return allowInput ? (
    <input ref={choicesRef} multiple={multiple} className={className} {...props} />
  ) : (
    <select ref={choicesRef} multiple={multiple} className={className} {...props}>
      {children}
    </select>
  )
}

export default ChoicesFormInput
