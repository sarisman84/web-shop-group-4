import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/(admin)/globals.css";
import { Toaster } from "@/components/ui/sonner";
import ShopHeader from "@/components/shop/shop-header";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Nordic Retail",
    template: "%s | Nordic Retail",
  },
  description:
    "Shop the Nordic Retail catalogue: browse products, check availability and add your picks to the cart.",
};

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased",
        geist.variable,
        geistMono.variable,
        "font-sans",
      )}
    >
      <body className="flex min-h-full flex-col">
        <ShopHeader />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
