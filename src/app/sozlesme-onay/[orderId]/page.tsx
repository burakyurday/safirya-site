'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Printer,
  Calendar,
  Clock,
  User,
  Heart,
  Tag,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Lock,
  Download,
  Share2,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { CustomContract } from '@/types/admin';

export default function SozlesmeOnayPage() {
  const params = useParams();
  const orderId = (params?.orderId as string) || '';

  const {
    orders,
    customContracts,
    createCustomContract,
    signCustomContract,
    getContractByOrderId,
    settings,
  } = useAdmin();

  const [contract, setContract] = useState<CustomContract | null>(null);
  const [order, setOrder] = useState<any>(null);

  // Form & İmza State'leri
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [checkTextApproved, setCheckTextApproved] = useState(false);
  const [checkLegalApproved, setCheckLegalApproved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signedSuccess, setSignedSuccess] = useState(false);

  // Sözleşmeyi ve Siparişi bul veya oluştur
  useEffect(() => {
    if (!orderId) return;

    // 1. Önce kayıtlı sözleşme var mı bak
    let existingContract = getContractByOrderId(orderId);
    if (!existingContract && typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('safirya_custom_contracts') || localStorage.getItem('safirya_admin_contracts');
        if (raw) {
          const list = JSON.parse(raw);
          existingContract = list.find((c: any) => c.orderId === orderId || c.orderNumber === orderId || (c.orderNumber && c.orderNumber.toUpperCase() === orderId.toUpperCase()));
        }
      } catch {}
    }

    if (existingContract) {
      setContract(existingContract);
      setSignerName(existingContract.customerName);
      if (existingContract.status === 'ONAYLANDI') {
        setSignedSuccess(true);
      }
      return;
    }

    // 2. Sipariş var mı bak
    let foundOrder = orders.find(
      (o) => o.id === orderId || o.orderNumber === orderId || (o.orderNumber && o.orderNumber.toUpperCase() === orderId.toUpperCase())
    );
    if (!foundOrder && typeof window !== 'undefined') {
      try {
        const oRaw = localStorage.getItem('safirya_orders');
        if (oRaw) {
          const oList = JSON.parse(oRaw);
          foundOrder = oList.find((o: any) => o.id === orderId || o.orderNumber === orderId || (o.orderNumber && o.orderNumber.toUpperCase() === orderId.toUpperCase()));
        }
      } catch {}
    }
    if (foundOrder) {
      setOrder(foundOrder);
      setSignerName(foundOrder.customerName);

      // Sözleşme kaydı yoksa taslak üret
      const customItem = foundOrder.items.find((i) => i.customization?.customText) || foundOrder.items[0];
      const newDraft = createCustomContract({
        orderId: foundOrder.id,
        orderNumber: foundOrder.orderNumber,
        customerName: foundOrder.customerName,
        customerEmail: foundOrder.customerEmail,
        customerPhone: foundOrder.customerPhone,
        productName: customItem?.productName || 'Kişiye Özel Tasarım Hediyelik',
        quantity: customItem?.quantity || 50,
        totalAmount: foundOrder.totalAmount,
        customText: customItem?.customization?.customText || 'Özel İsim Belirtilmedi',
        scentNote: customItem?.customization?.selectedScent,
        colorPalette: customItem?.customization?.selectedColor,
        tagDesignType: customItem?.customization?.tagDesignType || 'STANDART-KRAFT',
        extraNotes: customItem?.customization?.extraNote,
        eventDate: '2026-06-18',
        agreedDeliveryDate: foundOrder.dueDate || '2026-10-20',
      });
      setContract(newDraft);
    }
  }, [orderId, orders, customContracts]);

  // Canvas İmza Çizimi Fonksiyonları (Dokunmatik + Fare Destekli)
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1B2A4A'; // Safir Mavi mürekkep rengi
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Sözleşmeyi İmzala ve Onayla
  const handleSignContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract) return;
    if (!checkTextApproved || !checkLegalApproved) {
      alert('Lütfen metin onayı ve yasal bilgilendirme kutucuklarını işaretleyiniz.');
      return;
    }
    if (!hasSignature) {
      alert('Lütfen dokunmatik ekranda imza kutusuna imzanızı atınız.');
      return;
    }

    setIsSubmitting(true);
    try {
      const canvas = canvasRef.current;
      const signatureDataUrl = canvas ? canvas.toDataURL('image/png') : '';
      const updated = await signCustomContract(contract.id, signatureDataUrl, signerName);
      setContract(updated);
      setSignedSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      alert('Sözleşme onaylanırken bir hata oluştu: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!contract) {
    return (
      <div className="min-h-screen bg-[#F6F4F0] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl max-w-md w-full text-center space-y-4 shadow-xl border border-gray-200">
          <FileText className="w-12 h-12 text-[#D96B27] mx-auto opacity-70 animate-pulse" />
          <h2 className="text-lg font-black text-[#1B2A4A]">Sözleşme Yükleniyor...</h2>
          <p className="text-xs text-gray-500">
            Sipariş #{orderId} bilgileri doğrulanıyor. Lütfen bekleyiniz.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 sm:py-12 px-4 sm:px-6 text-[#231B18] font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* ÜST ATÖLYE LOGO & BAŞLIK */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <span className="font-serif text-2xl font-bold tracking-widest text-[#1B2A4A]">
              {settings.logoText || 'SAFİRYA'}
            </span>
          </Link>
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#D96B27]">
            <ShieldCheck className="w-4 h-4" />
            <span>Kişiye Özel Üretim & Tasarım Onay Portalı</span>
          </div>
        </div>

        {/* SÖZLEŞME BELGESİ KARTI */}
        <div className="bg-white rounded-3xl border border-[#E8E2D9] p-6 sm:p-10 shadow-lg space-y-8 relative">
          
          {/* Başarı Durumu Rozeti */}
          {signedSuccess && (
            <div className="bg-emerald-50 border-2 border-emerald-500 p-4 sm:p-6 rounded-2xl text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-emerald-900">
                Sözleşme Dijital Olarak Onaylandı!
              </h3>
              <p className="text-xs text-emerald-800 max-w-lg mx-auto">
                Baskı metniniz ve üretim detaylarınız onaylanmış olup atölyemizde imalat sırasına alınmıştır.
              </p>
              <div className="inline-block bg-white px-3 py-1 rounded-full text-xs font-mono font-bold text-emerald-700 border border-emerald-300 mt-1 shadow-xs">
                Doğrulama Mührü: {contract.verificationCode || 'SOZ-SFR-2026-OK'}
              </div>
            </div>
          )}

          {/* Sözleşme Başlığı & Referans Bilgileri */}
          <div className="border-b border-gray-200 pb-6 text-center space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-serif font-black text-[#1B2A4A]">
              Kişiye Özel Üretim & Kişiselleştirme Sözleşmesi
            </h1>
            <p className="text-xs text-gray-500">
              6502 Sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği Md. 15/b Uyarınca
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px] text-gray-600 font-medium">
              <span className="bg-gray-100 px-2.5 py-1 rounded-md">
                Sipariş No: <strong>#{contract.orderNumber}</strong>
              </span>
              <span className="bg-gray-100 px-2.5 py-1 rounded-md">
                Müşteri: <strong>{contract.customerName}</strong>
              </span>
              <span className="bg-gray-100 px-2.5 py-1 rounded-md">
                Tarih: <strong>{contract.createdAt.slice(0, 10)}</strong>
              </span>
            </div>
          </div>

          {/* DİKKAT: BİREBİR BASILACAK METİN ALANI (Öne Çıkan Kutu) */}
          <div className="bg-[#FFF8F3] border-2 border-[#D96B27] rounded-2xl p-5 sm:p-6 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D96B27]">
              <Sparkles className="w-4 h-4" />
              <span>Ürün Üzerine Basılacak Birebir İsim ve Tarih</span>
            </div>

            <div className="text-center py-4 bg-white rounded-xl border border-orange-200 shadow-xs">
              <span className="text-xs text-gray-400 block mb-1 uppercase tracking-widest font-bold">
                Baskı / Kaligrafi Metni:
              </span>
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#1B2A4A] tracking-wide px-4 block">
                &ldquo;{contract.customText}&rdquo;
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-700 pt-1">
              <div className="bg-white/80 p-2 rounded-lg border border-orange-100">
                <span className="text-[10px] text-gray-400 block font-bold">Ürün</span>
                <span className="font-semibold truncate block">{contract.productName}</span>
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-orange-100">
                <span className="text-[10px] text-gray-400 block font-bold">Adet</span>
                <span className="font-semibold">{contract.quantity} Adet</span>
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-orange-100">
                <span className="text-[10px] text-gray-400 block font-bold">Seçilen Koku</span>
                <span className="font-semibold truncate block">{contract.scentNote || 'Belirtilmedi'}</span>
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-orange-100">
                <span className="text-[10px] text-gray-400 block font-bold">Kararlaştırılan Teslim</span>
                <span className="font-semibold text-[#D96B27]">{contract.agreedDeliveryDate}</span>
              </div>
            </div>
          </div>

          {/* HUKUKİ ŞARTLAR & CAYMA HAKKI İSTİSNASI MADDELERİ */}
          <div className="space-y-4 text-xs text-gray-600 leading-relaxed bg-[#FAF8F5] p-5 rounded-2xl border border-gray-200">
            <h3 className="font-bold text-sm text-[#1B2A4A] flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#D96B27]" />
              <span>Sözleşme Maddeleri ve Yasal Aydınlatma</span>
            </h3>

            <div className="space-y-2.5">
              <p>
                <strong>Madde 1 (İsim ve İmla Sorumluluğu):</strong> Ürün üzerine yazılacak isim, tarih, harf ve notlar yukarıdaki kutuda belirtildiği şekliyle atölyemizde baskıya alınacaktır. Bu form onaylandıktan sonra yazım hatası veya imla düzeltmesi sorumluluğu ALICI&apos;ya aittir.
              </p>
              <p>
                <strong>Madde 2 (Cayma Hakkı İstisnası):</strong> 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesinin (b) bendi uyarınca; <em>&ldquo;Tüketicinin istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan mallara ilişkin sözleşmelerde tüketici cayma hakkını kullanamaz.&rdquo;</em> Bu kapsamda kişiselleştirilen ürünlerde iade ve iptal kabul edilmemektedir.
              </p>
              <p>
                <strong>Madde 3 (Zanaatkar El Yapımı Toleransı):</strong> Doğal soya vaksı, el dökümü kokulu taş ve reçineli sunumluklar zanaatkarlarımız tarafından tek tek üretildiğinden, renk tonlarında ve kurutulmuş çiçek süslemelerinde %5 oranında butik doğal farklılıklar bulunabilir.
              </p>
              <p>
                <strong>Madde 4 (Teslimat ve Kargo Güvencesi):</strong> Ürünler darbe emici özel ambalajlarla paketlenir. Teslimat sırasında hasar gören kargolarda tutanak tutulması şartıyla Safirya Atölyesi tarafından ivedilikle ücretsiz yenisi üretilir.
              </p>
            </div>
          </div>

          {/* ONAY & İMZA ALANI */}
          {signedSuccess ? (
            /* Zaten İmzalanmış Görünüm */
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                    Dijital E-İmza & Onay İzi
                  </span>
                  <div className="text-sm font-bold text-[#1B2A4A]">{contract.signedBy || contract.customerName}</div>
                  <div className="text-xs text-gray-500">Onay Zamanı: {contract.signedAt}</div>
                  <div className="text-[11px] font-mono text-emerald-700">Mühür: {contract.verificationCode}</div>
                </div>

                {contract.signatureDataUrl && (
                  <div className="bg-white p-3 rounded-xl border border-gray-300 shadow-xs">
                    <img
                      src={contract.signatureDataUrl}
                      alt="Müşteri İmzası"
                      className="h-16 w-auto max-w-[180px] object-contain"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-xs transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Sözleşmeyi Yazdır / PDF</span>
                </button>
              </div>
            </div>
          ) : (
            /* İmzalama Formu */
            <form onSubmit={handleSignContract} className="border-t border-gray-200 pt-6 space-y-6">
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[#1B2A4A]">
                  Dijital Onay ve Dokunmatik E-İmzanız
                </h4>

                {/* Onay Kutucukları */}
                <div className="space-y-2 bg-orange-50/50 p-4 rounded-xl border border-orange-200/60">
                  <label className="flex items-start gap-2.5 text-xs text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkTextApproved}
                      onChange={(e) => setCheckTextApproved(e.target.checked)}
                      className="rounded text-[#D96B27] focus:ring-[#D96B27] w-4 h-4 mt-0.5"
                    />
                    <span>
                      Yukarıdaki <strong>&ldquo;{contract.customText}&rdquo;</strong> metnini, koku seçimini ve teslimat tarihini kontrol ettim, doğruluğunu onaylıyorum.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 text-xs text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkLegalApproved}
                      onChange={(e) => setCheckLegalApproved(e.target.checked)}
                      className="rounded text-[#D96B27] focus:ring-[#D96B27] w-4 h-4 mt-0.5"
                    />
                    <span>
                      6502 sayılı Tüketicinin Korunması Kanunu Md. 15/b uyarınca kişiye özel hazırlanan ürünlerde cayma hakkı bulunmadığını kabul ediyorum.
                    </span>
                  </label>
                </div>

                {/* İsim Girişi */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    İmza Sahibi Ad Soyad
                  </label>
                  <input
                    type="text"
                    required
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    placeholder="Ad Soyad"
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>

                {/* Dokunmatik Canvas İmza Pad */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-700">
                      Dokunmatik İmza Alanı (Parmağınızla veya fareyle imzalayınız)
                    </label>
                    {hasSignature && (
                      <button
                        type="button"
                        onClick={clearSignature}
                        className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>İmzayı Temizle</span>
                      </button>
                    )}
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white shadow-inner flex justify-center">
                    <canvas
                      ref={canvasRef}
                      width={500}
                      height={160}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="cursor-crosshair touch-none w-full max-w-[500px] h-[160px]"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 text-center">
                    İmzanız zaman damgası ve şifreli onay koduyla birlikte sisteme mühürlenecektir.
                  </p>
                </div>
              </div>

              {/* Onayla Butonu */}
              <button
                type="submit"
                disabled={isSubmitting || !hasSignature || !checkTextApproved || !checkLegalApproved}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#D96B27] hover:bg-[#c25a1e] text-white text-sm font-bold shadow-lg shadow-[#D96B27]/30 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Sözleşme Mühürleniyor...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Sözleşmeyi İmzala & Üretimi Başlat</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* ALT GÜVENLİK BİLGİSİ */}
        <div className="text-center text-xs text-gray-400 space-y-1">
          <p>Safirya El Yapımı Tasarım Atölyesi — Karşıyaka / İzmir</p>
          <p className="text-[10px]">Tüm dijital onay kayıtları 256-bit SSL ve zaman damgası ile güvence altındadır.</p>
        </div>
      </div>
    </div>
  );
}
