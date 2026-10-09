"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ProductError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations("productDetail");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="page-container flex flex-1 items-center justify-center py-16">
      <Card className="w-full max-w-md text-center">
        <CardContent className="flex flex-col items-center gap-4 py-10">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("errorTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("errorText")}
          </p>
          <Button type="button" size="lg" onClick={() => retry()} className="mt-2">
            {t("tryAgain")}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
