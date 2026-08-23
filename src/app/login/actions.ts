"use server";

import { createClient } from "@/lib/supabase/server";
import { normalizePhone, phoneToAuthEmail } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function login(_prevState: unknown, formData: FormData) {
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (phone.length < 10 || !password) return { error: "Enter your WhatsApp number and password." };

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
