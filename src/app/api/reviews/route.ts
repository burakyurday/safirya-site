import { NextRequest, NextResponse } from 'next/server';
import { getProductReviews, addProductReview, calculateRatingSummary } from '@/lib/reviews';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Ürün kimliği (productId) gereklidir.' },
        { status: 400 }
      );
    }

    const reviews = await getProductReviews(productId);
    const summary = calculateRatingSummary(reviews);

    return NextResponse.json({
      success: true,
      reviews,
      summary,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Yorumlar getirilemedi.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, userName, rating, title, comment, images = [], variantName } = body;

    if (!productId || !comment || !rating) {
      return NextResponse.json(
        { success: false, error: 'Lütfen yıldız puanı ve yorum alanlarını eksiksiz doldurunuz.' },
        { status: 400 }
      );
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { success: false, error: 'Puan 1 ile 5 arasında olmalıdır.' },
        { status: 400 }
      );
    }

    const newReview = await addProductReview({
      productId: String(productId).trim(),
      userName: (userName && String(userName).trim()) || 'Safirya Müşterisi',
      rating: numRating,
      title: title ? String(title).trim() : undefined,
      comment: String(comment).trim(),
      images: Array.isArray(images) ? images.filter(Boolean) : [],
      variantName: variantName ? String(variantName).trim() : undefined,
    });

    return NextResponse.json({
      success: true,
      review: newReview,
      message: 'Değerlendirmeniz için teşekkür ederiz! Yorumunuz yayınlandı.',
    });
  } catch (error: any) {
    console.error('Yorum ekleme API hatası:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Yorum kaydedilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
