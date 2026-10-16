export interface ReviewItem {
  id: string;
  productId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1 - 5
  title?: string;
  comment: string;
  images: string[];
  variantName?: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
}

export interface ProductRatingSummary {
  averageRating: number;
  totalReviews: number;
  photoReviewsCount: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}
