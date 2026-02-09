import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface NumberInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const NumberInput = React.forwardRef<
  HTMLInputElement,
  NumberInputProps
>(({ className, onWheel, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      type="number"
      className={cn(className)}
      onWheel={(e) => {
        e.currentTarget.blur();
        onWheel?.(e);
      }}
      {...props}
    />
  );
});

NumberInput.displayName = "NumberInput";
