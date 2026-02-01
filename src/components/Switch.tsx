import type { ReactNode } from "react";
import { useState } from "react";

interface SwitchProps {
  name: string;
  children?: ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  trackColor?: string;
}

const Switch = ({
  name,
  children,
  checked = false,
  onChange,
  trackColor,
}: SwitchProps) => {
  const [isChecked, setIsChecked] = useState(checked);

  const handleChange = () => {
    const newState = !isChecked;
    setIsChecked(newState);
    onChange?.(newState);
  };

  return (
    <div className="flex items-center gap-2 md:gap-3">
      <div className="relative inline-block w-[36px] h-[16px]">
        <input
          name={name}
          id={name}
          type="checkbox"
          className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
          checked={isChecked}
          onChange={handleChange}
        />
        <span
          className={`absolute cursor-pointer inset-0 grid place-items-start items-center transition-all duration-150 ${
            isChecked ? "" : "bg-stone-500"
          }`}
          style={{
            backgroundColor: isChecked
              ? (trackColor ?? "var(--color-ocean-700)")
              : "",
          }}
        >
          <i
            className={`block w-4 h-3 bg-white shadow-none ${isChecked ? "translate-x-4.5" : "translate-x-0.5"} transition-transform duration-150`}
          />
        </span>
      </div>
      {children}
    </div>
  );
};

export default Switch;
