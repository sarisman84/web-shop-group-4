import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <main id="main-content" className="page-container flex flex-1 items-center justify-center py-16">
      <Card className="w-full max-w-md text-center">
        <CardContent className="flex flex-col items-center gap-4 py-10">
          <p className="text-sm font-semibold text-muted-foreground">404</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("description")}
          </p>
          <Link
            href="/products"
            className={cn(buttonVariants({ size: "lg" }), "mt-2")}
          >
            {t("back")}
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
