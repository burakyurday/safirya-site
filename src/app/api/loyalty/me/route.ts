import { NextRequest, NextResponse } from 'next/server';
import { verifyUserSessionToken, USER_COOKIE_NAME } from '@/lib/auth/userAuth';
import prisma from '@/lib/prisma';
import { createInitialLoyaltyAccount, calculateTier } from '@/lib/loyalty';
import { LoyaltyAccount } from '@/types/loyalty';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(USER_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ success: false, account: null, message: 'Giriş yapılmadı' });
    }

    const payload = await verifyUserSessionToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, account: null, message: 'Geçersiz oturum' });
    }

    const userId = payload.id;
    const userName = payload.name;

    // Prisma DB sorgusu
    try {
      const dbAccount = await prisma.loyaltyAccount.findUnique({
        where: { userId },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
        },
      });

      if (dbAccount) {
        const account: LoyaltyAccount = {
          id: dbAccount.id,
          userId: dbAccount.userId,
          pointsBalance: dbAccount.pointsBalance,
          lifetimePoints: dbAccount.lifetimePoints,
          totalSpent: Number(dbAccount.totalSpent),
          currentTier: dbAccount.currentTier as any,
          referralCode: dbAccount.referralCode,
          referredByCode: dbAccount.referredByCode || undefined,
          birthday: dbAccount.birthday ? dbAccount.birthday.toISOString() : undefined,
          transactions: dbAccount.transactions.map((tx) => ({
            id: tx.id,
            type: tx.type as any,
            points: tx.points,
            description: tx.description,
            orderNumber: tx.orderNumber || undefined,
            createdAt: tx.createdAt.toISOString(),
          })),
        };

        return NextResponse.json({ success: true, account });
      }

      // Veritabanında henüz hesap yoksa yeni oluştur
      const initial = createInitialLoyaltyAccount(userId, userName);
      const created = await prisma.loyaltyAccount.create({
        data: {
          id: initial.id,
          userId: initial.userId,
          pointsBalance: initial.pointsBalance,
          lifetimePoints: initial.lifetimePoints,
          totalSpent: initial.totalSpent,
          currentTier: initial.currentTier,
          referralCode: initial.referralCode,
          transactions: {
            create: initial.transactions.map((t) => ({
              id: t.id,
              type: t.type,
              points: t.points,
              description: t.description,
            })),
          },
        },
        include: {
          transactions: true,
        },
      });

      return NextResponse.json({
        success: true,
        account: {
          ...initial,
          id: created.id,
        },
      });
    } catch {
      // Veritabanı bağlantısı yoksa (local fallback)
      const fallbackAccount = createInitialLoyaltyAccount(userId, userName);
      return NextResponse.json({ success: true, account: fallbackAccount, isFallback: true });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Sadakat hesabı alınamadı' },
      { status: 500 }
    );
  }
}
