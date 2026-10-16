import { NextRequest, NextResponse } from 'next/server';
import {
  getAdminSessionServer,
  listAuthorizedAdmins,
  addAuthorizedAdmin,
  removeAuthorizedAdmin,
} from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/authorities
 * Yetkili yöneticilerin listesini döner.
 */
export async function GET() {
  const session = await getAdminSessionServer();
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Yetkisiz erişim. Yönetici oturumu gereklidir.' },
      { status: 401 }
    );
  }

  try {
    const admins = await listAuthorizedAdmins();
    return NextResponse.json({ success: true, admins });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Yöneticiler listelenemedi.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/authorities
 * Yeni bir e-posta adresine yönetici yetkisi verir.
 * Body: { email: string, name?: string }
 */
export async function POST(req: NextRequest) {
  const session = await getAdminSessionServer();
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Yetkisiz erişim. Yönetici oturumu gereklidir.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { email, name } = body as { email?: string; name?: string };

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Lütfen yetkilendirilecek e-posta adresini giriniz.' },
        { status: 400 }
      );
    }

    const result = await addAuthorizedAdmin(email, {
      name,
      addedBy: session.username,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    const updatedList = await listAuthorizedAdmins(true);
    return NextResponse.json({
      success: true,
      message: `${email} adresine yönetim paneli yetkisi başarıyla verildi.`,
      admins: updatedList,
      admin: result.admin,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Yönetici yetkisi verilirken hata oluştu.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/authorities
 * Bir e-posta adresinin yönetici yetkisini kaldırır.
 * Body: { email: string }
 */
export async function DELETE(req: NextRequest) {
  const session = await getAdminSessionServer();
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Yetkisiz erişim. Yönetici oturumu gereklidir.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { email } = body as { email?: string };

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Lütfen yetkisi kaldırılacak e-posta adresini belirtiniz.' },
        { status: 400 }
      );
    }

    const result = await removeAuthorizedAdmin(email);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    const updatedList = await listAuthorizedAdmins(true);
    return NextResponse.json({
      success: true,
      message: `${email} adresinin yönetim paneli yetkisi kaldırıldı.`,
      admins: updatedList,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Yetki kaldırılırken hata oluştu.' },
      { status: 500 }
    );
  }
}
