/**
 * WhatsApp Business app "coexistence": one number runs on the phone app and
 * the Cloud API at once. Meta sends four extra webhook fields for these
 * numbers — message_echoes (messages typed in the app), contact sync, chat
 * history, and account updates. This turns each payload into plain rows.
 *
 * Shapes follow Meta's coexistence onboarding guide. They are read
 * defensively (every field optional) because no live coexistence number was
 * available to capture a real payload against.
 */

/** The Embedded Signup session event Meta sends when someone connects a number that is already on the WhatsApp Business app. */
export const COEXISTENCE_EVENT = "FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING";

export type StoredMessageStatus = "sent" | "delivered" | "read" | "failed";

export interface ParsedMessage {
  id: string;
  customerPhone: string; // digits only
  direction: "inbound" | "outbound";
  body: string;
  sentAt: string; // ISO
  status: StoredMessageStatus;
}

export interface ParsedContactSync {
  phone: string;
  name: string | null;
  action: "add" | "remove";
}

export interface ParsedHistory {
  progress: number | null;
  phase: number | null;
  /** The business chose not to share history (Meta error 2593109). */
  declined: boolean;
  messages: ParsedMessage[];
}

export interface ParsedAccountUpdate {
  event: string | null;
  /** True when this update means the number was disconnected from Sendkar. */
  disconnected: boolean;
  reason: string | null;
}

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const asArray = (v: unknown): Obj[] => (Array.isArray(v) ? v.filter(isObj) : []);
const str = (v: unknown): string | null => (typeof v === "string" && v.length > 0 ? v : typeof v === "number" ? String(v) : null);
const digits = (v: unknown): string => (str(v) ?? "").replace(/\D/g, "");

/** Meta timestamps are Unix seconds, as a string or number. */
export function unixToIso(v: unknown, fallback: Date = new Date()): string {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? new Date(n * 1000).toISOString() : fallback.toISOString();
}

/** Text for any message type; media keeps its caption so the inbox shows more than a placeholder. */
export function describeMessage(msg: Obj): string {
  const type = str(msg.type) ?? "unsupported";
  const inner = isObj(msg[type]) ? (msg[type] as Obj) : null;
  if (type === "text") return str(inner?.body) ?? "[text message]";
  const caption = str(inner?.caption);
  return caption ? `[${type}] ${caption}` : `[${type} message]`;
}

const HISTORY_STATUS: Record<string, StoredMessageStatus> = {
  PENDING: "sent",
  SENT: "sent",
  DELIVERED: "delivered",
  READ: "read",
  PLAYED: "read",
  ERROR: "failed",
};

/** Messages typed in the WhatsApp Business app on a coexistence number (field: smb_message_echoes). */
export function parseMessageEchoes(value: unknown): ParsedMessage[] {
  if (!isObj(value)) return [];
  const out: ParsedMessage[] = [];
  for (const echo of asArray(value.message_echoes)) {
    const id = str(echo.id);
    const customerPhone = digits(echo.to);
    if (!id || !customerPhone) continue;
    out.push({ id, customerPhone, direction: "outbound", body: describeMessage(echo), sentAt: unixToIso(echo.timestamp), status: "sent" });
  }
  return out;
}

/** Contacts added or removed in the phone's address book (field: smb_app_state_sync). */
export function parseContactSync(value: unknown): ParsedContactSync[] {
  if (!isObj(value)) return [];
  const out: ParsedContactSync[] = [];
  for (const item of asArray(value.state_sync)) {
    if (item.type !== "contact" || !isObj(item.contact)) continue;
    const phone = digits(item.contact.phone_number);
    if (!phone) continue;
    out.push({
      phone,
      name: str(item.contact.full_name) ?? str(item.contact.first_name),
      action: item.action === "remove" ? "remove" : "add",
    });
  }
  return out;
}

/** One chunk of the chat-history backfill (field: history). A thread's id is the customer's number. */
export function parseHistory(value: unknown): ParsedHistory {
  const result: ParsedHistory = { progress: null, phase: null, declined: false, messages: [] };
  if (!isObj(value)) return result;

  if (asArray(value.errors).some((e) => Number(e.code) === 2593109)) result.declined = true;

  for (const item of asArray(value.history)) {
    const meta = isObj(item.metadata) ? item.metadata : {};
    if (result.progress === null && Number.isFinite(Number(meta.progress))) result.progress = Number(meta.progress);
    if (result.phase === null && Number.isFinite(Number(meta.phase))) result.phase = Number(meta.phase);

    if (asArray(item.errors).some((e) => Number(e.code) === 2593109)) result.declined = true;

    for (const thread of asArray(item.threads)) {
      const customerPhone = digits(thread.id);
      if (!customerPhone) continue;
      for (const msg of asArray(thread.messages)) {
        const id = str(msg.id);
        if (!id) continue;
        const inbound = digits(msg.from) === customerPhone;
        const ctx = isObj(msg.history_context) ? msg.history_context : {};
        const status = HISTORY_STATUS[String(ctx.status ?? "").toUpperCase()] ?? (inbound ? "delivered" : "sent");
        result.messages.push({
          id,
          customerPhone,
          direction: inbound ? "inbound" : "outbound",
          body: describeMessage(msg),
          sentAt: unixToIso(msg.timestamp),
          status: inbound ? "delivered" : status,
        });
      }
    }
  }
  return result;
}

/** Account-level changes (field: account_update). Only disconnects need action. */
export function parseAccountUpdate(value: unknown): ParsedAccountUpdate {
  if (!isObj(value)) return { event: null, disconnected: false, reason: null };
  const event = str(value.event);
  const info = isObj(value.disconnection_info) ? value.disconnection_info : null;
  const reason = str(info?.reason);
  const disconnected = Boolean(info) || /REMOVED|DISCONNECT/i.test(event ?? "");
  return { event, disconnected, reason };
}
