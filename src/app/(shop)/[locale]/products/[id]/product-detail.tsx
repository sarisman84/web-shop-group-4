import { useLocale, useTranslations } from "next-intl";
import type { Product } from "@/app/admin/types";
import {
  getDiscountPercentage,
  getDiscountedPrice,
  getStockStatus,
  normalizeStock,
  type StockStatus,
} from "@/app/admin/components/productUtils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MAX_CART_QUANTITY } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import StarRating from "@/components/shop/star-rating";
import AddToCart from "./add-to-cart";
import ProductGallery from "./product-gallery";
import ProductReviews from "./product-reviews";

const STOCK_KEYS: Record<StockStatus, "inStock" | "lowStock" | "outOfStock"> = {
  "in-stock": "inStock",
  "low-stock": "lowStock",
  "out-of-stock": "outOfStock",
};

const STOCK_BADGE_CLASSES: Record<StockStatus, string> = {
  "in-stock":
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  "low-stock":
    "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  "out-of-stock": "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
};

function SpecRow({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) {
  if (value === undefined || value === null || value === "") return null;

  return (
    <div className="flex items-center justify-between gap-6 py-3 first:pt-0 last:pb-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-end text-sm font-medium">{value}</dd>
    </div>
  );
}

function TextBlock({ title, value }: { title: string; value?: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p
        className={
          value
            ? "mt-1.5 text-sm leading-6 text-muted-foreground"
            : "mt-1.5 text-sm italic text-muted-foreground"
        }
      >
        {value || "No information available."}
      </p>
    </div>
  );
}

export default function ProductDetail({ product }: { product: Product }) {
  const t = useTranslations("productDetail");
  const locale = useLocale();
  const images = [
    ...new Set([product.thumbnail, ...product.images].filter(Boolean)),
  ];

  const stock = normalizeStock(product.stock);
  const stockStatus = getStockStatus(stock);
  const discountPercentage = getDiscountPercentage(product.discountPercentage);
  const discountedPrice = getDiscountedPrice(product.price, discountPercentage);
  const hasDiscount = discountPercentage > 0;
  const reviews = product.reviews ?? [];
  const dimensions = product.dimensions;

  return (
    <main id="main-content" className="page-container flex flex-1 flex-col gap-6">
      <Card>
        <CardContent className="grid gap-8 lg:grid-cols-2">
          <ProductGallery title={product.title} images={images} />

          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              {product.category?.name && (
                <Badge variant="secondary">{product.category.name}</Badge>
              )}
              <Badge
                variant="outline"
                className={STOCK_BADGE_CLASSES[stockStatus.status]}
              >
                {t(`stock.${STOCK_KEYS[stockStatus.status]}`)}
              </Badge>
              {hasDiscount && (
                <Badge variant="outline" className="border-emerald-200 text-emerald-700">
                  {t("discountOff", { percent: discountPercentage.toFixed(0) })}
                </Badge>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-semibold tracking-tight">
                {product.title}
              </h1>

              {product.brand && (
                <p className="text-sm text-muted-foreground">
                  {t("by")} <span className="font-medium text-foreground">{product.brand}</span>
                </p>
              )}

              {product.rating !== undefined && (
                <div className="flex items-center gap-2">
                  <StarRating rating={product.rating} />
                  <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                  {reviews.length > 0 && (
                    <span className="text-sm text-muted-foreground">
                      ({reviews.length})
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-semibold tracking-tight">
                {formatMoney(discountedPrice, locale)}
              </span>
              {hasDiscount && (
                <span className="text-base text-muted-foreground line-through">
                  {formatMoney(product.price, locale)}
                </span>
              )}
            </div>

            <AddToCart
              productId={product.id}
              productTitle={product.title}
              stock={stock}
              maxQuantity={Math.min(stock, MAX_CART_QUANTITY)}
              minimumOrderQuantity={product.minimumOrderQuantity}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle role="heading" aria-level={2}>{t("description")}</CardTitle>
        </CardHeader>
        <CardContent>
          {product.description ? (
            <p className="max-w-4xl whitespace-pre-line text-sm leading-7 text-muted-foreground">
              {product.description}
            </p>
          ) : (
            <p className="text-sm italic text-muted-foreground">
              {t("noDescription")}
            </p>
          )}

          {product.tags && product.tags.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <li key={tag}>
                  <Badge variant="outline">{tag}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b">
            <CardTitle role="heading" aria-level={2}>{t("specifications")}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-border">
              <SpecRow label={t("sku")} value={product.sku} />
              <SpecRow label={t("category")} value={product.category?.name} />
              <SpecRow
                label={t("weight")}
                value={
                  product.weight !== undefined ? `${product.weight} g` : undefined
                }
              />
              {dimensions && (
                <SpecRow
                  label={t("dimensions")}
                  value={`${dimensions.width} × ${dimensions.height} × ${dimensions.depth} cm`}
                />
              )}
              <SpecRow
                label={t("minimumOrder")}
                value={product.minimumOrderQuantity}
              />
              <SpecRow label={t("warranty")} value={product.warrantyInformation} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle role="heading" aria-level={2}>{t("shippingReturns")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <TextBlock
              title={t("shippingInfo")}
              value={product.shippingInformation}
            />
            <TextBlock title={t("returnPolicy")} value={product.returnPolicy} />
          </CardContent>
        </Card>
      </div>

      <ProductReviews product={product} />
    </main>
  );
}
