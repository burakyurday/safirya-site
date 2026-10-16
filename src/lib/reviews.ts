import { ReviewItem, ProductRatingSummary } from '@/types/review';
import { supabaseAdmin } from '@/lib/supabase';
import prisma from '@/lib/prisma';

const BUCKET_NAME = 'safirya-media';
const REVIEWS_FILE_PATH = 'reviews/all.json';

// Kaliteli, zanaatkar Safirya atölyesi müşteri yorumları (fotoğraflı)
export const INITIAL_ARTISAN_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-sfr-1',
    productId: 'soz-nisan-numune-deneyim-kiti',
    userName: 'Buse T.',
    rating: 5,
    title: 'Söz hediyeliğimiz için numune aldık, bayıldık!',
    comment:
      'Nişanımız için 75 adet sipariş vermeden önce numune kitini denemek istedik. Ahşap fitil çıtırtısı ve vanilya-lavanta kokusu salonu öyle güzel kapladı ki tereddütsüz toplu siparişimizi verdik. Numune ücretinin siparişten düşülmesi de çok ince bir jest.',
    images: [
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=80',
    ],
    variantName: 'Vanilya & Fransız Lavantası',
    isVerifiedPurchase: true,
    helpfulCount: 24,
    createdAt: '2026-10-12T14:32:00.000Z',
  },
  {
    id: 'rev-sfr-2',
    productId: 'soz-nisan-numune-deneyim-kiti',
    userName: 'Ceren A.',
    rating: 5,
    title: 'Kişiselleştirilmiş etiket ve kraft kutulama harika',
    comment:
      'Etiketteki kaligrafi yazı fontu ve mühür çok zarif. Kırılmaması için ambalajı çok özenli yapmışlar, hiçbir hasar olmadan 2 günde İzmir Karşıyaka atölyesinden ulaştı.',
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    ],
    variantName: 'Amber & Sandal Ağacı',
    isVerifiedPurchase: true,
    helpfulCount: 18,
    createdAt: '2026-10-10T09:15:00.000Z',
  },
  {
    id: 'rev-sfr-3',
    productId: 'dogal-kehribar-cam-kavanoz-soya-mumu',
    userName: 'Mert Y.',
    rating: 5,
    title: 'Gerçek soya mumu farkı!',
    comment:
      'Piyasadaki parafin mumlar gibi kesinlikle baş ağrısı veya siyah is yapmıyor. Ahşap fitilin yanış sesi insanı dinlendiriyor. Çalışma masamın vazgeçilmezi oldu.',
    images: [
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    ],
    variantName: '210g Kehribar Cam / Lavanta & Sandal',
    isVerifiedPurchase: true,
    helpfulCount: 31,
    createdAt: '2026-10-08T18:45:00.000Z',
  },
  {
    id: 'rev-sfr-4',
    productId: 'dogal-kehribar-cam-kavanoz-soya-mumu',
    userName: 'Selin D.',
    rating: 5,
    title: 'Hem dekoratif hem de çok kalıcı koku',
    comment:
      'Amber cam kavanozun vintage dokusu ve kapağı çok şık. Yakmadığınızda dahi odaya hafif bir vanilya esintisi yayılıyor. İkinciyi hediye olarak sipariş verdim.',
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    ],
    variantName: '210g Kehribar Cam / Vanilya',
    isVerifiedPurchase: true,
    helpfulCount: 12,
    createdAt: '2026-10-05T11:20:00.000Z',
  },
  {
    id: 'rev-sfr-5',
    productId: 'kisiye-ozel-isimli-soya-mumu',
    userName: 'Gizem & Kaan',
    rating: 5,
    title: 'Nikah masamızın başrolüydü!',
    comment:
      'İsimlerimizin ve nikah tarihimizin yazılı olduğu altın yaldızlı etiketler kusursuz basılmış. Misafirlerimizin hepsi kokusuna ve zarafetine bayıldı. Safirya ekibine ilgileri için teşekkürler.',
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=80',
    ],
    variantName: 'Altın Varaklı İsim Baskılı / Pudra & Gül',
    isVerifiedPurchase: true,
    helpfulCount: 45,
    createdAt: '2026-09-28T16:10:00.000Z',
  },
  {
    id: 'rev-sfr-6',
    productId: 'safir-okyanus-dalgali-epoksi-sunumluk',
    userName: 'Deniz K.',
    rating: 5,
    title: 'Gerçek bir zanaat eseri, masif ceviz kalitesi muazzam',
    comment:
      'Epoksinin okyanus mavisi tonları ve dalga efektleri fotoğraflardakinden çok daha canlı. Fırınlanmış masif ceviz ağacının damarları harika görünüyor.',
    images: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    ],
    variantName: 'Masif Ceviz / Safir Mavi Dalgalı',
    isVerifiedPurchase: true,
    helpfulCount: 19,
    createdAt: '2026-10-02T13:40:00.000Z',
  },
];

