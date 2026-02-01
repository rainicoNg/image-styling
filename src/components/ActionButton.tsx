import type { JSX } from "react";

interface ActionButtonProps {
  onClick: () => void;
  label: string;
  disabled?: boolean;
  startAddon?: JSX.Element;
  variant?: "secondary" | "primary";
  className?: string;
}

const buttonStyle = {
  secondary:
    "bg-transparent text-ocean-700 border-2 border-ocean-700 hover:not-disabled:bg-star-200",
  primary:
    "bg-star-300 text-star-700 border-2 border-star-800 hover:not-disabled:bg-star-200",
};

const ActionButton = ({
  onClick,
  label,
  disabled,
  startAddon,
  variant = "primary",
  className,
}: ActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${buttonStyle[variant]} disabled:bg-stone-200 disabled:border-stone-500 disabled:text-stone-500 flex flex-row gap-1 items-center justify-center ${className ?? ""}`}
    >
      {startAddon && <span>{startAddon}</span>}
      {label}
    </button>
  );
};

export default ActionButton;
