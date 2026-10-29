/** Colour choices on the free card page: the festival's own colours, or one of these main colours. */
export const FREE_CARD_COLOURS: Array<{ key: string; primary: string | null; label: string }> = [
  { key: "festival", primary: null, label: "Festival" },
  { key: "green", primary: "#14532d", label: "Green" },
  { key: "blue", primary: "#0f4c81", label: "Blue" },
  { key: "maroon", primary: "#7a1226", label: "Maroon" },
  { key: "purple", primary: "#4a1d7a", label: "Purple" },
  { key: "orange", primary: "#b45309", label: "Orange" },
  { key: "black", primary: "#1f2937", label: "Black" },
];

/** Normalises a number typed by a shopkeeper (10 digits, +91, spaces) to 91XXXXXXXXXX, or null. */
export function indianMobile(raw: string): string | null {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("0091")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  if (d.length === 10 && /^[6-9]/.test(d)) return `91${d}`;
  if (d.length === 12 && d.startsWith("91") && /^[6-9]/.test(d[2])) return d;
  return null;
}
