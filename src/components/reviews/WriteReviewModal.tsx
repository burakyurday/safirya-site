'use client';

import React, { useState } from 'react';
import { X, Star, Upload, Trash2, CheckCircle2, Sparkles } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { ReviewItem } from '@/types/review';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  onReviewSubmitted: (newReview: ReviewItem) => void;
}

export function WriteReviewModal({
  isOpen,
  onClose,
  productId,
  productName,
  onReviewSubmitted,
}: WriteReviewModalProps) {
  const { currentUser } = useStore();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [userName, setUserName] = useState<string>(currentUser?.name || '');
  const [title, setTitle] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [variantName, setVariantName] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Fotoğraf dosyasını base64 data URL'e dönüştürür (veya dosya yükleyici)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 5) {
      setErrorMsg('En fazla 5 adet fotoğraf ekleyebilirsiniz.');
      return;
    }

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Lütfen sadece resim dosyası seçiniz.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Her fotoğraf en fazla 5MB boyutunda olabilir.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result as string;
        if (result) {
          setImages((prev) => [...prev, result]);
          setErrorMsg('');
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!comment.trim()) {
      setErrorMsg('Lütfen deneyiminizi anlatan bir yorum yazınız.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          userName: userName.trim() || 'Safirya Müşterisi',
          rating,
          title: title.trim() || undefined,
          comment: comment.trim(),
          images,
          variantName: variantName.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Yorum gönderilemedi.');
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);
      onReviewSubmitted(data.review);

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch {
      setErrorMsg('Yorum gönderilirken bağlantı hatası oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-xs border border-stone-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Başlık Çubuğu */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-[#FAF8F5]">
          <div>
            <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#C85A32] font-semibold block">
              ZANAATKAR DEĞERLENDİRMESİ
            </span>
            <h2 className="font-serif text-lg font-normal text-[#231B18] mt-0.5">
              Ürünü Değerlendir & Fotoğraf Paylaş
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 hover:text-[#231B18] transition"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Alanı */}
        <div className="p-6 overflow-y-auto space-y-5">
          {isSuccess ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-serif text-xl text-[#231B18]">Değerlendirmeniz Alındı!</h3>
              <p className="text-xs text-[#7A7067]">
                Atölyemize ve diğer zanaat severlere katkınız için teşekkür ederiz.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xs">
                  {errorMsg}
                </div>
              )}

              {/* Ürün İsmi Hatırlatma */}
              <div className="p-3 bg-[#FAF8F5] rounded-xs border border-stone-200 text-xs text-[#54473F]">
                <span className="text-[#7A7067]">Değerlendirilen Ürün:</span>{' '}
                <span className="font-semibold text-[#231B18]">{productName}</span>
              </div>

              {/* Puan Seçimi (Yıldızlar) */}
              <div>
                <label className="block text-xs font-semibold text-[#231B18] uppercase tracking-wider mb-1.5">
                  Deneyim Puanınız *
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 hover:scale-110 transition-transform focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 stroke-[1.5] ${
                          (hoverRating || rating) >= star
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-semibold text-[#231B18] ml-2">
                    {hoverRating || rating} / 5 Yıldız
                  </span>
                </div>
              </div>

              {/* İsim ve Varyant */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#231B18] mb-1">
                    Adınız Soyadınız *
                  </label>
                  <input
                    required
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Örn: Zeynep K."
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xs focus:outline-none focus:border-[#231B18]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#231B18] mb-1">
                    Seçtiğiniz Koku / Boyut (İsteğe Bağlı)
                  </label>
                  <input
                    type="text"
                    value={variantName}
                    onChange={(e) => setVariantName(e.target.value)}
                    placeholder="Örn: Vanilya & Sandal"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xs focus:outline-none focus:border-[#231B18]"
                  />
                </div>
              </div>

              {/* Yorum Başlığı */}
              <div>
                <label className="block text-xs font-medium text-[#231B18] mb-1">
                  Yorum Başlığı (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Masamıza çok yakıştı, kokusu harika!"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xs focus:outline-none focus:border-[#231B18]"
                />
              </div>

              {/* Yorum Metni */}
              <div>
                <label className="block text-xs font-medium text-[#231B18] mb-1">
                  Detaylı Değerlendirmeniz *
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ürünün kokusu, yanış süresi, ambalajı ve kargolanma kalitesi hakkındaki düşünceleriniz..."
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xs focus:outline-none focus:border-[#231B18] resize-none"
                />
              </div>

              {/* Fotoğraf Ekleme Alanı (Customer Photos) */}
              <div>
                <label className="block text-xs font-semibold text-[#231B18] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>📸 Fotoğraf Ekle ({images.length}/5)</span>
                  <span className="text-[11px] font-normal text-[#7A7067]">Ev veya etkinlik sunumunuz</span>
                </label>

                {/* Önizleme Listesi */}
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative w-16 h-16 rounded-xs overflow-hidden border border-stone-200 group"
                      >
                        <img src={img} alt="Yüklenen fotoğraf" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Fotoğraf Seçme Butonu */}
                {images.length < 5 && (
                  <label className="flex flex-col items-center justify-center p-4 border border-dashed border-stone-300 rounded-xs hover:border-[#231B18] hover:bg-[#FAF8F5] transition cursor-pointer text-center">
                    <Upload className="w-5 h-5 text-stone-400 mb-1" />
                    <span className="text-xs text-[#231B18] font-medium">Fotoğraf Yükle</span>
                    <span className="text-[10px] text-[#7A7067]">PNG, JPG veya WEBP (Max 5MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Gönder Butonu */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#231B18] hover:bg-[#C85A32] text-white text-xs uppercase tracking-widest font-medium rounded-xs transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSubmitting ? 'Yayınlanıyor...' : 'Yorumu & Fotoğrafları Yayınla'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
