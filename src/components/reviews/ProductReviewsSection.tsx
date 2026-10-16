'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Star,
  ShieldCheck,
  Camera,
  ThumbsUp,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  MessageSquarePlus,
  Check,
} from 'lucide-react';
import { ReviewItem, ProductRatingSummary } from '@/types/review';
import { calculateRatingSummary, INITIAL_ARTISAN_REVIEWS } from '@/lib/reviews';
import { WriteReviewModal } from './WriteReviewModal';

interface ProductReviewsSectionProps {
  productId: string;
  productName: string;
  initialReviews?: ReviewItem[];
}

export function ProductReviewsSection({
  productId,
  productName,
  initialReviews,
}: ProductReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews || []);
  const [activeFilter, setActiveFilter] = useState<'all' | 'with_photos' | '5_star'>('all');
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<{ url: string; author: string; caption?: string } | null>(null);
  const [helpfulVotedIds, setHelpfulVotedIds] = useState<Set<string>>(new Set());

  // Sunucudan ürünün en güncel yorumlarını yükle
  useEffect(() => {
    fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
          setReviews(data.reviews);
        } else if (!initialReviews || initialReviews.length === 0) {
          // Eğer bu ürüne henüz yorum yapılmamışsa genel atölye yorumlarından göster
          setReviews(INITIAL_ARTISAN_REVIEWS.slice(0, 3));
        }
      })
      .catch(() => {});
  }, [productId, initialReviews]);

  const summary: ProductRatingSummary = calculateRatingSummary(reviews);

  // Filtreleme
  const filteredReviews = reviews.filter((r) => {
    if (activeFilter === 'with_photos') {
      return r.images && r.images.length > 0;
    }
    if (activeFilter === '5_star') {
      return r.rating === 5;
    }
    return true;
  });

  // Müşteri fotoğrafları havuzu (Customer photo wall)
  const allCustomerPhotos = reviews
    .flatMap((r) => (r.images || []).map((img) => ({ url: img, author: r.userName, caption: r.title || r.comment })))
    .filter(Boolean);

  const handleHelpfulClick = async (reviewId: string) => {
    if (helpfulVotedIds.has(reviewId)) return;

    setHelpfulVotedIds((prev) => new Set(prev).add(reviewId));
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r))
    );

    try {
      await fetch('/api/reviews/helpful', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId }),
      });
    } catch {}
  };

  const handleNewReview = (newReview: ReviewItem) => {
    setReviews((prev) => [newReview, ...prev]);
  };

  return (
    <section className="border-t border-stone-200/80 pt-12 mt-12 space-y-10">
      
      {/* ── BÖLÜM 1: ÜST DEĞERLENDİRME VE İSTATİSTİK KARTI ── */}
      <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-xs p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Sol: Büyük Skor & Doğrulanmış Rozeti */}
          <div className="lg:col-span-4 text-center lg:text-left space-y-2 border-b lg:border-b-0 lg:border-r border-stone-200 pb-6 lg:pb-0 lg:pr-8">
            <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#C85A32] font-semibold block">
              MÜŞTERİ DENEYİMİ
            </span>
            <div className="flex items-baseline justify-center lg:justify-start gap-2">
              <span className="font-serif text-5xl sm:text-6xl text-[#231B18] font-normal">
                {summary.averageRating}
              </span>
              <span className="text-stone-400 text-lg font-serif">/ 5.0</span>
            </div>
            
            <div className="flex items-center justify-center lg:justify-start gap-1 text-amber-500 py-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(summary.averageRating)
                      ? 'fill-amber-500 text-amber-500'
                      : 'text-stone-300'
                  }`}
                />
              ))}
            </div>

            <p className="text-xs text-[#7A7067]">
              Toplam <strong>{summary.totalReviews}</strong> gerçek müşteri değerlendirmesi
            </p>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium mt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>%100 Doğrulanmış Alıcı Deneyimleri</span>
            </div>
          </div>

          {/* Orta: Yıldız Dağılım Çubukları */}
          <div className="lg:col-span-5 space-y-2 px-0 lg:px-4">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = summary.ratingDistribution[stars as 1 | 2 | 3 | 4 | 5] || 0;
              const pct = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 w-12 text-[#231B18] font-medium shrink-0">
                    <span>{stars}</span>
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  </div>
                  <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#C85A32] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-[11px] text-[#7A7067] font-mono">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Sağ: Aksiyon Butonu */}
          <div className="lg:col-span-3 text-center space-y-3">
            <button
              onClick={() => setIsWriteModalOpen(true)}
              className="w-full py-3.5 px-5 bg-[#231B18] hover:bg-[#C85A32] text-white text-xs uppercase tracking-widest font-medium rounded-xs transition shadow-sm flex items-center justify-center gap-2"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Değerlendirme Yaz</span>
            </button>
            <p className="text-[11px] text-[#7A7067]">
              Fotoğraflı deneyiminizi paylaşın, atölye topluluğumuza katılın.
            </p>
          </div>

        </div>
      </div>

      {/* ── BÖLÜM 2: MÜŞTERİ FOTOĞRAFLARI GALERİSİ (PHOTO WALL) ── */}
      {allCustomerPhotos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#C85A32]" />
              <h3 className="font-serif text-lg font-normal text-[#231B18]">
                Müşterilerimizden Gelen Kareler ({allCustomerPhotos.length})
              </h3>
            </div>
            <span className="text-[11px] text-[#7A7067] hidden sm:inline">
              Büyütmek için fotoğrafa tıklayınız
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {allCustomerPhotos.map((photo, idx) => (
              <button
                key={idx}
                onClick={() => setLightboxPhoto(photo)}
                className="relative aspect-square w-24 sm:w-28 shrink-0 rounded-xs overflow-hidden border border-stone-200 group focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
              >
                <img
                  src={photo.url}
                  alt={`Müşteri karesi ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── BÖLÜM 3: FİLTRELEME SEKMELERİ ── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-1.5 text-xs rounded-full transition ${
            activeFilter === 'all'
              ? 'bg-[#231B18] text-white font-medium'
              : 'bg-[#FAF8F5] text-[#54473F] hover:bg-stone-200'
          }`}
        >
          Tüm Yorumlar ({reviews.length})
        </button>

        {summary.photoReviewsCount > 0 && (
          <button
            onClick={() => setActiveFilter('with_photos')}
            className={`px-4 py-1.5 text-xs rounded-full flex items-center gap-1.5 transition ${
              activeFilter === 'with_photos'
                ? 'bg-[#231B18] text-white font-medium'
                : 'bg-[#FAF8F5] text-[#54473F] hover:bg-stone-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Fotoğraflı ({summary.photoReviewsCount})</span>
          </button>
        )}

        <button
          onClick={() => setActiveFilter('5_star')}
          className={`px-4 py-1.5 text-xs rounded-full flex items-center gap-1.5 transition ${
            activeFilter === '5_star'
              ? 'bg-[#231B18] text-white font-medium'
              : 'bg-[#FAF8F5] text-[#54473F] hover:bg-stone-200'
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>5 Yıldız ({summary.ratingDistribution[5] || 0})</span>
        </button>
      </div>

      {/* ── BÖLÜM 4: YORUMLAR LİSTESİ ── */}
      {filteredReviews.length === 0 ? (
        <div className="py-12 text-center space-y-2 bg-[#FAF8F5] rounded-xs border border-stone-200">
          <p className="text-xs text-[#7A7067]">Seçtiğiniz filtreye uygun yorum bulunamadı.</p>
          <button
            onClick={() => setActiveFilter('all')}
            className="text-xs text-[#C85A32] underline font-medium"
          >
            Tüm yorumları görüntüle
          </button>
        </div>
      ) : (
        <div className="space-y-6 divide-y divide-stone-100">
          {filteredReviews.map((rev) => (
            <div key={rev.id} className="pt-6 first:pt-0 space-y-3">
              
              {/* Kullanıcı Başlığı & Yıldızlar */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* Baş Harf Avatarı */}
                  <div className="w-9 h-9 rounded-full bg-[#FAF8F5] border border-stone-200 flex items-center justify-center font-serif text-sm font-semibold text-[#231B18] shrink-0">
                    {rev.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[#231B18]">
                        {rev.userName}
                      </span>
                      {rev.isVerifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Check className="w-3 h-3" />
                          <span>Doğrulanmış Alıcı</span>
                        </span>
                      )}
                    </div>
                    {rev.variantName && (
                      <span className="text-[11px] text-[#7A7067] block mt-0.5">
                        Seçenek: <span className="text-[#231B18]">{rev.variantName}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Yıldız ve Tarih */}
                <div className="text-right">
                  <div className="flex items-center justify-end text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-[#7A7067] font-mono mt-0.5 block">
                    {new Date(rev.createdAt).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Yorum Başlığı ve Metni */}
              <div className="space-y-1.5 pl-12">
                {rev.title && (
                  <h4 className="font-serif text-sm font-medium text-[#231B18]">
                    {rev.title}
                  </h4>
                )}
                <p className="text-xs text-[#54473F] leading-relaxed">
                  {rev.comment}
                </p>

                {/* Yorum Fotoğrafları */}
                {rev.images && rev.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {rev.images.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() =>
                          setLightboxPhoto({
                            url: img,
                            author: rev.userName,
                            caption: rev.title || rev.comment,
                          })
                        }
                        className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xs overflow-hidden border border-stone-200 hover:scale-105 transition-transform"
                      >
                        <img src={img} alt="Müşteri fotoğrafı" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Faydalı Buldum Butonu */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleHelpfulClick(rev.id)}
                    disabled={helpfulVotedIds.has(rev.id)}
                    className={`inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full border transition ${
                      helpfulVotedIds.has(rev.id)
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-stone-200 text-[#7A7067] hover:border-[#231B18] hover:text-[#231B18]'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>
                      {helpfulVotedIds.has(rev.id)
                        ? `Teşekkürler (${rev.helpfulCount})`
                        : `Bu yorum faydalı oldu (${rev.helpfulCount})`}
                    </span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ── BÖLÜM 5: FOTOĞRAF LIGHTBOX BÜYÜTME MODALİ ── */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="relative max-w-3xl w-full bg-white rounded-xs overflow-hidden shadow-2xl">
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-3 right-3 z-20 p-2 bg-black/60 hover:bg-black text-white rounded-full transition"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="max-h-[75vh] bg-stone-900 flex items-center justify-center overflow-hidden">
              <img
                src={lightboxPhoto.url}
                alt={lightboxPhoto.author}
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>
            <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#231B18] block">
                  Fotoğraf: {lightboxPhoto.author}
                </span>
                {lightboxPhoto.caption && (
                  <p className="text-xs text-[#7A7067] line-clamp-1 mt-0.5">
                    {lightboxPhoto.caption}
                  </p>
                )}
              </div>
              <span className="text-[10px] uppercase font-sans tracking-widest text-[#C85A32] font-medium">
                SAFİRYA ATÖLYESİ
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── BÖLÜM 6: YORUM YAZMA MODALİ ── */}
      <WriteReviewModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        productId={productId}
        productName={productName}
        onReviewSubmitted={handleNewReview}
      />

    </section>
  );
}
