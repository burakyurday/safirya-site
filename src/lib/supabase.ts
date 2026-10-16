import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://surzgnggpubyiiqwuxvu.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1cnpnbmdncHVieWlpcXd1eHZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5ODAyMTAsImV4cCI6MjEwNzU1NjIxMH0.ek9JVm2XnLhgwVdqLKygbWlpPtmf4mFWM_lvdCfPebI';
const DEFAULT_SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1cnpnbmdncHVieWlpcXd1eHZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTk4MDIxMCwiZXhwIjoyMTA3NTU2MjEwfQ.4owUbCV3JqTjRzqgOabszDUfRSdhnmIhwU220uKsQN8';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  DEFAULT_SUPABASE_URL;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_ANON_KEY;

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  DEFAULT_SUPABASE_SERVICE_ROLE_KEY;

/**
 * Public client for client-side queries or anon server calls
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Server-only client with service_role bypass for admin storage & DB operations
 */
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceRoleKey || supabaseAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

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