let memoryReviewsCache: { data: ReviewItem[]; timestamp: number } | null = null;

/**
 * Tüm yorumları Supabase Cloud Storage veya seed verisinden okur
 */
export async function getAllReviews(): Promise<ReviewItem[]> {
  if (memoryReviewsCache && Date.now() - memoryReviewsCache.timestamp < 10000) {
    return memoryReviewsCache.data;
  }

  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .download(REVIEWS_FILE_PATH);

      if (!error && data) {
        const text = await data.text();
        const parsed = JSON.parse(text) as ReviewItem[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryReviewsCache = { data: parsed, timestamp: Date.now() };
          return parsed;
        }
      }
    } catch {}
  }

  memoryReviewsCache = { data: INITIAL_ARTISAN_REVIEWS, timestamp: Date.now() };
  return INITIAL_ARTISAN_REVIEWS;
}

/**
 * Belirli bir ürüne ait onaylı yorumları getirir
 */
export async function getProductReviews(productIdOrSlug: string): Promise<ReviewItem[]> {
  const all = await getAllReviews();
  const cleanKey = productIdOrSlug.toLowerCase().trim();

  // Hem slug hem ID ile eşleştir
  return all.filter(
    (r) =>
      r.productId.toLowerCase() === cleanKey ||
      (cleanKey.includes('numune') && r.productId.includes('numune')) ||
      (cleanKey.includes('kehribar') && r.productId.includes('kehribar')) ||
      (cleanKey.includes('isimli') && r.productId.includes('isimli'))
  );
}

/**
 * Yeni fotoğraflı müşteri yorumu ekler
 */
export async function addProductReview(
  newReviewData: Omit<ReviewItem, 'id' | 'createdAt' | 'helpfulCount' | 'isVerifiedPurchase'>
): Promise<ReviewItem> {
  const all = await getAllReviews();

  const newReview: ReviewItem = {
    ...newReviewData,
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    helpfulCount: 0,
    isVerifiedPurchase: true,
  };

  const updatedReviews = [newReview, ...all];
  memoryReviewsCache = { data: updatedReviews, timestamp: Date.now() };

  if (supabaseAdmin) {
    try {
      const payload = Buffer.from(JSON.stringify(updatedReviews, null, 2), 'utf-8');
      await supabaseAdmin.storage.from(BUCKET_NAME).upload(REVIEWS_FILE_PATH, payload, {
        contentType: 'application/json',
        upsert: true,
      });
    } catch (err) {
      console.warn('Yorum buluta kaydedilirken uyarı:', err);
    }
  }

  // Prisma DB varsa senkronize etmeyi dene
  try {
    await prisma.productReview.create({
      data: {
        productId: newReview.productId,
        userName: newReview.userName,
        rating: newReview.rating,
        title: newReview.title || null,
        comment: newReview.comment,
        images: newReview.images,
        variantName: newReview.variantName || null,
        isVerifiedPurchase: true,
      },
    });
  } catch {}

  return newReview;
}

/**
 * Yorum "Faydalı Buldum" oyunu 1 artırır
 */
export async function incrementReviewHelpful(reviewId: string): Promise<boolean> {
  const all = await getAllReviews();
  const target = all.find((r) => r.id === reviewId);
  if (!target) return false;

  target.helpfulCount += 1;
  memoryReviewsCache = { data: all, timestamp: Date.now() };

  if (supabaseAdmin) {
    try {
      const payload = Buffer.from(JSON.stringify(all, null, 2), 'utf-8');
      await supabaseAdmin.storage.from(BUCKET_NAME).upload(REVIEWS_FILE_PATH, payload, {
        contentType: 'application/json',
        upsert: true,
      });
    } catch {}
  }

  return true;
}

/**
 * Yorum listesinden ortalama puan ve dağılım istatistikleri üretir
 */
export function calculateRatingSummary(reviews: ReviewItem[]): ProductRatingSummary {
  if (!reviews || reviews.length === 0) {
    return {
      averageRating: 5.0,
      totalReviews: 0,
      photoReviewsCount: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let totalScore = 0;
  let photoCount = 0;

  for (const r of reviews) {
    const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[star] += 1;
    totalScore += r.rating;
    if (r.images && r.images.length > 0) {
      photoCount += 1;
    }
  }

  const average = Number((totalScore / reviews.length).toFixed(1));

  return {
    averageRating: average,
    totalReviews: reviews.length,
    photoReviewsCount: photoCount,
    ratingDistribution: distribution,
  };
}
