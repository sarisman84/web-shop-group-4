"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ImageLightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: string[];
  activeIndex: number;
  title: string;
}

export default function ImageLightbox({
  open,
  onOpenChange,
  images,
  activeIndex,
  title,
}: ImageLightboxProps) {
  const [index, setIndex] = useState(activeIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  if (images.length === 0) return null;

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setIndex(activeIndex);
      setIsZoomed(false);
    }

    onOpenChange(nextOpen);
  }

  function goTo(next: number) {
    setIndex((next + images.length) % images.length);
    setIsZoomed(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[100dvh] w-[calc(100%-1rem)] flex-col gap-3 border-0 bg-neutral-950/95 p-3 text-neutral-50 shadow-2xl ring-0 backdrop-blur-sm sm:max-w-5xl"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            goTo(index + 1);
          }

          if (event.key === "ArrowLeft") {
            event.preventDefault();
            goTo(index - 1);
          }
        }}
      >
        <DialogTitle className="sr-only">
          {title} — image {index + 1} of {images.length}
        </DialogTitle>

        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-medium">
            {title}
            <span className="ms-2 text-neutral-400">
              {index + 1} / {images.length}
            </span>
          </p>

          <div className="flex shrink-0 items-center gap-2">
            {images.length > 1 && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => goTo(index - 1)}
                  aria-label="Previous image"
                >
                  <ChevronLeft aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => goTo(index + 1)}
                  aria-label="Next image"
                >
                  <ChevronRight aria-hidden="true" />
                </Button>
              </>
            )}

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsZoomed((zoomed) => !zoomed)}
              aria-pressed={isZoomed}
            >
              {isZoomed ? (
                <ZoomOut aria-hidden="true" />
              ) : (
                <ZoomIn aria-hidden="true" />
              )}
              {isZoomed ? "Reset zoom" : "Zoom"}
            </Button>
          </div>
        </div>

        <div
          className={cn(
            "flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg bg-neutral-900",
            isZoomed && "overflow-auto",
          )}
        >
          <Image
            key={images[index]}
            src={images[index]}
            alt={`${title} — view ${index + 1}`}
            width={isZoomed ? 1600 : 1200}
            height={isZoomed ? 1600 : 1200}
            sizes="(max-width: 640px) 100vw, 1024px"
            priority
            className={cn(
              "h-full w-full object-contain motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200",
              isZoomed && "h-auto w-[160%] max-w-none shrink-0",
            )}
          />
        </div>

        {images.length > 1 && (
          <ul
            aria-label={`${title} image thumbnails`}
            className="flex shrink-0 flex-wrap justify-center gap-2"
          >
            {images.map((image, thumbIndex) => (
              <li key={`${image}-${thumbIndex}`}>
                <Button
                  type="button"
                  variant="ghost"
                  aria-pressed={thumbIndex === index}
                  aria-label={`Show image ${thumbIndex + 1} of ${images.length}`}
                  onClick={() => goTo(thumbIndex)}
                  className={cn(
                    "h-14 w-14 rounded-md p-1",
                    thumbIndex === index &&
                      "bg-neutral-100 ring-2 ring-neutral-50",
                  )}
                >
                  <Image
                    src={image}
                    alt=""
                    width={48}
                    height={48}
                    loading="lazy"
                    className="h-full w-full object-contain"
                  />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
