import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { getAdminSessionServer } from '@/lib/adminAuth';
import { ConceptBannersMap } from '@/types/admin';

export const dynamic = 'force-dynamic';

const BUCKET_NAME = 'safirya-media';
const CONFIG_PATH = 'config/banners.json';

// Varsayılan bellek önbelleği (cold startlar arası hızlı erişim)
let memoryCache: { data: ConceptBannersMap | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};

export async function GET() {
  try {
    // 1. Önbellek kontrolü (10 saniye geçerli)
    if (memoryCache.data && Date.now() - memoryCache.timestamp < 10000) {
      return NextResponse.json({
        success: true,
        banners: memoryCache.data,
        source: 'cache',
      });
    }

    // 2. Supabase Storage üzerinden oku
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .download(CONFIG_PATH);

      if (!error && data) {
        const text = await data.text();
        const parsed = JSON.parse(text) as ConceptBannersMap;
        memoryCache = { data: parsed, timestamp: Date.now() };
        return NextResponse.json({
          success: true,
          banners: parsed,
          source: 'cloud',
        });
      }
    }

    // 3. Henüz bulutta kayıtlı değilse boş / varsayılan döndür
    return NextResponse.json({
      success: true,
      banners: memoryCache.data || {},
      source: 'empty',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Bannerlar alınırken hata oluştu.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Yönetici Oturum Kontrolü
    const session = await getAdminSessionServer();
    if (!session) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim. Lütfen admin girişi yapınız.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { banners } = body;

    if (!banners || typeof banners !== 'object') {
      return NextResponse.json(
        { error: 'Geçersiz banner verisi gönderildi.' },
        { status: 400 }
      );
    }

    // 2. Supabase Storage üzerine kaydet
    if (supabaseAdmin) {
      const payload = Buffer.from(JSON.stringify(banners, null, 2), 'utf-8');
      let { error } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(CONFIG_PATH, payload, {
          contentType: 'application/json',
          upsert: true,
        });

      if (error && error.message?.toLowerCase().includes('not found')) {
        await supabaseAdmin.storage.createBucket(BUCKET_NAME, { public: true });
        const retry = await supabaseAdmin.storage
          .from(BUCKET_NAME)
          .upload(CONFIG_PATH, payload, {
            contentType: 'application/json',
            upsert: true,
          });
        error = retry.error;
      }

      if (error) {
        return NextResponse.json(
          { error: `Supabase kayıt hatası: ${error.message}` },
          { status: 500 }
        );
      }
    }

    // 3. Bellek önbelleğini güncelle
    memoryCache = { data: banners, timestamp: Date.now() };

    return NextResponse.json({
      success: true,
      message: 'Konsept bannerlar buluta başarıyla kaydedildi.',
      banners,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Bannerlar kaydedilirken hata oluştu.' },
      { status: 500 }
    );
  }
}
