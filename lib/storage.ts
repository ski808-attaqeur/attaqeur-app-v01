import { getSupabase } from "@/lib/supabase/browser";

/**
 * Best-effort upload to a public bucket. Returns the storage path on success,
 * or null if the bucket/policies aren't available. Callers must treat a null
 * result as "no attachment" and continue — never block the note on storage.
 */
export async function uploadToBucket(
  bucket: string,
  file: Blob,
  ext: string,
): Promise<string | null> {
  try {
    const path = `demo/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await getSupabase()
      .storage.from(bucket)
      .upload(path, file, {
        contentType: file.type || undefined,
        upsert: false,
      });
    if (error) return null;
    return path;
  } catch {
    return null;
  }
}
