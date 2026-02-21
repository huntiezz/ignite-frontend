import { useCallback, useEffect } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { DownloadSimple, X } from '@phosphor-icons/react';

const ImageLightbox = ({ src, alt, open, onOpenChange }) => {
  const handleDownload = useCallback(
    (e) => {
      e.stopPropagation();
      const a = document.createElement('a');
      a.href = src;
      a.download = alt || 'image';
      a.click();
    },
    [src, alt]
  );

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onOpenChange]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-black/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          onClick={() => onOpenChange(false)}
        />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none"
          onClick={() => onOpenChange(false)}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogPrimitive.Title className="sr-only">
            {alt || 'Image preview'}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Full size preview of {alt || 'image'}
          </DialogPrimitive.Description>

          <div className="relative flex max-h-[90vh] max-w-[90vw] flex-col items-center gap-2">
            <img
              src={src}
              alt={alt}
              className="max-h-[85vh] max-w-[90vw] rounded object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div
              className="flex items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#00a8fc] hover:underline"
              >
                Open original
              </a>
              <button
                type="button"
                onClick={handleDownload}
                className="cursor-pointer text-[#b5bac1] transition-colors hover:text-white"
              >
                <DownloadSimple className="size-5" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 cursor-pointer rounded-full bg-black/50 p-2 text-white/70 transition-colors hover:text-white"
          >
            <X className="size-5" />
          </button>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default ImageLightbox;
