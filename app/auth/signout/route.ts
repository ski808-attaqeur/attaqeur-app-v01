import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Sign-out must happen server-side: @supabase/ssr sets the auth cookies
// httpOnly (refreshed in middleware), so client-side signOut() can't delete
// them. A route handler can, then we bounce to /login.
export async function GET(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", request.url), {
    // 303 so the browser issues a GET to /login.
    status: 303,
  });
}
