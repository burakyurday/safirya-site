import { NextResponse } from 'next/server';

// Sunucu tarafında oturum süresince in-memory (hafızada) sepet deposu
declare global {
  // eslint-disable-next-line no-var
  var __safirya_user_carts: Map<string, any[]> | undefined;
}

const userCarts =
  global.__safirya_user_carts ||
  (global.__safirya_user_carts = new Map<string, any[]>());

// GET /api/cart?userId=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID parametresi gerekli' }, { status: 400 });
    }

    const items = userCarts.get(userId) || [];
    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Sunucu hatası' }, { status: 500 });
  }
}

// POST /api/cart
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, items } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID gerekli' }, { status: 400 });
    }

    if (!Array.isArray(items)) {
      return NextResponse.json({ success: false, error: 'Geçersiz sepet verisi' }, { status: 400 });
    }

    userCarts.set(userId, items);
    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Sunucu hatası' }, { status: 500 });
  }
}

// DELETE /api/cart?userId=...
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID parametresi gerekli' }, { status: 400 });
    }

    userCarts.delete(userId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Sunucu hatası' }, { status: 500 });
  }
}
