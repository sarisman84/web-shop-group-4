"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";

export async function signOutAction() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });

  if (error) {
    throw new Error(`Unable to sign out: ${error.message}`);
  }

  redirect("/");
}
