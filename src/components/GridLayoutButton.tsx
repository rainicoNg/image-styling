const GridLayoutButton = ({
  row,
  col,
  onClickCallback,
  active = false,
}: {
  row: number;
  col: number;
  onClickCallback?: () => void;
  active: boolean;
}) => {
  return (
    <div
      onClick={onClickCallback}
      className={`cursor-pointer p-1 hover:bg-ocean-200 ${
        active ? "bg-ocean-300" : ""
      }`}
    >
      <div
        className={`grid grid-cols-${col} gap-px h-[75px] aspect-9/16 bg-star-100`}
      >
        {Array.from({ length: row }).map((_, r) =>
          Array.from({ length: col }).map((_, c) => (
            <div
              key={`${r}-${c}`}
              className="flex items-center justify-center outline-ocean-700 outline-1 outline-solid p-1 text-xs"
            >
              {r * col + c + 1}
            </div>
          )),
        )}
      </div>
    </div>
  );
};

export default GridLayoutButton;
