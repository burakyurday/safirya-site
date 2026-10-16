import { supabaseAdmin } from '@/lib/supabase';
import { initialConceptBanners } from '@/context/AdminContext';
import { ConceptBannersMap } from '@/types/admin';

const BUCKET_NAME = 'safirya-media';
const CONFIG_PATH = 'config/banners.json';

/**
 * Sunucu tarafında en güncel vitrin bannerlarını çeker.
 * 1. Supabase Storage (safirya-media/config/banners.json)
 * 2. Hata veya kayıt yoksa initialConceptBanners fallback
 */
export async function getConceptBannersServer(): Promise<ConceptBannersMap> {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return initialConceptBanners;
  }

  try {
    // 1. Supabase Storage SDK ile çek
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .download(CONFIG_PATH);

      if (!error && data) {
        const text = await data.text();
        const parsed = JSON.parse(text) as ConceptBannersMap;
        if (parsed && typeof parsed === 'object') {
          return { ...initialConceptBanners, ...parsed };
        }
      }
    }

    // 2. Fallback: Supabase Public Storage URL üzerinden çek
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://surzgnggpubyiiqwuxvu.supabase.co';
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${CONFIG_PATH}`;
    const res = await fetch(publicUrl, { cache: 'no-store' });
    if (res.ok) {
      const parsed = (await res.json()) as ConceptBannersMap;
      if (parsed && typeof parsed === 'object') {
        return { ...initialConceptBanners, ...parsed };
      }
    }
  } catch (err) {
    console.warn('Sunucu banner yükleme uyarısı:', err);
  }

  return initialConceptBanners;
}
