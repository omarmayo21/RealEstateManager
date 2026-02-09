import * as React from "react";

type NumberInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function NumberInput(props: NumberInputProps) {
  return (
    <input
      type="number"
      onWheel={(e) => e.currentTarget.blur()}
      {...props}
    />
  );
}
