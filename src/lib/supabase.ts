import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Public client for client-side queries or anon server calls
 */
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/**
 * Server-only client with service_role bypass for admin storage & DB operations
 */
export const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && (supabaseServiceRoleKey || supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;

/**
 * Checks if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

/**
 * Upload helper to upload files to Supabase Storage bucket
 * Default bucket: 'safirya-media'
 */
export async function uploadToSupabaseStorage(
  fileBuffer: Buffer | Uint8Array,
  fileName: string,
  contentType: string,
  bucketName: string = 'safirya-media'
): Promise<{ url: string | null; error: string | null }> {
  if (!supabaseAdmin) {
    return {
      url: null,
      error: 'Supabase ayarları (.env: NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY) henüz girilmemiş.',
    };
  }

  try {
    const cleanPath = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(cleanPath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      return { url: null, error: uploadError.message };
    }

    const { data } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(cleanPath);

    return { url: data.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err?.message || 'Bilinmeyen Supabase yükleme hatası.' };
  }
}
