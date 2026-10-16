import { NextRequest, NextResponse } from 'next/server';
import { incrementReviewHelpful } from '@/lib/reviews';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reviewId } = body;

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: 'Yorum kimliği (reviewId) gereklidir.' },
        { status: 400 }
      );
    }

    const success = await incrementReviewHelpful(String(reviewId));

    return NextResponse.json({
      success,
      message: success ? 'Geri bildiriminiz kaydedildi.' : 'Yorum bulunamadı.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'İşlem başarısız.' },
      { status: 500 }
    );
  }
}
