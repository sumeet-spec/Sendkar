/**
 * Builds the `components` array Meta's message_templates API expects.
 *
 * Meta rejects any template whose body contains {{n}} variables unless it is
 * given an example value for each one ("template parameter examples are
 * required"), so every body with variables carries `example.body_text`. A
 * template submitted without them is refused outright — which silently broke
 * every personalised template created before this existed.
 */

export interface BuildInput {
  headerType?: "none" | "text" | "image";
  headerText?: string;
  /** Meta media handle for an image header's sample picture (Resumable Upload API). */
  headerHandle?: string;
  bodyText: string;
  footerText?: string;
  buttons?: Array<Record<string, unknown>>;
  /** One realistic example per variable, in order. Falls back to generic samples. */
  bodyExamples?: string[];
  carouselCards?: Array<{ headerHandle: string; bodyText: string; buttons?: Array<Record<string, unknown>> }>;
}

// Realistic-looking fallbacks: Meta's reviewers reject obvious placeholders like "test" or "xxx".
const FALLBACK_EXAMPLES = ["Rajesh", "Sharma Traders", "Diwali", "₹5,000", "15 Nov 2026", "https://sendkar.shop/pay/abc123", "BILL-1042", "Sharma Transport"];

export function countBodyVariables(bodyText: string): number {
  const indexes = [...bodyText.matchAll(/\{\{(\d+)\}\}/g)].map((m) => Number(m[1]));
  return indexes.length ? Math.max(...indexes) : 0;
}

export function exampleValues(bodyText: string, provided?: string[]): string[] {
  const count = countBodyVariables(bodyText);
  return Array.from({ length: count }, (_, i) => provided?.[i]?.trim() || FALLBACK_EXAMPLES[i] || `Value ${i + 1}`);
}

export function buildTemplateComponents(input: BuildInput): Array<Record<string, unknown>> {
  const components: Array<Record<string, unknown>> = [];

  if (input.headerType === "text" && input.headerText) {
    components.push({ type: "HEADER", format: "TEXT", text: input.headerText });
  } else if (input.headerType === "image") {
    components.push(input.headerHandle
      ? { type: "HEADER", format: "IMAGE", example: { header_handle: [input.headerHandle] } }
      : { type: "HEADER", format: "IMAGE" });
  }

  const body: Record<string, unknown> = { type: "BODY", text: input.bodyText };
  if (countBodyVariables(input.bodyText) > 0) {
    body.example = { body_text: [exampleValues(input.bodyText, input.bodyExamples)] };
  }
  components.push(body);

  if (input.footerText) components.push({ type: "FOOTER", text: input.footerText });
  if (input.buttons?.length) components.push({ type: "BUTTONS", buttons: input.buttons });

  // A carousel replaces the body/header above with per-card versions of the
  // same idea — Meta's top-level BODY is still required as the intro text
  // shown above the scrollable cards.
  if (input.carouselCards?.length) {
    if (input.carouselCards.length < 2 || input.carouselCards.length > 10) {
      throw new Error("A carousel template needs between 2 and 10 cards.");
    }
    components.push({
      type: "CAROUSEL",
      cards: input.carouselCards.map((card, i) => ({
        card_index: i,
        components: [
          { type: "HEADER", format: "IMAGE", example: { header_handle: [card.headerHandle] } },
          { type: "BODY", text: card.bodyText },
          ...(card.buttons?.length ? [{ type: "BUTTONS", buttons: card.buttons }] : []),
        ],
      })),
    });
  }

  return components;
}
