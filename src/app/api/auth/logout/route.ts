import { NextResponse } from 'next/server';
import { USER_COOKIE_NAME } from '@/lib/auth/userAuth';
import { ADMIN_COOKIE_NAME } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Başarıyla çıkış yapıldı.',
  });

  response.cookies.delete(USER_COOKIE_NAME);
  response.cookies.delete(ADMIN_COOKIE_NAME);

  return response;
}
