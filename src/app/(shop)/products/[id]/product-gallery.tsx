"use client";

import { useState } from "react";
import Image from "next/image";
import { Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ImageLightbox from "./image-lightbox";

interface ProductGalleryProps {
  title: string;
  images: string[];
}

export default function ProductGallery({ title, images }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0] ?? "");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const activeImage = images.includes(selectedImage)
    ? selectedImage
    : (images[0] ?? "");
  const activeIndex = Math.max(images.indexOf(activeImage), 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          aria-label={`Expand ${title} image ${activeIndex + 1} of ${images.length}`}
          className={cn(
            "group relative flex aspect-4/3 w-full cursor-zoom-in items-center justify-center overflow-hidden rounded-xl bg-muted sm:aspect-square",
            "motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out",
            "hover:scale-[1.03]",
          )}
        >
          {activeImage ? (
            <Image
              key={activeImage}
              src={activeImage}
              alt={title}
              width={700}
              height={700}
              preload
              sizes="(max-width: 1024px) 100vw, 520px"
              className="h-full w-full object-contain p-8 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200"
            />
          ) : (
            <p className="text-sm text-muted-foreground">No image available</p>
          )}
        </button>

        {activeImage && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-3 end-3 flex size-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm ring-1 ring-border"
          >
            <Expand className="size-4" />
          </span>
        )}
      </div>

      {images.length > 1 && (
        <ul aria-label="Product images" className="flex flex-wrap gap-2">
          {images.map((image, index) => {
            const isSelected = activeImage === image;

            return (
              <li key={`${image}-${index}`}>
                <Button
                  type="button"
                  variant="outline"
                  aria-pressed={isSelected}
                  aria-label={`Show image ${index + 1} of ${images.length}`}
                  onClick={() => setSelectedImage(image)}
                  className={cn(
                    "h-16 w-16 rounded-lg p-1",
                    "motion-safe:transition-transform motion-safe:duration-200",
                    "hover:scale-105",
                    isSelected && "border-primary ring-2 ring-primary",
                  )}
                >
                  <Image
                    src={image}
                    alt=""
                    width={56}
                    height={56}
                    loading="lazy"
                    className="h-full w-full object-contain"
                  />
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <ImageLightbox
        open={isLightboxOpen}
        onOpenChange={setIsLightboxOpen}
        images={images}
        activeIndex={activeIndex}
        title={title}
      />
    </div>
  );
}
