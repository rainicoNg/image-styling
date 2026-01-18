import type { ReactNode } from "react";
import { useState } from "react";

interface SwitchProps {
  name: string;
  children?: ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

const Switch = ({ name, children, checked = false, onChange }: SwitchProps) => {
  const [isChecked, setIsChecked] = useState(checked);

  const handleChange = () => {
    const newState = !isChecked;
    setIsChecked(newState);
    onChange?.(newState);
  };

  return (
    <div className="flex flex-row items-center gap-2">
      <div className="relative inline-block w-[50px] h-[24px]">
        <input
          name={name}
          id={name}
          type="checkbox"
          className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
          checked={isChecked}
          onChange={handleChange}
        />
        <span
          className={`rounded-full absolute cursor-pointer inset-0 before:absolute before:top-[2px] before:left-[2px] before:h-[20px] before:w-[20px] before:bg-white before:start-1 before:bottom-px before:rounded-full before:transition-all transition-all ${
            isChecked ? "bg-star-500 before:translate-x-[26px]" : "bg-slate-600"
          }`}
        ></span>
      </div>
      {children}
    </div>
  );
};

export default Switch;
