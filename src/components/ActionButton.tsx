import type { JSX } from "react";

interface ActionButtonProps {
  onClick: () => void;
  label: string;
  disabled?: boolean;
  startAddon?: JSX.Element;
  variant?: "positive" | "negative" | "default";
  className?: string;
}

const buttonStyle = {
  positive: "bg-green-600 text-green-50 hover:bg-green-700",
  negative: "bg-red-600 text-red-50 hover:bg-red-700",
  default: "bg-star-600 text-star-50 hover:bg-star-700",
};

const ActionButton = ({
  onClick,
  label,
  disabled,
  startAddon,
  variant = "default",
  className,
}: ActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${buttonStyle[variant]} disabled:bg-stone-300 flex flex-row gap-1 items-center ${className}`}
    >
      {startAddon && <span>{startAddon}</span>}
      {label}
    </button>
  );
};

export default ActionButton;
