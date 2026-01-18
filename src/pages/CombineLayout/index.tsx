import { HiDocumentDownload } from "react-icons/hi";
import { MdOutlineDelete } from "react-icons/md";

import ActionButton from "@/components/ActionButton";
import GridLayoutButton from "@/components/GridLayoutButton";
import LayoutGrid from "@/components/LayoutGrid";
import { getAspectRatio, getGridCols } from "@/utils/helper";
import { type ChangeEvent, useCallback, useMemo, useState } from "react";
import { gridLayoutOptions } from "./constants";
import Switch from "@/components/Switch";

const CombineLayout = () => {
  const [borderEnabled, setBorderEnabled] = useState(true);
  const [borderWidthOption, setBorderWidthOption] = useState(0); // 0: thin (20px), 1: medium (30px), 2: thick (40px)
  const borderWidths = [20, 30, 40];
  const borderWidth = borderWidths[borderWidthOption];
  const [borderColor, setBorderColor] = useState("#475569");
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

  const handleResetSelectedImgs = useCallback(
    (row?: number, col?: number) => {
      setSelectedImgs(
        Array.from({ length: row ?? layout.row }, () =>
          Array(col ?? layout.col).fill("")
        )
      );
    },
    [layout.row, layout.col]
  );

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

      // Draw borders if enabled
      if (borderEnabled) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth;

        const cellWidth = width / layout.col;
        const cellHeight = height / layout.row;

        // Draw vertical lines (borders between columns)
        for (let col = 1; col < layout.col; col++) {
          const x = cellWidth * col;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }

        // Draw horizontal lines (borders between rows)
        for (let row = 1; row < layout.row; row++) {
          const y = cellHeight * row;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Draw outer border
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(
          borderWidth / 2,
          borderWidth / 2,
          width - borderWidth,
          height - borderWidth
        );
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
    const gridStyle = `grid ${getGridCols(layout.col)} aspect-${getAspectRatio(
      finalImageSize.width,
      finalImageSize.height
    )} h-full w-full`;

    return (
      <div className="portrait:w-4/5 landscape:h-4/5">
        <div className={gridStyle}>
          {Array.from({ length: layout.row }).map((_, row) =>
            Array.from({ length: layout.col }).map((_, col) => {
              const width = !borderEnabled
                ? {
                    top: row === 0 ? 1 : 0.5,
                    right: col === layout.col - 1 ? 1 : 0.5,
                    bottom: row === layout.row - 1 ? 1 : 0.5,
                    left: col === 0 ? 1 : 0.5,
                  }
                : {
                    top: (row === 0 ? borderWidth : borderWidth / 2) / 10,
                    right:
                      (col === layout.col - 1 ? borderWidth : borderWidth / 2) /
                      10,
                    bottom:
                      (row === layout.row - 1 ? borderWidth : borderWidth / 2) /
                      10,
                    left: (col === 0 ? borderWidth : borderWidth / 2) / 10,
                  };

              return (
                <LayoutGrid
                  key={`${row}-${col}`}
                  position={{ row, col }}
                  content={selectedImgs[row][col]}
                  onUpload={handleImageUpload(row, col)}
                  className={`${layout.aspectRatioClass}`}
                  style={{
                    borderTop: width?.top,
                    borderRight: width?.right,
                    borderBottom: width?.bottom,
                    borderLeft: width?.left,
                    borderStyle: borderEnabled ? "solid" : "dashed",
                    borderColor,
                  }}
                />
              );
            })
          )}
        </div>
      </div>
    );
  };

  const GridLayoutPanel = useMemo(
    () => (
      <div className="flex flex-col h-full landscape:items-center gap-2">
        <div className="landscape:text-xs">Layout Template</div>
        <div className="flex portrait:flex-row portrait:overflow-x-auto landscape:flex-col landscape:overflow-y-auto landscape:h-full landscape:w-full landscape:items-center landscape:gap-4 portrait:gap-8 items-end">
          {gridLayoutOptions.map((opt) => (
            <GridLayoutButton
              key={`${opt.row}*${opt.col}`}
              row={opt.row}
              col={opt.col}
              onClickCallback={() => {
                setLayout(opt);
                handleResetSelectedImgs(opt.row, opt.col);
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

          <div className="flex gap-2 items-center">
            <div>Border</div>
            <Switch
              name="border-toggle"
              checked={borderEnabled}
              onChange={() => {
                setBorderEnabled(!borderEnabled);
              }}
            >
              <div className="flex flex-row gap-4 items-center">
                <div className="flex flex-col gap-2">
                  <input
                    type="color"
                    id="colorPicker"
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    className="cursor-pointer w-[24px] h-[24px] rounded-full border-0 disabled:opacity-50"
                    disabled={!borderEnabled}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  value={borderWidthOption}
                  disabled={!borderEnabled}
                  onChange={(e) =>
                    setBorderWidthOption(parseInt(e.target.value))
                  }
                  className="cursor-pointer w-24"
                  style={{
                    accentColor: borderColor,
                  }}
                />
              </div>
            </Switch>
          </div>

          <div className="flex flex-row flex-0 gap-4 items-center justify-between portrait:w-4/5 landscape:h-4/5">
            <ActionButton
              variant="negative"
              disabled={!selectedImgs.flat().some((img) => img)}
              onClick={() => {
                handleResetSelectedImgs();
              }}
              label="Reset"
              startAddon={<MdOutlineDelete />}
            />
            <ActionButton
              disabled={!selectedImgs.flat().some((img) => img)}
              onClick={async () => {
                await handleDownloadImg();
              }}
              label="Download"
              startAddon={<HiDocumentDownload />}
            />
          </div>
        </div>
        {GridLayoutPanel}
      </div>
    </div>
  );
};

export default CombineLayout;
