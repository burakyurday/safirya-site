'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  ExternalLink,
  Info,
  CheckCircle2,
  RefreshCw,
  Monitor,
  Smartphone,
  Check,
  Sparkles,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { ConceptSlotKey, ConceptBannerItem, ConceptBannersMap } from '@/types/admin';

export default function KonseptTasarimlariPage() {
  const {
    conceptBanners,
    updateConceptBanner,
    resetConceptBanners,
    saveConceptBannersToCloud,
    categories,
    showToast,
  } = useAdmin();

  const [selectedSlot, setSelectedSlot] = useState<ConceptSlotKey>('hero');
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const handleSaveToCloud = async () => {
    setIsSavingCloud(true);
    try {
      let latestBanners: ConceptBannersMap = conceptBanners;
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('safirya_concept_banners');
        if (saved) {
          try {
            latestBanners = { ...conceptBanners, ...JSON.parse(saved) };
          } catch {}
        }
      }

      const res = await saveConceptBannersToCloud(latestBanners);
      if (res.success) {
        showToast('✓ Tüm vitrin tasarımları buluta kaydedildi (Masaüstü ve Mobil anında aktif).');
        setSavedAt(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
      } else {
        alert(res.error || 'Kaydedilirken hata oluştu.');
      }
    } finally {
      setIsSavingCloud(false);
    }
  };

  const bannerSlots: {
    key: ConceptSlotKey;
    title: string;
    sectionName: string;
    desktopDimensions: string;
    mobileDimensions: string;
    desktopRatio: string;
    mobileRatio: string;
    description: string;
  }[] = [
    {
      key: 'hero',
      title: 'Ana Hero Banner',
      sectionName: 'Üst Geniş Vitrin',
      desktopDimensions: '1920 × 600 px',
      mobileDimensions: '800 × 800 px (veya 750 × 1000 px)',
      desktopRatio: '16:5 Panoramik',
      mobileRatio: '1:1 Kare / 3:4 Dikey',
      description: 'Sayfanın en üstünde yer alan ana vitrin ve kampanya afiş alanı.',
    },
    {
      key: 'category_1',
      title: '1. Koleksiyon Kartı (Sol)',
      sectionName: 'Kategorilerimize Göz Atın',
      desktopDimensions: '800 × 800 px',
      mobileDimensions: '600 × 600 px',
      desktopRatio: '1:1 Kare',
      mobileRatio: '1:1 Kare',
      description: "3'lü vitrinin sol kartı (Örn: Çay Fincanı Seti / Doğal Mumlar).",
    },
    {
      key: 'category_2',
      title: '2. Koleksiyon Kartı (Orta)',
      sectionName: 'Kategorilerimize Göz Atın',
      desktopDimensions: '800 × 800 px',
      mobileDimensions: '600 × 600 px',
      desktopRatio: '1:1 Kare',
      mobileRatio: '1:1 Kare',
      description: "3'lü vitrinin orta kartı (Örn: Kahve Yanı Bardağı Seti / Takılar).",
    },
    {
      key: 'category_3',
      title: '3. Koleksiyon Kartı (Sağ)',
      sectionName: 'Kategorilerimize Göz Atın',
      desktopDimensions: '800 × 800 px',
      mobileDimensions: '600 × 600 px',
      desktopRatio: '1:1 Kare',
      mobileRatio: '1:1 Kare',
      description: "3'lü vitrinin sağ kartı (Örn: Tabak Setleri / Epoksi Tasarımlar).",
    },
    {
      key: 'showcase_1',
      title: 'Vitrin 1 - Split Banner',
      sectionName: 'Kavanoz & Saklama Koleksiyonu',
      desktopDimensions: '1200 × 800 px',
      mobileDimensions: '800 × 800 px',
      desktopRatio: '4:3 veya 3:2 Yatay',
      mobileRatio: '1:1 Kare',
      description: 'Sol tarafında büyük konsept afişi, sağında 3 adet ürün sergileyen 1. vitrin.',
    },
    {
      key: 'showcase_2',
      title: 'Vitrin 2 - Split Banner',
      sectionName: 'Kahvaltılık & Sofra Koleksiyonu',
      desktopDimensions: '1200 × 800 px',
      mobileDimensions: '800 × 800 px',
      desktopRatio: '4:3 veya 3:2 Yatay',
      mobileRatio: '1:1 Kare',
      description: 'Sol tarafında büyük konsept afişi, sağında 3 adet ürün sergileyen 2. vitrin.',
    },
  ];

  const currentSlotMeta = bannerSlots.find((s) => s.key === selectedSlot) || bannerSlots[0];

  const currentBanner: ConceptBannerItem = conceptBanners[selectedSlot] || {
    id: `concept-${selectedSlot}`,
    slotKey: selectedSlot,
    slotName: currentSlotMeta.title,
    title: '',
    subtitle: '',
    tag: '',
    buttonText: 'KEŞFEDİN',
    buttonLink: '/kategoriler',
    imageUrl: '',
    mobileImageUrl: '',
    recommendedDimensions: currentSlotMeta.desktopDimensions,
    mobileRecommendedDimensions: currentSlotMeta.mobileDimensions,
    aspectRatioLabel: currentSlotMeta.desktopRatio,
    mobileAspectRatioLabel: currentSlotMeta.mobileRatio,
    isActive: true,
  };

  // Bulut veya Yerel Dosya Yükleme (Masaüstü ve Mobil için ayrı)
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    slotKey: ConceptSlotKey,
    target: 'desktop' | 'mobile'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Lütfen geçerli bir görsel dosyası seçin (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Görsel boyutu en fazla 10MB olmalıdır.');
      return;
    }

    const uploadKey = `${slotKey}_${target}`;
    setUploadingTarget(uploadKey);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'safirya_banners');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        const updateField = target === 'desktop' ? { imageUrl: data.url } : { mobileImageUrl: data.url };

        // 1. En güncel yerel veriyi al
        let baseBanners: ConceptBannersMap = conceptBanners;
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('safirya_concept_banners');
          if (saved) {
            try {
              baseBanners = { ...conceptBanners, ...JSON.parse(saved) };
            } catch {}
          }
        }

        const existingSlot = baseBanners[slotKey] || conceptBanners[slotKey] || { slotKey, ...updateField };
        const updatedSlot = { ...existingSlot, ...updateField };
        const updatedAll: ConceptBannersMap = {
          ...baseBanners,
          [slotKey]: updatedSlot,
        };

        // 2. React state ve localStorage güncelle
        updateConceptBanner(slotKey, updateField);

        // 3. Buluta KESİNLİKLE güncel nesneyle kaydet
        const cloudRes = await saveConceptBannersToCloud(updatedAll);
        setSavedAt(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));

        if (cloudRes.success) {
          showToast(
            target === 'desktop'
              ? '✓ Masaüstü (Web) görseli başarıyla yüklendi ve anında yayına alındı.'
              : '✓ Mobil (Telefon) görseli başarıyla yüklendi ve anında yayına alındı.'
          );
        } else {
          showToast(`✓ Görsel tarayıcıya kaydedildi. Bulut eşitleme: ${cloudRes.error || 'Kaydedilemedi'}`);
        }
      } else {
        alert(data.error || 'Görsel yüklenirken bir hata oluştu.');
      }
    } catch {
      alert('Görsel yükleme servisine bağlanırken bir hata oluştu.');
    } finally {
      setUploadingTarget(null);
      // Reset input value so same file can be selected again if needed
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      
      {/* ── Üst Başlık & Aksiyonlar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2DCD3] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#C85A32] font-semibold">
            <ImageIcon className="w-4 h-4" />
            <span>Vitrin Tasarım Yönetimi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#231B18] mt-1">
            Konsept Tasarımları & Çift Görsel (Masaüstü & Mobil)
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-1 max-w-2xl">
            Ana sayfadaki vitrin ve koleksiyon kartları hem masaüstü monitörlerde hem de cep telefonlarında en kusursuz çözünürlükte görüntülensin diye her alan için ayrı masaüstü ve mobil görsel yükleyebilirsiniz.
          </p>
          {savedAt && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bulut Senkronize: Son kayıt {savedAt} (Masaüstü ve Mobil anında aktif)</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSaveToCloud}
            disabled={isSavingCloud}
            className="px-4 py-2 rounded-xs bg-[#C85A32] hover:bg-[#A04523] text-white text-xs uppercase tracking-wider font-medium transition inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isSavingCloud ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <UploadCloud className="w-3.5 h-3.5" />
            )}
            <span>{isSavingCloud ? 'Yayınlanıyor...' : 'Tüm Cihazlara Yayınla'}</span>
          </button>

          <Link
            href="/"
            target="_blank"
            className="px-4 py-2 rounded-xs border border-[#231B18] text-[#231B18] hover:bg-[#231B18] hover:text-[#F6F3EC] text-xs uppercase tracking-wider font-medium transition inline-flex items-center gap-1.5"
          >
            <span>Canlı Mağazada Gör</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => {
              if (confirm('Tüm konsept alanlarını varsayılan boş şablona sıfırlamak istediğinize emin misiniz?')) {
                resetConceptBanners();
              }
            }}
            className="px-3 py-2 rounded-xs border border-[#E2DCD3] text-[#7A7067] hover:text-[#C85A32] hover:border-[#C85A32] text-xs font-medium transition inline-flex items-center gap-1.5 cursor-pointer"
            title="Tüm alanları sıfırla"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sıfırla</span>
          </button>
        </div>
      </div>

      {/* ── Boyut ve Format Kılavuzu Bilgi Kartı (Masaüstü vs Mobil Karşılaştırma) ── */}
      <div className="bg-[#FAF8F5] border border-[#E2DCD3] rounded-xs p-5 sm:p-6">
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-xs bg-[#231B18] text-[#F6F3EC] shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-[#231B18] uppercase tracking-wider">
                Masaüstü & Mobil İçin Tavsiye Edilen Görsel Çözünürlükleri
              </h3>
              <p className="text-xs text-[#7A7067] mt-0.5 leading-relaxed">
                Kullanıcı cep telefonundan girdiğinde mobil görsel, bilgisayardan girdiğinde ise masaüstü görsel otomatik olarak yüklenir. Eğer bir alan için mobil görsel yüklemezseniz, sistem otomatik olarak masaüstü görselini yedek olarak gösterir.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              
              {/* 1. Hero */}
              <div className="bg-white p-3.5 rounded-xs border border-[#E2DCD3] space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#C85A32] block">
                  1. Ana Hero Banner
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[#231B18]">
                    <span className="flex items-center gap-1 font-medium text-stone-600">
                      <Monitor className="w-3.5 h-3.5 text-stone-500" /> Masaüstü:
                    </span>
                    <span className="font-mono font-bold">1920 × 600 px (16:5)</span>
                  </div>
                  <div className="flex items-center justify-between text-[#231B18]">
                    <span className="flex items-center gap-1 font-medium text-stone-600">
                      <Smartphone className="w-3.5 h-3.5 text-stone-500" /> Mobil:
                    </span>
                    <span className="font-mono font-bold text-[#C85A32]">800 × 800 px (1:1)</span>
                  </div>
                </div>
              </div>

              {/* 2. Koleksiyon Kartları */}
              <div className="bg-white p-3.5 rounded-xs border border-[#E2DCD3] space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#C85A32] block">
                  2. 3&apos;lü Koleksiyon Kartları
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[#231B18]">
                    <span className="flex items-center gap-1 font-medium text-stone-600">
                      <Monitor className="w-3.5 h-3.5 text-stone-500" /> Masaüstü:
                    </span>
                    <span className="font-mono font-bold">800 × 800 px (1:1)</span>
                  </div>
                  <div className="flex items-center justify-between text-[#231B18]">
                    <span className="flex items-center gap-1 font-medium text-stone-600">
                      <Smartphone className="w-3.5 h-3.5 text-stone-500" /> Mobil:
                    </span>
                    <span className="font-mono font-bold text-[#C85A32]">600 × 600 px (1:1)</span>
                  </div>
                </div>
              </div>

              {/* 3. Vitrin Split Bannerları */}
              <div className="bg-white p-3.5 rounded-xs border border-[#E2DCD3] space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#C85A32] block">
                  3. Vitrin Split Bannerları
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[#231B18]">
                    <span className="flex items-center gap-1 font-medium text-stone-600">
                      <Monitor className="w-3.5 h-3.5 text-stone-500" /> Masaüstü:
                    </span>
                    <span className="font-mono font-bold">1200 × 800 px (4:3)</span>
                  </div>
                  <div className="flex items-center justify-between text-[#231B18]">
                    <span className="flex items-center gap-1 font-medium text-stone-600">
                      <Smartphone className="w-3.5 h-3.5 text-stone-500" /> Mobil:
                    </span>
                    <span className="font-mono font-bold text-[#C85A32]">800 × 800 px (1:1)</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── Alan Seçim Sekmeleri (Slot Navigator) ── */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-[#7A7067] mb-3">
          Düzenlemek İstediğiniz Vitrin Alanını Seçin:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {bannerSlots.map((slot) => {
            const hasDesktop = Boolean(conceptBanners[slot.key]?.imageUrl);
            const hasMobile = Boolean(conceptBanners[slot.key]?.mobileImageUrl);
            const isSelected = selectedSlot === slot.key;

            return (
              <button
                key={slot.key}
                onClick={() => setSelectedSlot(slot.key)}
                className={`p-3 text-left rounded-xs border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#231B18] bg-[#231B18] text-white shadow-sm'
                    : 'border-[#E2DCD3] bg-white text-[#231B18] hover:border-[#7A7067]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-none font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#FAF8F5] text-[#C85A32] border border-[#E2DCD3]'
                    }`}>
                      {slot.key === 'hero' ? 'HERO' : slot.desktopRatio.split(' ')[0]}
                    </span>
                    
                    {/* Görsel Yükleme Durum İndikatörleri */}
                    <div className="flex items-center gap-1">
                      <span
                        className={`w-2 h-2 rounded-full ${hasDesktop ? 'bg-emerald-400' : 'bg-stone-300'}`}
                        title={hasDesktop ? '🖥️ Masaüstü Görseli Yüklü' : 'Masaüstü Görseli Boş'}
                      />
                      <span
                        className={`w-2 h-2 rounded-full ${hasMobile ? 'bg-sky-400' : 'bg-stone-300'}`}
                        title={hasMobile ? '📱 Mobil Görseli Yüklü' : 'Mobil Görseli Boş'}
                      />
                    </div>
                  </div>
                  <h4 className="text-xs font-semibold leading-tight line-clamp-1">{slot.title}</h4>
                </div>

                <div className="mt-3 pt-2 border-t border-stone-200/40 flex items-center justify-between text-[10px]">
                  <span className={isSelected ? 'text-stone-300' : 'text-[#7A7067]'}>
                    🖥️ {hasDesktop ? 'Var' : 'Yok'}
                  </span>
                  <span className={isSelected ? 'text-stone-300' : 'text-[#7A7067]'}>
                    📱 {hasMobile ? 'Var' : 'Yok'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Seçili Slotun Düzenleme Kartı ── */}
      <div className="bg-white border border-[#E2DCD3] rounded-xs p-6 sm:p-8 space-y-8">
        
        {/* Slot Başlığı ve Bilgisi */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DCD3] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono bg-[#C85A32] text-white px-2 py-0.5 font-bold uppercase tracking-wider">
                {currentBanner.slotKey}
              </span>
              <h2 className="text-xl font-serif text-[#231B18]">
                {currentSlotMeta.title}
              </h2>
            </div>
            <p className="text-xs text-[#7A7067] mt-1">
              {currentSlotMeta.description}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#FAF8F5] border border-[#E2DCD3] px-3.5 py-2 rounded-xs">
            <span className="text-xs text-[#7A7067]">Bölüm:</span>
            <span className="text-xs font-semibold text-[#231B18]">{currentSlotMeta.sectionName}</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            İKİLİ GÖRSEL YÜKLEME ALANI (MASAÜSTÜ VE MOBİL YAN YANA)
        ══════════════════════════════════════════════════════════════ */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#231B18] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#C85A32]" />
                <span>Görsel Yükleme Paneli (Masaüstü & Mobil)</span>
              </h3>
              <p className="text-xs text-[#7A7067] mt-0.5">
                Koleksiyon kartlarının ve vitrinin her iki cihazda da kusursuz ölçeklenmesi için görselleri ayrı yükleyin.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            
            {/* ── 1. MASAÜSTÜ (WEB) GÖRSELİ KARTI ── */}
            <div className="p-5 rounded-xs border-2 border-stone-200 bg-[#FAF8F5] flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#231B18] uppercase tracking-wider">
                    <Monitor className="w-4 h-4 text-stone-700" />
                    <span>1. Masaüstü Görünümü (Web)</span>
                  </div>
                  <span className="text-[10px] font-mono bg-white border border-[#E2DCD3] text-[#231B18] px-2 py-0.5 font-bold rounded-none">
                    📐 {currentSlotMeta.desktopDimensions}
                  </span>
                </div>

                {/* Masaüstü Önizleme Kutusu */}
                <div className={`relative overflow-hidden rounded-xs border-2 ${
                  currentBanner.imageUrl
                    ? 'border-[#231B18] bg-stone-900'
                    : 'border-dashed border-stone-300 bg-white'
                } flex items-center justify-center p-2 min-h-[200px] max-h-[240px]`}>
                  {currentBanner.imageUrl ? (
                    <div className="relative w-full h-full group flex items-center justify-center">
                      <img
                        src={currentBanner.imageUrl}
                        alt="Masaüstü Konsept Görseli"
                        className="w-full h-44 sm:h-48 object-cover rounded-xs"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <a
                          href={currentBanner.imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 bg-white/90 hover:bg-white text-[#231B18] text-xs font-medium rounded-xs flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Tam Gör</span>
                        </a>
                        <button
                          onClick={() => updateConceptBanner(selectedSlot, { imageUrl: '' })}
                          className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-xs flex items-center gap-1 transition cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Kaldır</span>
                        </button>
                      </div>
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 text-white text-[10px] rounded-xs font-mono">
                        🖥️ Masaüstü Aktif
                      </span>
                    </div>
                  ) : (
                    <div className="text-center p-4 space-y-1.5">
                      <div className="w-10 h-10 rounded-full bg-stone-100 mx-auto flex items-center justify-center text-stone-400">
                        <Monitor className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-[#231B18] block">Masaüstü Görseli Henüz Eklenmedi</span>
                      <span className="text-[11px] text-[#7A7067] block">
                        Önerilen: {currentSlotMeta.desktopDimensions} ({currentSlotMeta.desktopRatio})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Masaüstü Yükleme ve URL */}
              <div className="space-y-2.5 pt-2">
                <label className="block">
                  <span className="text-[11px] font-medium text-[#231B18] mb-1 block">
                    Bilgisayardan Masaüstü Görseli Yükle:
                  </span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={(e) => handleFileUpload(e, selectedSlot, 'desktop')}
                    disabled={uploadingTarget === `${selectedSlot}_desktop`}
                    className="block w-full text-xs text-[#7A7067] file:mr-2.5 file:py-1.5 file:px-3 file:rounded-xs file:border-0 file:text-xs file:font-semibold file:bg-[#231B18] file:text-white hover:file:bg-[#3A2E29] file:cursor-pointer cursor-pointer border border-[#E2DCD3] rounded-xs bg-white"
                  />
                  {uploadingTarget === `${selectedSlot}_desktop` && (
                    <span className="text-[11px] text-[#C85A32] mt-1 inline-flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Masaüstü görseli yükleniyor...
                    </span>
                  )}
                </label>

                <div>
                  <span className="text-[11px] font-medium text-[#231B18] mb-1 block">
                    veya Masaüstü Görsel Linki (URL):
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="https://... (Masaüstü görsel bağlantısı)"
                      value={currentBanner.imageUrl || ''}
                      onChange={(e) => updateConceptBanner(selectedSlot, { imageUrl: e.target.value })}
                      className="flex-1 px-3 py-1.5 text-xs border border-[#E2DCD3] rounded-xs bg-white focus:outline-none focus:border-[#231B18]"
                    />
                    {currentBanner.imageUrl && (
                      <button
                        onClick={() => updateConceptBanner(selectedSlot, { imageUrl: '' })}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-xs border border-red-200"
                        title="Masaüstü Görselini Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── 2. MOBİL (TELEFON) GÖRSELİ KARTI ── */}
            <div className="p-5 rounded-xs border-2 border-[#C85A32]/30 bg-[#FFFDF9] flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#C85A32] uppercase tracking-wider">
                    <Smartphone className="w-4 h-4 text-[#C85A32]" />
                    <span>2. Mobil Görünümü (Telefon & Tablet)</span>
                  </div>
                  <span className="text-[10px] font-mono bg-orange-50 border border-orange-200 text-[#C85A32] px-2 py-0.5 font-bold rounded-none">
                    📐 {currentSlotMeta.mobileDimensions}
                  </span>
                </div>

                {/* Mobil Önizleme Kutusu (Telefon Çerçevesi Hissi) */}
                <div className={`relative overflow-hidden rounded-xs border-2 ${
                  currentBanner.mobileImageUrl
                    ? 'border-[#C85A32] bg-stone-900'
                    : 'border-dashed border-orange-200 bg-white'
                } flex items-center justify-center p-2 min-h-[200px] max-h-[240px]`}>
                  {currentBanner.mobileImageUrl ? (
                    <div className="relative w-full h-full group flex items-center justify-center">
                      <img
                        src={currentBanner.mobileImageUrl}
                        alt="Mobil Konsept Görseli"
                        className="w-40 sm:w-44 h-44 sm:h-48 object-cover rounded-xs shadow-md border border-white/20"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <a
                          href={currentBanner.mobileImageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 bg-white/90 hover:bg-white text-[#231B18] text-xs font-medium rounded-xs flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Tam Gör</span>
                        </a>
                        <button
                          onClick={() => updateConceptBanner(selectedSlot, { mobileImageUrl: '' })}
                          className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-xs flex items-center gap-1 transition cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Kaldır</span>
                        </button>
                      </div>
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-[#C85A32] text-white text-[10px] rounded-xs font-mono">
                        📱 Mobil Aktif
                      </span>
                    </div>
                  ) : currentBanner.imageUrl ? (
                    /* Mobil boşsa fakat masaüstü yüklüyse: Akıllı Yedekleme Uyarısı */
                    <div className="text-center p-4 space-y-1.5">
                      <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 mx-auto flex items-center justify-center text-amber-700">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-stone-800 block">Özel Mobil Görseli Eklenmedi</span>
                      <span className="text-[11px] text-amber-700 block max-w-xs mx-auto">
                        ⚠️ Mobil cihazlarda masaüstü görseli otomatik uyarlanarak gösterilecek. Mobil için kare/dikey özel görsel yükleyebilirsiniz.
                      </span>
                    </div>
                  ) : (
                    <div className="text-center p-4 space-y-1.5">
                      <div className="w-10 h-10 rounded-full bg-stone-100 mx-auto flex items-center justify-center text-stone-400">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-[#231B18] block">Mobil Görseli Boş</span>
                      <span className="text-[11px] text-[#7A7067] block">
                        Önerilen: {currentSlotMeta.mobileDimensions} ({currentSlotMeta.mobileRatio})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobil Yükleme ve URL */}
              <div className="space-y-2.5 pt-2">
                <label className="block">
                  <span className="text-[11px] font-medium text-[#231B18] mb-1 block">
                    Bilgisayardan Mobil Görseli Yükle:
                  </span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={(e) => handleFileUpload(e, selectedSlot, 'mobile')}
                    disabled={uploadingTarget === `${selectedSlot}_mobile`}
                    className="block w-full text-xs text-[#7A7067] file:mr-2.5 file:py-1.5 file:px-3 file:rounded-xs file:border-0 file:text-xs file:font-semibold file:bg-[#C85A32] file:text-white hover:file:bg-[#A04523] file:cursor-pointer cursor-pointer border border-[#E2DCD3] rounded-xs bg-white"
                  />
                  {uploadingTarget === `${selectedSlot}_mobile` && (
                    <span className="text-[11px] text-[#C85A32] mt-1 inline-flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Mobil görseli yükleniyor...
                    </span>
                  )}
                </label>

                <div>
                  <span className="text-[11px] font-medium text-[#231B18] mb-1 block">
                    veya Mobil Görsel Linki (URL):
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="https://... (Mobil görsel bağlantısı)"
                      value={currentBanner.mobileImageUrl || ''}
                      onChange={(e) => updateConceptBanner(selectedSlot, { mobileImageUrl: e.target.value })}
                      className="flex-1 px-3 py-1.5 text-xs border border-[#E2DCD3] rounded-xs bg-white focus:outline-none focus:border-[#C85A32]"
                    />
                    {currentBanner.mobileImageUrl && (
                      <button
                        onClick={() => updateConceptBanner(selectedSlot, { mobileImageUrl: '' })}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-xs border border-red-200"
                        title="Mobil Görselini Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            METİNLER, BUTONLAR VE YÖNLENDİRME AYARLARI
        ══════════════════════════════════════════════════════════════ */}
        <div className="pt-6 border-t border-[#E2DCD3] space-y-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#231B18]">
            <Layers className="w-4 h-4 text-[#C85A32]" />
            <span>Vitrin Metinleri ve Buton Yönlendirmesi</span>
          </div>

          {/* 1. Başlık & Alt Başlık */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#231B18] block mb-1">
                Ana Başlık
              </label>
              <input
                type="text"
                value={currentBanner.title}
                onChange={(e) => updateConceptBanner(selectedSlot, { title: e.target.value })}
                placeholder="Örn: SON YAZ FIRSATLARI"
                className="w-full px-3 py-2 text-xs border border-[#E2DCD3] rounded-xs focus:outline-none focus:border-[#231B18]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#231B18] block mb-1">
                Üst / Alt Başlık (Slogan)
              </label>
              <input
                type="text"
                value={currentBanner.subtitle || ''}
                onChange={(e) => updateConceptBanner(selectedSlot, { subtitle: e.target.value })}
                placeholder="Örn: Seçili Ürünlerde %50'ye Varan İndirim"
                className="w-full px-3 py-2 text-xs border border-[#E2DCD3] rounded-xs focus:outline-none focus:border-[#231B18]"
              />
            </div>
          </div>

          {/* 2. Kampanya Rozeti & Buton Metni */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#231B18] block mb-1">
                Kampanya Rozeti (Tag)
              </label>
              <input
                type="text"
                value={currentBanner.tag || ''}
                onChange={(e) => updateConceptBanner(selectedSlot, { tag: e.target.value })}
                placeholder="Örn: %50'YE VARAN İNDİRİM"
                className="w-full px-3 py-2 text-xs border border-[#E2DCD3] rounded-xs focus:outline-none focus:border-[#231B18]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#231B18] block mb-1">
                Buton Metni
              </label>
              <input
                type="text"
                value={currentBanner.buttonText}
                onChange={(e) => updateConceptBanner(selectedSlot, { buttonText: e.target.value })}
                placeholder="Örn: ALIŞVERİŞE BAŞLA"
                className="w-full px-3 py-2 text-xs border border-[#E2DCD3] rounded-xs focus:outline-none focus:border-[#231B18]"
              />
            </div>
          </div>

          {/* 3. Buton Linki */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#231B18] block mb-1">
              Buton Yönlendirme Linki (Sayfa URL)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentBanner.buttonLink}
                onChange={(e) => updateConceptBanner(selectedSlot, { buttonLink: e.target.value })}
                placeholder="/kategoriler/dogal-mumlar veya /cok-satanlar"
                className="flex-1 px-3 py-2 text-xs border border-[#E2DCD3] rounded-xs focus:outline-none focus:border-[#231B18]"
              />
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    updateConceptBanner(selectedSlot, { buttonLink: e.target.value });
                  }
                }}
                className="px-3 py-2 text-xs border border-[#E2DCD3] rounded-xs bg-[#FAF8F5] text-[#231B18]"
              >
                <option value="">Hızlı Kategori Seç...</option>
                <option value="/cok-satanlar">Çok Satanlar</option>
                <option value="/kategoriler">Tüm Kategoriler</option>
                <option value="/kisiye-ozel-toplu-siparis">Özel & Toplu Sipariş</option>
                {categories.map((c) => (
                  <option key={c.id} value={`/kategoriler/${c.slug}`}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vitrin 1 ve Vitrin 2 için Kategori Bağlantısı */}
          {(selectedSlot === 'showcase_1' || selectedSlot === 'showcase_2') && (
            <div className="p-4 bg-[#FAF8F5] border border-[#E2DCD3] rounded-xs space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#231B18] block">
                Yanında Gösterilecek Ürün Kategorisi (3 Ürün)
              </label>
              <select
                value={currentBanner.categorySlug || ''}
                onChange={(e) => updateConceptBanner(selectedSlot, { categorySlug: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-[#E2DCD3] rounded-xs bg-white text-[#231B18]"
              >
                <option value="">Tüm Koleksiyondan Otomatik Seç</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name} ({c.slug})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#7A7067]">
                Bu konsept afişinin sağ tarafında sergilenecek 3 adet ürün bu seçilen kategoriden dinamik olarak getirilir.
              </p>
            </div>
          )}

          {/* Aktiflik Durumu */}
          <div className="flex items-center justify-between pt-3 border-t border-[#E2DCD3]">
            <div>
              <span className="text-xs font-semibold text-[#231B18] block">Vitrinde Göster (Aktif)</span>
              <span className="text-[11px] text-[#7A7067] block">Pasife alındığında bu alan ana sayfada gizlenir.</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={currentBanner.isActive}
                onChange={(e) => updateConceptBanner(selectedSlot, { isActive: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C85A32]"></div>
            </label>
          </div>

          {/* Alt Kaydet Butonu */}
          <div className="pt-4 border-t border-[#E2DCD3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-[11px] text-[#7A7067]">
              ✓ Masaüstü ve Mobil görseller Supabase buluta aktarılır ve ziyaretçilere cihazlarına göre anında gösterilir.
            </div>
            <button
              onClick={handleSaveToCloud}
              disabled={isSavingCloud}
              className="px-6 py-2.5 rounded-xs bg-[#231B18] hover:bg-[#C85A32] text-white text-xs uppercase tracking-wider font-medium transition inline-flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isSavingCloud ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>{isSavingCloud ? 'Buluta Kaydediliyor...' : 'Değişiklikleri Yayınla & Kaydet'}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
