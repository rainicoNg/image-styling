import ActionButton from "@/components/ActionButton";
import GridLayoutButton from "@/components/GridLayoutButton";
import LayoutGrid from "@/components/LayoutGrid";
import PreviewDialog from "@/components/PreviewDialog";
import { getAspectRatio, getGridCols } from "@/utils/helper";
import { type ChangeEvent, useCallback, useMemo, useState } from "react";
import { gridLayoutOptions } from "./constants";
import Panel, { FeatureType } from "@/components/Panel";

const borderWidthOptions = [20, 30, 40] as const;

interface Features {
  date: {
    enabled: boolean;
    value: string;
  };
  border: {
    enabled: boolean;
    width?: number;
    color?: string;
  };
}
const CombineLayout = () => {
  const today = new Date();

  const [featureEnabled, setFeatureEnabled] = useState<Features>({
    date: {
      enabled: true,
      value: `${today.getFullYear().toString()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`,
    },
    border: {
      enabled: false,
      color: "#2a548f",
      width: borderWidthOptions[0],
    },
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | undefined>(
    undefined,
  );

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
    Array.from({ length: layout.row }, () => Array(layout.col).fill("")),
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
          Array(col ?? layout.col).fill(""),
        ),
      );
    },
    [layout.row, layout.col],
  );

  async function renderCanvas(width: number, height: number) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    canvas.width = width;
    canvas.height = height;

    // Fill background black
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);

    const loadImg = (src: string): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    const cropAndDrawImage = (
      img: HTMLImageElement,
      x: number,
      y: number,
      targetWidth: number,
      targetHeight: number,
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
        targetHeight,
      );
    };

    const shadeHex = (hex: string, percent: number) => {
      const h = hex.replace("#", "");
      const num = parseInt(h, 16);
      let r = (num >> 16) + percent;
      let g = ((num >> 8) & 0x00ff) + percent;
      let b = (num & 0x0000ff) + percent;
      r = Math.max(Math.min(255, r), 0);
      g = Math.max(Math.min(255, g), 0);
      b = Math.max(Math.min(255, b), 0);
      return `rgb(${r},${g},${b})`;
    };

    const invertHex = (hex: string, percent = 0) => {
      const h = hex.replace("#", "");
      const num = parseInt(h, 16);
      let r = 255 - (num >> 16) + percent;
      let g = 255 - ((num >> 8) & 0x00ff) + percent;
      let b = 255 - (num & 0x0000ff) + percent;
      r = Math.max(Math.min(255, r), 0);
      g = Math.max(Math.min(255, g), 0);
      b = Math.max(Math.min(255, b), 0);
      return `rgb(${r},${g},${b})`;
    };

    const drawPixelText = (text: string, x: number, y: number) => {
      ctx.font = `180px "ByteBounce", sans-serif`;
      ctx.fillStyle = featureEnabled.border.color || "#dbb570";
      ctx.shadowColor = featureEnabled.border.color
        ? invertHex(featureEnabled.border.color)
        : "#b08b46";
      ctx.shadowOffsetX = 8;
      ctx.shadowOffsetY = 6;
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      ctx.fillText(text, x, y);
    };

    try {
      for (let row = 0; row < layout.row; row++) {
        for (let col = 0; col < layout.col; col++) {
          const imgSrc = selectedImgs[row][col];
          if (imgSrc) {
            // eslint-disable-next-line no-await-in-loop
            await loadImg(imgSrc).then((img) => {
              cropAndDrawImage(
                img,
                (width / layout.col) * col,
                (height / layout.row) * row,
                width / layout.col,
                height / layout.row,
              );
            });
          }
        }
      }

      if (featureEnabled.border.enabled) {
        const cellWidth = width / layout.col;
        const cellHeight = height / layout.row;

        const fill = (
          colStart: number,
          colEnd: number,
          rowStart: number,
          rowEnd: number,
        ) => {
          for (let i = colStart; i < colEnd; i += 10) {
            for (let j = rowStart; j < rowEnd; j += 10) {
              const shade = Math.floor(Math.random() * 100) - 50;
              ctx.fillStyle = shadeHex(featureEnabled.border.color!, shade);
              ctx.fillRect(i, j, 10, 10);
            }
          }
        };

        // draw vertical inner borders as squares
        for (let c = 1; c < layout.col; c++) {
          const x = Math.round(
            cellWidth * c - featureEnabled.border.width! / 2,
          );
          fill(x, x + featureEnabled.border.width!, 0, height);
        }

        // draw horizontal inner borders as tiled squares
        for (let r = 1; r < layout.row; r++) {
          const y = Math.round(
            cellHeight * r - featureEnabled.border.width! / 2,
          );
          fill(0, width, y, y + featureEnabled.border.width!);
        }

        // outer border: top/bottom/left/right tiled
        fill(0, width, 0, featureEnabled.border.width!);
        fill(0, width, height - featureEnabled.border.width!, height);
        fill(0, featureEnabled.border.width!, 0, height);
        fill(width - featureEnabled.border.width!, width, 0, height);
      }

      if (featureEnabled.date.enabled) {
        const padding = 24;
        const dateXPosition =
          width -
          (featureEnabled.border.enabled ? featureEnabled.border.width! : 0) -
          padding;
        const dateYPosition =
          height -
          (featureEnabled.border.enabled ? featureEnabled.border.width! : 0) -
          padding;
        drawPixelText(featureEnabled.date.value, dateXPosition, dateYPosition);
      }

      return canvas;
    } catch (error) {
      return canvas;
    }
  }

  const handlePreview = async () => {
    const canvas = await renderCanvas(
      finalImageSize.width,
      finalImageSize.height,
    );
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    setPreviewDataUrl(url);
    setPreviewOpen(true);
  };

  const handleDownloadImg = async (
    width = finalImageSize.width,
    height = finalImageSize.height,
  ) => {
    // Use renderCanvas to draw and then download
    const canvas = await renderCanvas(width, height);
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `MYlife4cuts-${featureEnabled.date.value.replace(/-/g, "")}-${today.getHours().toString().padStart(2, "0")}${today.getMinutes().toString().padStart(2, "0")}${today.getSeconds().toString().padStart(2, "0")}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }, "image/png");
  };

  const handleDialogDownload = async () => {
    if (previewDataUrl) {
      const link = document.createElement("a");
      link.href = previewDataUrl;
      link.download = `MYlife4cuts-${featureEnabled.date.value.replace(/-/g, "")}-${today.getHours().toString().padStart(2, "0")}${today.getMinutes().toString().padStart(2, "0")}${today.getSeconds().toString().padStart(2, "0")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // keep previewDataUrl intact; close after a short delay to allow mobile download to complete
      setTimeout(() => setPreviewOpen(false), 300);
    } else {
      await handleDownloadImg();
      setPreviewOpen(false);
    }
  };

  const LayoutGridBox = () => {
    const gridStyle = `grid ${getGridCols(layout.col)} aspect-${getAspectRatio(
      finalImageSize.width,
      finalImageSize.height,
    )} h-full w-full`;

    return (
      <div className="portrait:w-4/5 landscape:h-4/5">
        <div className={gridStyle}>
          {Array.from({ length: layout.row }).map((_, row) =>
            Array.from({ length: layout.col }).map((_, col) => {
              // Use fixed border width regardless of border state to maintain consistent grid height
              const borderWidthPx = featureEnabled.border.enabled
                ? featureEnabled.border.width! / 10
                : 2;

              return (
                <div className={layout.aspectRatioClass}>
                  <LayoutGrid
                    key={`${row}-${col}`}
                    position={{ row, col }}
                    content={selectedImgs[row][col]}
                    onUpload={handleImageUpload(row, col)}
                    className="h-full"
                    style={{
                      borderTop: row === 0 ? borderWidthPx : borderWidthPx / 2,
                      borderRight:
                        col === layout.col - 1
                          ? borderWidthPx
                          : borderWidthPx / 2,
                      borderBottom:
                        row === layout.row - 1
                          ? borderWidthPx
                          : borderWidthPx / 2,
                      borderLeft: col === 0 ? borderWidthPx : borderWidthPx / 2,
                      borderStyle: featureEnabled.border.enabled
                        ? "solid"
                        : "dashed",
                      borderColor: featureEnabled.border.enabled
                        ? featureEnabled.border.color
                        : "#cbd5e1",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              );
            }),
          )}
        </div>
      </div>
    );
  };

  const GridLayoutPanel = useMemo(
    () => (
      <div className="flex flex-col h-full landscape:items-center gap-2">
        <div className="landscape:text-md">Layout</div>
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
    [gridLayoutOptions, setLayout, setSelectedImgs, layout.row, layout.col],
  );

  return (
    <div className="w-full h-full">
      <div className="h-full flex portrait:flex-col landscape:flex-row items-center justify-between">
        <div />
        <div className="flex flex-col gap-4 items-center justify-center portrait:w-full landscape:h-full portrait:mb-4">
          <LayoutGridBox />

          <Panel
            features={[
              {
                name: "date-toggle",
                type: FeatureType.SWITCH,
                label: "Date",
                value: featureEnabled.date.enabled,
                onChange: (v: boolean) =>
                  setFeatureEnabled({
                    ...featureEnabled,
                    date: {
                      ...featureEnabled.date,
                      enabled: v,
                    },
                  }),
                child: (
                  <input
                    type="date"
                    value={featureEnabled.date.value}
                    onChange={(e) =>
                      setFeatureEnabled({
                        ...featureEnabled,
                        date: {
                          ...featureEnabled.date,
                          value: e.target.value,
                        },
                      })
                    }
                    className="cursor-pointer disabled:opacity-50"
                    disabled={!featureEnabled.date.enabled}
                    style={{
                      color: featureEnabled.border.enabled
                        ? featureEnabled.border.color
                        : undefined,
                    }}
                  />
                ),
              },
              {
                name: "border-toggle",
                type: FeatureType.SWITCH,
                label: "Border",
                value: featureEnabled.border.enabled,
                onChange: (v: boolean) =>
                  setFeatureEnabled({
                    ...featureEnabled,
                    border: {
                      ...featureEnabled.border,
                      enabled: v,
                    },
                  }),
                child: (
                  <div className="flex flex-row gap-4 items-center">
                    <div className="flex flex-col gap-2">
                      <input
                        type="color"
                        id="colorPicker"
                        value={featureEnabled.border.color}
                        onChange={(e) =>
                          setFeatureEnabled({
                            ...featureEnabled,
                            border: {
                              ...featureEnabled.border,
                              color: e.target.value,
                            },
                          })
                        }
                        className="cursor-pointer w-[20px] h-[20px] disabled:opacity-50"
                        disabled={!featureEnabled.border.enabled}
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      value={borderWidthOptions.findIndex(
                        (opt) => opt === (featureEnabled.border.width ?? 20),
                      )}
                      disabled={!featureEnabled.border.enabled}
                      onChange={(e) =>
                        setFeatureEnabled({
                          ...featureEnabled,
                          border: {
                            ...featureEnabled.border,
                            width: borderWidthOptions[parseInt(e.target.value)],
                          },
                        })
                      }
                      className="cursor-pointer w-20 md:w-24"
                    />
                  </div>
                ),
              },
            ]}
          />

          <div className="flex flex-row flex-0 gap-4 items-center justify-between portrait:w-4/5 landscape:h-4/5 md:mx-0.5 w-full">
            <ActionButton
              variant="secondary"
              disabled={!selectedImgs.flat().some((img) => img)}
              onClick={() => {
                handleResetSelectedImgs();
              }}
              label="Reset"
              startAddon={<i className="hn hn-trash-alt block text-xs" />}
            />
            <ActionButton
              disabled={!selectedImgs.flat().some((img) => img)}
              onClick={async () => {
                await handlePreview();
              }}
              label="Preview"
              startAddon={<i className="hn hn-image block text-xs" />}
            />
          </div>
        </div>
        {GridLayoutPanel}
        <PreviewDialog
          open={previewOpen}
          imageDataUrl={previewDataUrl}
          onClose={() => setPreviewOpen(false)}
          onDownload={handleDialogDownload}
        />
      </div>
    </div>
  );
};

export default CombineLayout;
