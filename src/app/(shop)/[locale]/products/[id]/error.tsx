"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ProductError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="page-container flex flex-1 items-center justify-center py-16">
      <Card className="w-full max-w-md text-center">
        <CardContent className="flex flex-col items-center gap-4 py-10">
          <h1 className="text-2xl font-semibold tracking-tight">
            We could not load this product
          </h1>
          <p className="text-sm text-muted-foreground">
            Something went wrong while fetching the product. This is usually
            temporary, so it is worth trying again.
          </p>
          <Button type="button" size="lg" onClick={() => retry()} className="mt-2">
            Try again
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
