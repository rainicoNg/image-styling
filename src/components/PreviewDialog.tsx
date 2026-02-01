import ActionButton from "./ActionButton";

interface PreviewDialogProps {
  open: boolean;
  title?: string;
  imageDataUrl?: string;
  onClose: () => void;
  onDownload: () => void;
}

const PreviewDialog = ({
  open,
  title = "Preview",
  imageDataUrl,
  onClose,
  onDownload,
}: PreviewDialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 md:p-2 h-full">
      <div className="bg-ocean-50 border-4 border-star-700 max-w-[480px] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pl-2 border-b-2 bg-star-700 border-star-700">
          <div className="font-bold text-2xl">{title}</div>
          <button
            onClick={onClose}
            className="w-7 h-7 border-1 border-star-50 bg-ocean-600 text-white flex items-center justify-center hover:bg-ocean-500"
          >
            <i className="hn hn-times-solid block text-lg"></i>
          </button>
        </div>
        <div className="p-2 flex-1 overflow-auto flex items-center justify-center">
          {imageDataUrl ? (
            <img
              src={imageDataUrl}
              alt="preview"
              className="h-[70vh] object-contain"
            />
          ) : (
            <div className="w-full h-40 grid place-items-center">
              <i className="hn hn-spinner-solid animate-spin text-3xl"></i>
            </div>
          )}
        </div>
        <div className="p-2 flex-none">
          <ActionButton
            onClick={onDownload}
            label="Download"
            startAddon={
              <i className="hn hn-download-alt-solid block text-xs" />
            }
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default PreviewDialog;
