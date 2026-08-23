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
    <div className="sk-card p-4">
      {product.image_url && (
        // eslint-disable-next-line @next/next/no-img-element -- user-supplied external URL, not a local/optimizable asset
        <img src={product.image_url} alt={product.name} className="mb-3 h-32 w-full rounded-md object-cover" />
      )}
      <div className="mb-1 flex items-center justify-between">
        <div className="font-medium">{product.name}</div>
        <button disabled={pending} onClick={() => startTransition(() => deleteProduct(product.id))} className="text-xs text-faint hover:text-danger">
          Delete
        </button>
      </div>
      {product.price_label && <div className="mb-1 text-[13px] text-accent">{product.price_label}</div>}
      <div className="font-mono text-[11.5px] text-faint">{product.retailer_id}</div>
      {product.description && <p className="mt-2 text-[12.5px] text-muted line-clamp-2">{product.description}</p>}
    </div>
  );
}
