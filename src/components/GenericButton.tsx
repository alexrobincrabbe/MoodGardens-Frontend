import type React from "react";

type GenericButtonProps = {
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children?: React.ReactNode;
  disabled?: boolean;
};

export function GenericButton({
  className = "",
  onClick = undefined,
  children = null,
  disabled = false,
}: GenericButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${className} bg-peach-cream hover:bg-beige-cream rounded-lg border-2 p-1 px-2 font-extrabold hover:border-3 disabled:opacity-60`}
    >
      {children}
    </button>
  );
}
