'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Send,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  Eye,
  Copy,
  Smartphone,
  Monitor,
  AlertCircle,
  Tag,
  ArrowRight,
  TrendingUp,
  Settings,
  ChevronRight,
  PlusCircle,
  Flame,
  Gift,
  Layers,
  Heart,
  RefreshCw,
  FileCode,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { MarketingCampaign, AutomatedEmailTrigger } from '@/types/admin';
import { generateCampaignEmailHtml, CampaignEmailProps } from '@/lib/marketing/campaignEmail';

export default function EpostaPazarlamaPage() {
  const {
    campaigns,
    automatedTriggers,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    toggleAutomatedTrigger,
    sendCampaignEmail,
    products,
    settings,
    showToast,
  } = useAdmin();

  // Aktif Sekme: 'composer' (Yeni Kampanya), 'triggers' (Otomasyonlar), 'history' (Geçmiş Raporlar)
  const [activeTab, setActiveTab] = useState<'composer' | 'triggers' | 'history'>('composer');

  // Canlı Önizleme Cihaz Modu: 'desktop' | 'mobile' | 'code'
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile' | 'code'>('desktop');

  // Kampanya Form State
  const [campaignName, setCampaignName] = useState('Kasım Ayı Yeni Soya Mumları & Zanaat Günleri');
  const [subject, setSubject] = useState('🕯️ Atölyemizin Yeni Hasadı: Tarçın & Kehribar Soya Mumları Yayında!');
  const [preheader, setPreheader] = useState('Doğal zanaat dokunuşlarıyla evinizi ısıtacak yeni kreasyonlarımız sınırlı stokla vitrinde.');
  const [templateType, setTemplateType] = useState<'lansman' | 'indirim' | 'ozel-davet' | 'sepet-kurtarma' | 'bulten'>('lansman');
  const [targetSegment, setTargetSegment] = useState('Tüm Aboneler & Müşteriler (2.450 Alıcı)');
  const [headline, setHeadline] = useState('Doğal Işık ve Sıcak Kokularla Sonbahara Merhaba');
  const [bodyText, setBodyText] = useState(
    'İzmir Karşıyaka atölyemizde zanaatkar ustalarımızın elleriyle hazırlanan yeni sezon aromaterapik soya mumu koleksiyonumuz hazırlandı. %100 saf soya mumu, ahşap fitil çıtırtısı ve organik esanslarla yaşam alanınıza huzur katın.\nHer siparişiniz geri dönüştürülebilir amber cam kavanozda, kurutulmuş lavanta dalı ve mühürlü kraft kutu ile kapınıza ulaşır.'
  );
  const [couponCode, setCouponCode] = useState('ATOLYE15');
  const [discountRate, setDiscountRate] = useState<number>(15);
  const [ctaLabel, setCtaLabel] = useState('Yeni Koleksiyonu Keşfet');
  const [ctaUrl, setCtaUrl] = useState('https://safirya.tr/kategoriler/dogal-mumlar');
  const [heroImageUrl, setHeroImageUrl] = useState(
    'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=80'
  );
  const [senderName, setSenderName] = useState('Safirya Zanaat Atölyesi');

  // Gönderim Durumları & Modallar
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testEmailInput, setTestEmailInput] = useState(settings?.contactEmail || 'admin@safirya.tr');
  const [previewModalHtml, setPreviewModalHtml] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Şablon Presetleri & İçerik Doldurucu
  const TEMPLATE_PRESETS = [
    {
      type: 'lansman' as const,
      title: 'Yeni Koleksiyon Lansmanı',
      badge: 'Lüks Zanaat',
      desc: 'Büyük görsel, atölye ustasından sıcak mektup, 3 vitrin ürün kartı ve incele butonu.',
      icon: Flame,
      defaultSubject: '🕯️ Atölyemizin Yeni Hasadı: Tarçın & Kehribar Soya Mumları Yayında!',
      defaultHeadline: 'Doğal Işık ve Sıcak Kokularla Sonbahara Merhaba',
      defaultBody: 'İzmir Karşıyaka atölyemizde ustalarımızın elleriyle hazırlanan yeni sezon aromaterapik soya mumu koleksiyonumuz hazırlandı. Ahşap fitil çıtırtısı ve organik esanslarla yaşam alanınıza huzur katın.',
      defaultHero: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=80',
      defaultCta: 'Yeni Koleksiyonu Keşfet',
      defaultUrl: 'https://safirya.tr/kategoriler/dogal-mumlar',
    },
    {
      type: 'indirim' as const,
      title: 'Hafta Sonu & İndirim Kuponu',
      badge: '%20 İndirim',
      desc: 'Terracotta indirim kutusu, kupon kopyalama alanı, aciliyet geri sayımı ve sepet linki.',
      icon: Gift,
      defaultSubject: '🎁 Hafta Sonuna Özel: Tüm Siparişlerde El Yazısı Hediye Kartı & %20 İndirim',
      defaultHeadline: 'Sevdiklerinize Zanaat Kokulu Bir Sürpriz Yapın',
      defaultBody: 'Bu hafta sonuna özel, atölyemizdeki tüm el yapımı soya mumları ve kokulu taş objelerde %20 indirim tanımlandı. Üstelik ₺500 üzeri siparişlerde kargonuz ücretsiz!',
      defaultHero: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80',
      defaultCta: 'Fırsatı Yakala & Alışverişe Başla',
      defaultUrl: 'https://safirya.tr/cok-satanlar',
    },
    {
      type: 'ozel-davet' as const,
      title: 'Kişiye Özel & Toptan / B2B',
      badge: 'Kurumsal / Nikah',
      desc: 'Söz, nişan, baby shower ve kurumsal hediyelikler için baremli fiyat avantajı ve katalog linki.',
      icon: Sparkles,
      defaultSubject: '🌿 Özel Günleriniz İçin Kişiselleştirilmiş El Yapımı Tasarımlar',
      defaultHeadline: 'En Özel Gününüze El Emeği Zarafeti Katın',
      defaultBody: 'Düğün, nişan, söz ve kurumsal davetleriniz için lazer kazımalı ahşap kapaklı mumlar, kişiselleştirilmiş kraft etiketler ve baremli toptan fiyat avantajıyla yanınızdayız.',
      defaultHero: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
      defaultCta: 'Özel Teklif Al & Kataloğu İncele',
      defaultUrl: 'https://safirya.tr/kisiye-ozel-toplu-siparis',
    },
    {
      type: 'sepet-kurtarma' as const,
      title: 'Zanaat Sepet Kurtarma',
      badge: 'Otomatik Hatırlatma',
      desc: 'Sepette kalan ürünleri atölyede rezerve tutma hissi veren zarif el emeği hatırlatması.',
      icon: Clock,
      defaultSubject: '⏳ Sepetinizdeki El Yapımı Ürünleri Sizin İçin Bekletiyoruz',
      defaultHeadline: 'Atölyemizden Ayrılmadan Önce Sepetinize Göz Atın',
      defaultBody: 'Sepetinize eklediğiniz el yapımı parçalar sınırlı sayıda üretilmektedir. Siparişinizi tamamlayabilmeniz için ürünlerinizi kısa bir süre daha sizin adınıza ayırdık.',
      defaultHero: 'https://images.unsplash.com/photo-1611591475155-239dd2a3449c?auto=format&fit=crop&w=1200&q=80',
      defaultCta: 'Sepetime Dön & Siparişi Tamamla',
      defaultUrl: 'https://safirya.tr/sepet',
    },
  ];

  const handleSelectTemplate = (preset: (typeof TEMPLATE_PRESETS)[0]) => {
    setTemplateType(preset.type);
    setSubject(preset.defaultSubject);
    setHeadline(preset.defaultHeadline);
    setBodyText(preset.defaultBody);
    setHeroImageUrl(preset.defaultHero);
    setCtaLabel(preset.defaultCta);
    setCtaUrl(preset.defaultUrl);
    showToast(`"${preset.title}" şablonu yüklendi.`);
  };

  // Dinamik Olarak Oluşturulan Kampanya E-Posta HTML'i
  const currentEmailProps: CampaignEmailProps = {
    campaignName,
    subject,
    preheader,
    templateType,
    headline,
    bodyText,
    heroImageUrl,
    couponCode: couponCode.trim() ? couponCode : undefined,
    discountRate: couponCode.trim() ? discountRate : undefined,
    ctaLabel,
    ctaUrl,
    senderName,
    logoUrl: settings?.logoUrl,
    logoText: settings?.logoText || 'SAFİRYA',
    brandTagline: settings?.brandTagline || 'El Yapımı Tasarım Atölyesi',
    storeName: settings?.storeName || 'Safirya Atölyesi',
    contactEmail: settings?.contactEmail || 'destek@safirya.tr',
    instagramHandle: settings?.instagramHandle || '@safirya35353535',
    address: settings?.atelierAddress || 'Karşıyaka / İzmir (Online Zanaat Atölyesi)',
  };

  const renderedHtml = generateCampaignEmailHtml(currentEmailProps);

  // Test E-Postası Gönder
  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailInput) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/marketing/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isTest: true,
          testEmail: testEmailInput,
          campaignProps: currentEmailProps,
          settings,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        showToast(data.error || 'E-posta gönderilemedi.');
        return;
      }

      showToast(data.message || `${testEmailInput} adresine test e-postası iletildi.`);
      setIsTestModalOpen(false);
    } catch (err: any) {
      showToast(`Gönderim hatası: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // Toplu Kampanya Gönderimi (Animasyonlu ve State Kayıtlı)
  const handleBroadcastCampaign = async () => {
    if (!confirm(`"${campaignName}" kampanyası "${targetSegment}" kitlesine gönderilsin mi?`)) {
      return;
    }

    setIsSending(true);
    setSendProgress(10);

    // İlerleme simülasyonu
    const timer = setInterval(() => {
      setSendProgress((prev) => {
        if (prev >= 90) {
          clearInterval(timer);
          return 95;
        }
        return prev + 25;
      });
    }, 300);

    try {
      const res = await fetch('/api/marketing/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isTest: false,
          campaignProps: currentEmailProps,
          settings,
        }),
      });

      const data = await res.json();
      clearInterval(timer);

      if (!res.ok || data.success === false) {
        setIsSending(false);
        setSendProgress(0);
        showToast(data.error || 'Kampanya gönderilirken bir hata oluştu.');
        return;
      }

      setSendProgress(100);

      // Kampanyayı geçmiş listesine ekle
      addCampaign({
        name: campaignName,
        subject,
        preheader,
        templateType,
        targetSegment,
        headline,
        bodyText,
        couponCode: couponCode || undefined,
        discountRate: discountRate || undefined,
        ctaLabel,
        ctaUrl,
        heroImageUrl,
        senderName,
        recipientCount: 2450,
        openRate: 44.8,
        clickRate: 19.5,
        status: 'SENT',
        sentAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      });

      setTimeout(() => {
        setIsSending(false);
        setSendProgress(0);
        showToast(data.message || 'Kampanya tüm alıcılara başarıyla iletildi!');
        setActiveTab('history');
      }, 600);
    } catch {
      clearInterval(timer);
      setIsSending(false);
      setSendProgress(0);
      showToast('Kampanya simülasyon modunda başarıyla iletildi!');
      setActiveTab('history');
    }
  };

  const handleCopyHtml = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(renderedHtml);
      setCopiedCode(true);
      showToast('E-Posta HTML kodu panoya kopyalandı!');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* 1. ÜST BAŞLIK & EK BİLGİ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D96B27]">
            <Mail className="w-4 h-4" />
            <span>Safirya E-Posta Pazarlama & Kampanya Motoru</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A4A] mt-1">
            E-Posta Pazarlama & Otomasyon Portalı
          </h1>
          <p className="text-xs sm:text-sm text-[#1B2A4A]/70 mt-1 max-w-2xl leading-relaxed">
            Zanaatkar marka ruhuna uygun duyarlı e-posta şablonları oluşturun, otomatik müşteri karşılama/sepet kurtarma kurallarını yönetin ve tek tıkla toplu bülten gönderin.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/ayarlar"
            className="px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-slate-50 text-xs font-bold text-[#1B2A4A] flex items-center gap-1.5 transition"
          >
            <Settings className="w-4 h-4 text-gray-500" />
            <span>SMTP & Gönderici Ayarları</span>
          </Link>

          <button
            onClick={() => setIsTestModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1B2A4A] text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Send className="w-3.5 h-3.5 text-[#D96B27]" />
            <span>Hızlı Test Maili</span>
          </button>
        </div>
      </div>

      {/* 2. KPI / METRİK KARTLARI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#E8E2D9] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#D96B27] flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-gray-400">Toplam Abone & Müşteri</div>
            <div className="text-xl sm:text-2xl font-black text-[#1B2A4A] mt-0.5">2.450</div>
            <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>+142 bu ay</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E8E2D9] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#16A34A] flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-gray-400">Aktif Otomasyonlar</div>
            <div className="text-xl sm:text-2xl font-black text-[#1B2A4A] mt-0.5">
              {automatedTriggers.filter((t) => t.isEnabled).length} Kural
            </div>
            <div className="text-[10px] text-gray-500 font-medium mt-0.5">
              Hoş geldin & Sepet tetikleyicisi
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E8E2D9] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-gray-400">Ort. Açılma Oranı</div>
            <div className="text-xl sm:text-2xl font-black text-[#1B2A4A] mt-0.5">%43.6</div>
            <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
              Sektör ortalaması %21
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E8E2D9] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-gray-400">E-Posta Cirosu (30g)</div>
            <div className="text-xl sm:text-2xl font-black text-[#1B2A4A] mt-0.5">₺84.200</div>
            <div className="text-[10px] text-purple-700 font-bold mt-0.5">
              184 sipariş dönüştü
            </div>
          </div>
        </div>
      </div>

      {/* 3. ANA SEKMELER */}
      <div className="bg-white p-4 rounded-3xl border border-[#E8E2D9] shadow-sm flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveTab('composer')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'composer'
              ? 'bg-[#1B2A4A] text-white shadow-md'
              : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
          }`}
        >
          <PlusCircle className="w-4 h-4 text-[#D96B27]" />
          <span>Toplu Kampanya Gönder & Şablonlar</span>
        </button>

        <button
          onClick={() => setActiveTab('triggers')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'triggers'
              ? 'bg-[#1B2A4A] text-white shadow-md'
              : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
          }`}
        >
          <Clock className="w-4 h-4 text-emerald-500" />
          <span>Otomatik E-Posta Kuralları ({automatedTriggers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-[#1B2A4A] text-white shadow-md'
              : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-purple-500" />
          <span>Gönderim Geçmişi & Raporlar ({campaigns.length})</span>
        </button>
      </div>

      {/* 4. SEKME 1: KAMPANYA DÜZENLEYİCİ & CANLI ÖNİZLEME */}
      {activeTab === 'composer' && (
        <div className="space-y-6">
          
          {/* Şablon Seçici Kartları */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D96B27]">
                  Adım 1 &bull; Şablon Seçimi
                </span>
                <h3 className="text-base font-bold text-[#1B2A4A] mt-0.5">
                  Safirya Marka Kimliğine Uygun Hazır E-Posta Tasarımları
                </h3>
              </div>
              <span className="text-xs text-gray-400 font-medium">Tüm şablonlar mobil & masaüstü uyumludur</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {TEMPLATE_PRESETS.map((preset) => {
                const isSelected = templateType === preset.type;
                const Icon = preset.icon;
                return (
                  <button
                    key={preset.type}
                    type="button"
                    onClick={() => handleSelectTemplate(preset)}
                    className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between gap-4 group ${
                      isSelected
                        ? 'border-[#D96B27] bg-[#FDF3EB]/60 ring-2 ring-[#D96B27]/30 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                          isSelected
                            ? 'bg-[#D96B27] text-white shadow-md'
                            : 'bg-orange-100 text-[#D96B27] group-hover:scale-105'
                        } transition`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white border border-gray-200 text-[#1B2A4A]">
                        {preset.badge}
                      </span>
                    </div>

                    <div>
                      <div className="font-bold text-sm text-[#1B2A4A] group-hover:text-[#D96B27] transition">
                        {preset.title}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                        {preset.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold">
                      <span className={isSelected ? 'text-[#D96B27]' : 'text-gray-400'}>
                        {isSelected ? '✓ Seçili Tasarım' : 'Tasarımı Yükle'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* İkili Bölüm: Sol Form (Editör) - Sağ Canlı Önizleme */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Sol: E-Posta Detayları Formu (6 Sütun) */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-5 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="font-bold text-sm text-[#1B2A4A]">
                  Adım 2 &bull; Kampanya & İçerik Düzenleyici
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-[#D96B27]">
                  {templateType.toUpperCase()}
                </span>
              </div>

              {/* Hedef Kitle */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Hedef Kitle Segmenti
                </label>
                <select
                  value={targetSegment}
                  onChange={(e) => setTargetSegment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-bold text-xs bg-white focus:ring-2 focus:ring-[#D96B27]"
                >
                  <option value="Tüm Aboneler & Müşteriler (2.450 Alıcı)">
                    👥 Tüm Aboneler & Müşteriler (2.450 Alıcı)
                  </option>
                  <option value="VIP & Sadık Müşteriler (240 Alıcı - ₺1.500+)">
                    💎 VIP & Sadık Müşteriler (240 Alıcı - ₺1.500+)
                  </option>
                  <option value="Doğal Soya Mumu Tutkunları (680 Alıcı)">
                    🕯️ Doğal Soya Mumu Tutkunları (680 Alıcı)
                  </option>
                  <option value="Toptan & Kurumsal Müşteriler (86 Cari Hesap)">
                    🏢 Toptan & Kurumsal Müşteriler (86 Cari Hesap)
                  </option>
                  <option value="Terk Edilmiş Sepet Sahipleri (42 Alıcı)">
                    ⏳ Terk Edilmiş Sepet Sahipleri (42 Alıcı)
                  </option>
                  <option value="Test Grubu (Sadece Yönetici E-Postası)">
                    🧪 Test Grubu (Sadece Yönetici E-Postası)
                  </option>
                </select>
              </div>

              {/* Kampanya Adı (İç İsim) */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Kampanya Adı (Panel İçi Referans)
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="Örn: Kasım Ayı Yeni Mum Lansmanı"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-semibold text-xs focus:ring-2 focus:ring-[#D96B27]"
                />
              </div>

              {/* Konu Satırı */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-gray-700">
                    E-Posta Konu Başlığı (Subject Line) *
                  </label>
                  <div className="flex items-center gap-1">
                    {['🕯️', '🎁', '✨', '🌿', '⏳'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setSubject((s) => `${emoji} ${s}`)}
                        className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-xs"
                        title="Emoji Ekle"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-bold text-xs focus:ring-2 focus:ring-[#D96B27]"
                />
              </div>

              {/* Önizleme Metni (Preheader) */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Gelen Kutusu Önizleme Metni (Preheader)
                </label>
                <input
                  type="text"
                  value={preheader}
                  onChange={(e) => setPreheader(e.target.value)}
                  placeholder="Gelen kutusunda konu başlığının yanında görünen kısa açıklama"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              {/* Ana Manşet */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  E-Posta İçi Ana Manşet (H1)
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 font-bold text-xs focus:ring-2 focus:ring-[#D96B27]"
                />
              </div>

              {/* İçerik Metni */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Mektup / Gövde Metni (Atölye Mesajı)
                </label>
                <textarea
                  rows={5}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs leading-relaxed font-sans focus:ring-2 focus:ring-[#D96B27]"
                />
              </div>

              {/* Hero Görseli */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Manşet / Banner Görsel URL'si
                </label>
                <input
                  type="url"
                  value={heroImageUrl}
                  onChange={(e) => setHeroImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 font-mono text-[11px]"
                />
              </div>

              {/* Kupon Kodu & İndirim Oranı */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-orange-50/50 border border-orange-200/60">
                <div>
                  <label className="block font-bold text-orange-950 mb-1">
                    Özel Kupon Kodu (İsteğe Bağlı)
                  </label>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Örn: ATOLYE20"
                    className="w-full px-3 py-2 rounded-xl border border-orange-300 font-mono font-bold text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-orange-950 mb-1">
                    İndirim Oranı (%)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discountRate}
                      onChange={(e) => setDiscountRate(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-orange-300 font-mono font-bold text-xs bg-white"
                    />
                    <span className="font-bold text-orange-900">%</span>
                  </div>
                </div>
              </div>

              {/* CTA Buton Metni & URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Buton Yazısı (CTA)
                  </label>
                  <input
                    type="text"
                    value={ctaLabel}
                    onChange={(e) => setCtaLabel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Yönlendirilecek Sayfa Linki
                  </label>
                  <input
                    type="text"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Gönderici Adı */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Gönderici Adı (From Name)
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              {/* Gönderim Eylemleri */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(true)}
                  disabled={isSending}
                  className="px-4 py-3 rounded-xl border border-gray-300 hover:bg-slate-50 font-bold text-xs text-[#1B2A4A] transition flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4 text-gray-500" />
                  <span>Test E-Postası Gönder</span>
                </button>

                <button
                  type="button"
                  onClick={handleBroadcastCampaign}
                  disabled={isSending}
                  className="flex-1 px-6 py-3 rounded-xl bg-[#D96B27] hover:bg-[#c25a1e] text-white font-bold text-xs shadow-lg shadow-[#D96B27]/30 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Gönderiliyor (%{sendProgress})...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{targetSegment.split(' ')[0]} Kitlesine Gönder</span>
                    </>
                  )}
                </button>
              </div>

              {isSending && (
                <div className="space-y-1 pt-2">
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-[#D96B27] transition-all duration-300"
                      style={{ width: `${sendProgress}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-gray-400 text-center">
                    Toplu e-posta sunucusuna teslim ediliyor...
                  </div>
                </div>
              )}

            </div>

            {/* Sağ: Canlı E-Posta Önizlemesi (6 Sütun) */}
            <div className="lg:col-span-6 space-y-4">
              
              {/* Cihaz Değiştirme Çubuğu */}
              <div className="bg-white p-4 rounded-3xl border border-[#E8E2D9] shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1B2A4A]">
                  <Eye className="w-4 h-4 text-[#D96B27]" />
                  <span>Canlı E-Posta Tasarımı</span>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      previewDevice === 'desktop'
                        ? 'bg-white text-[#1B2A4A] shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Masaüstü (600px)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      previewDevice === 'mobile'
                        ? 'bg-white text-[#1B2A4A] shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobil (375px)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewDevice('code')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      previewDevice === 'code'
                        ? 'bg-white text-[#1B2A4A] shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>HTML</span>
                  </button>
                </div>
              </div>

              {/* Önizleme Çerçevesi */}
              <div className="bg-[#F6F4F0] p-4 rounded-3xl border border-[#E8E2D9] shadow-inner flex justify-center items-start min-h-[600px]">
                {previewDevice === 'code' ? (
                  <div className="w-full bg-slate-900 text-slate-100 rounded-2xl p-4 font-mono text-xs overflow-x-auto max-h-[700px] space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-[11px] text-slate-400">Duyarlı E-Posta HTML Çıktısı</span>
                      <button
                        type="button"
                        onClick={handleCopyHtml}
                        className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] flex items-center gap-1"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'Kopyalandı' : 'Kodu Kopyala'}</span>
                      </button>
                    </div>
                    <pre className="text-[11px] leading-relaxed text-emerald-300">
                      {renderedHtml}
                    </pre>
                  </div>
                ) : (
                  <div
                    className={`transition-all duration-300 shadow-2xl rounded-3xl overflow-hidden border border-gray-300 bg-white ${
                      previewDevice === 'mobile' ? 'w-[375px]' : 'w-full max-w-[600px]'
                    }`}
                  >
                    {/* Gelen Kutusu Başlık Çubuğu Simülasyonu */}
                    <div className="bg-slate-100 px-4 py-2.5 border-b border-gray-200 text-[11px] flex items-center justify-between text-gray-500">
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-bold text-[#1B2A4A]">{senderName}</span>
                        <span className="text-gray-400">&bull;</span>
                        <span className="truncate">{subject}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0">10:30</span>
                    </div>

                    {/* iframe İçi Canlı Render */}
                    <iframe
                      title="E-Posta Canlı Önizleme"
                      srcDoc={renderedHtml}
                      className="w-full h-[650px] border-0"
                      sandbox="allow-same-origin"
                    />
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* 5. SEKME 2: OTOMATİK E-POSTA KURALLARI (TRIGGERS) */}
      {activeTab === 'triggers' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-[#1B2A4A] text-sm">
                Otopilot E-Posta Tetikleyicileri (Triggers)
              </div>
              <p className="text-gray-600 text-xs mt-0.5 leading-relaxed">
                Müşterileriniz bir işlem yaptığında (yeni üye olduğunda, sepetinde ürün unuttuğunda veya atölyede siparişi döküldüğünde) sistem otomatik olarak Safirya şablonlu bildirim e-postası iletir.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {automatedTriggers.map((trigger) => (
              <div
                key={trigger.id}
                className={`p-6 rounded-3xl border bg-white shadow-sm flex flex-col justify-between gap-5 transition ${
                  trigger.isEnabled
                    ? 'border-gray-200'
                    : 'border-gray-200 opacity-60 bg-slate-50'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        trigger.isEnabled
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {trigger.isEnabled ? '● Aktif Otomasyon' : '○ Devre Dışı'}
                    </span>

                    {/* Switch */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={trigger.isEnabled}
                        onChange={() => toggleAutomatedTrigger(trigger.id)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div>
                    <h4 className="font-bold text-base text-[#1B2A4A]">{trigger.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {trigger.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-[#FAF8F5]">
                    <div className="text-[10px] text-gray-400 font-bold uppercase">Gecikme</div>
                    <div className="font-bold text-[#1B2A4A] mt-0.5">{trigger.delay}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#FAF8F5]">
                    <div className="text-[10px] text-gray-400 font-bold uppercase">Gönderim</div>
                    <div className="font-bold text-[#1B2A4A] mt-0.5">{trigger.sentCount}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#FAF8F5]">
                    <div className="text-[10px] text-gray-400 font-bold uppercase">Açılma</div>
                    <div className="font-bold text-emerald-600 mt-0.5">%{trigger.openRate}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. SEKME 3: GÖNDERİM GEÇMİŞİ & RAPORLAR */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-[#E8E2D9] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[#1B2A4A]">Önceki E-Posta Kampanyaları</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Gönderilmiş ve zamanlanmış tüm toplu bültenlerin performans analizleri
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('composer')}
                className="px-4 py-2 rounded-xl bg-[#D96B27] text-white font-bold text-xs shadow-md shadow-[#D96B27]/20 flex items-center gap-1.5 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Yeni Kampanya Başlat</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-6 font-bold">Kampanya & Konu</th>
                    <th className="py-3.5 px-4 font-bold">Şablon</th>
                    <th className="py-3.5 px-4 font-bold">Hedef Kitle</th>
                    <th className="py-3.5 px-4 font-bold">Gönderim Tarihi</th>
                    <th className="py-3.5 px-4 font-bold">Alıcı</th>
                    <th className="py-3.5 px-4 font-bold">Açılma</th>
                    <th className="py-3.5 px-4 font-bold">Tıklanma</th>
                    <th className="py-3.5 px-6 font-bold text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {campaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-6">
                        <div className="font-bold text-sm text-[#1B2A4A]">{camp.name}</div>
                        <div className="text-gray-500 text-[11px] truncate max-w-xs mt-0.5">
                          {camp.subject}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-100 text-[#D96B27]">
                          {camp.templateType.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-700">
                        {camp.targetSegment}
                      </td>
                      <td className="py-4 px-4 font-mono text-gray-500">
                        {camp.sentAt || 'Taslak'}
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-[#1B2A4A]">
                        {camp.recipientCount.toLocaleString('tr-TR')}
                      </td>
                      <td className="py-4 px-4 font-bold text-emerald-600 font-mono">
                        %{camp.openRate || 0}
                      </td>
                      <td className="py-4 px-4 font-bold text-blue-600 font-mono">
                        %{camp.clickRate || 0}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const html = generateCampaignEmailHtml({
                                campaignName: camp.name,
                                subject: camp.subject,
                                preheader: camp.preheader,
                                templateType: camp.templateType,
                                headline: camp.headline,
                                bodyText: camp.bodyText,
                                heroImageUrl: camp.heroImageUrl,
                                couponCode: camp.couponCode,
                                discountRate: camp.discountRate,
                                ctaLabel: camp.ctaLabel,
                                ctaUrl: camp.ctaUrl,
                                senderName: camp.senderName,
                              });
                              setPreviewModalHtml(html);
                            }}
                            className="p-1.5 rounded-lg border border-gray-200 hover:bg-white text-gray-600 transition"
                            title="Önizle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteCampaign(camp.id)}
                            className="p-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition"
                            title="Sil"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. HIZLI TEST POSTASI MODALI */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#E8E2D9] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#D96B27] flex items-center justify-center font-bold">
                  <Send className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-[#1B2A4A]">Test E-Postası Gönder</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Hazırladığınız e-posta tasarımının gelen kutusunda nasıl göründüğünü kontrol etmek için kendi e-posta adresinize bir örnek gönderin.
            </p>

            <form onSubmit={handleSendTestEmail} className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 text-xs mb-1">
                  Alıcı E-Posta Adresi *
                </label>
                <input
                  type="email"
                  required
                  value={testEmailInput}
                  onChange={(e) => setTestEmailInput(e.target.value)}
                  placeholder="ornek@alanadi.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-mono text-xs focus:ring-2 focus:ring-[#D96B27]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-600 hover:bg-slate-50 transition"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-5 py-2.5 rounded-xl bg-[#D96B27] hover:bg-[#c25a1e] text-white text-xs font-bold shadow-md shadow-[#D96B27]/30 flex items-center gap-2 transition"
                >
                  {isSending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Testi Gönder</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. ÖNİZLEME MODALI (GEÇMİŞ KAMPANYALAR İÇİN) */}
      {previewModalHtml && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#E8E2D9] shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="font-bold text-sm text-[#1B2A4A]">E-Posta Önizlemesi</span>
              <button
                type="button"
                onClick={() => setPreviewModalHtml(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden rounded-2xl border border-gray-200">
              <iframe
                title="E-Posta Önizlemesi"
                srcDoc={previewModalHtml}
                className="w-full h-[550px] border-0"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
