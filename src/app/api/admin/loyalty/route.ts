import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionServer } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase';
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

    // 1. Önce Prisma ile çekmeyi dene
    try {
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
        const totalSpent =
          u.orders?.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0) ||
          Number(u.loyaltyAccount?.totalSpent || 0);

        const points = u.loyaltyAccount?.pointsBalance ?? 100;
        const tier: LoyaltyTierKey =
          (u.loyaltyAccount?.currentTier as LoyaltyTierKey) || calculateTier(totalSpent);

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
    } catch (prismaErr) {
      console.warn('Prisma GET loyalty hatası, Supabase REST fallback devreye giriyor:', prismaErr);
    }

    // 2. Prisma hata verdiyse Supabase REST API ile çek
    if (supabaseAdmin) {
      const { data: dbUsers } = await supabaseAdmin
        .from('users')
        .select('*')
        .order('createdAt', { ascending: false });

      const { data: dbAccounts } = await supabaseAdmin
        .from('loyalty_accounts')
        .select('*');

      const { data: dbOrders } = await supabaseAdmin
        .from('orders')
        .select('id, userId, totalAmount');

      const accountsMap = new Map((dbAccounts || []).map((a: any) => [a.userId, a]));
      const ordersMap = new Map<string, { count: number; total: number }>();
      (dbOrders || []).forEach((o: any) => {
        if (!o.userId) return;
        const current = ordersMap.get(o.userId) || { count: 0, total: 0 };
        ordersMap.set(o.userId, {
          count: current.count + 1,
          total: current.total + Number(o.totalAmount || 0),
        });
      });

      const members = (dbUsers || []).map((u: any) => {
        const orderInfo = ordersMap.get(u.id) || { count: 0, total: 0 };
        const acc = accountsMap.get(u.id);
        const points = acc ? acc.pointsBalance : 100;
        const totalSpent = orderInfo.total || (acc ? Number(acc.totalSpent || 0) : 0);
        const tier: LoyaltyTierKey =
          (acc?.currentTier as LoyaltyTierKey) || calculateTier(totalSpent);

        return {
          id: u.id,
          name: u.name || 'İsimsiz Üye',
          email: u.email,
          phone: u.phone || '-',
          tier,
          points,
          totalSpent,
          ordersCount: orderInfo.count,
          joinDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString('tr-TR') : '-',
          hasLoyaltyAccount: Boolean(acc),
        };
      });

      return NextResponse.json({
        success: true,
        members,
      });
    }

    return NextResponse.json({
      success: true,
      members: [],
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

    // 1. Önce Prisma ile işlem yapmayı dene
    let prismaSuccess = false;
    let resultAccount: any = null;
    let targetUserName: string = normalizedEmail;

    try {
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

      if (user) {
        targetUserName = user.name || user.email;
        let account = user.loyaltyAccount;

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

        resultAccount = await prisma.loyaltyAccount.update({
          where: { id: account.id },
          data: {
            pointsBalance: newBalance,
            lifetimePoints: newLifetime,
            currentTier: newTier,
          },
        });

        await prisma.loyaltyTransaction.create({
          data: {
            accountId: account.id,
            type: 'ADMIN_ADJUSTMENT',
            points: delta,
            description: reason?.trim() || (delta > 0 ? 'Yönetici Puan Tanımlaması' : 'Yönetici Puan Düşümü'),
          },
        });

        prismaSuccess = true;
      }
    } catch (prismaErr) {
      console.warn('Prisma POST loyalty hatası, Supabase REST API fallback çalıştırılıyor:', prismaErr);
    }

    // 2. Prisma başarılı olduysa hemen dön
    if (prismaSuccess && resultAccount) {
      return NextResponse.json({
        success: true,
        message: `${targetUserName} hesabına ${delta > 0 ? '+' : ''}${delta} Safir Puan tanımlandı. Güncel Bakiye: ${resultAccount.pointsBalance} Puan.`,
        account: resultAccount,
        newBalance: resultAccount.pointsBalance,
      });
    }

    // 3. Supabase REST API ile gerçekleştir (Fallback / Güvenli HTTP Bağlantısı)
    if (supabaseAdmin) {
      // A) public.users tablosunda ara
      let { data: user } = await supabaseAdmin
        .from('users')
        .select('*')
        .ilike('email', normalizedEmail)
        .maybeSingle();

      // B) users tablosunda yoksa Supabase Auth'ta ara
      if (!user) {
        try {
          const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
          const authUser = authData?.users?.find(
            (u) => u.email?.toLowerCase().trim() === normalizedEmail
          );

          if (authUser) {
            const newUserId = authUser.id;
            const newUserName =
              authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Safirya Üyesi';

            const { data: createdUser } = await supabaseAdmin
              .from('users')
              .insert({
                id: newUserId,
                email: normalizedEmail,
                name: newUserName,
                role: 'CUSTOMER',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })
              .select()
              .single();

            user = createdUser;
          }
        } catch (authErr) {
          console.warn('Supabase Auth arama uyarısı:', authErr);
        }
      }

      // C) Kullanıcı hala bulunamadıysa yeni kullanıcı oluştur
      if (!user) {
        const generatedId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const generatedName = normalizedEmail.split('@')[0];
        const { data: createdUser, error: cErr } = await supabaseAdmin
          .from('users')
          .insert({
            id: generatedId,
            email: normalizedEmail,
            name: generatedName,
            role: 'CUSTOMER',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .select()
          .single();

        if (cErr || !createdUser) {
          return NextResponse.json(
            { error: `"${normalizedEmail}" adresine ait üye kaydı bulunamadı ve oluşturulamadı.` },
            { status: 404 }
          );
        }
        user = createdUser;
      }

      targetUserName = user.name || user.email;

      // D) Sadakat hesabını bul veya oluştur
      let { data: account } = await supabaseAdmin
        .from('loyalty_accounts')
        .select('*')
        .eq('userId', user.id)
        .maybeSingle();

      const now = new Date().toISOString();

      if (!account) {
        const initial = createInitialLoyaltyAccount(user.id, user.name);
        const { data: createdAccount, error: accErr } = await supabaseAdmin
          .from('loyalty_accounts')
          .insert({
            id: initial.id,
            userId: user.id,
            pointsBalance: initial.pointsBalance,
            lifetimePoints: initial.lifetimePoints,
            totalSpent: initial.totalSpent,
            currentTier: initial.currentTier,
            referralCode: initial.referralCode,
            createdAt: now,
            updatedAt: now,
          })
          .select()
          .single();

        if (accErr || !createdAccount) {
          throw new Error(accErr?.message || 'Sadakat hesabı oluşturulamadı.');
        }
        account = createdAccount;
      }

      const currentBalance = Number(account.pointsBalance || 0);
      const currentLifetime = Number(account.lifetimePoints || 0);
      const newBalance = Math.max(0, currentBalance + delta);
      const newLifetime = delta > 0 ? currentLifetime + delta : currentLifetime;
      const newTier = calculateTier(Number(account.totalSpent || 0));

      // E) Hesabı güncelle
      const { data: updatedAccount, error: updateErr } = await supabaseAdmin
        .from('loyalty_accounts')
        .update({
          pointsBalance: newBalance,
          lifetimePoints: newLifetime,
          currentTier: newTier,
          updatedAt: now,
        })
        .eq('id', account.id)
        .select()
        .single();

      if (updateErr) {
        throw new Error(updateErr.message || 'Puan bakiyesi güncellenemedi.');
      }

      // F) İşlem geçmişine hareket ekle
      await supabaseAdmin.from('loyalty_transactions').insert({
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        accountId: account.id,
        type: 'ADMIN_ADJUSTMENT',
        points: delta,
        description: reason?.trim() || (delta > 0 ? 'Yönetici Puan Tanımlaması' : 'Yönetici Puan Düşümü'),
        createdAt: now,
      });

      return NextResponse.json({
        success: true,
        message: `${targetUserName} hesabına ${delta > 0 ? '+' : ''}${delta} Safir Puan tanımlandı. Güncel Bakiye: ${newBalance} Puan.`,
        account: updatedAccount,
        newBalance,
      });
    }

    return NextResponse.json(
      { error: 'Veritabanı bağlantısı sağlanamadı.' },
      { status: 500 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Puan işlemi gerçekleştirilemedi.' },
      { status: 500 }
    );
  }
}
