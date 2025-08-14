"use client";

import Choices, { type Options as ChoiceOption } from "choices.js";
import {
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  forwardRef,
} from "react";

export type ChoiceProps = HTMLAttributes<HTMLInputElement> &
  HTMLAttributes<HTMLSelectElement> & {
    multiple?: boolean;
    className?: string;
    options?: Partial<ChoiceOption>;
    onChange?: (value: string | string[]) => void;
    value?: string | string[];
    children?: ReactNode; // ✅ FIXED HERE
    allowInput?: boolean;
  };

const ChoicesFormInput = forwardRef<
  HTMLInputElement | HTMLSelectElement,
  ChoiceProps
>(
  (
    {
      children,
      multiple,
      className,
      onChange,
      allowInput,
      options,
      value,
      ...props
    },
    ref
  ) => {
    const choicesRef = useRef<HTMLInputElement & HTMLSelectElement>(null);

    useImperativeHandle(ref, () => choicesRef.current as any, []);

    useEffect(() => {
      if (choicesRef.current) {
        const choices = new Choices(choicesRef.current, {
          ...options,
          placeholder: true,
          allowHTML: true,
          shouldSort: false,
        });

        choices.passedElement.element.addEventListener("change", (e: Event) => {
          if (!(e.target instanceof HTMLSelectElement)) return;

          if (onChange) {
            if (multiple) {
              const values = Array.from(e.target.selectedOptions).map(
                (opt) => opt.value
              );
              onChange(values);
            } else {
              onChange(e.target.value);
            }
          }
        });

        return () => {
          choices.destroy();
        };
      }
    }, [choicesRef]);

    return allowInput ? (
      <input
        ref={choicesRef}
        multiple={multiple}
        className={className}
        onChange={(e) => onChange?.(e.target.value)}
        value={typeof value === "string" ? value : ""}
        {...props}
      />
    ) : (
      <select
        ref={choicesRef}
        multiple={multiple}
        className={className}
        onChange={(e) => {
          if (onChange) {
            if (multiple) {
              const values = Array.from(e.target.selectedOptions).map(
                (opt) => opt.value
              );
              onChange(values);
            } else {
              onChange(e.target.value);
            }
          }
        }}
        value={value}
        {...props}
      >
        {children}
      </select>
    );
  }
);

export default ChoicesFormInput;
