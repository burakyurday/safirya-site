'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CreditCard,
  Building2,
  CheckCircle2,
  Copy,
  ArrowRight,
  Gift,
  ShoppingBag,
  ChevronRight,
  AlertCircle,
  Check,
  FileCheck2,
  RotateCcw,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useStore, CartItem } from '@/context/StoreContext';

const TURKISH_CITIES = [
  'İstanbul',
  'Ankara',
  'İzmir',
  'Bursa',
  'Antalya',
  'Adana',
  'Eskişehir',
  'Gaziantep',
  'Konya',
  'Kocaeli',
  'Muğla',
  'Aydın',
  'Trabzon',
  'Samsun',
  'Kayseri',
  'Diğer İl',
];

export default function CheckoutPage() {
  const {
    cartItems,
    cartTotal,
    originalCartTotal,
    isGiftWrapped,
    giftNote,
    appliedCoupon,
    clearCart,
    currentUser,
  } = useStore();

  // Müşteri & Teslimat Bilgileri Form State (Temiz kullanıcı formu)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: 'İstanbul',
    district: '',
    neighborhood: '',
    address: '',
    postalCode: '',
    orderNote: '',
    // Fatura
    invoiceType: 'INDIVIDUAL' as 'INDIVIDUAL' | 'CORPORATE',
    sameAsShipping: true,
    tckn: '',
    companyName: '',
    taxOffice: '',
    vkn: '',
    corporateAddress: '',
    // Ödeme
    paymentMethod: 'CREDIT_CARD' as 'CREDIT_CARD' | 'HAVALE_EFT',
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: '',
  });

  // Giriş yapmış kullanıcının profil bilgilerini forma aktar
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || currentUser.name || '',
        email: prev.email || currentUser.email || '',
        phone: prev.phone || currentUser.phone || '',
      }));
    }
  }, [currentUser]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Benzersiz Sipariş Numarası (Sözleşme ve sipariş entegrasyonu için sabitlenir)
  const [orderNumber] = useState(() => `SFR-2026-${Math.floor(1000 + Math.random() * 9000)}`);

  // Kişiselleştirilen Ürünler (Yalnızca sepette kişiselleştirilen ürün varsa sözleşme gerekir)
  const personalizedItems = cartItems.filter(
    (item) => Boolean(item.customText && item.customText.trim().length > 0)
  );
  const hasPersonalizedItems = personalizedItems.length > 0;

  // Dijital Sözleşme & E-İmza State'leri (TKHK Md. 15/b)
  const contractCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawingSignature, setIsDrawingSignature] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [signerName, setSignerName] = useState('');
  const [checkTextApproved, setCheckTextApproved] = useState(false);
  const [checkLegalApproved, setCheckLegalApproved] = useState(false);
  const [isContractApproved, setIsContractApproved] = useState(false);
  const [contractVerificationCode, setContractVerificationCode] = useState<string | null>(null);
  const [contractSignedAt, setContractSignedAt] = useState<string | null>(null);
  const [contractError, setContractError] = useState<string | null>(null);

  // Formdaki isimle imzalayan ismini eşle
  useEffect(() => {
    if (formData.fullName && !signerName) {
      setSignerName(formData.fullName);
    }
  }, [formData.fullName, signerName]);

  // Canvas İmza Koordinat Hesaplama (Mobil Dokunmatik + Masaüstü Fare)
  const getCanvasCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = contractCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = contractCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawingSignature(true);
    setHasSignature(true);
    setContractError(null);

    const { x, y } = getCanvasCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawSignature = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawingSignature) return;
    const canvas = contractCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#231B18';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawingSignature(false);
  };

  const clearSignature = () => {
    const canvas = contractCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setSignatureDataUrl(null);
    setIsContractApproved(false);
    setContractVerificationCode(null);
  };

  // Sözleşmeyi Mühürle / Doğrula
  const handleSealContract = (targetOrderNumber: string = orderNumber) => {
    if (!checkTextApproved) {
      setContractError('Lütfen yukarıdaki kişiselleştirme metinlerinin ve tasarım detaylarının doğruluğunu onaylayınız.');
      return null;
    }
    if (!checkLegalApproved) {
      setContractError('Lütfen 6502 Sayılı Tüketicinin Korunması Kanunu Md. 15/b yasal cayma hakkı istisnasını onaylayınız.');
      return null;
    }
    const finalSigner = (signerName || formData.fullName).trim();
    if (!finalSigner) {
      setContractError('Lütfen imzalayan Ad Soyad bilgisini giriniz.');
      return null;
    }
    if (!hasSignature && !signatureDataUrl) {
      setContractError('Lütfen dijital imza alanına parmağınızla veya farenizle imzanızı atınız.');
      return null;
    }

    const canvas = contractCanvasRef.current;
    const sigUrl = signatureDataUrl || (canvas ? canvas.toDataURL('image/png') : '');
    const nowStr = new Date().toLocaleString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const sealCode = `SOZ-${targetOrderNumber}-${randomSuffix}-OK`;

    setSignatureDataUrl(sigUrl);
    setContractVerificationCode(sealCode);
    setContractSignedAt(nowStr);
    setIsContractApproved(true);
    setContractError(null);

    // Yerel depolamaya sözleşme kaydını yaz (Admin & Sipariş Takip ekranları için)
    if (typeof window !== 'undefined') {
      try {
        const contractPayload = {
          id: `cnt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          orderNumber: targetOrderNumber,
          orderId: targetOrderNumber,
          customerName: finalSigner,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          productName: personalizedItems.map((i) => `${i.name} (${i.quantity} Adet)`).join(', '),
          quantity: personalizedItems.reduce((acc, i) => acc + i.quantity, 0),
          totalAmount: grandTotal,
          customText: personalizedItems.map((i) => i.customText).filter(Boolean).join(' | '),
          scentNote: personalizedItems[0]?.scentNote,
          colorPalette: personalizedItems[0]?.colorPalette,
          status: 'ONAYLANDI' as const,
          verificationCode: sealCode,
          signedAt: nowStr,
          signedBy: finalSigner,
          signatureDataUrl: sigUrl,
          legalConsentChecked: true,
          createdAt: new Date().toISOString(),
        };

        const existingRaw = localStorage.getItem('safirya_custom_contracts');
        const list = existingRaw ? JSON.parse(existingRaw) : [];
        const filtered = list.filter((c: any) => c.orderNumber !== targetOrderNumber);
        filtered.unshift(contractPayload);
        localStorage.setItem('safirya_custom_contracts', JSON.stringify(filtered));
        localStorage.setItem('safirya_admin_contracts', JSON.stringify(filtered));
      } catch (storageErr) {
        console.warn('Sözleşme kaydedilirken uyarı:', storageErr);
      }
    }

    return {
      verificationCode: sealCode,
      signedAt: nowStr,
      signedBy: finalSigner,
      signatureDataUrl: sigUrl,
    };
  };

  const [placedOrder, setPlacedOrder] = useState<{
    orderNumber: string;
    email: string;
    totalAmount: number;
    items: CartItem[];
    date: string;
    shippingAddress: string;
    giftNote?: string;
    paymentMethod?: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  // PayTR Ödeme State'leri
  const [paytrToken, setPaytrToken] = useState<string | null>(null);
  const [paytrOrderNumber, setPaytrOrderNumber] = useState<string | null>(null);
  const [paytrError, setPaytrError] = useState<string | null>(null);
  const [paytrNotConfiguredNotice, setPaytrNotConfiguredNotice] = useState(false);

  // Fiyat Hesaplamaları
  const freeShippingThreshold = 500;
  const giftWrapFee = 30;
  const isFreeShipping = cartTotal >= freeShippingThreshold;
  const shippingFee = cartItems.length === 0 ? 0 : isFreeShipping ? 0 : 45.0;

  const bulkSavings = Math.max(0, originalCartTotal - cartTotal);

  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      couponDiscount = (cartTotal * appliedCoupon.discountValue) / 100;
    } else {
      couponDiscount = Math.min(cartTotal, appliedCoupon.discountValue);
    }
  }

  const giftWrapCost = isGiftWrapped ? giftWrapFee : 0;
  const discountedSubtotal = Math.max(0, cartTotal - couponDiscount);
  const grandTotal = discountedSubtotal + giftWrapCost + shippingFee;
  const shippingSavings = isFreeShipping && cartItems.length > 0 ? 45.0 : 0;
  const totalSavings = bulkSavings + couponDiscount + shippingSavings;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateCheckout = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Lütfen adınızı ve soyadınızı giriniz.';
    if (!formData.email.trim()) {
      newErrors.email = 'Lütfen e-posta adresinizi giriniz.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Lütfen geçerli bir e-posta adresi giriniz.';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Lütfen cep telefonu numaranızı giriniz.';
    } else if (formData.phone.replace(/[^0-9]/g, '').length < 10) {
      newErrors.phone = 'Geçerli bir telefon numarası giriniz (en az 10 hane).';
    }
    if (!formData.district.trim()) newErrors.district = 'Lütfen ilçe bilgisini giriniz.';
    if (!formData.neighborhood.trim()) newErrors.neighborhood = 'Lütfen mahalle bilgisini giriniz.';
    if (!formData.address.trim()) newErrors.address = 'Lütfen açık teslimat adresinizi giriniz.';

    if (formData.invoiceType === 'CORPORATE') {
      if (!formData.companyName.trim()) newErrors.companyName = 'Şirket ünvanı zorunludur.';
      if (!formData.taxOffice.trim()) newErrors.taxOffice = 'Vergi dairesi zorunludur.';
      if (!formData.vkn.trim()) newErrors.vkn = 'VKN bilgisi zorunludur.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const placeDirectOrder = async (orderNum: string, method: string = formData.paymentMethod) => {
    setIsSubmitting(true);
    let confirmedOrderNumber = orderNum;
    let finalTotal = grandTotal;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          district: formData.district,
          neighborhood: formData.neighborhood,
          address: formData.address,
          postalCode: formData.postalCode,
          orderNote: formData.orderNote,
          invoiceType: formData.invoiceType,
          companyName: formData.companyName,
          taxOffice: formData.taxOffice,
          vkn: formData.vkn,
          paymentMethod: method,
          cartItems,
          couponCode: appliedCoupon?.code,
          isGiftWrapped,
          giftNote: isGiftWrapped ? giftNote : undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.orderNumber) {
        confirmedOrderNumber = data.orderNumber;
        if (data.order?.totalAmount) {
          finalTotal = Number(data.order.totalAmount);
        }
      }
    } catch (apiErr) {
      console.warn('Sunucuya sipariş iletilirken uyarı (yerel yedek devrede):', apiErr);
    }

    const orderPayload = {
      orderNumber: confirmedOrderNumber,
      email: formData.email,
      customerName: formData.fullName,
      phone: formData.phone,
      totalAmount: finalTotal,
      items: [...cartItems],
      date: new Date().toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      shippingAddress: `${formData.neighborhood} ${formData.address} ${formData.district} / ${formData.city}`,
      isGiftWrapped,
      giftNote: isGiftWrapped ? giftNote : undefined,
      stage: 'SIPARIS_ALINDI',
      paymentMethod: method,
      paymentStatus: method === 'HAVALE_EFT' ? 'BEKLIYOR' : 'ODENDI',
    };

    try {
      const existingRaw = localStorage.getItem('safirya_orders');
      const existingList = existingRaw ? JSON.parse(existingRaw) : [];
      existingList.unshift(orderPayload);
      localStorage.setItem('safirya_orders', JSON.stringify(existingList));
    } catch (err) {
      console.error('Sipariş kaydedilirken hata:', err);
    }

    setPlacedOrder({
      orderNumber: confirmedOrderNumber,
      email: formData.email,
      totalAmount: finalTotal,
      items: [...cartItems],
      date: orderPayload.date,
      shippingAddress: orderPayload.shippingAddress,
      giftNote: isGiftWrapped ? giftNote : undefined,
      paymentMethod: method,
    });

    clearCart();
    setIsSubmitting(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCheckout()) {
      window.scrollTo({ top: 220, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setPaytrError(null);
    setPaytrNotConfiguredNotice(false);

    // Benzersiz Sipariş Numarası Üret (Örn: SFR-2026-8921)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `SFR-2026-${randomSuffix}`;

    // 1. Kredi Kartı (PayTR 3D Secure Akışı)
    if (formData.paymentMethod === 'CREDIT_CARD') {
      try {
        const res = await fetch('/api/payment/paytr/create-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderNumber,
            email: formData.email,
            fullName: formData.fullName,
            phone: formData.phone,
            city: formData.city,
            district: formData.district,
            neighborhood: formData.neighborhood,
            address: formData.address,
            postalCode: formData.postalCode,
            orderNote: formData.orderNote,
            cartItems,
            grandTotal,
            shippingFee,
            giftWrapFee,
            couponDiscount,
            couponCode: appliedCoupon?.code,
            isGiftWrapped,
            giftNote: isGiftWrapped ? giftNote : undefined,
            invoiceType: formData.invoiceType,
            companyName: formData.companyName,
            taxOffice: formData.taxOffice,
            vkn: formData.vkn,
          }),
        });

        const data = await res.json();

        if (data.isConfigured === false) {
          // PayTR bilgileri henüz .env'de tanımlanmamış
          setPaytrNotConfiguredNotice(true);
          setIsSubmitting(false);
          return;
        }

        if (data.success && data.token) {
          // PayTR iframe token'ı hazır, modalı aç
          setPaytrToken(data.token);
          setPaytrOrderNumber(orderNumber);

          // PayTR iFrameResizer script'ini yükle
          if (typeof window !== 'undefined' && !document.getElementById('paytr-resizer-script')) {
            const script = document.createElement('script');
            script.id = 'paytr-resizer-script';
            script.src = 'https://www.paytr.com/js/iframeResizer.min.js';
            script.onload = () => {
              // @ts-ignore
              if (window.iFrameResize) window.iFrameResize({}, '#paytriframe');
            };
            document.body.appendChild(script);
          } else {
            setTimeout(() => {
              // @ts-ignore
              if (window.iFrameResize) window.iFrameResize({}, '#paytriframe');
            }, 300);
          }

          setIsSubmitting(false);
          return;
        } else {
          setPaytrError(data.error || 'PayTR ödeme oturumu başlatılamadı. Lütfen tekrar deneyiniz.');
          setIsSubmitting(false);
        }
      } catch (err: any) {
        setPaytrError('Ödeme servisine bağlanırken bir hata oluştu: ' + (err?.message || ''));
        setIsSubmitting(false);
      }
      return;
    }

    // 2. Havale / EFT Akışı
    await placeDirectOrder(orderNumber, 'HAVALE_EFT');
  };

  const [copiedIban, setCopiedIban] = useState<string | null>(null);
  const copyIban = (iban: string) => {
    navigator.clipboard.writeText(iban.replace(/\s+/g, ''));
    setCopiedIban(iban);
    setTimeout(() => setCopiedIban(null), 2000);
  };

  const copyOrderNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ════════════════════════════════════════════════════════════
  // SİPARİŞ TAMAMLANDI - BAŞARI EKRANI (Clean Minimalist White)
  // ════════════════════════════════════════════════════════════
  if (placedOrder) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-xs border border-stone-200 p-8 sm:p-10 text-center space-y-6">
            <div className="w-16 h-16 bg-[#FEF5C8] text-[#231B18] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-[#7A7067] block mb-2">
                Siparişiniz Başarıyla Alındı
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#231B18]">
                Teşekkür Ederiz, Siparişiniz Atölyemize Ulaştı
              </h1>
              <p className="text-xs sm:text-sm text-[#7A7067] mt-2 max-w-md mx-auto leading-relaxed">
                Sipariş onayınız ve detaylar <strong className="text-[#231B18]">{placedOrder.email}</strong> adresinize gönderildi. Zanaatkar ustalarımız hazırlığa başladı.
              </p>
            </div>

            {/* Sipariş Numarası Vurgusu */}
            <div className="p-4 rounded-xs bg-[#FAF8F5] border border-stone-200 flex items-center justify-between gap-4 max-w-md mx-auto">
              <div className="text-left">
                <span className="text-[10px] uppercase tracking-widest text-[#7A7067] block">
                  Sipariş Numaranız
                </span>
                <span className="text-lg sm:text-xl font-mono font-medium text-[#231B18] tracking-wider">
                  {placedOrder.orderNumber}
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyOrderNumber(placedOrder.orderNumber)}
                className="px-3.5 py-2 rounded-xs bg-white border border-stone-300 hover:border-[#231B18] text-xs uppercase tracking-wider text-[#231B18] flex items-center gap-1.5 transition active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#C85A32]" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
                <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
              </button>
            </div>

            {/* Havale / EFT İçin WhatsApp Dekont & Sipariş No İletimi */}
            {placedOrder.paymentMethod === 'HAVALE_EFT' && (
              <div className="p-4 sm:p-5 rounded-xs bg-[#FEF5C8] border border-[#F5E898] text-left space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">📱</span>
                  <div>
                    <h3 className="font-semibold text-xs uppercase tracking-wider text-[#231B18]">
                      WhatsApp Dekont & Sipariş No İletimi
                    </h3>
                    <p className="text-[11px] text-[#554D46] mt-0.5">
                      Havale/EFT transferinizin teyit edilerek siparişinizin derhal üretime alınması için lütfen dekontunuzu WhatsApp hattımıza iletiniz.
                    </p>
                  </div>
                </div>
                <div className="bg-white/90 p-3 rounded-xs border border-[#F5E898] text-xs text-[#231B18] space-y-1">
                  <p>
                    • <strong className="text-[#7A7067]">Sipariş Numaranız:</strong> <span className="font-mono font-semibold">{placedOrder.orderNumber}</span>
                  </p>
                  <p>
                    • <strong className="text-[#7A7067]">Ödenecek Tutar:</strong> <span className="font-semibold">₺{placedOrder.totalAmount.toFixed(2)}</span>
                  </p>
                </div>
                <a
                  href={`https://wa.me/905325557234?text=${encodeURIComponent(
                    `Merhaba, #${placedOrder.orderNumber} nolu siparişimin havale/EFT dekontunu iletiyorum. Tutar: ₺${placedOrder.totalAmount.toFixed(2)}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xs bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold uppercase tracking-wider transition shadow-sm"
                >
                  <span>WhatsApp ile Dekont İlet</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* Sipariş Özet Bilgileri */}
            <div className="text-left p-5 rounded-xs bg-[#FAF8F5] border border-stone-200 space-y-3 text-xs text-[#231B18]">
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="text-[#7A7067]">Sipariş Tarihi:</span>
                <span className="font-medium">{placedOrder.date}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="text-[#7A7067]">Teslimat Adresi:</span>
                <span className="font-medium max-w-[260px] text-right truncate">
                  {placedOrder.shippingAddress}
                </span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="text-[#7A7067]">Toplam Tutar:</span>
                <span className="font-semibold text-sm text-[#231B18]">
                  ₺{placedOrder.totalAmount.toFixed(2)}
                </span>
              </div>
              {placedOrder.giftNote && (
                <div className="pt-1">
                  <span className="text-[#7A7067] block mb-1">Mühürlü Hediye Notunuz:</span>
                  <p className="italic text-[#C85A32] bg-white p-2.5 rounded-xs border border-stone-200">
                    &quot;{placedOrder.giftNote}&quot;
                  </p>
                </div>
              )}
            </div>

            {/* Aksiyon Butonları */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href={`/tesekkurler?order=${placedOrder.orderNumber}`}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xs bg-[#231B18] hover:bg-[#3A2E29] text-white text-xs uppercase tracking-widest font-medium flex items-center justify-center gap-2 transition"
              >
                <span>Detaylı Özet Sayfası</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={`/siparis-takip?orderNumber=${placedOrder.orderNumber}&email=${encodeURIComponent(placedOrder.email)}`}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xs bg-white border border-[#231B18] text-[#231B18] text-xs uppercase tracking-widest font-medium hover:bg-[#231B18] hover:text-white flex items-center justify-center gap-2 transition"
              >
                <span>Siparişi Canlı Takip Et</span>
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto px-5 py-3.5 rounded-xs text-[#7A7067] hover:text-[#231B18] text-xs uppercase tracking-widest font-medium transition"
              >
                Anasayfa
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // SEPET BOŞ İSE
  // ════════════════════════════════════════════════════════════
  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center bg-white min-h-[60vh] flex items-center justify-center">
        <div className="bg-white p-8 rounded-xs border border-stone-200 space-y-4 w-full">
          <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto stroke-[1.5]" />
          <h2 className="font-serif text-xl font-normal text-[#231B18]">Ödeme İçin Sepetinizde Ürün Yok</h2>
          <p className="text-xs text-[#7A7067]">
            Ödeme ekranına geçmeden önce lütfen beğendiğiniz tasarımları sepetinize ekleyiniz.
          </p>
          <Link
            href="/sepet"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xs bg-[#231B18] hover:bg-[#3A2E29] text-white text-xs uppercase tracking-widest font-medium transition"
          >
            <span>Sepetime Git</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // ÜYELİKSİZ SİPARİŞ & ÖDEME FORMU
  // ════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-white pb-24 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigasyon */}
        <nav className="flex items-center gap-2 text-xs text-[#7A7067] mb-6">
          <Link href="/sepet" className="hover:text-[#231B18] transition">Sepetim</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#231B18] font-medium">
            {currentUser ? 'Güvenli Ödeme' : 'Hızlı & Üyeliksiz Ödeme'}
          </span>
        </nav>

        {/* Üst Bilgilendirme Bandı - Yalnızca Giriş Yapmamış Kullanıcılara Göster */}
        {!currentUser && (
          <div className="mb-8 p-4 rounded-xs bg-[#FEF5C8] border border-[#F5E898] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#231B18]">
                Üyeliksiz Hızlı Sipariş Modu Aktif
              </h2>
              <p className="text-xs text-[#554D46] mt-0.5">
                Şifre veya hesap oluşturma zorunluluğu yok. Adres bilgilerinizi girerek doğrudan sipariş verebilirsiniz.
              </p>
            </div>
            <Link
              href="/hesabim/giris"
              className="text-xs font-medium text-[#231B18] underline hover:text-[#C85A32] self-start sm:self-auto shrink-0 transition"
            >
              Mevcut Hesabın Var mı? Giriş Yap →
            </Link>
          </div>
        )}

        <form onSubmit={handleCompleteOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* SOL KOLON: ADRES + FATURA + ÖDEME */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Form Hataları Uyarı Bandı */}
              {Object.keys(errors).length > 0 && (
                <div className="p-4 rounded-xs bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                  <div>
                    <span className="font-semibold block text-red-800">Lütfen Eksik Alanları Doldurunuz:</span>
                    <span>Kırmızı ile vurgulanan zorunlu teslimat alanlarını kontrol edip tekrar deneyiniz.</span>
                  </div>
                </div>
              )}

              {/* ADIM 1: İLETİŞİM & TESLİMAT BİLGİLERİ */}
              <div className="bg-white rounded-xs border border-stone-200 p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-stone-200">
                  <span className="w-6 h-6 rounded-xs bg-[#231B18] text-white text-xs font-medium flex items-center justify-center">
                    1
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-normal text-[#231B18]">
                      İletişim & Teslimat Bilgileri
                    </h3>
                    <p className="text-xs text-[#7A7067]">
                      Sipariş takip bildirimleri ve atölye kargosu için gereklidir
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1.5">
                      Adınız Soyadınız *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Adınız Soyadınız"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-3.5 py-2.5 rounded-xs border text-sm text-[#231B18] bg-white focus:outline-none transition ${
                        errors.fullName
                          ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                          : 'border-stone-300 focus:border-[#231B18]'
                      }`}
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1.5">
                      E-posta Adresi (Sipariş Takibi İçin) *
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="ornek@alanadi.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3.5 py-2.5 rounded-xs border text-sm text-[#231B18] bg-white focus:outline-none transition ${
                        errors.email
                          ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                          : 'border-stone-300 focus:border-[#231B18]'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1.5">
                      Cep Telefonu (Kargo Teslimat SMS&apos;i) *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="05XX XXX XX XX"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-3.5 py-2.5 rounded-xs border text-sm text-[#231B18] bg-white focus:outline-none transition ${
                        errors.phone
                          ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                          : 'border-stone-300 focus:border-[#231B18]'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1.5">
                      İl (Şehir) *
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xs border border-stone-300 bg-white text-sm text-[#231B18] focus:outline-none focus:border-[#231B18]"
                    >
                      {TURKISH_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1.5">
                      İlçe *
                    </label>
                    <input
                      type="text"
                      name="district"
                      placeholder="Örn: Karşıyaka"
                      value={formData.district}
                      onChange={handleInputChange}
                      className={`w-full px-3.5 py-2.5 rounded-xs border text-sm text-[#231B18] bg-white focus:outline-none transition ${
                        errors.district
                          ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                          : 'border-stone-300 focus:border-[#231B18]'
                      }`}
                    />
                    {errors.district && (
                      <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.district}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1.5">
                      Mahalle *
                    </label>
                    <input
                      type="text"
                      name="neighborhood"
                      placeholder="Örn: Caferağa Mah."
                      value={formData.neighborhood}
                      onChange={handleInputChange}
                      className={`w-full px-3.5 py-2.5 rounded-xs border text-sm text-[#231B18] bg-white focus:outline-none transition ${
                        errors.neighborhood
                          ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                          : 'border-stone-300 focus:border-[#231B18]'
                      }`}
                    />
                    {errors.neighborhood && (
                      <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.neighborhood}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1.5">
                      Açık Teslimat Adresi (Cadde, Sokak, Bina No, Daire) *
                    </label>
                    <textarea
                      name="address"
                      rows={2}
                      placeholder="Örn: Şair Nefi Sk. No:18 D:4"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full px-3.5 py-2.5 rounded-xs border text-sm text-[#231B18] bg-white focus:outline-none transition ${
                        errors.address
                          ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                          : 'border-stone-300 focus:border-[#231B18]'
                      }`}
                    />
                    {errors.address && (
                      <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.address}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1.5">
                      Posta Kodu (Opsiyonel)
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      placeholder="34710"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xs border border-stone-300 bg-white text-sm text-[#231B18] focus:outline-none focus:border-[#231B18]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1.5">
                      Kurye İçin Sipariş Notu (Opsiyonel)
                    </label>
                    <input
                      type="text"
                      name="orderNote"
                      placeholder="Örn: Zili çalmayınız, bebek uyuyor."
                      value={formData.orderNote}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xs border border-stone-300 bg-white text-sm text-[#231B18] focus:outline-none focus:border-[#231B18]"
                    />
                  </div>
                </div>
              </div>

              {/* ADIM 2: FATURA BİLGİLERİ */}
              <div className="bg-white rounded-xs border border-stone-200 p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-stone-200">
                  <span className="w-6 h-6 rounded-xs bg-[#231B18] text-white text-xs font-medium flex items-center justify-center">
                    2
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-normal text-[#231B18]">
                      Fatura Bilgileri
                    </h3>
                    <p className="text-xs text-[#7A7067]">
                      E-Fatura veya E-Arşiv faturanız sistem tarafından otomatik düzenlenir
                    </p>
                  </div>
                </div>

                {/* Bireysel / Kurumsal Seçimi */}
                <div className="grid grid-cols-2 gap-3 max-w-sm">
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, invoiceType: 'INDIVIDUAL' }))}
                    className={`py-2.5 px-4 rounded-xs text-xs uppercase tracking-wider font-medium border transition ${
                      formData.invoiceType === 'INDIVIDUAL'
                        ? 'bg-[#231B18] text-white border-[#231B18]'
                        : 'bg-white border-stone-300 text-[#231B18] hover:border-[#231B18]'
                    }`}
                  >
                    Bireysel Fatura
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, invoiceType: 'CORPORATE' }))}
                    className={`py-2.5 px-4 rounded-xs text-xs uppercase tracking-wider font-medium border transition ${
                      formData.invoiceType === 'CORPORATE'
                        ? 'bg-[#231B18] text-white border-[#231B18]'
                        : 'bg-white border-stone-300 text-[#231B18] hover:border-[#231B18]'
                    }`}
                  >
                    Kurumsal Fatura
                  </button>
                </div>

                {formData.invoiceType === 'INDIVIDUAL' ? (
                  <div className="space-y-3 text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.sameAsShipping}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, sameAsShipping: e.target.checked }))
                        }
                        className="w-4 h-4 text-[#231B18] accent-[#231B18] rounded-xs"
                      />
                      <span className="font-medium text-[#231B18]">
                        Fatura adresim teslimat adresim ile aynı
                      </span>
                    </label>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1">
                        T.C. Kimlik Numarası (Opsiyonel / 11111111111 girilebilir)
                      </label>
                      <input
                        type="text"
                        name="tckn"
                        maxLength={11}
                        placeholder="11 Haneli TCKN"
                        value={formData.tckn}
                        onChange={handleInputChange}
                        className="w-full sm:w-72 px-3.5 py-2.5 rounded-xs border border-stone-300 bg-white text-sm text-[#231B18] focus:outline-none focus:border-[#231B18]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1">
                        Şirket Resmi Unvanı *
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        required={formData.invoiceType === 'CORPORATE'}
                        placeholder="Örn: Safir Tasarım Ltd. Şti."
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 rounded-xs border border-stone-300 bg-white text-sm text-[#231B18] focus:outline-none focus:border-[#231B18]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1">
                        Vergi Dairesi *
                      </label>
                      <input
                        type="text"
                        name="taxOffice"
                        required={formData.invoiceType === 'CORPORATE'}
                        placeholder="Örn: Karşıyaka V.D."
                        value={formData.taxOffice}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 rounded-xs border border-stone-300 bg-white text-sm text-[#231B18] focus:outline-none focus:border-[#231B18]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1">
                        Vergi Kimlik Numarası (VKN) *
                      </label>
                      <input
                        type="text"
                        name="vkn"
                        maxLength={10}
                        required={formData.invoiceType === 'CORPORATE'}
                        placeholder="10 Haneli VKN"
                        value={formData.vkn}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 rounded-xs border border-stone-300 bg-white text-sm text-[#231B18] focus:outline-none focus:border-[#231B18]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ADIM 3: ÖDEME YÖNTEMİ */}
              <div className="bg-white rounded-xs border border-stone-200 p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-stone-200">
                  <span className="w-6 h-6 rounded-xs bg-[#231B18] text-white text-xs font-medium flex items-center justify-center">
                    3
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-normal text-[#231B18]">
                      Ödeme Yöntemi
                    </h3>
                    <p className="text-xs text-[#7A7067]">
                      256-Bit SSL şifreleme ve 3D Secure güvencesiyle koruma altında
                    </p>
                  </div>
                </div>

                {/* Ödeme Türü Seçimi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    onClick={() => setFormData((p) => ({ ...p, paymentMethod: 'CREDIT_CARD' }))}
                    className={`flex items-center gap-3 p-4 rounded-xs border cursor-pointer transition ${
                      formData.paymentMethod === 'CREDIT_CARD'
                        ? 'border-[#231B18] bg-[#FAF8F5]'
                        : 'border-stone-300 bg-white hover:border-stone-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={formData.paymentMethod === 'CREDIT_CARD'}
                      onChange={() => {}}
                      className="w-4 h-4 text-[#231B18] accent-[#231B18]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#231B18]" />
                        <span className="text-xs sm:text-sm font-medium text-[#231B18]">
                          Kredi / Banka Kartı
                        </span>
                      </div>
                      <span className="text-[11px] text-[#7A7067] block mt-0.5">
                        Tüm banka kartları & 3D Secure
                      </span>
                    </div>
                  </label>

                  <label
                    onClick={() => setFormData((p) => ({ ...p, paymentMethod: 'HAVALE_EFT' }))}
                    className={`flex items-center gap-3 p-4 rounded-xs border cursor-pointer transition ${
                      formData.paymentMethod === 'HAVALE_EFT'
                        ? 'border-[#231B18] bg-[#FAF8F5]'
                        : 'border-stone-300 bg-white hover:border-stone-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={formData.paymentMethod === 'HAVALE_EFT'}
                      onChange={() => {}}
                      className="w-4 h-4 text-[#231B18] accent-[#231B18]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#231B18]" />
                        <span className="text-xs sm:text-sm font-medium text-[#231B18]">
                          Havale / EFT ile Ödeme
                        </span>
                      </div>
                      <span className="text-[11px] text-[#7A7067] block mt-0.5">
                        Atölye banka hesaplarımıza transfer
                      </span>
                    </div>
                  </label>
                </div>

                {/* Kredi Kartı (PayTR 3D Secure Güvenli Ödeme) Bilgi Kartı */}
                {formData.paymentMethod === 'CREDIT_CARD' ? (
                  <div className="space-y-4">
                    <div className="p-5 rounded-xs bg-[#FAF8F5] border border-stone-200 space-y-3.5">
                      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-emerald-600" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#231B18]">
                            PayTR 3D Secure Güvenli Ödeme
                          </span>
                        </div>
                        <span className="text-[10px] font-medium bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-xs">
                          256-Bit SSL Korumalı
                        </span>
                      </div>

                      <p className="text-xs text-[#54473F] leading-relaxed">
                        Kart bilgileriniz Safirya sunucularında asla tutulmaz. &quot;Siparişi Onayla &amp; 3D Secure ile Öde&quot; butonuna bastığınızda resmi <strong>PayTR Güvenli Ödeme Ekranı</strong> açılacak, bankanızın SMS doğrulama kodu ile ödemeniz doğrudan banka güvencesiyle tamamlanacaktır.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px] text-[#7A7067]">
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Tüm Banka Kartları</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Taksit Seçenekleri</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>BDDK / TCMB Lisanslı</span>
                        </div>
                      </div>
                    </div>

                    {/* PayTR Hata Bildirimi */}
                    {paytrError && (
                      <div className="p-4 rounded-xs bg-red-50 border border-red-200 text-red-800 flex items-start gap-2.5 text-xs">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold block">Ödeme Başlatılamadı:</span>
                          <span className="text-[11px] mt-0.5 block">{paytrError}</span>
                        </div>
                      </div>
                    )}

                    {/* PayTR Henüz Tanımlanmamışsa Kurulum Rehberi & Test Desteği */}
                    {paytrNotConfiguredNotice && (
                      <div className="p-4 rounded-xs bg-amber-50 border border-amber-200 text-amber-900 space-y-2.5 text-xs">
                        <div className="flex items-center gap-2 font-semibold">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>PayTR API Anahtarları Henüz Girilmedi</span>
                        </div>
                        <p className="text-[11px] text-amber-800 leading-relaxed">
                          Canlı kart ödemeleri alabilmek için PayTR Mağaza Paneli&apos;nden aldığınız
                          <strong> PAYTR_MERCHANT_ID</strong>, <strong>PAYTR_MERCHANT_KEY</strong> ve <strong>PAYTR_MERCHANT_SALT</strong> bilgilerini
                          Vercel / .env ortam değişkenlerine eklemeniz gerekmektedir.
                        </p>
                        <div className="pt-1 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const rSuffix = Math.floor(1000 + Math.random() * 9000);
                              placeDirectOrder(`SFR-TEST-${rSuffix}`, 'PAYTR_TEST');
                            }}
                            className="px-3 py-1.5 rounded-xs bg-[#231B18] text-white text-[11px] hover:bg-[#C85A32] transition cursor-pointer"
                          >
                            ✓ Test Siparişi Olarak Onayla
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData((p) => ({ ...p, paymentMethod: 'HAVALE_EFT' }))}
                            className="px-3 py-1.5 rounded-xs border border-amber-300 bg-white text-amber-900 text-[11px] hover:bg-amber-100 transition cursor-pointer"
                          >
                            Havale / EFT ile Devam Et
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-5 rounded-xs bg-[#FAF8F5] border border-stone-200 space-y-3 text-xs text-[#231B18]">
                    <div className="p-3.5 bg-white rounded-xs border border-stone-200 flex items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <span className="font-medium text-[#231B18] block truncate">Garanti BBVA - Safirya Tasarım Ltd.</span>
                        <p className="font-mono text-xs text-[#231B18] tracking-wider">TR42 0006 2000 1234 5678 9012 34</p>
                        <span className="text-[11px] text-[#7A7067] block">Şube: Karşıyaka Çarşı / İzmir</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyIban('TR42 0006 2000 1234 5678 9012 34')}
                        className="px-3 py-1.5 rounded-xs border border-stone-200 hover:border-[#231B18] bg-white text-[11px] font-medium text-[#231B18] shrink-0 flex items-center gap-1 transition"
                      >
                        {copiedIban === 'TR42 0006 2000 1234 5678 9012 34' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Kopyalandı</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-stone-500" />
                            <span>Kopyala</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-3.5 bg-white rounded-xs border border-stone-200 flex items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <span className="font-medium text-[#231B18] block truncate">Türkiye İş Bankası - Safirya Tasarım Ltd.</span>
                        <p className="font-mono text-xs text-[#231B18] tracking-wider">TR88 0006 4000 9876 5432 1098 76</p>
                        <span className="text-[11px] text-[#7A7067] block">Şube: Karşıyaka Bostanlı / İzmir</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyIban('TR88 0006 4000 9876 5432 1098 76')}
                        className="px-3 py-1.5 rounded-xs border border-stone-200 hover:border-[#231B18] bg-white text-[11px] font-medium text-[#231B18] shrink-0 flex items-center gap-1 transition"
                      >
                        {copiedIban === 'TR88 0006 4000 9876 5432 1098 76' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Kopyalandı</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-stone-500" />
                            <span>Kopyala</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-[11px] text-[#554D46] bg-[#FEF5C8] p-3.5 rounded-xs border border-[#F5E898] space-y-2">
                      <div className="font-semibold text-[#231B18] flex items-center gap-1.5">
                        <span>⚠️ Önemli WhatsApp Dekont Bildirimi:</span>
                      </div>
                      <p className="leading-relaxed">
                        Havale/EFT ile ödemelerde banka açıklama alanına <strong>Sipariş Numaranızı</strong> yazmanız ve ödeme sonrası <strong>dekontunuzu WhatsApp hattımıza iletmeniz</strong> gerekmektedir. Dekontunuz teyit edildiği anda siparişiniz atölyemizde üretime alınacaktır.
                      </p>
                      <a
                        href="https://wa.me/905325557234?text=Merhaba,%20havale%20ile%20sipari%C5%9F%20verdim.%20Dekontumu%20ve%20sipari%C5%9F%20numaram%C4%B1%20iletmek%20istiyorum."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#231B18] hover:text-[#C85A32] underline pt-0.5"
                      >
                        <span>WhatsApp Destek Hattı (+90 532 555 72 34) →</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* SAĞ KOLON (4 Kolon - Sticky): SİPARİŞ ÖZETİ */}
            <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-5">
              
              <div className="bg-white rounded-xs border border-stone-200 p-6 sm:p-7 space-y-5">
                <h3 className="font-serif text-base font-normal text-[#231B18] pb-3 border-b border-stone-200 flex items-center justify-between">
                  <span>Sipariş Özeti</span>
                  <Link href="/sepet" className="text-xs text-[#C85A32] font-medium hover:underline">
                    Sepeti Düzenle
                  </Link>
                </h3>

                {/* Sepetteki Ürünlerin Listesi */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 text-xs border-b border-stone-100 pb-3 last:border-0 last:pb-0">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 object-cover rounded-xs border border-stone-200 shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-[#231B18] block truncate">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-[#7A7067] mt-0.5">
                          <span>{item.quantity} Adet</span>
                          {item.scentNote && <span>• {item.scentNote}</span>}
                        </div>
                        {item.customText && (
                          <span className="text-[10px] text-[#C85A32] font-medium block truncate">
                            &quot;{item.customText}&quot;
                          </span>
                        )}
                        <span className="font-semibold text-[#231B18] block mt-1">
                          ₺{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Hediye Paketi Varsa Not Özeti */}
                {isGiftWrapped && (
                  <div className="p-3 rounded-xs bg-[#FAF8F5] border border-stone-200 text-xs text-[#231B18] space-y-1">
                    <div className="flex items-center gap-1.5 text-[#C85A32] font-medium">
                      <Gift className="w-3.5 h-3.5" />
                      <span>Özel Hediye Paketi Dahil (+₺30)</span>
                    </div>
                    {giftNote && (
                      <p className="text-[11px] text-[#7A7067] italic line-clamp-2">
                        &quot;{giftNote}&quot;
                      </p>
                    )}
                  </div>
                )}

                {/* Fiyat Kırılımı */}
                <div className="space-y-2 text-xs text-[#7A7067] pt-2 border-t border-stone-200">
                  <div className="flex justify-between">
                    <span>Ara Toplam</span>
                    <span className="font-medium text-[#231B18]">₺{originalCartTotal.toFixed(2)}</span>
                  </div>

                  {bulkSavings > 0 && (
                    <div className="flex justify-between text-[#15803D]">
                      <span>Toplu Alım İndirimi</span>
                      <span className="font-medium">-₺{bulkSavings.toFixed(2)}</span>
                    </div>
                  )}

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-[#15803D]">
                      <span>Kupon İndirimi ({appliedCoupon?.code})</span>
                      <span className="font-medium">-₺{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  {isGiftWrapped && (
                    <div className="flex justify-between text-[#231B18]">
                      <span>Hediye Paketi</span>
                      <span className="font-medium">+₺{giftWrapFee.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span>Kargo Bedeli</span>
                    {isFreeShipping ? (
                      <span className="font-medium text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded-xs text-[11px]">
                        ÜCRETSİZ
                      </span>
                    ) : (
                      <span className="font-medium text-[#231B18]">₺45.00</span>
                    )}
                  </div>
                </div>

                {/* Kazanç Kutusu */}
                {totalSavings > 0 && (
                  <div className="p-3 rounded-xs bg-[#FEF5C8] border border-[#F5E898] text-[#231B18]">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span>Bu Siparişten Kazancınız:</span>
                      <span className="font-semibold text-sm">₺{totalSavings.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Toplam Tutar */}
                <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs text-[#7A7067] block">Ödenecek Tutar</span>
                    <span className="text-[10px] uppercase tracking-wider text-stone-400">KDV Dahil</span>
                  </div>
                  <span className="text-2xl font-semibold text-[#231B18]">
                    ₺{grandTotal.toFixed(2)}
                  </span>
                </div>

                {/* SİPARİŞİ TAMAMLA BUTONU */}
                <button
                  type="submit"
                  disabled={isSubmitting || cartItems.length === 0}
                  className="w-full py-4 rounded-xs bg-[#231B18] hover:bg-[#C85A32] text-white flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-medium transition active:scale-[0.99] disabled:opacity-70 cursor-pointer shadow-sm"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{formData.paymentMethod === 'CREDIT_CARD' ? 'PayTR Ödeme Ekranı Hazırlanıyor...' : 'Siparişiniz Alınıyor...'}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      <span>
                        {formData.paymentMethod === 'CREDIT_CARD'
                          ? `PayTR ile Güvenli Öde (₺${grandTotal.toFixed(2)})`
                          : `Havale ile Onayla (₺${grandTotal.toFixed(2)})`}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                    </span>
                  )}
                </button>

                <div className="pt-2 text-center text-[10px] text-stone-400">
                  <p>Siparişi tamamlayarak Mesafeli Satış Sözleşmesi&apos;ni kabul etmiş olursunuz.</p>
                </div>
              </div>

            </div>

          </div>
        </form>

        {/* ── PAYTR 3D SECURE GÜVENLİ ÖDEME MODAL PENCERESİ ── */}
        {paytrToken && (
          <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white rounded-xs border border-stone-200 max-w-2xl w-full p-4 sm:p-6 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200">
              
              {/* Modal Üst Başlık */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-serif text-sm sm:text-base font-normal text-[#231B18] block">
                      PayTR 3D Secure Güvenli Ödeme
                    </span>
                    <span className="text-[10px] text-[#7A7067] block">
                      Sipariş: #{paytrOrderNumber} • Tutar: ₺{grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Ödeme penceresini kapatmak istediğinize emin misiniz? Siparişiniz henüz onaylanmadı.')) {
                      setPaytrToken(null);
                    }
                  }}
                  className="text-stone-400 hover:text-stone-700 text-xs px-2.5 py-1 rounded-xs border border-stone-200 hover:border-stone-300 transition cursor-pointer"
                >
                  ✕ Kapat
                </button>
              </div>

              {/* PayTR Resmi iframe */}
              <div className="w-full bg-stone-50 rounded-xs overflow-hidden min-h-[560px] flex items-center justify-center">
                <iframe
                  src={`https://www.paytr.com/odeme/guvenli/${paytrToken}`}
                  id="paytriframe"
                  frameBorder="0"
                  scrolling="no"
                  className="w-full min-h-[580px] border-0"
                />
              </div>

              <div className="pt-3 text-center text-[10px] text-[#7A7067]">
                🔒 256-Bit SSL Şifreli Güvenli Ödeme Altyapısı • PayTR Ödeme ve Elektronik Para Kuruluşu A.Ş.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
