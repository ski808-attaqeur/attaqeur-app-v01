import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Note } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  let note: Note | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("notes")
      .select("*")
      .eq("share_token", token)
      .maybeSingle();
    note = (data as Note) ?? null;
  } catch {
    note = null;
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center px-6 py-16">
      <div className="app-bg" />
      <div className="glass-strong w-full max-w-2xl rounded-3xl p-8">
        <Link
          href="/"
          className="wordmark text-3xl text-white/90 hover:text-white"
        >
          Idé.
        </Link>

        {note ? (
          <article className="mt-6">
            <div className="text-xs uppercase tracking-wide text-white/50">
              Shared note · read only
            </div>
            <h1 className="mt-1 text-xl font-semibold">{note.title}</h1>
            <p
              className="note-body mt-4 text-[15px] leading-relaxed text-white/90"
              dir="auto"
              lang={note.language_code}
            >
              {note.body || "(empty note)"}
            </p>
          </article>
        ) : (
          <div className="mt-8 text-center text-white/70">
            <p className="text-lg font-semibold">Note not found</p>
            <p className="mt-1 text-sm">
              This share link is invalid or the note was deleted.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-black hover:bg-white"
            >
              Go to Idé
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
