import { NextRequest, NextResponse } from "next/server";
import { renderMonogramPng, type MonogramShape } from "@/lib/cards/renderCard";
import { initialsFor } from "@/lib/brandLogo";
import { isHexColor } from "@/lib/brandKit";
import { memberOf, storeLogo } from "@/lib/brandLogoStore";

export const runtime = "nodejs";

const SHAPES: MonogramShape[] = ["circle", "rounded", "square"];

/** Makes a simple logo from the shop name's first letters, for shops that have none. */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { workspaceId?: string; name?: string; shape?: string; fill?: string; ink?: string };
  if (!(await memberOf(body.workspaceId ?? ""))) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const name = body.name?.trim().slice(0, 60);
  if (!name) return NextResponse.json({ error: "Type your shop name first." }, { status: 400 });
  const shape = SHAPES.find((s) => s === body.shape) ?? "circle";
  const fill = body.fill && isHexColor(body.fill) ? body.fill : "#0f766e";
  const ink = body.ink && isHexColor(body.ink) ? body.ink : "#ffffff";

  const png = renderMonogramPng({ text: initialsFor(name), shape, fill, ink });
  const url = await storeLogo(body.workspaceId!, png);
  if (!url) return NextResponse.json({ error: "Could not save the logo." }, { status: 500 });
  return NextResponse.json({ url });
}
