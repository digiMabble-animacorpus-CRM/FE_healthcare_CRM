import { type InputHTMLAttributes } from "react";
import {
  FormControl,
  FormGroup,
  FormLabel,
  type FormControlProps,
} from "react-bootstrap";
import {
  Controller,
  type FieldPath,
  type FieldValues,
  type PathValue,
} from "react-hook-form";

import type { FormInputProps } from "@/types/component-props";

const TextFormInput = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  containerClassName,
  control,
  id,
  label,
  noValidate,
  labelClassName,
  required,
  ...rest
}: FormInputProps<TFieldValues> &
  FormControlProps &
  InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <Controller<TFieldValues, TName>
      name={name as TName}
      // defaultValue={"" as PathValue<TFieldValues, TName>}
      control={control}
      render={({ field, fieldState }) => (
        <FormGroup className={containerClassName}>
          {label && (
            <FormLabel htmlFor={id ?? name} className={labelClassName}>
              {label}
              {required && <span className="text-danger"> *</span>}
            </FormLabel>
          )}

          <FormControl
            id={id ?? name}
            {...field}
            {...rest}
            isInvalid={!!fieldState.error}
          />

          {!noValidate && fieldState.error?.message && (
            <small className="text-danger">{fieldState.error.message}</small>
          )}
        </FormGroup>
      )}
    />
  );
};

export default TextFormInput;
