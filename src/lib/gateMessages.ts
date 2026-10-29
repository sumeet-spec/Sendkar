import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { GATE_COPY } from "@/lib/i18n/gateCopy";

/** The refusal shown to a person in the language they use. Only call from a server action, where their language is known. */
export async function refusal(kind: "noPlan" | "noNumber"): Promise<string> {
  const t = GATE_COPY[await getCurrentLanguage()];
  return kind === "noPlan" ? t.refusedNoPlan : t.refusedNoNumber;
}
