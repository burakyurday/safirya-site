'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Printer,
  Download,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  Check,
} from 'lucide-react';
import { CartItem } from '@/context/StoreContext';
import { CustomContract } from '@/types/admin';
import { printContractA4, downloadContractPdf } from '@/lib/contractPdf';

interface PersonalizedContractSectionProps {
  personalizedItems: CartItem[];
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  orderNumber: string;
  grandTotal: number;
  // Canvas refs and drawing handlers
  contractCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  hasSignature: boolean;
  signatureDataUrl: string | null;
  signerName: string;
  setSignerName: (name: string) => void;
  checkTextApproved: boolean;
  setCheckTextApproved: (approved: boolean) => void;
  checkLegalApproved: boolean;
  setCheckLegalApproved: (approved: boolean) => void;
  isContractApproved: boolean;
  contractVerificationCode: string | null;
  contractSignedAt: string | null;
  contractError: string | null;
  startDrawing: (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => void;
  drawSignature: (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => void;
  stopDrawing: () => void;
  clearSignature: () => void;
  onSealContract: () => void;
  onReopenSignature?: () => void;
  settings?: any;
}

export default function PersonalizedContractSection({
  personalizedItems,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  orderNumber,
  grandTotal,
  contractCanvasRef,
  hasSignature,
  signatureDataUrl,
  signerName,
  setSignerName,
  checkTextApproved,
  setCheckTextApproved,
  checkLegalApproved,
  setCheckLegalApproved,
  isContractApproved,
  contractVerificationCode,
  contractSignedAt,
  contractError,
  startDrawing,
  drawSignature,
  stopDrawing,
  clearSignature,
  onSealContract,
  onReopenSignature,
  settings,
}: PersonalizedContractSectionProps) {
  const [isContractTextExpanded, setIsContractTextExpanded] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Anlık sözleşme verisi nesnesi
  const currentContractObj: CustomContract = {
    id: `cnt-${orderNumber}`,
    orderNumber,
    customerName: (signerName || customerName).trim() || 'Müşteri',
    customerEmail,
    customerPhone,
    customerAddress,
    productName: personalizedItems.map((i) => `${i.name} (${i.quantity} Adet)`).join(', '),
    quantity: personalizedItems.reduce((acc, i) => acc + i.quantity, 0),
    totalAmount: grandTotal,
    customText: personalizedItems.map((i) => i.customText).filter(Boolean).join(' | '),
    scentNote: personalizedItems[0]?.scentNote,
    colorPalette: personalizedItems[0]?.colorPalette,
    status: isContractApproved ? 'ONAYLANDI' : 'BEKLIYOR',
    verificationCode: contractVerificationCode || `SOZ-${orderNumber}-OK`,
    signedAt: contractSignedAt || new Date().toLocaleString('tr-TR'),
    signedBy: (signerName || customerName).trim(),
    signatureDataUrl: signatureDataUrl || undefined,
    legalConsentChecked: checkLegalApproved && checkTextApproved,
    createdAt: new Date().toISOString(),
    agreedDeliveryDate: '3-4 İş Günü',
    items: personalizedItems.map((i) => ({
      productName: i.name,
      quantity: i.quantity,
      unitPrice: i.price,
      totalAmount: i.price * i.quantity,
      customText: i.customText,
      scentNote: i.scentNote,
      colorPalette: i.colorPalette,
    })),
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      await printContractA4(currentContractObj, settings);
    } catch (e) {
      console.error(e);
      alert('Yazdırma işlemi başlatılamadı.');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadContractPdf(currentContractObj, settings);
    } catch (e) {
      console.error(e);
      alert('PDF oluşturulamadı.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      id="personalized-contract-section"
      className={`bg-white rounded-xs border transition-all ${
        contractError
          ? 'border-red-400 ring-2 ring-red-200'
          : isContractApproved
          ? 'border-emerald-300 ring-1 ring-emerald-100'
          : 'border-stone-200'
      } p-6 sm:p-8 space-y-6`}
    >
      {/* 1. ADIM BAŞLIĞI VE YASAL MEVZUAT BİLGİSİ */}
      <div className="flex items-start justify-between pb-4 border-b border-stone-200 gap-3">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-xs bg-[#C85A32] text-white text-xs font-medium flex items-center justify-center shrink-0">
            3
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg font-normal text-[#231B18]">
                Kişiye Özel Üretim & Kişiselleştirme Sözleşmesi
              </h3>
              <span className="px-2 py-0.5 rounded-xs text-[10px] font-semibold uppercase tracking-wider bg-orange-100 text-[#C85A32]">
                Yasal Zorunluluk
              </span>
            </div>
            <p className="text-xs text-[#7A7067] mt-0.5">
              6502 Sayılı Tüketicinin Korunması Kanunu ve Mesafeli Sözleşmeler Yönetmeliği Md. 15/1-b Uyarınca
            </p>
          </div>
        </div>

        {isContractApproved && (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-xs bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dijital Olarak Mühürlendi</span>
          </span>
        )}
      </div>

      {/* Hata Bildirimi */}
      {contractError && (
        <div className="p-3.5 rounded-xs bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5 animate-shake">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span className="font-medium">{contractError}</span>
        </div>
      )}

      {/* 2. ÖNEMLİ YASAL CAYMA HAKKI İSTİSNASI UYARISI */}
      <div className="p-4 rounded-xs bg-amber-50/70 border border-amber-300/80 text-amber-950 space-y-2 text-xs leading-relaxed">
        <div className="flex items-center gap-2 font-semibold text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Tüketici Hakları Kanunu Cayma Hakkı İstisnası (Önemli Hukuki Bilgilendirme):</span>
        </div>
        <p className="text-[11px] text-amber-900/90">
          6502 sayılı Tüketicinin Korunması Hakkında Kanun&apos;un 48. maddesi ve 27.11.2014 tarihli Resmi Gazete&apos;de yayımlanan Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesinin 1. fıkrasının (b) bendi uyarınca;{' '}
          <strong>&ldquo;Tüketicinin istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan mallara ilişkin sözleşmelerde tüketici cayma hakkını kullanamaz.&rdquo;</strong>
        </p>
        <p className="text-[11px] text-amber-900/90">
          Siparişinizdeki ürünler tamamen şahsınıza özel isim, tarih ve süsleme ile üretileceğinden; sipariş verildikten sonra <strong>yasal cayma, iade, değişim veya keyfi sipariş iptali hakkı bulunmamaktadır.</strong>
        </p>
      </div>

      {/* 3. BASILACAK BİREBİR METİN VE TASARIM DETAYLARI LİSTESİ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#231B18] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>Atölyemizde Ürün Üzerine Basılacak Birebir İsim & Bilgiler</span>
          </span>
          <span className="text-[11px] text-[#7A7067]">
            {personalizedItems.length} Kişiselleştirilmiş Ürün
          </span>
        </div>

        <div className="space-y-2.5">
          {personalizedItems.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-3.5 rounded-xs border border-stone-200 bg-[#FAF8F5] space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#231B18]">
                  {item.quantity}x {item.name}
                </span>
                {item.scentNote && (
                  <span className="text-[11px] text-[#7A7067] bg-white px-2 py-0.5 rounded-xs border border-stone-200">
                    Koku: {item.scentNote}
                  </span>
                )}
              </div>

              {/* Birebir Metin Vurgusu */}
              <div className="bg-white p-3 rounded-xs border-2 border-[#C85A32]/40 text-center">
                <span className="text-[10px] text-[#7A7067] uppercase tracking-wider font-semibold block mb-0.5">
                  Baskı / Kaligrafi Yazısı:
                </span>
                <span className="font-serif text-base sm:text-lg font-bold text-[#231B18] tracking-wide">
                  &ldquo;{item.customText}&rdquo;
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#7A7067]">
                {item.colorPalette && (
                  <span className="bg-white px-2 py-0.5 rounded-xs border border-stone-200">
                    Palet: {item.colorPalette}
                  </span>
                )}
                <span className="text-amber-800 font-medium">
                  * Lütfen harf, imla ve büyük/küçük harf kontrolünü yapınız.
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. GENİŞLETİLEBİLİR RESMİ SÖZLEŞME METNİ */}
      <div className="border border-stone-200 rounded-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setIsContractTextExpanded(!isContractTextExpanded)}
          className="w-full px-4 py-3 bg-[#FAF8F5] hover:bg-stone-100 flex items-center justify-between text-xs font-semibold text-[#231B18] transition cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#C85A32]" />
            <span>Resmi Kişiye Özel Üretim Sözleşmesi Maddelerini İncele (9 Madde)</span>
          </span>
          <span className="text-[11px] text-[#C85A32] flex items-center gap-1 font-medium">
            <span>{isContractTextExpanded ? 'Kapat' : 'Tam Metni Oku'}</span>
            {isContractTextExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </button>

        {isContractTextExpanded && (
          <div className="p-4 sm:p-5 text-[11px] text-[#554D46] space-y-3 bg-white border-t border-stone-200 leading-relaxed max-h-72 overflow-y-auto">
            <p>
              <strong>MADDE 1 – TARAFLAR:</strong> İşbu sözleşme; Bostanlı Mah. Karşıyaka / İzmir adresinde mukim Safirya El Yapımı Tasarım ve Zanaat Atölyesi Tic. Ltd. Şti. (Karşıyaka V.D. 1820448192) ile yukarıdaki formda bilgileri yer alan ALICI ({customerName || 'Müşteri'}) arasında elektronik ortamda akdedilmiştir.
            </p>
            <p>
              <strong>MADDE 2 – KONU:</strong> ALICI&apos;nın elektronik ortamda siparişini verdiği, özellikleri ve kişiselleştirme parametreleri belirtilen özel tasarım hediyelik ürünün imalatı ve teslimi ile ilgili 6502 sayılı Kanun gereğince tarafların hak ve borçlarıdır.
            </p>
            <p>
              <strong>MADDE 3 – İSİM VE İMLA TEYİDİ:</strong> ALICI; baskı kutusunda yer alan metinleri bizzat kontrol ettiğini, imla ve noktalama hatalarından ALICI&apos;nın sorumlu olduğunu, sipariş oluştuktan sonra atölyede kalıp ve baskı sürecine başlanacağından metin değişikliği yapılamayacağını kabul eder.
            </p>
            <p>
              <strong>MADDE 4 – CAYMA HAKKI İSTİSNASI:</strong> 6502 Sayılı Tüketicinin Korunması Hakkında Kanun Md. 48 ve Mesafeli Sözleşmeler Yönetmeliği Md. 15/1-b amir hükmü uyarınca; kişiye özel üretilen mallarda tüketici cayma hakkını kullanamaz. İade ve iptal kabul edilmez.
            </p>
            <p>
              <strong>MADDE 5 – ZANAATKAR TOLERANSI:</strong> Doğal soya mumu, kokulu taş ve kurutulmuş çiçeklerin el işçiliği dökümü olması sebebiyle renk tonlarında %5 oranında mikro ton ve doğal dizilim varyasyonları bulunabilir.
            </p>
            <p>
              <strong>MADDE 6 – TESLİMAT VE KARGO HASARI:</strong> Kargo tesliminde pakette hasar olması durumunda kuryeye hasar tespit tutanağı tutturulması zorunludur. Tutanaklı hasarlı ürünler bedelsiz olarak yenilenir.
            </p>
            <p>
              <strong>MADDE 7 – DELİL SÖZLEŞMESİ:</strong> HMK 193. maddesi uyarınca SATICI veri tabanı kayıtları ve e-imza verileri kesin delil niteliğindedir.
            </p>
            <p>
              <strong>MADDE 8 – UYUŞMAZLIK:</strong> Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir.
            </p>
            <p>
              <strong>MADDE 9 – YÜRÜRLÜK:</strong> Sözleşme, ALICI tarafından sipariş öncesi dijital olarak onaylanıp mühürlenmesiyle yürürlüğe girer.
            </p>
          </div>
        )}
      </div>

      {/* 5. ZORUNLU ONAY KUTULARI */}
      <div className="space-y-2.5 pt-1">
        <label className="flex items-start gap-3 p-3 rounded-xs border border-stone-200 bg-[#FAF8F5] cursor-pointer hover:bg-stone-50 transition">
          <input
            type="checkbox"
            checked={checkTextApproved}
            onChange={(e) => setCheckTextApproved(e.target.checked)}
            className="w-4 h-4 text-[#C85A32] accent-[#C85A32] rounded-xs mt-0.5 shrink-0"
          />
          <span className="text-xs text-[#231B18] leading-snug">
            Sipariş ettiğim ürünlerin üzerine basılacak isim, tarih, harf ve koku seçimlerini kontrol ettim,{' '}
            <strong>doğruluğunu onaylıyorum.</strong> Baskıya alındıktan sonra yazım hatası düzeltmesi yapılamayacağını kabul ediyorum. *
          </span>
        </label>

        <label className="flex items-start gap-3 p-3 rounded-xs border border-stone-200 bg-[#FAF8F5] cursor-pointer hover:bg-stone-50 transition">
          <input
            type="checkbox"
            checked={checkLegalApproved}
            onChange={(e) => setCheckLegalApproved(e.target.checked)}
            className="w-4 h-4 text-[#C85A32] accent-[#C85A32] rounded-xs mt-0.5 shrink-0"
          />
          <span className="text-xs text-[#231B18] leading-snug">
            6502 sayılı Tüketicinin Korunması Kanunu ve Mesafeli Sözleşmeler Yönetmeliği Md. 15/1-b uyarınca{' '}
            <strong>kişiye özel hazırlanan ürünlerde cayma ve iade hakkımın bulunmadığını</strong> bildiren Kişiye Özel Üretim Sözleşmesi&apos;ni okudum ve kabul ediyorum. *
          </span>
        </label>
      </div>

      {/* 6. DİJİTAL İMZA & MÜHÜRLEME ALANI */}
      {isContractApproved ? (
        /* ONAYLANMIŞ DURUM GÖRÜNÜMÜ */
        <div className="p-4 sm:p-5 rounded-xs bg-emerald-50/70 border border-emerald-300 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-serif text-sm font-bold text-emerald-950 block">
                  Sözleşme Dijital Olarak Mühürlendi ve Onaylandı
                </span>
                <span className="text-xs text-emerald-800">
                  İmzalayan: <strong>{signerName || customerName}</strong> • {contractSignedAt}
                </span>
              </div>
            </div>

            <div className="bg-white px-3 py-1 rounded-xs border border-emerald-300 text-[11px] font-mono font-bold text-emerald-800">
              {contractVerificationCode}
            </div>
          </div>

          {/* İmza Önizlemesi Varsa */}
          {signatureDataUrl && (
            <div className="bg-white p-2.5 rounded-xs border border-emerald-200 inline-block">
              <span className="text-[9px] text-[#7A7067] uppercase font-bold block mb-1">
                Kayıtlı Dijital E-İmza:
              </span>
              <img
                src={signatureDataUrl}
                alt="Müşteri İmzası"
                className="h-12 w-auto max-w-[200px] object-contain"
              />
            </div>
          )}

          {/* İndirme & Yazdırma Aksiyonları */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-emerald-200/60">
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-3 py-1.5 rounded-xs bg-[#1B2A4A] hover:bg-[#283d6a] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'İndiriliyor...' : 'Sözleşmeyi İndir (PDF)'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting}
              className="px-3 py-1.5 rounded-xs border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-900 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isPrinting ? 'Yazdırılıyor...' : 'Sözleşmeyi Yazdır (A4)'}</span>
            </button>

            {onReopenSignature && (
              <button
                type="button"
                onClick={onReopenSignature}
                className="text-[11px] text-stone-500 hover:text-stone-800 underline ml-auto transition cursor-pointer"
              >
                İmzayı Yenile
              </button>
            )}
          </div>
        </div>
      ) : (
        /* İMZALAMA VE ONAY FORMU */
        <div className="space-y-4 pt-2 border-t border-stone-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-medium text-[#231B18] mb-1">
                İmza Sahibi Adı Soyadı *
              </label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Adınız Soyadınız"
                className="w-full px-3.5 py-2 rounded-xs border border-stone-300 bg-white text-sm text-[#231B18] focus:outline-none focus:border-[#231B18]"
              />
            </div>
            
            <div className="flex items-end">
              <span className="text-[11px] text-[#7A7067] pb-2">
                * Dokunmatik ekranda parmağınızla veya masaüstünde fare ile aşağıdaki kutuya imzanızı atınız.
              </span>
            </div>
          </div>

          {/* DOKUNMATİK CANVAS E-İMZA PAD */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] uppercase tracking-wider font-medium text-[#231B18] flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-[#C85A32]" />
                <span>Dokunmatik E-İmza Alanı *</span>
              </label>
              {hasSignature && (
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-[11px] text-red-600 hover:text-red-700 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Temizle</span>
                </button>
              )}
            </div>

            <div className="border border-stone-300 rounded-xs bg-white overflow-hidden shadow-inner flex justify-center">
              <canvas
                ref={contractCanvasRef}
                width={520}
                height={150}
                onMouseDown={startDrawing}
                onMouseMove={drawSignature}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={drawSignature}
                onTouchEnd={stopDrawing}
                className="cursor-crosshair touch-none w-full max-w-[520px] h-[150px] bg-white"
              />
            </div>
            <p className="text-[10px] text-[#7A7067] text-center">
              İmzanız 256-bit SSL güvenlik şifrelemesi ve zaman damgasıyla sipariş kaydınıza mühürlenecektir.
            </p>
          </div>

          {/* Mühürle Butonu */}
          <button
            type="button"
            onClick={onSealContract}
            disabled={!checkTextApproved || !checkLegalApproved || !hasSignature}
            className="w-full py-3 rounded-xs bg-[#231B18] hover:bg-[#C85A32] text-white text-xs uppercase tracking-widest font-medium transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Sözleşmeyi İnceledim & Dijital Olarak Mühürle</span>
          </button>
        </div>
      )}
    </div>
  );
}
