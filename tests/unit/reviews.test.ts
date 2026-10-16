import { describe, it, expect } from 'vitest';
import { calculateRatingSummary } from '@/lib/reviews';
import { ReviewItem } from '@/types/review';

describe('calculateRatingSummary - Değerlendirme & Yorum İstatistikleri', () => {
  it('boş yorum dizisi için varsayılan değerleri dönmelidir', () => {
    const summary = calculateRatingSummary([]);
    expect(summary.totalReviews).toBe(0);
    expect(summary.averageRating).toBe(5.0);
    expect(summary.photoReviewsCount).toBe(0);
    expect(summary.ratingDistribution[5]).toBe(0);
  });

  it('ortalama puanı ve yıldız dağılımını doğru hesaplamalıdır', () => {
    const mockReviews: ReviewItem[] = [
      {
        id: '1',
        productId: 'prod-1',
        userName: 'Ahmet',
        rating: 5,
        comment: 'Harika bir ürün',
        images: ['https://example.com/photo1.jpg'],
        isVerifiedPurchase: true,
        helpfulCount: 2,
        createdAt: '2026-10-10',
      },
      {
        id: '2',
        productId: 'prod-1',
        userName: 'Mehmet',
        rating: 5,
        comment: 'Çok beğendim',
        images: [],
        isVerifiedPurchase: true,
        helpfulCount: 0,
        createdAt: '2026-10-11',
      },
      {
        id: '3',
        productId: 'prod-1',
        userName: 'Ayşe',
        rating: 4,
        comment: 'Güzel ama kargo biraz gecikti',
        images: ['https://example.com/photo2.jpg', 'https://example.com/photo3.jpg'],
        isVerifiedPurchase: true,
        helpfulCount: 5,
        createdAt: '2026-10-12',
      },
    ];

    const summary = calculateRatingSummary(mockReviews);

    expect(summary.totalReviews).toBe(3);
    // (5 + 5 + 4) / 3 = 14 / 3 = 4.666... -> 4.7
    expect(summary.averageRating).toBe(4.7);
    expect(summary.photoReviewsCount).toBe(2);
    expect(summary.ratingDistribution[5]).toBe(2);
    expect(summary.ratingDistribution[4]).toBe(1);
    expect(summary.ratingDistribution[3]).toBe(0);
  });
});
