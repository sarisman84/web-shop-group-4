import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  label?: string;
  className?: string;
}

export default function StarRating({
  rating,
  max = 5,
  label,
  className,
}: StarRatingProps) {
  const t = useTranslations("productDetail");

  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={label ?? t("ratingLabel", { rating, max })}
    >
      {Array.from({ length: max }).map((_, index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={cn(
            "size-4",
            index < Math.round(rating)
              ? "fill-amber-600 text-amber-600 dark:fill-amber-400 dark:text-amber-400"
              : "text-muted-foreground/40",
          )}
        />
      ))}
    </span>
  );
}
