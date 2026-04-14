import * as React from 'react';
import { useFormContext, useFormState } from 'react-hook-form';
import type { FieldPath, FieldValues } from 'react-hook-form';

export interface FormFieldContextValue<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
    name: TName;
}

export const FormFieldContext = React.createContext<FormFieldContextValue | undefined>(undefined);

export interface FormItemContextValue {
    id: string;
}

export const FormItemContext = React.createContext<FormItemContextValue | undefined>(undefined);

export const useFormField = () => {
    const fieldContext = React.use(FormFieldContext);
    const itemContext = React.use(FormItemContext);

    if (!fieldContext) {
        throw new Error('useFormField should be used within <FormField>');
    }

    const { getFieldState } = useFormContext();
    const formState = useFormState({ name: fieldContext.name });
    const fieldState = getFieldState(fieldContext.name, formState);

    const id = itemContext?.id ?? '';

    return {
        id,
        name: fieldContext.name,
        formItemId: `${id}-form-item`,
        formDescriptionId: `${id}-form-item-description`,
        formMessageId: `${id}-form-item-message`,
        ...fieldState,
    };
};
