import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  // Returns empty list or default notifications
  const defaultList = [
    {
      id: 'notif-welcome',
      title: '✨ Safirya Atölyesi’ne Hoş Geldiniz!',
      message: 'İzmir Karşıyaka atölyemizde özenle dökülen doğal soya mumları ve zanaatkar objelerimizi keşfedin.',
      type: 'system',
      isRead: false,
      createdAt: new Date().toISOString(),
      link: '/kategoriler',
    },
  ];

  return NextResponse.json({
    success: true,
    notifications: defaultList,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({
      success: true,
      notification: {
        ...body,
        id: `notif-${Date.now()}`,
        createdAt: new Date().toISOString(),
        isRead: false,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
