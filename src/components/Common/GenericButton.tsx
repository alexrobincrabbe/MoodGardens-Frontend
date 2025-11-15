import type React from "react";

type GenericButtonProps = {
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children?: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit" | "reset" | undefined;
};

export function GenericButton({
  className = "",
  onClick = undefined,
  children = null,
  disabled = false,
  type = "button",
}: GenericButtonProps) {
  return (
    <div>
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`${className} bg-peach-cream hover:bg-beige-cream border-coral rounded-lg border-2 p-1 px-2 font-extrabold shadow-sm shadow-black hover:m-[-1px] hover:border-3 hover:shadow-md active:shadow-xs disabled:opacity-60`}
      >
        {children}
      </button>
    </div>
  );
}
