'use client';

import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  X,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Sparkles,
} from 'lucide-react';
import { CustomContract } from '@/types/admin';
import { printContractA4, downloadContractPdf } from '@/lib/contractPdf';

interface ContractPreviewModalProps {
  contract: CustomContract;
  isOpen: boolean;
  onClose: () => void;
  settings?: any;
}

export default function ContractPreviewModal({
  contract,
  isOpen,
  onClose,
  settings,
}: ContractPreviewModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen || !contract) return null;

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      await downloadContractPdf(contract, settings);
    } catch (err) {
      console.error('PDF indirme hatası:', err);
      alert('PDF oluşturulurken bir hata oluştu.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      await printContractA4(contract, settings);
    } catch (err) {
      console.error('Yazdırma hatası:', err);
      alert('Yazdırma başlatılırken bir hata oluştu.');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleCopyCode = () => {
    const code = contract.verificationCode || `SOZ-${contract.orderNumber}`;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const itemsList =
    contract.items && contract.items.length > 0
      ? contract.items
      : [
          {
            productName: contract.productName || 'Kişiye Özel Tasarım Hediyelik',
            quantity: contract.quantity || 1,
            unitPrice:
              contract.quantity && contract.quantity > 0
                ? contract.totalAmount / contract.quantity
                : contract.totalAmount,
            totalAmount: contract.totalAmount,
            customText: contract.customText,
            scentNote: contract.scentNote,
            colorPalette: contract.colorPalette,
            tagDesignType: contract.tagDesignType,
            extraNote: contract.extraNotes,
          },
        ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-stone-200 my-auto flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* MODAL ÜST ARAÇ ÇUBUĞU */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#D96B27] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base font-bold text-[#1B2A4A]">
                  Kişiye Özel Üretim Sözleşmesi
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {contract.status === 'ONAYLANDI' ? 'DİJİTAL ONAYLI' : 'ONAY BEKLİYOR'}
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Sipariş #{contract.orderNumber} • 6502 Sayılı TKHK & Mesafeli Sözleşmeler Yön. Md. 15/1-b
              </p>
            </div>
          </div>

          {/* Aksiyon Butonları */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              title="Resmi PDF Sözleşmesini Cihaza İndir"
              className="px-3.5 py-2 rounded-xl bg-[#1B2A4A] hover:bg-[#283d6a] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'İndiriliyor...' : 'PDF İndir'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting}
              title="Yalnızca Sözleşmeyi A4 Formatında Yazdır"
              className="px-3.5 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-4 h-4 text-stone-600" />
              <span>{isPrinting ? 'Hazırlanıyor...' : 'A4 Yazdır'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SÖZLEŞME GÖVDE ÖNİZLEMESİ (A4 KAĞIT BİÇİMİ) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-stone-100/60 flex justify-center">
          <div className="bg-white rounded-xl shadow-md border border-stone-300 w-full max-w-[760px] p-6 sm:p-10 space-y-6 text-[#1f2937] text-xs leading-relaxed font-sans">
            
            {/* ÜST ANTET & META */}
            <div className="flex flex-col sm:flex-row items-start justify-between pb-4 border-b-2 border-[#1B2A4A] gap-4">
              <div>
                <span className="font-serif text-2xl font-black tracking-widest text-[#1B2A4A] block">
                  {settings?.logoText || 'SAFİRYA'}
                </span>
                <span className="text-[11px] font-semibold text-stone-600 block mt-0.5">
                  Safirya El Yapımı Tasarım ve Zanaat Atölyesi Tic. Ltd. Şti.
                </span>
                <span className="text-[10px] text-stone-500 block">
                  Karşıyaka V.D. • VKN: 1820448192 • Mersis: 0182044819200001
                </span>
                <span className="text-[10px] text-stone-500 block">
                  Bostanlı Mah. Cemal Gürsel Cad. No: 42/A Karşıyaka / İZMİR
                </span>
              </div>

              <div className="bg-[#FAF8F5] border border-stone-300 rounded-lg p-3 text-[11px] space-y-1 sm:text-right min-w-[220px]">
                <div>
                  <span className="text-stone-500">Sözleşme No: </span>
                  <strong className="text-[#1B2A4A]">{contract.verificationCode || `SOZ-${contract.orderNumber}`}</strong>
                </div>
                <div>
                  <span className="text-stone-500">Sipariş No: </span>
                  <strong>#{contract.orderNumber}</strong>
                </div>
                <div>
                  <span className="text-stone-500">Tarih: </span>
                  <strong>{contract.createdAt ? contract.createdAt.slice(0, 10) : new Date().toLocaleDateString('tr-TR')}</strong>
                </div>
                <div>
                  <span className="text-stone-500">Hukuki Durum: </span>
                  <strong className="text-emerald-700">DİJİTAL ONAYLI</strong>
                </div>
              </div>
            </div>

            {/* BELGE BAŞLIĞI */}
            <div className="text-center space-y-1">
              <h2 className="text-base sm:text-lg font-black text-[#1B2A4A] uppercase tracking-wide">
                Kişiye Özel Üretim ve Kişiselleştirme Sözleşmesi
              </h2>
              <p className="text-[11px] text-stone-600 font-medium">
                6502 Sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği Md. 15/1-b Kapsamında
              </p>
            </div>

            {/* TARAFLAR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg border border-stone-200 bg-[#FAF8F5] space-y-1">
                <span className="text-[10px] font-bold text-[#1B2A4A] uppercase tracking-wider block border-b border-stone-200 pb-1 mb-1.5">
                  SATICI (Mal / Hizmet Sağlayıcı)
                </span>
                <div><strong>Ünvan:</strong> Safirya Tasarım Ltd. Şti.</div>
                <div><strong>Adres:</strong> Karşıyaka / İzmir</div>
                <div><strong>Vergi:</strong> Karşıyaka V.D. - 1820448192</div>
                <div><strong>Telefon:</strong> +90 (532) 555 72 34</div>
                <div><strong>E-Posta:</strong> atolye@safirya.tr</div>
              </div>

              <div className="p-3.5 rounded-lg border border-stone-200 bg-[#FAF8F5] space-y-1">
                <span className="text-[10px] font-bold text-[#1B2A4A] uppercase tracking-wider block border-b border-stone-200 pb-1 mb-1.5">
                  ALICI (Tüketici)
                </span>
                <div><strong>Ad Soyad:</strong> {contract.customerName || 'Müşteri'}</div>
                <div><strong>T.C. Kimlik / VKN:</strong> {contract.customerTckn || 'Tüketici Beyanı'}</div>
                <div><strong>Teslimat Adresi:</strong> {contract.customerAddress || `${contract.customerDistrict || ''} ${contract.customerCity || 'Kayıtlı Adres'}`}</div>
                <div><strong>Telefon:</strong> {contract.customerPhone || 'Kayıtlı Telefon'}</div>
                <div><strong>E-Posta:</strong> {contract.customerEmail}</div>
              </div>
            </div>

            {/* ÖNE ÇIKAN BİREBİR BASKI KUTUSU */}
            <div className="p-4 rounded-xl bg-orange-50/80 border-2 border-[#D96B27] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#D96B27] uppercase tracking-wide">
                <Sparkles className="w-4 h-4" />
                <span>Ürün Üzerine Basılacak Birebir İsim, Tarih ve Kaligrafi Metni:</span>
              </div>
              <div className="py-3 px-4 bg-white rounded-lg border border-orange-200 text-center">
                <span className="font-serif text-xl sm:text-2xl font-bold text-[#1B2A4A] tracking-wide block">
                  &ldquo;{contract.customText || 'Özel İsim Belirtilmedi'}&rdquo;
                </span>
              </div>
              <p className="text-[10px] text-amber-900 leading-tight">
                * Atölye lazer kazıma ve kaligrafi ekibimiz yukarıdaki metne harfiyen sadık kalarak imalatı gerçekleştirecektir.
              </p>
            </div>

            {/* KALEMLER TABLOSU */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#1B2A4A] text-white text-[10px] uppercase">
                    <th className="p-2.5 rounded-tl-md">Ürün Adı</th>
                    <th className="p-2.5 text-center">Adet</th>
                    <th className="p-2.5">Koku / Esans</th>
                    <th className="p-2.5">Renk / Palet</th>
                    <th className="p-2.5">Teslim Tarihi</th>
                    <th className="p-2.5 text-right rounded-tr-md">Tutar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 border border-stone-200">
                  {itemsList.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 1 ? 'bg-stone-50' : 'bg-white'}>
                      <td className="p-2.5 font-medium text-[#1B2A4A]">
                        {item.productName}
                        {item.customText && (
                          <span className="block text-[10px] text-[#D96B27] mt-0.5">
                            Baskı: &quot;{item.customText}&quot;
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-center">{item.quantity} Adet</td>
                      <td className="p-2.5">{item.scentNote || 'Standart'}</td>
                      <td className="p-2.5">{item.colorPalette || 'Doğal'}</td>
                      <td className="p-2.5">{contract.agreedDeliveryDate || '3 İş Günü'}</td>
                      <td className="p-2.5 text-right font-bold text-[#1B2A4A]">
                        ₺{Number(item.totalAmount || contract.totalAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-stone-100 font-bold">
                    <td colSpan={5} className="p-2.5 text-right text-xs text-[#1B2A4A]">
                      TOPLAM SİPARİŞ TUTARI (KDV DAHİL):
                    </td>
                    <td className="p-2.5 text-right text-sm text-[#1B2A4A]">
                      ₺{Number(contract.totalAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* HUKUKİ MADDELER */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-[11px] text-stone-700 leading-relaxed">
              <h4 className="font-bold text-xs text-[#1B2A4A] flex items-center gap-1.5 uppercase">
                <Lock className="w-3.5 h-3.5 text-[#D96B27]" />
                <span>Resmi Hukuki Maddeler ve Yasal Tüketici Aydınlatması</span>
              </h4>

              <p>
                <strong>Madde 1 (İsim ve İmla Teyidi):</strong> Ürün üzerine yazılacak isim, tarih, harf ve notlar yukarıdaki tabloda belirtildiği şekliyle atölyemizde baskıya alınacaktır. İşbu sözleşme onaylandıktan sonra yazım hatası veya imla sorumluluğu ALICI&apos;ya aittir.
              </p>
              <p>
                <strong>Madde 2 (Cayma Hakkı İstisnası):</strong> 6502 sayılı Tüketicinin Korunması Hakkında Kanun&apos;un 48. maddesi ve Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesinin (b) bendi uyarınca; <em>&ldquo;Tüketicinin istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan mallara ilişkin sözleşmelerde tüketici cayma hakkını kullanamaz.&rdquo;</em> Bu kapsamda kişiye özel üretilen ürünlerde iade, iptal ve değişim kabul edilmemektedir.
              </p>
              <p>
                <strong>Madde 3 (Zanaatkar Butik İmalat Toleransı):</strong> Doğal soya mumu, kokulu taş ve reçineli sunumluklar el dökümü olup butik üretildiğinden renk tonlarında ve kurutulmuş çiçek süslemelerinde %5 oranında doğal tolerans bulunabilir.
              </p>
              <p>
                <strong>Madde 4 (Kargo Hasar Güvencesi):</strong> Ürünler darbe emici özel paketleme ile sevk edilir. Kargo teslimi esnasında tutanak tutulması şartıyla hasarlı ürünler ücretsiz olarak yenilenir.
              </p>
            </div>

            {/* DİJİTAL İMZA & ONAY ALANI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t-2 border-[#1B2A4A]">
              <div className="p-3.5 rounded-lg border border-stone-200 bg-[#FAF8F5] space-y-1">
                <span className="text-[10px] font-bold text-[#1B2A4A] uppercase tracking-wider block border-b border-stone-200 pb-1">
                  SATICI (Yetkili Atölye Kaşesi)
                </span>
                <div className="text-xs font-semibold text-[#1B2A4A]">Safirya Tasarım Ltd. Şti.</div>
                <div className="text-[10px] text-stone-500">Yetkili Atölye Yönetimi</div>
                <div className="pt-2 text-[11px] font-bold text-[#1B2A4A]">
                  [ Elektronik Sistem Kaşesi Onaylı ]
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-stone-200 bg-[#FAF8F5] space-y-1.5">
                <span className="text-[10px] font-bold text-[#1B2A4A] uppercase tracking-wider block border-b border-stone-200 pb-1">
                  ALICI (Tüketici Dijital E-İmzası)
                </span>
                <div>
                  <span className="text-stone-500">İmza Sahibi: </span>
                  <strong className="text-[#1B2A4A]">{contract.signedBy || contract.customerName}</strong>
                </div>
                <div>
                  <span className="text-stone-500">Onay Zamanı: </span>
                  <span>{contract.signedAt || contract.createdAt}</span>
                </div>

                {contract.signatureDataUrl ? (
                  <div className="bg-white p-2 rounded border border-stone-300 inline-block mt-1">
                    <img
                      src={contract.signatureDataUrl}
                      alt="Müşteri İmzası"
                      className="h-10 max-w-[160px] object-contain"
                    />
                  </div>
                ) : (
                  <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Dijital Olarak Onaylandı & Mühürlendi</span>
                  </div>
                )}

                <div className="pt-1">
                  <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                    Mühür Kodu: {contract.verificationCode || `SOZ-${contract.orderNumber}`}
                  </span>
                </div>
              </div>
            </div>

            {/* ALT METİN */}
            <div className="text-center text-[10px] text-stone-400 pt-2 border-t border-stone-200">
              İşbu sözleşme 6502 sayılı Kanun ve 6563 sayılı Kanun uyarınca elektronik ortamda tanzim edilmiş olup ıslak imza hükmündedir.
            </div>

          </div>
        </div>

        {/* MODAL ALT BİLGİ & DOĞRULAMA ÇUBUĞU */}
        <div className="px-6 py-3 border-t border-stone-200 bg-[#FAF8F5] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-stone-600">
              Doğrulama Mührü: <code className="font-bold text-[#1B2A4A]">{contract.verificationCode || `SOZ-${contract.orderNumber}`}</code>
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="text-stone-500 hover:text-[#1B2A4A] transition p-1 cursor-pointer"
              title="Kodu Kopyala"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-4 py-1.5 rounded-lg bg-[#D96B27] hover:bg-[#c25a1e] text-white font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'İndiriliyor...' : 'PDF İndir'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting}
              className="px-3.5 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-bold transition flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <Printer className="w-3.5 h-3.5 text-stone-600" />
              <span>A4 Yazdır</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-stone-600 transition cursor-pointer text-xs"
            >
              Kapat
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
