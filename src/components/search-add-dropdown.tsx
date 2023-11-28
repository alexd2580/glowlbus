import * as React from "react";
import { Form, FormDropdownProps } from "semantic-ui-react";

type SearchAddDropdownProps = {
    onAddItem: (value: string) => void,
    onChange?: (value: string) => void,
};
export const SearchAddDropdown = (props: Omit<FormDropdownProps, "onAddItem" | "onChange"> & SearchAddDropdownProps) => (
    <Form.Dropdown
        {...props}
        search
        selection
        allowAdditions
        onAddItem={(_, data) => props.onAddItem(data.value as string)}
        onChange={(_, data) => props.onChange?.(data.value as string)}
    />
);
