/**
 * Every WhatsApp BSP's #1 named complaint (per direct competitor review
 * research) is that a rejected template gives you a raw code and nothing
 * else — no explanation, no fix. Meta's `reason` field isn't a single
 * documented enum we can exhaustively map (it varies by rejection path),
 * so this pattern-matches the common, well-known categories and always
 * falls back to genuinely useful general guidance rather than just
 * echoing the raw string back with no help.
 */

interface RejectionGuidance {
  plainLanguage: string;
  fix: string;
}

const PATTERNS: Array<{ match: RegExp; guidance: RejectionGuidance }> = [
  {
    match: /scam|fraud/i,
    guidance: {
      plainLanguage: "Meta's automated review flagged this as resembling a scam pattern.",
      fix: "Remove urgency language (\"act now\", \"limited time\"), unfamiliar shortened links, and any request for payment, OTP, or account details. Use your real business name as the sender identity.",
    },
  },
  {
    match: /abusive|harassment/i,
    guidance: {
      plainLanguage: "The content was flagged as abusive or harassing.",
      fix: "Review the message for aggressive language, threats, or content that could read as harassment — even sarcastically. Rewrite in a neutral, professional tone.",
    },
  },
  {
    match: /tag_content_mismatch|category.*mismatch|incorrect_category/i,
    guidance: {
      plainLanguage: "The template's category doesn't match what the message actually says.",
      fix: "UTILITY templates must be strictly transactional (order updates, appointment reminders) with no promotional language. If this message mentions a sale, discount, or new product, resubmit it under the MARKETING category instead.",
    },
  },
  {
    match: /invalid_format|format/i,
    guidance: {
      plainLanguage: "The template's structure doesn't match Meta's formatting rules.",
      fix: "Check for unbalanced {{1}} placeholders, more than 4 consecutive newlines, or a header/footer using formatting (bold/italic) that WhatsApp doesn't support in those slots.",
    },
  },
  {
    match: /inaccurate|misinformation/i,
    guidance: {
      plainLanguage: "The content was flagged as potentially misleading or inaccurate.",
      fix: "Remove absolute claims (\"guaranteed\", \"100% cure\", \"risk-free\") and unverifiable statistics. State offers and claims precisely and factually.",
    },
  },
  {
    match: /promotional|marketing.*utility/i,
    guidance: {
      plainLanguage: "This reads as promotional content submitted under a non-marketing category.",
      fix: "Resubmit under the MARKETING category — Utility and Authentication templates are reviewed against a stricter, transactional-only bar.",
    },
  },
];

const GENERIC_FIX =
  "Common fixes across rejections: make sure the category (Marketing/Utility/Authentication) actually matches the content, avoid excessive punctuation/emoji/ALL CAPS, remove shortened or unfamiliar links, and never ask the recipient for payment, OTP, or personal details in the template body.";

export function explainRejection(rawReason: string | null): { plainLanguage: string; fix: string } {
  if (!rawReason || rawReason.trim().toUpperCase() === "NONE") {
    return { plainLanguage: "Meta didn't provide a specific reason with this rejection.", fix: GENERIC_FIX };
  }
  const matched = PATTERNS.find((p) => p.match.test(rawReason));
  if (matched) return matched.guidance;
  return { plainLanguage: `Meta's stated reason: "${rawReason}"`, fix: GENERIC_FIX };
}
