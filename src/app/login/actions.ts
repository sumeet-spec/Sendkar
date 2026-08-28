"use server";

import { createClient } from "@/lib/supabase/server";
import { normalizePhone, phoneToAuthEmail } from "@/lib/auth";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";
import { redirect } from "next/navigation";

export async function login(_prevState: unknown, formData: FormData) {
  // Matches the signup form: only the 10-digit local number is collected,
  // +91 is fixed in the UI rather than typed every time.
  const phone = normalizePhone("91" + String(formData.get("phone") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (phone.length !== 12 || !password) return { error: "Enter your WhatsApp number and password." };

  const ip = await getClientIp();
  if (await isRateLimited(`login:${ip}`, 10, 600)) {
    return { error: "Too many login attempts from this network. Try again in a few minutes." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: phoneToAuthEmail(phone), password });
  if (error) return { error: "Incorrect WhatsApp number or password." };

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
