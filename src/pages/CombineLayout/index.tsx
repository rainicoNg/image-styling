import { HiDocumentDownload } from "react-icons/hi";

import ActionButton from "@/components/ActionButton";
import GridLayoutButton from "@/components/GridLayoutButton";
import LayoutGrid from "@/components/LayoutGrid";
import { getAspectRatio, getGridCols } from "@/utils/helper";
import { type ChangeEvent, useMemo, useState } from "react";
import { gridLayoutOptions } from "./constants";

const CombineLayout = () => {
  const [finalImageSize] = useState<{
    width: number;
    height: number;
  }>({
    width: 2268,
    height: 4032,
  });
  const [layout, setLayout] = useState<{
    row: number;
    col: number;
    aspectRatioClass: string;
  }>(gridLayoutOptions[0]);
  const [selectedImgs, setSelectedImgs] = useState<string[][]>(
    Array.from({ length: layout.row }, () => Array(layout.col).fill(""))
  );

  const handleImageUpload =
    (row: number, col: number) => (event: ChangeEvent<HTMLInputElement>) => {
      const img = event.target.files?.[0];
      if (img && img.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImgs = [...selectedImgs];
          newImgs[row][col] = e.target?.result as string;
          setSelectedImgs(newImgs);
        };
        reader.readAsDataURL(img);
      }
    };

  const handleDownloadImg = async (
    width = finalImageSize.width,
    height = finalImageSize.height
  ) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);

    const loadImg = (src: string): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    const cropAndDrawImage = (
      img: HTMLImageElement,
      x: number,
      y: number,
      targetWidth: number,
      targetHeight: number
    ) => {
      const targetAspectRatio = targetWidth / targetHeight;
      const srcAspectRatio = img.width / img.height;

      let srcX = 0,
        srcY = 0,
        srcHeight = img.height,
        srcWidth = img.width;

      if (srcAspectRatio > targetAspectRatio) {
        srcWidth = img.height * targetAspectRatio;
        srcX = (img.width - srcWidth) / 2;
      } else {
        srcHeight = img.width / targetAspectRatio;
        srcY = (img.height - srcHeight) / 2;
      }

      ctx.drawImage(
        img,
        srcX,
        srcY,
        srcWidth,
        srcHeight,
        x,
        y,
        targetWidth,
        targetHeight
      );
    };

    try {
      for (let row = 0; row < layout.row; row++) {
        for (let col = 0; col < layout.col; col++) {
          const imgSrc = selectedImgs[row][col];
          if (imgSrc) {
            await loadImg(imgSrc).then((img) => {
              cropAndDrawImage(
                img,
                (width / layout.col) * col,
                (height / layout.row) * row,
                width / layout.col,
                height / layout.row
              );
            });
          }
        }
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `styled-img-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, "image/png");
    } catch (error) {
      console.error("logs err", error);
    }
  };

  const LayoutGridBox = () => {
    const gridStyle = `grid ${getGridCols(
      layout.col
    )} gap-px aspect-${getAspectRatio(
      finalImageSize.width,
      finalImageSize.height
    )} portrait:w-4/5 landscape:h-4/5`;
    return (
      <div className={gridStyle}>
        {Array.from({ length: layout.row }).map((_, row) =>
          Array.from({ length: layout.col }).map((_, col) => (
            <LayoutGrid
              key={`${row}-${col}`}
              position={{ row, col }}
              content={selectedImgs[row][col]}
              onUpload={handleImageUpload(row, col)}
              className={layout.aspectRatioClass}
            />
          ))
        )}
      </div>
    );
  };

  const GridLayoutPanel = useMemo(
    () => (
      <div className="flex flex-col h-full">
        <div className="landscape:text-xs">Layout Template</div>
        <div className="flex portrait:flex-row portrait:overflow-x-auto landscape:flex-col landscape:overflow-y-auto landscape:h-full landscape:gap-4 portrait:gap-8 items-end">
          {gridLayoutOptions.map((opt) => (
            <GridLayoutButton
              key={`${opt.row}*${opt.col}`}
              row={opt.row}
              col={opt.col}
              onClickCallback={() => {
                setLayout(opt);
                setSelectedImgs(
                  Array.from({ length: opt.row }, () => Array(opt.col).fill(""))
                );
              }}
              active={layout.row === opt.row && layout.col === opt.col}
            />
          ))}
        </div>
      </div>
    ),
    [gridLayoutOptions, setLayout, setSelectedImgs, layout.row, layout.col]
  );

  return (
    <div className="w-full h-full">
      <div className="h-full flex portrait:flex-col landscape:flex-row items-center justify-between">
        <div />
        <div className="flex flex-col gap-4 items-center justify-center portrait:w-full landscape:h-full portrait:mb-4">
          <LayoutGridBox />

          <ActionButton
            disabled={!selectedImgs.flat().some((img) => img)}
            onClick={async () => {
              await handleDownloadImg();
            }}
            label="Download"
            startAddon={<HiDocumentDownload />}
          />
        </div>
        {GridLayoutPanel}
      </div>
    </div>
  );
};

export default CombineLayout;
