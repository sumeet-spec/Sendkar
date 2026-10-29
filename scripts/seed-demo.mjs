// Builds a believable demo account for the expo stand: a sample shop with a brand kit, contacts in several
// languages, a finished campaign and some of yesterday's activity, so every screen has something to show.
//
// Nothing is sent to anyone. Contacts use made-up numbers (91900000xxxx). To demo a real send, add your own
// number and friends' numbers (with their permission) under Contacts afterwards.
//
// Run once, deliberately:   node scripts/seed-demo.mjs
// It prints the login for the demo account at the end. Run with --remove to delete the demo account again.

import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

// Read .env.local without needing dotenv.
const env = Object.fromEntries(
  fs.readFileSync(path.resolve(".env.local"), "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => {
    const i = l.indexOf("=");
    return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")];
  }),
);
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

const PHONE = "919000000099"; // a made-up number: no one owns it
const EMAIL = `wa${PHONE}@sendkar.internal`; // same fake-address scheme the app uses (see lib/auth.ts)

async function findUser() {
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  return data?.users?.find((u) => u.email === EMAIL) ?? null;
}

if (process.argv.includes("--remove")) {
  const u = await findUser();
  if (!u) { console.log("No demo account found."); process.exit(0); }
  await admin.from("workspaces").delete().eq("owner_id", u.id);
  await admin.auth.admin.deleteUser(u.id);
  console.log("Demo account removed.");
  process.exit(0);
}

if (await findUser()) { console.log("A demo account already exists. Run with --remove first to rebuild it."); process.exit(1); }

const password = crypto.randomBytes(9).toString("base64url");
const { data: created, error: userError } = await admin.auth.admin.createUser({
  email: EMAIL, password, email_confirm: true, user_metadata: { whatsapp_number: PHONE },
});
if (userError) throw userError;
const userId = created.user.id;

const trialEnds = new Date(Date.now() + 30 * 86_400_000).toISOString(); // a month, so the demo never shows an expired banner
const { data: ws, error: wsError } = await admin.from("workspaces").insert({ name: "Demo Traders", owner_id: userId, plan: "trial", trial_ends_at: trialEnds }).select("id").single();
if (wsError) throw wsError;
const workspaceId = ws.id;

await admin.from("brand_kits").upsert({
  workspace_id: workspaceId, name: "Demo Traders", names: { gu: "ડેમો ટ્રેડર્સ", hi: "डेमो ट्रेडर्स", mr: "डेमो ट्रेडर्स", ta: "டெமோ டிரேடர்ஸ்", te: "డెమో ట్రేడర్స్", kn: "ಡೆಮೋ ಟ್ರೇಡರ್ಸ್" },
  tagline: "", primary_color: "#14532d", accent_color: "#fcd34d", phone: "98765 43210", address: "", website: "",
});

const langs = ["gu", "gu", "gu", "hi", "hi", "mr", "ta", "te", "kn", "en"];
const first = ["Rajesh", "Meena", "Kiran", "Suresh", "Anita", "Vikram", "Pooja", "Mahesh", "Lata", "Dinesh"];
const now = Date.now();
const contacts = Array.from({ length: 30 }, (_, i) => ({
  workspace_id: workspaceId, phone: `91900000${String(1000 + i)}`, name: `${first[i % first.length]} ${i + 1}`, language: langs[i % langs.length],
  source: i % 3 === 0 ? "counter_qr" : "manual", ...(i % 3 === 0 ? { consent_at: new Date(now - i * 3_600_000).toISOString(), consent_source: "counter_qr" } : {}),
  created_at: new Date(now - (i < 6 ? 3_600_000 * (i + 1) : 86_400_000 * (i + 2))).toISOString(),
}));
const { data: inserted } = await admin.from("contacts").insert(contacts).select("id");

// One finished campaign, so the dashboard and campaign report have real-looking numbers.
const { data: tpl } = await admin.from("templates").insert({
  workspace_id: workspaceId, name: "Festival greeting", language: "en", meta_template_name: "festival_greeting", category: "MARKETING",
  header_type: "none", body_text: "Hello {{1}}, warm festival wishes from {{2}}!", body_preview: "Hello, warm festival wishes!", status: "approved",
}).select("id").single();
const { data: camp } = await admin.from("campaigns").insert({
  workspace_id: workspaceId, name: "Diwali greeting", template_id: tpl.id, status: "completed",
  started_at: new Date(now - 2 * 86_400_000).toISOString(), completed_at: new Date(now - 2 * 86_400_000 + 600_000).toISOString(),
}).select("id").single();
const statuses = ["read", "read", "delivered", "delivered", "delivered", "read", "delivered", "failed", "read", "delivered"];
await admin.from("campaign_recipients").insert((inserted ?? []).map((c, i) => ({
  campaign_id: camp.id, contact_id: c.id, status: statuses[i % statuses.length], sent_at: new Date(now - 2 * 86_400_000).toISOString(),
  ...(statuses[i % statuses.length] === "failed" ? { error: "Message undeliverable" } : {}),
})));

// A few messages yesterday so the "Yesterday" card has something to say.
const yesterday = now - 18 * 3_600_000;
await admin.from("messages").insert((inserted ?? []).slice(0, 12).flatMap((c, i) => [
  { workspace_id: workspaceId, contact_id: c.id, direction: "outbound", status: i % 2 ? "read" : "delivered", created_at: new Date(yesterday + i * 60_000).toISOString() },
  ...(i % 4 === 0 ? [{ workspace_id: workspaceId, contact_id: c.id, direction: "inbound", status: "sent", body: "Thank you!", created_at: new Date(yesterday + i * 60_000 + 30_000).toISOString() }] : []),
]));

console.log("\nDemo account ready.");
console.log("  Login number (the 10 digits):  9000000099");
console.log(`  Password:                      ${password}`);
console.log("\nNothing was sent. The numbers are made up. Add your own number under Contacts to demo a real send.");
console.log("Remove it later with:  node scripts/seed-demo.mjs --remove");
