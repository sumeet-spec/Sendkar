import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { CollapsibleImport } from "./CollapsibleImport";
import { ContactFilters } from "./ContactFilters";
import { ContactTable, type ContactRow } from "./ContactTable";

const SOURCE_LABEL: Record<string, string> = {
  apify_scrape: "CSV import",
  csv_import: "CSV import",
  whatsapp_inbound: "WhatsApp",
  manual: "Manual",
  api: "API",
};

type SearchParams = Promise<{ q?: string; lang?: string; tag?: string; optedOut?: string }>;

export default async function ContactsPage({ searchParams }: { searchParams: SearchParams }) {
  const { q = "", lang = "", tag = "", optedOut = "" } = await searchParams;
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();

  let query = supabase
    .from("contacts")
    .select("id, phone, name, language, source, tags, opted_out, ad_headline, created_at")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (q.trim()) {
    const safe = q.trim().replace(/[,.()%]/g, "");
    query = query.or(`phone.ilike.%${safe}%,name.ilike.%${safe}%`);
  }
  if (lang) query = query.eq("language", lang);
  if (tag) query = query.contains("tags", [tag]);
  if (optedOut) query = query.eq("opted_out", true);

  const [{ data: contacts }, { count: totalCount }, { data: orders }, { data: allContacts }] =
    await Promise.all([
      query,
      supabase
        .from("contacts")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", workspace.id),
      supabase.from("orders").select("contact_id, total_amount").eq("workspace_id", workspace.id),
      supabase
        .from("contacts")
        .select("tags")
        .eq("workspace_id", workspace.id)
        .not("tags", "is", null),
    ]);

  const spendByContact = new Map<string, number>();
  for (const o of orders ?? []) {
    if (!o.contact_id) continue;
    spendByContact.set(o.contact_id, (spendByContact.get(o.contact_id) ?? 0) + Number(o.total_amount));
  }

  // Collect all unique tags for the filter dropdown
  const allTagSet = new Set<string>();
  for (const c of allContacts ?? []) {
    for (const t of (c.tags as string[]) ?? []) allTagSet.add(t);
  }
  const availableTags = [...allTagSet].sort();

  const rows: ContactRow[] = (contacts ?? []).map((c) => ({
    id: c.id,
    phone: c.phone,
    name: c.name,
    language: c.language,
    source: SOURCE_LABEL[c.source ?? ""] ?? c.source,
    tags: (c.tags as string[]) ?? [],
    opted_out: c.opted_out ?? false,
    ad_headline: c.ad_headline,
    created_at: c.created_at,
    spend: spendByContact.get(c.id) ?? 0,
  }));

  return (
    <div className="max-w-5xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Contacts</h1>
          <p className="mt-1 text-[13px] text-faint">
            {totalCount ?? 0} total
            {(totalCount ?? 0) > 200 && ` — showing most recent 200`}
          </p>
        </div>
        <a href="/api/contacts/export" className="sk-btn sk-btn-ghost text-[13px]">
          Export CSV
        </a>
      </div>

      <CollapsibleImport />

      <Suspense>
        <ContactFilters availableTags={availableTags} />
      </Suspense>

      <ContactTable contacts={rows} currency={workspace.currency ?? "USD"} />
    </div>
  );
}
