import { useRef, type ChangeEvent, type HTMLAttributes } from "react";
import { BiSolidImageAdd } from "react-icons/bi";

interface LayoutGridProps extends HTMLAttributes<HTMLDivElement> {
  position: { row: number; col: number };
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  content?: string;
}
const LayoutGrid = ({
  onUpload,
  className,
  content,
  style,
}: LayoutGridProps) => {
  const fileInputRefs = useRef<HTMLInputElement | null>(null);

  const handleLayoutGridTap = () => {
    fileInputRefs.current?.click();
  };

  const outlineStyle = "";
  return (
    <div
      className={`cursor-pointer ${outlineStyle} hover:bg-stone-200 transition-colors duration-500 bg-stone-100 flex flex-col item-center justify-center ${className}`}
      onClick={handleLayoutGridTap}
      style={style}
    >
      {content ? (
        <img src={content} className="w-full h-full object-cover" />
      ) : (
        <BiSolidImageAdd className="w-full portrait:h-10 landscape:h-5 text-star-600 animate-pulse" />
      )}
      <input
        ref={(el) => {
          fileInputRefs.current = el;
        }}
        type="file"
        accept="image/*"
        onChange={onUpload}
        className="hidden"
      />
    </div>
  );
};

export default LayoutGrid;
