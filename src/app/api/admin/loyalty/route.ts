import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionServer } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';
import { createInitialLoyaltyAccount, calculateTier } from '@/lib/loyalty';
import { LoyaltyTierKey } from '@/types/loyalty';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSessionServer();
    if (!session) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim. Lütfen admin girişi yapınız.' },
        { status: 401 }
      );
    }

    // Tüm kullanıcıları sadakat hesapları ve siparişleriyle çek
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        loyaltyAccount: {
          include: {
            transactions: {
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
        },
        orders: {
          select: {
            id: true,
            totalAmount: true,
          },
        },
      },
    });

    const members = users.map((u) => {
      const ordersCount = u.orders?.length || 0;
      const totalSpent = u.orders?.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0) || Number(u.loyaltyAccount?.totalSpent || 0);

      const points = u.loyaltyAccount?.pointsBalance ?? 100;
      const tier: LoyaltyTierKey = (u.loyaltyAccount?.currentTier as LoyaltyTierKey) || calculateTier(totalSpent);

      return {
        id: u.id,
        name: u.name || 'İsimsiz Üye',
        email: u.email,
        phone: u.phone || '-',
        tier,
        points,
        totalSpent,
        ordersCount,
        joinDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString('tr-TR') : '-',
        hasLoyaltyAccount: Boolean(u.loyaltyAccount),
      };
    });

    return NextResponse.json({
      success: true,
      members,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Sadakat üyeleri alınamadı.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSessionServer();
    if (!session) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim. Lütfen admin girişi yapınız.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { email, pointsDelta, reason } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Geçerli bir üye e-posta adresi belirtiniz.' },
        { status: 400 }
      );
    }

    const delta = Number(pointsDelta);
    if (isNaN(delta) || delta === 0) {
      return NextResponse.json(
        { error: 'Geçerli bir puan miktarı giriniz (0 dışında pozitif veya negatif sayı).' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Kullanıcıyı bul
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: 'insensitive',
        },
      },
      include: {
        loyaltyAccount: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: `"${normalizedEmail}" e-posta adresine sahip kayıtlı üye bulunamadı.` },
        { status: 404 }
      );
    }

    let account = user.loyaltyAccount;

    // Hesabı yoksa önce oluştur
    if (!account) {
      const initial = createInitialLoyaltyAccount(user.id, user.name || undefined);
      account = await prisma.loyaltyAccount.create({
        data: {
          id: initial.id,
          userId: user.id,
          pointsBalance: initial.pointsBalance,
          lifetimePoints: initial.lifetimePoints,
          totalSpent: initial.totalSpent,
          currentTier: initial.currentTier,
          referralCode: initial.referralCode,
        },
      });
    }

    const newBalance = Math.max(0, account.pointsBalance + delta);
    const newLifetime = delta > 0 ? account.lifetimePoints + delta : account.lifetimePoints;
    const newTier = calculateTier(Number(account.totalSpent));

    // Hesabı güncelle
    const updatedAccount = await prisma.loyaltyAccount.update({
      where: { id: account.id },
      data: {
        pointsBalance: newBalance,
        lifetimePoints: newLifetime,
        currentTier: newTier,
      },
    });

    // İşlem geçmişine kaydet
    await prisma.loyaltyTransaction.create({
      data: {
        accountId: account.id,
        type: 'ADMIN_ADJUSTMENT',
        points: delta,
        description: reason?.trim() || (delta > 0 ? 'Yönetici Puan Tanımlaması' : 'Yönetici Puan Düşümü'),
      },
    });

    return NextResponse.json({
      success: true,
      message: `${user.name || user.email} hesabına ${delta > 0 ? '+' : ''}${delta} Safir Puan tanımlandı. Yeni bakiye: ${newBalance} Puan.`,
      account: updatedAccount,
      newBalance,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Puan işlemi gerçekleştirilemedi.' },
      { status: 500 }
    );
  }
}
