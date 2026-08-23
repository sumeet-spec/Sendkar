import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { NewProductForm } from "./NewProductForm";
import { ProductCard } from "./ProductCard";
import Link from "next/link";

export default async function CatalogPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, retailer_id, name, price_label, image_url, description")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Catalog</h1>
        <NewProductForm />
      </div>

      {!workspace.catalog_id && (
        <div className="sk-card mb-5 p-4" style={{ borderColor: "rgba(251,191,36,0.3)" }}>
          <p className="text-sm">
            Add your Meta Commerce catalog ID in{" "}
            <Link href="/settings/channels" className="text-accent hover:text-accent-hover">Settings → Channels</Link> to actually send these as
            product messages — the catalog itself is still set up once in Meta Commerce Manager, same as templates.
          </p>
        </div>
      )}
      <p className="mb-5 text-sm text-muted">
        Each retailer ID here must match a product already in your Meta catalog exactly — this list is for picking
        what to send from the inbox, not a replacement for Commerce Manager.
      </p>

      <div className="grid grid-cols-3 gap-4">
        {(products ?? []).map((p) => <ProductCard key={p.id} product={p} />)}
        {(!products || products.length === 0) && <p className="col-span-3 py-8 text-center text-muted">No products yet.</p>}
      </div>
    </div>
  );
}
