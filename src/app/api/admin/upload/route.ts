import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionServer } from '@/lib/adminAuth';
import { uploadToCloudinary, isCloudinaryConfigured } from '@/lib/cloudinary';
import { uploadToSupabaseStorage, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  // 1. Yetki Kontrolü
  const session = await getAdminSessionServer();
  if (!session) {
    return NextResponse.json(
      { error: 'Yetkisiz erişim. Lütfen admin paneline giriş yapınız.' },
      { status: 401 }
    );
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    let fileBuffer: Buffer | null = null;
    let fileName = `upload_${Date.now()}`;
    let mimeType = 'image/jpeg';
    let folder = 'safirya_products';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const folderParam = formData.get('folder') as string | null;
      if (folderParam) folder = folderParam;

      if (!file) {
        return NextResponse.json({ error: 'Yüklenecek dosya bulunamadı.' }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
      fileName = file.name || fileName;
      mimeType = file.type || mimeType;
    } else {
      // JSON Base64 payload
      const body = await req.json();
      const { file, folder: folderParam } = body;
      if (folderParam) folder = folderParam;

      if (!file) {
        return NextResponse.json({ error: 'Görsel verisi (base64) bulunamadı.' }, { status: 400 });
      }

      // Base64 Data URL kontrolü
      const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        fileBuffer = Buffer.from(matches[2], 'base64');
      } else {
        fileBuffer = Buffer.from(file, 'base64');
      }
    }

    // 2. Cloudinary Entegrasyonu (Varsayılan ve Öncelikli)
    if (isCloudinaryConfigured() && fileBuffer) {
      const cloudResult = await uploadToCloudinary(fileBuffer, folder);
      if (cloudResult.url) {
        return NextResponse.json({
          success: true,
          url: cloudResult.url,
          publicId: cloudResult.publicId,
          provider: 'cloudinary',
        });
      }
    }

    // 3. Supabase Storage Alternatifi
    if (isSupabaseConfigured() && fileBuffer) {
      const supaResult = await uploadToSupabaseStorage(
        fileBuffer,
        fileName,
        mimeType,
        'safirya-media'
      );
      if (supaResult.url) {
        return NextResponse.json({
          success: true,
          url: supaResult.url,
          provider: 'supabase',
        });
      }
    }

    // 4. Eğer henüz Cloudinary ve Supabase API anahtarları girilmemişse,
    // kesintisiz çalışmayı sürdürmek için optimize edilmiş Data URL döndür
    if (fileBuffer) {
      const base64Fallback = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
      return NextResponse.json({
        success: true,
        url: base64Fallback,
        provider: 'local_base64',
        notice: 'Cloudinary veya Supabase API anahtarları .env dosyasına tanımlandığında otomatik CDN yüklemesi aktif olacaktır.',
      });
    }

    return NextResponse.json(
      { error: 'Dosya işlenemedi.' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Görsel yüklenirken bir hata meydana geldi.' },
      { status: 500 }
    );
  }
}
