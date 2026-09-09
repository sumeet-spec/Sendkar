"use client";

import { useTransition } from "react";
import { deleteProduct } from "./actions";

interface Product {
  id: string;
  retailer_id: string;
  name: string;
  price_label: string | null;
  image_url: string | null;
  description: string | null;
}

export function ProductCard({ product }: { product: Product }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className={`sk-card p-4 ${pending ? "opacity-60" : ""}`}>
      {product.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element -- user-supplied external URL
        <img src={product.image_url} alt={product.name} className="mb-3 h-32 w-full rounded-md object-cover" />
      ) : (
        <div className="mb-3 flex h-32 w-full items-center justify-center rounded-md border border-border text-faint text-[11px]">
          No image
        </div>
      )}
      <div className="mb-1 flex items-start justify-between gap-2">
        <div className="font-medium leading-snug">{product.name}</div>
        <button
          disabled={pending}
          onClick={() => {
            if (confirm(`Delete "${product.name}"?`)) {
              startTransition(async () => { await deleteProduct(product.id); });
            }
          }}
          className="flex-shrink-0 text-xs text-faint hover:text-danger"
        >
          Delete
        </button>
      </div>
      {product.price_label && <div className="mb-1 text-[13px] font-medium text-accent">{product.price_label}</div>}
      <div className="font-mono text-[11px] text-faint">{product.retailer_id}</div>
      {product.description && <p className="mt-2 text-[12.5px] text-muted line-clamp-2">{product.description}</p>}
    </div>
  );
}
