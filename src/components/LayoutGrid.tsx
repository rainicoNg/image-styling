import { useRef, type ChangeEvent, type HTMLAttributes } from "react";

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

  return (
    <div
      className={`cursor-pointer hover:bg-star-200 transition-colors duration-500 bg-star-100 flex flex-col item-center justify-center ${className}`}
      onClick={handleLayoutGridTap}
      style={style}
    >
      {content ? (
        <img src={content} className="w-full h-full object-cover" />
      ) : (
        <i className="hn hn-upload-alt-solid text-star-800 animate-pulse text-2xl md:text-4xl" />
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
