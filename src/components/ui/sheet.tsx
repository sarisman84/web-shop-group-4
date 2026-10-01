"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "cn";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function Sheet({ open, onOpenChange, children }: SheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
          <span className="text-lg font-semibold text-gray-900">Meny</span>
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Stäng meny"
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-col p-4">{children}</div>
      </div>
    </div>
  );
}

function SheetLink({
  href,
  children,
  onNavigate,
}: {
  href: string;
  children: React.ReactNode;
  onNavigate?: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onNavigate}
      className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-[#0d5c56]"
    >
      {children}
    </a>
  );
}

export { Sheet, SheetLink };
