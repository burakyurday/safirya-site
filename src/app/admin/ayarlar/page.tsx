'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Settings,
  Truck,
  Gift,
  Megaphone,
  FileEdit,
  Save,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  Send,
  MessageSquare,
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  RefreshCw,
  Palette,
  ExternalLink,
  Smartphone,
  ChevronDown,
  CreditCard,
  ShieldCheck,
  Key,
  Copy,
  Check,
  Bell,
  History,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { addSiteNotification } from '@/lib/notifications/orderNotifications';

export default function AyarlarPage() {
  const {
    settings,
    updateSettings,
    cmsPages,
    updateCmsPage,
    purgeAllDemoData,
    showToast,
    webhookLogs,
    triggerWebhook,
    clearWebhookLogs,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<'logo' | 'store' | 'payment' | 'cms' | 'webhook'>('logo');

  // Webhook Otomasyon State'leri
  const [webhookEnabled, setWebhookEnabled] = useState<boolean>(settings.webhookEnabled ?? false);
  const [webhookUrl, setWebhookUrl] = useState<string>(settings.webhookUrl || '');
  const [webhookSecret, setWebhookSecret] = useState<string>(settings.webhookSecret || '');
  const [webhookEvents, setWebhookEvents] = useState<string[]>(
    settings.webhookEvents || ['order.stage_changed', 'order.photo_uploaded', 'order.contract_signed']
  );
  const [testWebhookStatus, setTestWebhookStatus] = useState<string | null>(null);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  // PayTR Ödeme Altyapısı State'leri
  const [paytrMerchantId, setPaytrMerchantId] = useState(settings.paytrMerchantId || '');
  const [paytrMerchantKey, setPaytrMerchantKey] = useState(settings.paytrMerchantKey || '');
  const [paytrMerchantSalt, setPaytrMerchantSalt] = useState(settings.paytrMerchantSalt || '');
  const [paytrTestMode, setPaytrTestMode] = useState<boolean>(settings.paytrTestMode ?? true);
  const [paytrDebugOn, setPaytrDebugOn] = useState<boolean>(settings.paytrDebugOn ?? false);
  const [copiedCallbackUrl, setCopiedCallbackUrl] = useState(false);

  // 0. Marka & Logo Yönetimi Form State
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [logoDarkUrl, setLogoDarkUrl] = useState(settings.logoDarkUrl || '');
  const [logoText, setLogoText] = useState(settings.logoText || 'SAFİRYA');
  const [brandTagline, setBrandTagline] = useState(settings.brandTagline || 'El Yapımı Tasarım Atölyesi');
  const [logoScale, setLogoScale] = useState<number>(settings.logoScale || 100);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState<'store' | 'admin' | 'mobile'>('store');

  // 1. Vitrin & Sistem Ayarları Form State
  const [announcementText, setAnnouncementText] = useState(settings.announcementText);
  const [isAnnouncementActive, setIsAnnouncementActive] = useState(settings.isAnnouncementActive);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(settings.freeShippingThreshold);
  const [giftWrapFee, setGiftWrapFee] = useState<number>(settings.giftWrapFee);
  const [storeName, setStoreName] = useState(settings.storeName);
  const [contactEmail, setContactEmail] = useState(settings.contactEmail);
  const [contactPhone, setContactPhone] = useState(settings.contactPhone);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [instagramHandle, setInstagramHandle] = useState(settings.instagramHandle);
  const [atelierAddress, setAtelierAddress] = useState(settings.atelierAddress);
  const [promoPopupEnabled, setPromoPopupEnabled] = useState(settings.promoPopupEnabled);
  const [promoPopupTitle, setPromoPopupTitle] = useState(settings.promoPopupTitle || '');

  // Müşteri Bildirim Ayarları (Sadeleştirilmiş Son Kullanıcı Formu)
  const [whatsappNotificationsEnabled, setWhatsappNotificationsEnabled] = useState(
    settings.whatsappNotificationsEnabled ?? false
  );
  const [whatsappPhoneNumberId, setWhatsappPhoneNumberId] = useState(
    settings.whatsappPhoneNumberId || ''
  );
  const [whatsappAccessToken, setWhatsappAccessToken] = useState(
    settings.whatsappAccessToken || ''
  );
  const [whatsappTemplateName, setWhatsappTemplateName] = useState(
    settings.whatsappTemplateName || 'safirya_stage_update'
  );
  const [smtpHost, setSmtpHost] = useState(settings.smtpHost || 'smtp.resend.com');
  const [smtpPort, setSmtpPort] = useState<number>(settings.smtpPort || 587);
  const [smtpUser, setSmtpUser] = useState(settings.smtpUser || 'resend');
  const [smtpPass, setSmtpPass] = useState(settings.smtpPass || '');
  const [smtpFrom, setSmtpFrom] = useState(
    settings.smtpFrom
      ? settings.smtpFrom.replace(/@safirya\.com/gi, '@safirya.tr')
      : 'Safirya Atölyesi <bildirim@safirya.tr>'
  );
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [emailTestStatus, setEmailTestStatus] = useState<string | null>(null);
  const [testEmailRecipient, setTestEmailRecipient] = useState('');

  // Sipariş Hareketleri ve Bildirim Tercihleri State'leri
  const [notifyOnOrderReceived, setNotifyOnOrderReceived] = useState<boolean>(
    settings.notifyOnOrderReceived ?? true
  );
  const [notifyOnOrderProduction, setNotifyOnOrderProduction] = useState<boolean>(
    settings.notifyOnOrderProduction ?? true
  );
  const [notifyOnOrderQuality, setNotifyOnOrderQuality] = useState<boolean>(
    settings.notifyOnOrderQuality ?? true
  );
  const [notifyOnOrderShipped, setNotifyOnOrderShipped] = useState<boolean>(
    settings.notifyOnOrderShipped ?? true
  );
  const [notifyOnOrderDelivered, setNotifyOnOrderDelivered] = useState<boolean>(
    settings.notifyOnOrderDelivered ?? true
  );
  const [notifyChannelSite, setNotifyChannelSite] = useState<boolean>(
    settings.notifyChannelSite ?? true
  );
  const [notifyChannelEmail, setNotifyChannelEmail] = useState<boolean>(
    settings.notifyChannelEmail ?? true
  );

  // 2. CMS Kurumsal Sayfalar Form State
  const [selectedSlug, setSelectedSlug] = useState<string>('hakkimizda');
  const currentPage = cmsPages[selectedSlug] || {
    slug: selectedSlug,
    title: '',
    subtitle: '',
    content: '',
    updatedAt: '',
  };

  const [pageTitle, setPageTitle] = useState(currentPage.title);
  const [pageSubtitle, setPageSubtitle] = useState(currentPage.subtitle);
  const [pageContent, setPageContent] = useState(currentPage.content);

  // Sayfa seçimi değiştiğinde formu güncelle
  const handleSelectPage = (slug: string) => {
    setSelectedSlug(slug);
    const p = cmsPages[slug];
    if (p) {
      setPageTitle(p.title);
      setPageSubtitle(p.subtitle);
      setPageContent(p.content);
    }
  };

  const handleSaveWebhookSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      webhookEnabled,
      webhookUrl: webhookUrl.trim(),
      webhookSecret: webhookSecret.trim(),
      webhookEvents,
    });
    showToast('Webhook entegrasyon ayarları başarıyla kaydedildi.');
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl.trim()) {
      alert('Lütfen önce geçerli bir Webhook URL giriniz.');
      return;
    }
    setIsTestingWebhook(true);
    setTestWebhookStatus(null);
    try {
      const res = await triggerWebhook('order.stage_changed', 'TEST-SFR-2026', {
        event: 'order.stage_changed',
        orderNumber: 'TEST-SFR-2026',
        customerName: 'Test Müşteri',
        previousStage: 'SIPARIS_ALINDI',
        newStage: 'ATOLYEDE_URETIMDE',
        itemSummary: 'Doğal Kehribar Soya Mumu (x50 Adet)',
        note: 'Bu bir test webhook iletisidir.',
      });
      if (res.success) {
        setTestWebhookStatus(`✅ Webhook Başarılı! Hedef yanıt kodu: ${res.statusCode || 200}`);
      } else {
        setTestWebhookStatus(`❌ Webhook Başarısız: ${res.message || 'Hedef sunucu yanıt vermedi'}`);
      }
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleTestEmailConnection = async () => {
    setIsTestingEmail(true);
    setEmailTestStatus(null);
    try {
      const target = testEmailRecipient.trim() || 'destek@safirya.tr';
      const res = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEmail: target,
          apiKey: smtpPass || undefined,
          from: smtpFrom || undefined,
          smtpSettings: {
            host: smtpHost || undefined,
            port: smtpPort || undefined,
            user: smtpUser || undefined,
            pass: smtpPass || undefined,
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailTestStatus(`✅ Başarılı! ${target} adresine test e-postası Resend (${data.messageId || 'OK'}) ile iletildi.`);
        showToast('Resend bağlantısı başarılı! Test e-postası gönderildi.');
      } else {
        setEmailTestStatus(`❌ Başarısız: ${data.error || 'Resend ile bağlantı kurulamadı.'}`);
        showToast(`E-posta testi başarısız: ${data.error || 'Bilinmeyen hata'}`);
      }
    } catch (err: any) {
      setEmailTestStatus(`❌ Ağ Hatası: ${err.message}`);
    } finally {
      setIsTestingEmail(false);
    }
  };

  // Butik Zanaat Logo Şablonları (SVG Vektörel)
  const PRESET_LOGOS = [
    {
      id: 'emblem',
      name: 'Safirya Zanaat Amblemi (Rozet)',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="44" viewBox="0 0 160 44"><rect width="40" height="40" rx="4" y="2" fill="%23C85A32"/><path d="M20 10l2.5 6.5L29 19l-6.5 2.5L20 28l-2.5-6.5L11 19l6.5-2.5z" fill="%23FFFFFF"/><text x="48" y="25" font-family="Georgia, serif" font-weight="700" font-size="18" letter-spacing="2" fill="%23231B18">SAFİRYA</text><text x="49" y="36" font-family="system-ui, sans-serif" font-weight="600" font-size="8" letter-spacing="1.5" fill="%23C85A32">ZANAAT ATÖLYESİ</text></svg>',
    },
    {
      id: 'minimal',
      name: 'Minimal Tipografi & İnce Çizgi',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="40" viewBox="0 0 150 40"><text x="0" y="24" font-family="Georgia, serif" font-weight="700" font-size="22" letter-spacing="3" fill="%23231B18">SAFİRYA</text><line x1="0" y1="30" x2="135" y2="30" stroke="%23C85A32" stroke-width="1.5"/><text x="0" y="38" font-family="system-ui" font-weight="500" font-size="7" letter-spacing="2" fill="%238C827A">KADIKÖY &bull; EST. 2024</text></svg>',
    },
    {
      id: 'candle',
      name: 'Mum & Alev İkonlu Zanaat Logosu',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="44" viewBox="0 0 160 44"><circle cx="20" cy="22" r="17" fill="%23F6F3EC" stroke="%23C85A32" stroke-width="1.5"/><path d="M20 11c-2.5 3.5-4 5.5-4 8 0 2.2 1.8 4 4 4s4-1.8 4-4c0-2.5-1.5-4.5-4-8z" fill="%23C85A32"/><text x="46" y="24" font-family="Georgia, serif" font-weight="700" font-size="18" letter-spacing="2" fill="%23231B18">SAFİRYA</text><text x="47" y="35" font-family="system-ui, sans-serif" font-weight="600" font-size="8" letter-spacing="1.5" fill="%235F6F52">EL YAPIMI TASARIM</text></svg>',
    },
  ];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, isDark = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Lütfen geçerli bir görsel dosyası seçin (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Görsel boyutu en fazla 2 MB olmalıdır.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (isDark) {
        setLogoDarkUrl(result);
      } else {
        setLogoUrl(result);
      }
      setIsUploading(false);
      showToast('Görsel başarıyla yüklendi! "Ayarları Kaydet" ile kaydedebilirsiniz.');
    };
    reader.onerror = () => {
      setUploadError('Görsel okunurken bir hata oluştu.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveLogoSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      logoUrl,
      logoDarkUrl,
      logoText,
      brandTagline,
      logoScale: Number(logoScale),
    });
    showToast('Marka logosu ve vitrin kimliği başarıyla kaydedildi!');
  };

  const handleSaveStoreSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      announcementText,
      isAnnouncementActive,
      freeShippingThreshold: Number(freeShippingThreshold),
      giftWrapFee: Number(giftWrapFee),
      storeName,
      contactEmail,
      contactPhone,
      whatsappNumber,
      instagramHandle,
      atelierAddress,
      promoPopupEnabled,
      promoPopupTitle,
      whatsappNotificationsEnabled,
      whatsappPhoneNumberId,
      whatsappAccessToken,
      whatsappTemplateName,
      smtpHost,
      smtpPort: Number(smtpPort),
      smtpUser,
      smtpPass,
      smtpFrom: (smtpFrom || '').replace(/[\r\n\t]+/g, ' ').trim(),
      notifyOnOrderReceived,
      notifyOnOrderProduction,
      notifyOnOrderQuality,
      notifyOnOrderShipped,
      notifyOnOrderDelivered,
      notifyChannelSite,
      notifyChannelEmail,
    });
    showToast('Mağaza ve bildirim ayarları başarıyla güncellendi!');
  };

  const handleSavePaymentSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      paytrMerchantId: paytrMerchantId.trim(),
      paytrMerchantKey: paytrMerchantKey.trim(),
      paytrMerchantSalt: paytrMerchantSalt.trim(),
      paytrTestMode,
      paytrDebugOn,
    });
    showToast('✓ PayTR ödeme altyapı ayarları güncellendi!');
  };

  const handleSaveCmsPage = (e: React.FormEvent) => {
    e.preventDefault();
    updateCmsPage(selectedSlug, {
      title: pageTitle,
      subtitle: pageSubtitle,
      content: pageContent,
    });
    showToast('Kurumsal sayfa içeriği vitrinde güncellendi!');
  };

  // Zengin Metin Düzenleme Araçları
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('cms-editor-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = pageContent.substring(start, end);
    const replacement = `${prefix}${selectedText || 'metin'}${suffix}`;

    const newContent =
      pageContent.substring(0, start) +
      replacement +
      pageContent.substring(end);

    setPageContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText ? selectedText.length : 5)
      );
    }, 50);
  };

  // Basit Markdown HTML Renderer
  const renderMarkdown = (text: string) => {
    let html = text
      .replace(/^### (.*$)/gim, '<h3 class="font-serif text-lg font-medium text-[#231B18] mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="font-serif text-xl font-normal text-[#231B18] mt-6 mb-3 border-b border-[#E2DCD3] pb-2">$1</h2>')
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-semibold text-[#231B18]">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-stone-700 my-1">$1</li>')
      .replace(/\n$/gim, '<br />');

    return { __html: html };
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 1. ÜST BAŞLIK */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E2DCD3] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] tracking-widest text-[#C85A32] uppercase font-bold">
            Safirya Yapılandırma
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#231B18] font-normal mt-1">
            Mağaza Ayarları
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Logo, kargo limitleri, mağaza iletişim bilgileri ve kurumsal sayfaları buradan yönetin.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="px-4 py-2 rounded-md border border-[#E2DCD3] bg-[#FAF8F5] hover:border-[#231B18] text-xs font-medium text-[#231B18] flex items-center gap-1.5 transition shrink-0"
        >
          <Eye className="w-3.5 h-3.5 text-stone-500" />
          <span>Vitrini Görüntüle</span>
        </Link>
      </div>

      {/* 2. SEKMELER */}
      <div className="bg-white p-2 sm:p-3 rounded-xl border border-[#E2DCD3] shadow-2xs flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveTab('logo')}
          className={`px-4 py-2 rounded-md text-xs font-medium transition flex items-center gap-2 ${
            activeTab === 'logo'
              ? 'bg-[#231B18] text-white shadow-xs'
              : 'bg-[#FAF8F5] text-stone-700 hover:bg-[#EFECE6]'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-[#C85A32]" />
          <span>Marka & Logo</span>
        </button>

        <button
          onClick={() => setActiveTab('store')}
          className={`px-4 py-2 rounded-md text-xs font-medium transition flex items-center gap-2 ${
            activeTab === 'store'
              ? 'bg-[#231B18] text-white shadow-xs'
              : 'bg-[#FAF8F5] text-stone-700 hover:bg-[#EFECE6]'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#C85A32]" />
          <span>Mağaza & Kargo Ayarları</span>
        </button>

        <button
          onClick={() => setActiveTab('payment')}
          className={`px-4 py-2 rounded-md text-xs font-medium transition flex items-center gap-2 ${
            activeTab === 'payment'
              ? 'bg-[#231B18] text-white shadow-xs'
              : 'bg-[#FAF8F5] text-stone-700 hover:bg-[#EFECE6]'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-[#C85A32]" />
          <span>Ödeme & PayTR</span>
        </button>

        <button
          onClick={() => setActiveTab('cms')}
          className={`px-4 py-2 rounded-md text-xs font-medium transition flex items-center gap-2 ${
            activeTab === 'cms'
              ? 'bg-[#231B18] text-white shadow-xs'
              : 'bg-[#FAF8F5] text-stone-700 hover:bg-[#EFECE6]'
          }`}
        >
          <FileEdit className="w-3.5 h-3.5 text-[#C85A32]" />
          <span>Kurumsal Sayfalar (CMS)</span>
        </button>

        <button
          onClick={() => setActiveTab('webhook')}
          className={`px-4 py-2 rounded-md text-xs font-medium transition flex items-center gap-2 ${
            activeTab === 'webhook'
              ? 'bg-[#231B18] text-white shadow-xs'
              : 'bg-[#FAF8F5] text-stone-700 hover:bg-[#EFECE6]'
          }`}
        >
          <Bell className="w-3.5 h-3.5 text-[#C85A32]" />
          <span>Webhook & API Otomasyonu</span>
        </button>

        <Link
          href="/admin/konsept-tasarimlari"
          className="px-4 py-2 rounded-md text-xs font-medium transition flex items-center gap-2 bg-[#FAF8F5] text-stone-700 hover:bg-[#EFECE6] border border-[#E2DCD3]"
        >
          <ImageIcon className="w-3.5 h-3.5 text-[#C85A32]" />
          <span>Konsept Tasarımları & Vitrin →</span>
        </Link>
      </div>


      {/* 3. İÇERİK: SEKME 1 - MARKA & LOGO YÖNETİMİ */}
      {activeTab === 'logo' && (
        <div className="space-y-6 text-xs animate-fadeIn">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Sol: Logo Ayar Formu */}
            <form onSubmit={handleSaveLogoSettings} className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E2DCD3] shadow-2xs space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#E2DCD3]">
                <div>
                  <h3 className="font-serif text-base text-[#231B18] font-normal">Logo Görseli & Başlık</h3>
                  <p className="text-[11px] text-stone-500">PNG, SVG veya WebP formatında dosya yükleyebilirsiniz</p>
                </div>

                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setLogoUrl('');
                      showToast('Logo görseli kaldırıldı. Varsayılan tipografiye dönüldü.');
                    }}
                    className="px-2.5 py-1 rounded border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 font-medium text-[11px] flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3 h-3 text-stone-500" />
                    <span>Görseli Kaldır</span>
                  </button>
                )}
              </div>

              {uploadError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Bilgisayardan Logo Yükleme */}
              <div>
                <label className="block font-medium text-stone-800 mb-1.5">
                  1. Bilgisayarınızdan Logo Yükleyin
                </label>
                <div className="relative border-2 border-dashed border-[#E2DCD3] hover:border-[#C85A32] rounded-xl p-6 text-center bg-[#FAF8F5] transition cursor-pointer group">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/svg+xml, image/webp"
                    onChange={(e) => handleLogoUpload(e, false)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={isUploading}
                  />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-white shadow-xs border border-[#E2DCD3] flex items-center justify-center text-[#C85A32] group-hover:scale-105 transition-transform">
                      {isUploading ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <UploadCloud className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-stone-800 group-hover:text-[#C85A32] transition">
                        Görsel Seçmek İçin Tıklayın
                      </span>
                      <span className="text-stone-500 font-normal"> veya sürükleyip bırakın</span>
                    </div>
                    <p className="text-[11px] text-stone-400">
                      Önerilen: Şeffaf arka planlı PNG veya SVG (Maks. 2 MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Logo Metni & Slogan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-stone-800 mb-1">
                    Logo Metni (Görsel Yokken Görünür)
                  </label>
                  <input
                    type="text"
                    value={logoText}
                    onChange={(e) => setLogoText(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-[#E2DCD3] text-xs focus:ring-1 focus:ring-[#C85A32]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-800 mb-1">
                    Alt Slogan
                  </label>
                  <input
                    type="text"
                    value={brandTagline}
                    onChange={(e) => setBrandTagline(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-[#E2DCD3] text-xs focus:ring-1 focus:ring-[#C85A32]"
                  />
                </div>
              </div>

              {/* Hazır Logo Presetleri */}
              <div>
                <label className="block font-medium text-stone-800 mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>Veya Hazır Zanaat Logo Şablonu Seçin</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {PRESET_LOGOS.map((preset) => {
                    const isSelected = logoUrl === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setLogoUrl(preset.url);
                          showToast(`"${preset.name}" seçildi.`);
                        }}
                        className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-3 ${
                          isSelected
                            ? 'border-[#C85A32] bg-[#FAF8F5]'
                            : 'border-[#E2DCD3] hover:border-stone-400 bg-white'
                        }`}
                      >
                        <div className="h-10 flex items-center justify-center p-1 bg-white rounded border border-[#E2DCD3]/50">
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="max-h-8 max-w-full object-contain"
                          />
                        </div>
                        <span className="text-[11px] font-medium text-stone-800 truncate">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-[#C85A32] hover:bg-[#B34E2A] text-white font-medium text-xs shadow-xs flex items-center gap-1.5 transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Logo Ayarlarını Kaydet</span>
                </button>
              </div>
            </form>

            {/* Sağ: Canlı Önizleme */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-[#E2DCD3] shadow-2xs space-y-4">
                <h3 className="font-serif text-base text-[#231B18] font-normal">
                  Canlı Vitrin Önizlemesi
                </h3>
                <p className="text-[11px] text-stone-500">
                  Header ve menülerinizde logonun nasıl göründüğünü kontrol edin.
                </p>

                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DCD3] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Logo Önizleme"
                        className="h-9 w-auto max-w-[140px] object-contain"
                      />
                    ) : (
                      <div>
                        <span className="font-serif text-lg tracking-wider text-[#231B18]">
                          {logoText || 'SAFİRYA'}
                        </span>
                        <span className="text-[9px] tracking-widest uppercase text-[#C85A32] font-semibold block">
                          {brandTagline || 'Zanaat Atölyesi'}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-400 font-medium">Header Görünümü</span>
                </div>

                <div className="p-4 rounded-xl bg-[#231B18] text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {logoDarkUrl || logoUrl ? (
                      <img
                        src={logoDarkUrl || logoUrl}
                        alt="Koyu Logo Önizleme"
                        className="h-8 w-auto max-w-[130px] object-contain"
                      />
                    ) : (
                      <span className="font-serif text-base tracking-wider text-[#F6F3EC]">
                        {logoText || 'SAFİRYA'}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-400 font-medium">Koyu Arka Plan</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 4. İÇERİK: SEKME 2 - MAĞAZA & KARGO AYARLARI */}
      {activeTab === 'store' && (
        <form onSubmit={handleSaveStoreSettings} className="space-y-6 text-xs">
          
          {/* Kargo & Sipariş Seçenekleri */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2DCD3] shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E2DCD3]">
              <Truck className="w-4 h-4 text-[#C85A32]" />
              <h3 className="font-serif text-base text-[#231B18] font-normal">
                Kargo & Paketleme Kuralları
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DCD3] space-y-2">
                <label className="block font-medium text-stone-800">
                  Ücretsiz Kargo Sepet Alt Limiti (₺)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={freeShippingThreshold}
                    onChange={(e) => setFreeShippingThreshold(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E2DCD3] font-semibold text-xs bg-white"
                  />
                  <span className="font-semibold text-stone-500">TL</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Bu tutarın üzerindeki sepetlerde kargo müşteriye ücretsiz olarak yansır.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DCD3] space-y-2">
                <label className="block font-medium text-stone-800">
                  Özel Atölye Hediye Paketi Ücreti (₺)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={giftWrapFee}
                    onChange={(e) => setGiftWrapFee(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E2DCD3] font-semibold text-xs bg-white"
                  />
                  <span className="font-semibold text-stone-500">TL</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Özel mühürlü kutu ve el yazısı zanaat not kartı için sepete eklenen tutar.
                </p>
              </div>
            </div>
          </div>

          {/* Üst Duyuru Bandı */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2DCD3] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2DCD3]">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#C85A32]" />
                <h3 className="font-serif text-base text-[#231B18] font-normal">
                  Üst Duyuru Bandı (Header)
                </h3>
              </div>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-xs text-stone-700">
                <input
                  type="checkbox"
                  checked={isAnnouncementActive}
                  onChange={(e) => setIsAnnouncementActive(e.target.checked)}
                  className="rounded text-[#C85A32] focus:ring-[#C85A32] w-4 h-4"
                />
                <span>Bandı Vitrinde Göster</span>
              </label>
            </div>

            <div>
              <label className="block font-medium text-stone-800 mb-1">
                Duyuru Metni
              </label>
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Örn: ₺500 ve Üzeri Siparişlerde Ücretsiz Kargo"
                className="w-full px-3.5 py-2 rounded-lg border border-[#E2DCD3] text-xs focus:ring-1 focus:ring-[#C85A32]"
              />
            </div>
          </div>

          {/* Mağaza İletişim Bilgileri */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2DCD3] shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E2DCD3]">
              <MapPin className="w-4 h-4 text-[#C85A32]" />
              <h3 className="font-serif text-base text-[#231B18] font-normal">
                Atölye İletişim Bilgileri
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-stone-800 mb-1">Mağaza Ticari Ünvanı</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#E2DCD3] text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-800 mb-1">E-Posta Adresi</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#E2DCD3] text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-800 mb-1">Telefon Numarası</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#E2DCD3] text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-800 mb-1">WhatsApp Sipariş Hattı</label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#E2DCD3] text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-stone-800 mb-1">Instagram Hesabı</label>
                <input
                  type="text"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#E2DCD3] text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-stone-800 mb-1">Atölye Açık Adresi (İzmir / Karşıyaka - Online)</label>
                <textarea
                  rows={2}
                  value={atelierAddress}
                  onChange={(e) => setAtelierAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#E2DCD3] text-xs"
                />
              </div>
            </div>
          </div>

          {/* MÜŞTERİ BİLDİRİM SERVİSLERİ (SADELEŞTİRİLMİŞ SON KULLANICI GÖRÜNÜMÜ) */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2DCD3] shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2DCD3]">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[#C85A32]" />
                <h3 className="font-serif text-base text-[#231B18] font-normal">
                  Otomatik Müşteri Bildirimleri
                </h3>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-[#5F6F52]/10 text-[#5F6F52]">
                Aktif
              </span>
            </div>

            <p className="text-xs text-stone-600">
              Sipariş alındığında, atölyede hazırlandığında veya kargoya verildiğinde müşterilerinize otomatik durum güncellemesi iletilir.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* E-Posta Bildirimi Kartı */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DCD3] space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-[#231B18] text-white flex items-center justify-center text-xs">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#231B18] text-xs">E-Posta Bildirimleri</h4>
                    <p className="text-[11px] text-stone-500">Sipariş onayı & kargo takip e-postası</p>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div>
                    <label className="block text-stone-700 font-medium mb-1">
                      Gönderici E-Posta / Başlık
                    </label>
                    <input
                      type="text"
                      placeholder="Safirya Atölyesi <bildirim@safirya.tr>"
                      value={smtpFrom}
                      onChange={(e) => setSmtpFrom(e.target.value.replace(/[\r\n]+/g, ' '))}
                      className="w-full px-3 py-1.5 rounded-md border border-[#E2DCD3] bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1">
                      E-Posta Servis Anahtarı (API Key / Şifre)
                    </label>
                    <input
                      type="password"
                      placeholder="re_•••••••••••• (Varsayılan Safirya Anahtarı Aktif)"
                      value={smtpPass}
                      onChange={(e) => setSmtpPass(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-md border border-[#E2DCD3] bg-white font-mono text-xs"
                    />
                  </div>

                  {/* Teknik Detayları İhtiyaç Halinde Açılır Akordiyona Gizledik */}
                  <details className="pt-1 text-[11px] text-stone-500 group">
                    <summary className="cursor-pointer font-medium hover:text-[#231B18] flex items-center gap-1 list-none">
                      <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
                      <span>Gelişmiş Sunucu Ayarları (Özel SMTP Host/Port)</span>
                    </summary>
                    <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-[#E2DCD3]">
                      <div className="col-span-2">
                        <label className="block text-[10px] text-stone-600 mb-0.5">Sunucu (Host)</label>
                        <input
                          type="text"
                          value={smtpHost}
                          onChange={(e) => setSmtpHost(e.target.value)}
                          className="w-full px-2 py-1 rounded border border-[#E2DCD3] bg-white font-mono text-[10px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-stone-600 mb-0.5">Port</label>
                        <input
                          type="number"
                          value={smtpPort}
                          onChange={(e) => setSmtpPort(parseInt(e.target.value) || 587)}
                          className="w-full px-2 py-1 rounded border border-[#E2DCD3] bg-white font-mono text-[10px]"
                        />
                      </div>
                    </div>
                  </details>

                  {/* Resend Altyapı Durumu & Canlı Test Bölümü */}
                  <div className="pt-2 border-t border-[#E2DCD3] space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Resend Altyapısı Aktif
                      </span>
                      <span className="text-stone-500 font-mono text-[10px]">
                        safirya.tr (Doğrulanmış)
                      </span>
                    </div>

                    <div className="flex gap-1.5 items-center">
                      <input
                        type="email"
                        placeholder="test@ornek.com (Test alıcısı)"
                        value={testEmailRecipient}
                        onChange={(e) => setTestEmailRecipient(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 rounded-md border border-[#E2DCD3] bg-white text-xs placeholder:text-stone-400"
                      />
                      <button
                        type="button"
                        onClick={handleTestEmailConnection}
                        disabled={isTestingEmail}
                        className="px-3 py-1.5 rounded-md bg-[#231B18] text-white hover:bg-[#3E342F] disabled:opacity-50 text-xs font-medium whitespace-nowrap cursor-pointer transition-colors"
                      >
                        {isTestingEmail ? 'Gönderiliyor...' : 'Test E-Postası Gönder'}
                      </button>
                    </div>

                    {emailTestStatus && (
                      <div
                        className={`p-2 rounded-md text-[11px] font-medium leading-relaxed ${
                          emailTestStatus.includes('✅')
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                      >
                        {emailTestStatus}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* WhatsApp Bildirimi Kartı */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DCD3] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-[#5F6F52] text-white flex items-center justify-center text-xs">
                      <MessageCircle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[#231B18] text-xs">WhatsApp Bildirimleri</h4>
                      <p className="text-[11px] text-stone-500">Müşteriye aşama fotoğrafı & mesaj</p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={whatsappNotificationsEnabled}
                      onChange={(e) => setWhatsappNotificationsEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#5F6F52]"></div>
                  </label>
                </div>

                <div className="space-y-2 pt-1">
                  <div>
                    <label className="block text-stone-700 font-medium mb-1">
                      Bildirim Gönderim Numarası
                    </label>
                    <input
                      type="text"
                      placeholder="+90 532 ..."
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-md border border-[#E2DCD3] bg-white text-xs"
                    />
                  </div>

                  {/* Teknik Detayları İhtiyaç Halinde Açılır Akordiyona Gizledik */}
                  <details className="pt-1 text-[11px] text-stone-500 group">
                    <summary className="cursor-pointer font-medium hover:text-[#231B18] flex items-center gap-1 list-none">
                      <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
                      <span>Gelişmiş Geliştirici Ayarları (Meta API)</span>
                    </summary>
                    <div className="space-y-2 mt-2 pt-2 border-t border-[#E2DCD3]">
                      <div>
                        <label className="block text-[10px] text-stone-600 mb-0.5">Phone Number ID</label>
                        <input
                          type="text"
                          value={whatsappPhoneNumberId}
                          onChange={(e) => setWhatsappPhoneNumberId(e.target.value)}
                          className="w-full px-2 py-1 rounded border border-[#E2DCD3] bg-white font-mono text-[10px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-stone-600 mb-0.5">Access Token</label>
                        <input
                          type="password"
                          value={whatsappAccessToken}
                          onChange={(e) => setWhatsappAccessToken(e.target.value)}
                          className="w-full px-2 py-1 rounded border border-[#E2DCD3] bg-white font-mono text-[10px]"
                        />
                      </div>
                    </div>
                  </details>
                </div>
              </div>

            </div>

            {/* SİPARİŞ HAREKETLERİ SEÇİMİ (YÖNETİM PANELİNDEN SEÇİLEBİLİR) */}
            <div className="pt-4 border-t border-[#E2DCD3] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-sm text-[#231B18] font-normal flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-[#C85A32]" />
                    <span>Hangi Sipariş Hareketleri Bildirim Olarak Gönderilsin?</span>
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Seçtiğiniz aşamalarda müşteriye otomatik bildirim iletilir. İstemediğiniz adımları kapatabilirsiniz.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    addSiteNotification({
                      title: '🎨 Test Sipariş Bildirimi',
                      message: 'Siparişiniz #SFR-TEST atölyede üretime alındı! Bu bir deneme bildirimidir.',
                      orderNumber: 'SFR-TEST',
                      stageName: 'Atölyede Üretimde',
                      type: 'order_stage',
                      link: '/siparis-takip?orderNumber=SFR-TEST',
                    });
                    showToast('✓ Test bildirimi oluşturuldu! Giriş yapılmışsa ana sayfa bildirim çanına yansıdı.');
                  }}
                  className="px-3 py-1.5 rounded-md border border-[#E2DCD3] bg-[#FAF8F5] hover:bg-white text-[11px] font-medium text-[#231B18] flex items-center gap-1.5 transition cursor-pointer shrink-0"
                >
                  <Send className="w-3 h-3 text-[#C85A32]" />
                  <span>Test Bildirimi Gönder</span>
                </button>
              </div>

              {/* 5 Aşamalı Sipariş Hareketleri Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <label className="p-3 rounded-lg border border-[#E2DCD3] bg-[#FAF8F5] flex items-start gap-2.5 cursor-pointer hover:bg-white transition">
                  <input
                    type="checkbox"
                    checked={notifyOnOrderReceived}
                    onChange={(e) => setNotifyOnOrderReceived(e.target.checked)}
                    className="mt-0.5 rounded text-[#C85A32] focus:ring-[#C85A32]"
                  />
                  <div>
                    <span className="font-medium text-[#231B18] block text-xs">1. Sipariş Alındı</span>
                    <span className="text-[10px] text-stone-500">Müşteri siparişi oluşturduğunda</span>
                  </div>
                </label>

                <label className="p-3 rounded-lg border border-[#E2DCD3] bg-[#FAF8F5] flex items-start gap-2.5 cursor-pointer hover:bg-white transition">
                  <input
                    type="checkbox"
                    checked={notifyOnOrderProduction}
                    onChange={(e) => setNotifyOnOrderProduction(e.target.checked)}
                    className="mt-0.5 rounded text-[#C85A32] focus:ring-[#C85A32]"
                  />
                  <div>
                    <span className="font-medium text-[#231B18] block text-xs">2. Atölyede Üretimde</span>
                    <span className="text-[10px] text-stone-500">Üretim bandına çekildiğinde</span>
                  </div>
                </label>

                <label className="p-3 rounded-lg border border-[#E2DCD3] bg-[#FAF8F5] flex items-start gap-2.5 cursor-pointer hover:bg-white transition">
                  <input
                    type="checkbox"
                    checked={notifyOnOrderQuality}
                    onChange={(e) => setNotifyOnOrderQuality(e.target.checked)}
                    className="mt-0.5 rounded text-[#C85A32] focus:ring-[#C85A32]"
                  />
                  <div>
                    <span className="font-medium text-[#231B18] block text-xs">3. Kalite Kontrol & Paket</span>
                    <span className="text-[10px] text-stone-500">Kutulama ve kalite aşamasında</span>
                  </div>
                </label>

                <label className="p-3 rounded-lg border border-[#E2DCD3] bg-[#FAF8F5] flex items-start gap-2.5 cursor-pointer hover:bg-white transition">
                  <input
                    type="checkbox"
                    checked={notifyOnOrderShipped}
                    onChange={(e) => setNotifyOnOrderShipped(e.target.checked)}
                    className="mt-0.5 rounded text-[#C85A32] focus:ring-[#C85A32]"
                  />
                  <div>
                    <span className="font-medium text-[#231B18] block text-xs">4. Kargoya Verildi</span>
                    <span className="text-[10px] text-stone-500">Kargo takip kodu ile yola çıktığında</span>
                  </div>
                </label>

                <label className="p-3 rounded-lg border border-[#E2DCD3] bg-[#FAF8F5] flex items-start gap-2.5 cursor-pointer hover:bg-white transition">
                  <input
                    type="checkbox"
                    checked={notifyOnOrderDelivered}
                    onChange={(e) => setNotifyOnOrderDelivered(e.target.checked)}
                    className="mt-0.5 rounded text-[#C85A32] focus:ring-[#C85A32]"
                  />
                  <div>
                    <span className="font-medium text-[#231B18] block text-xs">5. Teslim Edildi</span>
                    <span className="text-[10px] text-stone-500">Müşteriye ulaştığında</span>
                  </div>
                </label>
              </div>

              {/* Bildirim Kanalları Seçimi */}
              <div className="pt-2">
                <span className="text-[11px] font-medium text-stone-700 block mb-2">
                  Aktif Bildirim Kanalları:
                </span>
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyChannelSite}
                      onChange={(e) => setNotifyChannelSite(e.target.checked)}
                      className="rounded text-[#C85A32] focus:ring-[#C85A32]"
                    />
                    <span className="text-[#231B18] font-medium">🔔 Site İçi Bildirim Çanı (Giriş Yapan Kullanıcılara)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyChannelEmail}
                      onChange={(e) => setNotifyChannelEmail(e.target.checked)}
                      className="rounded text-[#C85A32] focus:ring-[#C85A32]"
                    />
                    <span className="text-[#231B18] font-medium">✉️ Müşteriye E-Posta Bildirimi</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Sistem Bakımı & Demo Veri Temizleme */}
          <div className="bg-white p-6 rounded-2xl border border-rose-200/80 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-rose-100">
              <Trash2 className="w-4 h-4 text-rose-600" />
              <h3 className="font-serif text-base text-[#231B18] font-normal">
                Sistem Bakımı & Demo Veri Temizleme
              </h3>
            </div>
            <p className="text-stone-600 text-xs">
              Sistemi son kullanıcıya açmadan önce test siparişleri, hayali cari hesaplar ve geçici hareket loglarını tek tıkla silebilirsiniz. Gerçek ürünleriniz ve mağaza ayarlarınız korunur.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Tüm demo sipariş, cari, teklif ve finans hareketlerini temizlemek istediğinize emin misiniz?')) {
                    purgeAllDemoData();
                  }
                }}
                className="px-4 py-2 rounded-md bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-medium text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Demo Test Verilerini Sıfırla ve Temizle</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-md bg-[#C85A32] hover:bg-[#B34E2A] text-white font-medium text-xs shadow-xs flex items-center gap-1.5 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Tüm Mağaza Ayarlarını Kaydet</span>
            </button>
          </div>
        </form>
      )}

      {/* 4. İÇERİK: SEKME - PAYTR ÖDEME ALTYAPISI */}
      {activeTab === 'payment' && (
        <form onSubmit={handleSavePaymentSettings} className="space-y-6 text-xs animate-fadeIn">
          
          {/* PayTR Bilgi ve Durum Kartı */}
          <div className="bg-[#FAF8F5] p-5 sm:p-6 rounded-2xl border border-[#E2DCD3] space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#231B18] text-white flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-[#C85A32]" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-serif text-base text-[#231B18] font-normal">
                    PayTR Sanal POS &amp; 3D Secure Entegrasyonu
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase ${
                      paytrMerchantId && paytrMerchantKey && paytrMerchantSalt
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {paytrMerchantId && paytrMerchantKey && paytrMerchantSalt
                      ? (paytrTestMode ? 'Test Modu Aktif' : 'Canlı POS Aktif')
                      : 'Kurulum Bekliyor'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                  Safirya mağazanızda tüm kredi ve banka kartlarından 3D Secure güvencesiyle tek çekim ve taksitli ödeme almak için PayTR bilgilerinizi tanımlayabilirsiniz. Kart bilgileri sunucunuzda tutulmaz, doğrudan PayTR BDDK lisanslı altyapısında işlenir.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Sol Kolon (7 Sütun): API Bilgileri */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E2DCD3] shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E2DCD3]">
                <Key className="w-4 h-4 text-[#C85A32]" />
                <h4 className="font-serif text-sm text-[#231B18] font-normal">
                  PayTR Mağaza API Bilgileri
                </h4>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">
                  Mağaza No (Merchant ID) *
                </label>
                <input
                  type="text"
                  placeholder="Örn: 123456"
                  value={paytrMerchantId}
                  onChange={(e) => setPaytrMerchantId(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-[#E2DCD3] bg-white font-mono text-xs focus:outline-none focus:border-[#231B18]"
                />
                <span className="text-[10px] text-stone-500 mt-0.5 block">
                  PayTR Mağaza Paneli &gt; Bilgi menüsündeki &quot;Mağaza No&quot; değeri.
                </span>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">
                  Mağaza Parolası (Merchant Key) *
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••••••"
                  value={paytrMerchantKey}
                  onChange={(e) => setPaytrMerchantKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-[#E2DCD3] bg-white font-mono text-xs focus:outline-none focus:border-[#231B18]"
                />
                <span className="text-[10px] text-stone-500 mt-0.5 block">
                  PayTR Mağaza Paneli &gt; Bilgi menüsündeki &quot;Mağaza Parolası&quot;.
                </span>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">
                  Mağaza Gizli Anahtar (Merchant Salt) *
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••••••"
                  value={paytrMerchantSalt}
                  onChange={(e) => setPaytrMerchantSalt(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-[#E2DCD3] bg-white font-mono text-xs focus:outline-none focus:border-[#231B18]"
                />
                <span className="text-[10px] text-stone-500 mt-0.5 block">
                  PayTR Mağaza Paneli &gt; Bilgi menüsündeki &quot;Mağaza Gizli Anahtar&quot;.
                </span>
              </div>

              {/* Mod Seçimleri */}
              <div className="pt-2 border-t border-[#E2DCD3] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-stone-800 block text-xs">Test Modu</span>
                    <span className="text-[11px] text-stone-500 block">
                      Açıkken PayTR test kartları ile sipariş simülasyonu yapılır. Canlıya geçerken kapatınız.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paytrTestMode}
                      onChange={(e) => setPaytrTestMode(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C85A32]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-stone-800 block text-xs">Hata Ayıklama (Debug On)</span>
                    <span className="text-[11px] text-stone-500 block">
                      PayTR API yanıtlarındaki hata detaylarını loglar.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paytrDebugOn}
                      onChange={(e) => setPaytrDebugOn(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#231B18]"></div>
                  </label>
                </div>
              </div>

            </div>

            {/* Sağ Kolon (5 Sütun): PayTR Paneline Girilecek URL Rehberi */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E2DCD3] shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E2DCD3]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h4 className="font-serif text-sm text-[#231B18] font-normal">
                  PayTR Paneline Girilmesi Gerekenler
                </h4>
              </div>

              {/* Bildirim URL (Callback URL) */}
              <div className="space-y-1.5 bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E2DCD3]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C85A32]">
                    1. Bildirim URL (Callback URL)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('https://safirya.tr/api/payment/paytr/callback');
                      setCopiedCallbackUrl(true);
                      setTimeout(() => setCopiedCallbackUrl(false), 2000);
                    }}
                    className="text-[10px] text-stone-700 hover:text-[#C85A32] font-medium flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCallbackUrl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCallbackUrl ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>
                </div>
                <div className="font-mono text-[11px] text-[#231B18] break-all bg-white p-2 rounded border border-stone-200 select-all">
                  https://safirya.tr/api/payment/paytr/callback
                </div>
                <p className="text-[10px] text-stone-500 leading-relaxed pt-1">
                  ⚠️ PayTR Mağaza Paneli &gt; <strong>Ayarlar &gt; Bildirim URL</strong> kısmına bu adresi yapıştırıp kaydediniz. Banka 3D Secure onayını bu adrese iletir.
                </p>
              </div>

              {/* Başarılı & Başarısız Sayfalar */}
              <div className="space-y-2 pt-1 text-[11px] text-stone-600">
                <span className="font-medium text-[#231B18] block">Ödeme Dönüş Sayfaları (Otomatik):</span>
                <div className="p-2.5 rounded bg-stone-50 border border-stone-200 font-mono text-[10px] space-y-1">
                  <div>✓ Başarılı: https://safirya.tr/odeme/sonuc?status=success</div>
                  <div>✕ Başarısız: https://safirya.tr/odeme/sonuc?status=failed</div>
                </div>
                <p className="text-[10px] text-stone-500">
                  Bu URL&apos;ler PayTR API isteklerinde sistem tarafından otomatik olarak iletilmektedir.
                </p>
              </div>

              {/* Vercel Env Notu */}
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] space-y-1">
                <span className="font-semibold block">Vercel Çevre Değişkenleri:</span>
                <p className="text-[10px] text-blue-800 leading-relaxed">
                  İsterseniz bu anahtarları doğrudan Vercel Dashboard &gt; Settings &gt; Environment Variables kısmına da ekleyebilirsiniz:
                  <code className="block font-mono text-[10px] mt-1 bg-white/70 p-1 rounded">
                    PAYTR_MERCHANT_ID, PAYTR_MERCHANT_KEY, PAYTR_MERCHANT_SALT, PAYTR_TEST_MODE
                  </code>
                </p>
              </div>

            </div>

          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-md bg-[#231B18] hover:bg-[#C85A32] text-white font-medium text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>PayTR Ayarlarını Kaydet</span>
            </button>
          </div>

        </form>
      )}

      {/* 5. İÇERİK: SEKME 4 - CMS KURUMSAL SAYFALAR */}
      {activeTab === 'cms' && (
        <div className="space-y-6 text-xs">
          
          {/* Sayfa Seçici Butonları */}
          <div className="bg-white p-3 rounded-xl border border-[#E2DCD3] shadow-2xs flex flex-wrap items-center gap-2">
            {[
              { slug: 'hakkimizda', label: 'Hakkımızda' },
              { slug: 'iade-kosullari', label: 'İade ve Değişim Koşulları' },
              { slug: 'gizlilik-ve-kvkk', label: 'Gizlilik ve KVKK Politikası' },
              { slug: 'mesafeli-satis-sozlesmesi', label: 'Mesafeli Satış Sözleşmesi' },
              { slug: 'iletisim', label: 'İletişim & Atölye' },
            ].map((p) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => handleSelectPage(p.slug)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  selectedSlug === p.slug
                    ? 'bg-[#C85A32] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-stone-700 hover:bg-[#EFECE6]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* İkili Bölüm: Editör & Canlı Önizleme */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* Sol: Düzenleme Formu */}
            <form onSubmit={handleSaveCmsPage} className="bg-white p-6 rounded-2xl border border-[#E2DCD3] shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2DCD3]">
                <div>
                  <span className="text-[10px] font-semibold text-[#C85A32] uppercase tracking-wider">
                    /sayfa/{selectedSlug}
                  </span>
                  <h3 className="font-serif text-base text-[#231B18] font-normal mt-0.5">
                    İçerik Düzenleyici
                  </h3>
                </div>

                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-md bg-[#C85A32] hover:bg-[#B34E2A] text-white font-medium text-xs shadow-xs flex items-center gap-1.5 transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Vitrinde Yayınla</span>
                </button>
              </div>

              <div>
                <label className="block font-medium text-stone-800 mb-1">
                  Sayfa Başlığı *
                </label>
                <input
                  type="text"
                  required
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#E2DCD3] font-medium text-xs focus:ring-1 focus:ring-[#C85A32]"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-800 mb-1">
                  Alt Başlık
                </label>
                <input
                  type="text"
                  value={pageSubtitle}
                  onChange={(e) => setPageSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#E2DCD3] text-xs focus:ring-1 focus:ring-[#C85A32]"
                />
              </div>

              {/* Araç Çubuğu */}
              <div>
                <label className="block font-medium text-stone-800 mb-1">
                  Sayfa İçeriği (Markdown)
                </label>

                <div className="flex items-center gap-1 p-2 bg-[#FAF8F5] border border-[#E2DCD3] rounded-t-lg border-b-0 flex-wrap">
                  <button
                    type="button"
                    onClick={() => insertFormatting('**', '**')}
                    className="p-1.5 rounded hover:bg-white text-stone-700"
                    title="Kalın"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => insertFormatting('*', '*')}
                    className="p-1.5 rounded hover:bg-white text-stone-700"
                    title="İtalik"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-[1px] h-3.5 bg-stone-300 mx-1" />

                  <button
                    type="button"
                    onClick={() => insertFormatting('## ')}
                    className="p-1.5 rounded hover:bg-white text-stone-700"
                    title="Başlık 2"
                  >
                    <Heading2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => insertFormatting('### ')}
                    className="p-1.5 rounded hover:bg-white text-stone-700"
                    title="Başlık 3"
                  >
                    <Heading3 className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-[1px] h-3.5 bg-stone-300 mx-1" />

                  <button
                    type="button"
                    onClick={() => insertFormatting('- ')}
                    className="p-1.5 rounded hover:bg-white text-stone-700"
                    title="Madde İmi"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>

                <textarea
                  id="cms-editor-textarea"
                  rows={14}
                  value={pageContent}
                  onChange={(e) => setPageContent(e.target.value)}
                  className="w-full p-3.5 rounded-b-lg border border-[#E2DCD3] font-mono text-xs focus:ring-1 focus:ring-[#C85A32] bg-white leading-relaxed"
                />
              </div>
            </form>

            {/* Sağ: Canlı Önizleme */}
            <div className="space-y-3">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                Vitrindeki Görünüm Önizlemesi
              </span>

              <div className="bg-white rounded-2xl border border-[#E2DCD3] p-7 shadow-2xs">
                <div className="border-b border-[#E2DCD3] pb-4 mb-5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C85A32]">
                    Safirya Kurumsal
                  </span>
                  <h1 className="font-serif text-2xl font-normal text-[#231B18] mt-1">
                    {pageTitle || 'Sayfa Başlığı'}
                  </h1>
                  {pageSubtitle && (
                    <p className="text-xs text-stone-600 mt-1">
                      {pageSubtitle}
                    </p>
                  )}
                </div>

                <div
                  className="prose prose-sm max-w-none text-stone-700 leading-relaxed font-sans"
                  dangerouslySetInnerHTML={renderMarkdown(pageContent)}
                />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 5. SEKME: WEBHOOK & API OTOMASYONU */}
      {activeTab === 'webhook' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E2DCD3] shadow-2xs space-y-6">
            <div className="border-b border-[#E2DCD3] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-semibold text-[#C85A32] uppercase tracking-wider block">
                  Kanban & Atölye Olay Tetikleyicileri
                </span>
                <h2 className="font-serif text-xl font-normal text-[#231B18] mt-1">
                  Webhook & Dış Sistem Entegrasyonu
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Atölyede sipariş aşaması güncellendiğinde, canlı fotoğraf yüklendiğinde veya sözleşme imzalandığında Discord, Slack, Zapier veya WhatsApp gateway sunucunuza anında HTTP POST isteği gönderin.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestWebhook}
                  disabled={isTestingWebhook}
                  className="px-4 py-2 rounded-xl border border-gray-300 bg-gray-50 hover:bg-gray-100 text-[#1B2A4A] text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>{isTestingWebhook ? 'Test Gönderiliyor...' : 'Test Webhook Gönder'}</span>
                </button>
              </div>
            </div>

            {testWebhookStatus && (
              <div className={`p-3.5 rounded-xl text-xs font-bold ${testWebhookStatus.includes('✅') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                {testWebhookStatus}
              </div>
            )}

            <form onSubmit={handleSaveWebhookSettings} className="space-y-5">
              {/* Webhook Aktif/Pasif */}
              <div className="flex items-center justify-between p-4 bg-[#FAF8F5] rounded-xl border border-stone-200">
                <div>
                  <h4 className="text-xs font-bold text-[#1B2A4A]">Webhook Servisini Aktifleştir</h4>
                  <p className="text-[11px] text-gray-500">
                    Açık olduğunda Kanban hareketleri ve fotoğraflar otomatik olarak hedef URL&apos;ye post edilir.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={webhookEnabled}
                    onChange={(e) => setWebhookEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C85A32]"></div>
                </label>
              </div>

              {/* Endpoint URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1B2A4A] block">
                  Webhook Hedef URL (Endpoint)
                </label>
                <input
                  type="url"
                  placeholder="https://discord.com/api/webhooks/... veya https://api.siteniz.com/webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8F5] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                />
                <p className="text-[11px] text-gray-400">
                  💡 Discord Webhook URL&apos;si girerseniz zengin görsel embed kartı olarak; Slack girerseniz Slack formatında; diğer adreslerde standart JSON olarak iletilir.
                </p>
              </div>

              {/* HMAC Secret */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1B2A4A]">
                    Güvenlik İmzası Anahtarı (HMAC Secret - Opsiyonel)
                  </label>
                  <button
                    type="button"
                    onClick={() => setWebhookSecret(`whsec_${Math.random().toString(36).substring(2, 12)}`)}
                    className="text-[10px] text-[#C85A32] hover:underline font-bold cursor-pointer"
                  >
                    Rastgele Anahtar Üret
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="whsec_..."
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8F5] border border-gray-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#C85A32]"
                />
                <p className="text-[10px] text-gray-400">
                  Her istekte `X-Safirya-Signature` başlığında SHA-256 doğrulama imzası gönderilir.
                </p>
              </div>

              {/* Tetiklenecek Olaylar */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-[#1B2A4A] block">
                  Abone Olunacak Atölye Olayları
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={webhookEvents.includes('order.stage_changed')}
                      onChange={(e) => {
                        if (e.target.checked) setWebhookEvents([...webhookEvents, 'order.stage_changed']);
                        else setWebhookEvents(webhookEvents.filter((ev) => ev !== 'order.stage_changed'));
                      }}
                      className="rounded text-[#C85A32] focus:ring-[#C85A32]"
                    />
                    <div>
                      <span className="font-bold block">order.stage_changed</span>
                      <span className="text-[10px] text-gray-500">Sipariş Kanban bandında sütun değiştirdiğinde</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={webhookEvents.includes('order.photo_uploaded')}
                      onChange={(e) => {
                        if (e.target.checked) setWebhookEvents([...webhookEvents, 'order.photo_uploaded']);
                        else setWebhookEvents(webhookEvents.filter((ev) => ev !== 'order.photo_uploaded'));
                      }}
                      className="rounded text-[#C85A32] focus:ring-[#C85A32]"
                    />
                    <div>
                      <span className="font-bold block">order.photo_uploaded</span>
                      <span className="text-[10px] text-gray-500">Atölyeden canlı aşama fotoğrafı yüklendiğinde</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={webhookEvents.includes('order.contract_signed')}
                      onChange={(e) => {
                        if (e.target.checked) setWebhookEvents([...webhookEvents, 'order.contract_signed']);
                        else setWebhookEvents(webhookEvents.filter((ev) => ev !== 'order.contract_signed'));
                      }}
                      className="rounded text-[#C85A32] focus:ring-[#C85A32]"
                    />
                    <div>
                      <span className="font-bold block">order.contract_signed</span>
                      <span className="text-[10px] text-gray-500">Müşteri özel üretim sözleşmesini imzaladığında</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Kaydet Butonu */}
              <div className="pt-3 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#231B18] hover:bg-[#382B27] text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-[#C85A32]" />
                  <span>Webhook Ayarlarını Kaydet</span>
                </button>
              </div>
            </form>
          </div>

          {/* Webhook Teslimat Geçmişi Tablosu */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2DCD3] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#C85A32]" />
                <h3 className="font-bold text-sm text-[#1B2A4A]">Webhook Teslimat Günlüğü (Son Olaylar)</h3>
              </div>
              {webhookLogs.length > 0 && (
                <button
                  type="button"
                  onClick={clearWebhookLogs}
                  className="text-xs text-red-600 hover:underline font-bold cursor-pointer"
                >
                  Logları Temizle
                </button>
              )}
            </div>

            {webhookLogs.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400">
                Henüz bir webhook teslimat kaydı bulunmuyor. Kanban&apos;da kart taşıdığınızda veya test gönderdiğinizde burada listelenir.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase">
                      <th className="py-2.5 px-3">Tarih</th>
                      <th className="py-2.5 px-3">Olay</th>
                      <th className="py-2.5 px-3">Sipariş</th>
                      <th className="py-2.5 px-3 text-center">Durum</th>
                      <th className="py-2.5 px-3">Yanıt Mesajı</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {webhookLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/70">
                        <td className="py-2.5 px-3 text-gray-500 font-mono text-[11px]">{log.sentAt}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[#1B2A4A]">{log.event}</td>
                        <td className="py-2.5 px-3 font-mono text-[#C85A32]">#{log.orderNumber}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                            {log.status} ({log.statusCode || 'Err'})
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-600 truncate max-w-xs">{log.responseMessage || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
