import * as React from "react";
import { Form, FormInputProps } from "semantic-ui-react";

type InputProps = {
    onChange?: (value: string) => void,
    onBlur?: (value: string) => void,
};
export const Input = (props: Omit<FormInputProps, "onChange" | "onBlur"> & InputProps) => (
    <Form.Input
        {...props}
        onChange={event => props.onChange?.(event.target.value as string)}
        onBlur={(event: React.FocusEvent<HTMLInputElement>) => props.onBlur?.(event.target.value as string)}
    />
);
