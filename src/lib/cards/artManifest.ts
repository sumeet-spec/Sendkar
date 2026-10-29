import type { OccasionId } from "./occasions";

/**
 * The festival background pictures that ship with the app (src/assets/art). Written by
 * scripts/festival-art/optimize.mjs from the pictures that passed review; do not edit by hand.
 * `avg` is the picture's average colour, used to tint the text panel so it sits naturally on the art.
 */
export type ArtEntry = { id: string; occasion: OccasionId; file: string; avg: string };

export const ART: ArtEntry[] = [];
