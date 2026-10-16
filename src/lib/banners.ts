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
  } catch (err) {
    console.warn('Sunucu banner yükleme uyarısı:', err);
  }

  return initialConceptBanners;
}
