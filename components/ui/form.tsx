import * as React from "react";
import { useFormContext, Controller, ControllerRenderProps, ControllerFieldState, UseFormStateReturn, Control } from "react-hook-form";
import { ReactElement } from "react";

// Form wrapper for react-hook-form
export function Form({ children, ...props }: React.FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form {...props} className={"space-y-6 " + (props.className || "")}>{children}</form>
  );
}

// FormField: wraps Controller for react-hook-form
export function FormField({ 
  name, 
  control, 
  render 
}: { 
  name: string; 
  control: Control<any>; 
  render: (props: { 
    field: ControllerRenderProps<any, string>; 
    fieldState: ControllerFieldState; 
    formState: UseFormStateReturn<any>; 
  }) => ReactElement 
}) {
  return <Controller name={name} control={control} render={render} />;
}

// FormItem: container for a form field
export function FormItem({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

// FormLabel: label for a field
export function FormLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{children}</label>;
}

// FormControl: wraps input/select/etc
export function FormControl({ children }: { children: React.ReactNode }) {
  return <div className="mt-1">{children}</div>;
}

// FormMessage: error message
export function FormMessage({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return <p className="text-xs text-red-500 mt-1">{children}</p>;
} 