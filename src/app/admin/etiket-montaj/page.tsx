'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Printer,
  Sparkles,
  Layers,
  CheckCircle2,
  SlidersHorizontal,
  RotateCcw,
  Copy,
  Scissors,
  Grid,
  FileText,
  Download,
  Eye,
  Type,
  Palette,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Info,
  Calendar,
  Heart,
  Tag,
  Check,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { AdminOrder } from '@/types/admin';

// Standart Hazır Etiket Şablonları (Piyasadaki Tanex/Avery ve Atölye Standartları)
export interface LabelTemplate {
  id: string;
  name: string;
  shape: 'circle' | 'square' | 'rectangle' | 'tag';
  widthMm: number;
  heightMm: number;
  cols: number;
  rows: number;
  labelsPerPage: number;
  marginTopMm: number;
  marginLeftMm: number;
  gapXMm: number;
  gapYMm: number;
  description: string;
}

const TEMPLATES: LabelTemplate[] = [
  {
    id: 'round-40',
    name: '40 mm Yuvarlak (24 Adet / A4)',
    shape: 'circle',
    widthMm: 40,
    heightMm: 40,
    cols: 4,
    rows: 6,
    labelsPerPage: 24,
    marginTopMm: 13.5,
    marginLeftMm: 15,
    gapXMm: 5,
    gapYMm: 5,
    description: 'Söz/Nişan hediyelik mum kapakları ve kokulu taş kutuları için en çok tercih edilen standart boyut.',
  },
  {
    id: 'round-50',
    name: '50 mm Yuvarlak (15 Adet / A4)',
    shape: 'circle',
    widthMm: 50,
    heightMm: 50,
    cols: 3,
    rows: 5,
    labelsPerPage: 15,
    marginTopMm: 11,
    marginLeftMm: 15,
    gapXMm: 10,
    gapYMm: 6,
    description: 'Büyük boy cam kavanoz kapakları ve geniş hediye kutusu mühürleri için idealdir.',
  },
  {
    id: 'round-35',
    name: '35 mm Yuvarlak (35 Adet / A4)',
    shape: 'circle',
    widthMm: 35,
    heightMm: 35,
    cols: 5,
    rows: 7,
    labelsPerPage: 35,
    marginTopMm: 14,
    marginLeftMm: 10,
    gapXMm: 4,
    gapYMm: 4,
    description: 'Küçük mantar tıpalı şişeler, mini teelight mumlar ve tüp hediyelikler için kompakt boyut.',
  },
  {
    id: 'rect-kraft',
    name: '63.5 × 38.1 mm Standart Dikdörtgen (21 Adet / A4)',
    shape: 'rectangle',
    widthMm: 63.5,
    heightMm: 38.1,
    cols: 3,
    rows: 7,
    labelsPerPage: 21,
    marginTopMm: 15.1,
    marginLeftMm: 7.2,
    gapXMm: 2.5,
    gapYMm: 0,
    description: 'Tanex ve Avery 21’li hazır kraft sticker kağıtlarıyla birebir uyumlu kavanoz gövde etiketi.',
  },
  {
    id: 'square-40',
    name: '40 × 40 mm Kare (24 Adet / A4)',
    shape: 'square',
    widthMm: 40,
    heightMm: 40,
    cols: 4,
    rows: 6,
    labelsPerPage: 24,
    marginTopMm: 13.5,
    marginLeftMm: 15,
    gapXMm: 5,
    gapYMm: 5,
    description: 'Küp mumlar, kare asetat kutular ve minimalist karton ambalajlar için modern kare etiket.',
  },
  {
    id: 'tag-flag',
    name: '50 × 25 mm Delikli / Sallama Etiket (32 Adet / A4)',
    shape: 'tag',
    widthMm: 50,
    heightMm: 25,
    cols: 4,
    rows: 8,
    labelsPerPage: 32,
    marginTopMm: 12,
    marginLeftMm: 10,
    gapXMm: 6,
    gapYMm: 4,
    description: 'Keten ip veya jüt ip ile kavanoz boynuna bağlanan delikli sallama etiket kurgusu.',
  },
];

// Tasarım Temaları & Motifler
export interface DesignTheme {
  id: string;
  name: string;
  bgType: 'kraft' | 'white' | 'cream' | 'marble';
  bgColor: string;
  textColor: string;
  subTextColor: string;
  accentColor: string;
  borderStyle: string;
  fontFamily: string;
  motif: 'wreath' | 'rings' | 'olive' | 'baby' | 'geometric' | 'minimal';
}

const THEMES: DesignTheme[] = [
  {
    id: 'rustic-kraft',
    name: 'Rustik Kraft & Botanik Çelenk',
    bgType: 'kraft',
    bgColor: '#EAD7BE',
    textColor: '#3A2616',
    subTextColor: '#664E3A',
    accentColor: '#8C5E38',
    borderStyle: 'border-dashed border-[#8C5E38]/50',
    fontFamily: 'serif',
    motif: 'wreath',
  },
  {
    id: 'safirya-gold',
    name: 'Safirya İmzalı Altın Yaldız',
    bgType: 'cream',
    bgColor: '#FDFCF7',
    textColor: '#1B2A4A',
    subTextColor: '#8C7355',
    accentColor: '#C5A059',
    borderStyle: 'border-double border-[#C5A059]',
    fontFamily: 'serif',
    motif: 'rings',
  },
  {
    id: 'olive-botanic',
    name: 'Akdeniz Zeytin Dalı',
    bgType: 'white',
    bgColor: '#FFFFFF',
    textColor: '#2E3A23',
    subTextColor: '#5C6D4C',
    accentColor: '#4A6B32',
    borderStyle: 'border border-[#4A6B32]/40',
    fontFamily: 'sans-serif',
    motif: 'olive',
  },
  {
    id: 'baby-angel',
    name: 'Melek & Bebek Hatırası',
    bgType: 'cream',
    bgColor: '#FFFBF2',
    textColor: '#4A3E3D',
    subTextColor: '#8C7775',
    accentColor: '#D97A7A',
    borderStyle: 'border-dotted border-[#D97A7A]/60',
    fontFamily: 'sans-serif',
    motif: 'baby',
  },
  {
    id: 'modern-deco',
    name: 'Minimalist Geometrik Monogram',
    bgType: 'white',
    bgColor: '#FFFFFF',
    textColor: '#111827',
    subTextColor: '#6B7280',
    accentColor: '#D96B27',
    borderStyle: 'border border-gray-300',
    fontFamily: 'sans-serif',
    motif: 'geometric',
  },
];

function EtiketMontajContent() {
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get('orderId') || searchParams.get('orderNumber');
  const { orders, showToast } = useAdmin();

  // Aktif Seçimler & Form State
  const [selectedTemplate, setSelectedTemplate] = useState<LabelTemplate>(TEMPLATES[0]);
  const [selectedTheme, setSelectedTheme] = useState<DesignTheme>(THEMES[0]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  // Etiket Metinleri
  const [titleText, setTitleText] = useState('Selin & Emre');
  const [subtitleText, setSubtitleText] = useState('18.06.2026');
  const [footnoteText, setFootnoteText] = useState('Sevgiyle Teşekkür Ederiz');
  const [scentTag, setScentTag] = useState('Madagaskar Vanilyası');
  const [requiredQuantity, setRequiredQuantity] = useState(50);
  const [fillMode, setFillMode] = useState<'fill-sheet' | 'exact-qty'>('exact-qty');

  // Kılavuz & Montaj İnce Ayarları
  const [showCutMarks, setShowCutMarks] = useState(true);
  const [showBleedBorder, setShowBleedBorder] = useState(true);
  const [zoomLevel, setZoomLevel] = useState<number>(0.85); // Ekran ölçeği
  const [activeViewTab, setActiveViewTab] = useState<'sheet' | 'single'>('sheet');

  // Milimetrik İnce Kaydırma (Yazıcı hassasiyeti için mm ofset)
  const [offsetXMm, setOffsetXMm] = useState<number>(0);
  const [offsetYMm, setOffsetYMm] = useState<number>(0);

  // Sipariş ID parametresiyle açılmışsa otomatik siparişi yükle
  useEffect(() => {
    if (orderIdParam && orders.length > 0) {
      const found = orders.find(
        (o) => o.id === orderIdParam || o.orderNumber === orderIdParam
      );
      if (found) {
        handleSelectOrder(found);
      }
    }
  }, [orderIdParam, orders]);

  const handleSelectOrder = (order: AdminOrder) => {
    setSelectedOrder(order);
    const customItem = order.items.find((i) => i.customization?.customText) || order.items[0];
    if (customItem) {
      if (customItem.customization?.customText) {
        // Metin parse et (örneğin "Selin & Emre 18.06.2026" veya benzeri)
        const parts = customItem.customization.customText.split(/\s+(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/);
        if (parts.length > 1) {
          setTitleText(parts[0].trim());
          setSubtitleText(parts[1].trim());
        } else {
          setTitleText(customItem.customization.customText);
          setSubtitleText(order.dueDate || 'Özel Gün Hatırası');
        }
      } else {
        setTitleText(order.customerName);
        setSubtitleText(order.dueDate || 'Safirya Atölye');
      }

      if (customItem.customization?.selectedScent) {
        setScentTag(customItem.customization.selectedScent);
      }
      setRequiredQuantity(customItem.quantity || 50);
    }
    showToast(`Sipariş #${order.orderNumber} etiket verileri başarıyla yüklendi.`);
  };

  // Toplam basılacak sayfa ve etiket sayısı hesaplama
  const totalLabelsToPrint =
    fillMode === 'fill-sheet'
      ? selectedTemplate.labelsPerPage
      : Math.max(1, requiredQuantity);

  const totalSheetsNeeded = Math.ceil(totalLabelsToPrint / selectedTemplate.labelsPerPage);

  // Doğrudan Tarayıcı Yazdırma (100% 1:1 Ölçekte A4 Çıktısı)
  const handlePrint = () => {
    window.print();
  };

  // Vektör Motif SVG Çizimi
  const renderMotifSvg = (motif: string, color: string) => {
    if (motif === 'wreath') {
      return (
        <svg viewBox="0 0 100 100" className="w-9 h-9 mx-auto opacity-80" fill="none" stroke={color} strokeWidth="1.6">
          <path d="M50 15 C 30 15, 18 35, 20 60 C 22 75, 35 85, 50 88 C 65 85, 78 75, 80 60 C 82 35, 70 15, 50 15" strokeDasharray="3 2" />
          <path d="M26 38 C 22 36, 18 39, 19 43 C 22 43, 25 41, 26 38" fill={color} opacity="0.6" />
          <path d="M74 38 C 78 36, 82 39, 81 43 C 78 43, 75 41, 74 38" fill={color} opacity="0.6" />
          <path d="M22 55 C 17 55, 16 60, 19 63 C 21 61, 23 58, 22 55" fill={color} opacity="0.6" />
          <path d="M78 55 C 83 55, 84 60, 81 63 C 79 61, 77 58, 78 55" fill={color} opacity="0.6" />
          <circle cx="50" cy="18" r="2" fill={color} />
          <circle cx="50" cy="86" r="2" fill={color} />
        </svg>
      );
    }
    if (motif === 'rings') {
      return (
        <svg viewBox="0 0 100 60" className="w-8 h-5 mx-auto opacity-85" fill="none" stroke={color} strokeWidth="2">
          <circle cx="42" cy="30" r="16" />
          <circle cx="58" cy="30" r="16" />
          <path d="M42 14 L 40 10 L 44 10 Z" fill={color} />
        </svg>
      );
    }
    if (motif === 'olive') {
      return (
        <svg viewBox="0 0 100 40" className="w-9 h-4 mx-auto opacity-85" fill="none" stroke={color} strokeWidth="1.5">
          <path d="M10 20 Q 50 5 90 20 Q 50 35 10 20" />
          <ellipse cx="30" cy="15" rx="5" ry="3" fill={color} opacity="0.5" />
          <ellipse cx="50" cy="25" rx="5" ry="3" fill={color} opacity="0.5" />
          <ellipse cx="70" cy="15" rx="5" ry="3" fill={color} opacity="0.5" />
        </svg>
      );
    }
    if (motif === 'baby') {
      return (
        <svg viewBox="0 0 60 50" className="w-6 h-5 mx-auto opacity-80" fill={color}>
          <path d="M15 15 C 20 8, 30 12, 30 20 C 30 12, 40 8, 45 15 C 50 25, 30 40, 30 40 C 30 40, 10 25, 15 15 Z" fill="none" stroke={color} strokeWidth="2" />
          <circle cx="25" cy="20" r="2" />
          <circle cx="35" cy="20" r="2" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 60 40" className="w-6 h-4 mx-auto opacity-70" fill="none" stroke={color} strokeWidth="1.5">
        <rect x="15" y="10" width="30" height="20" />
        <line x1="10" y1="20" x2="50" y2="20" strokeDasharray="2 2" />
      </svg>
    );
  };

  // Tekil Etiket Tasarımı Bileşeni
  const SingleLabelBadge = ({ scale = 1, isPreview = false }: { scale?: number; isPreview?: boolean }) => {
    const isRound = selectedTemplate.shape === 'circle';
    const isTag = selectedTemplate.shape === 'tag';

    return (
      <div
        className={`relative flex flex-col items-center justify-center text-center transition-all overflow-hidden select-none ${
          isRound ? 'rounded-full' : isTag ? 'rounded-md' : 'rounded-sm'
        } ${selectedTheme.borderStyle}`}
        style={{
          width: `${selectedTemplate.widthMm * 3.78 * scale}px`, // 1mm ~= 3.78px on screen
          height: `${selectedTemplate.heightMm * 3.78 * scale}px`,
          backgroundColor: selectedTheme.bgColor,
          color: selectedTheme.textColor,
          fontFamily: selectedTheme.fontFamily,
          boxShadow: isPreview ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
        }}
      >
        {/* Sallama etiket için üst delik kılavuzu */}
        {isTag && (
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border border-gray-400 bg-white" />
        )}

        {/* Motif */}
        <div className="shrink-0 mb-0.5">
          {renderMotifSvg(selectedTheme.motif, selectedTheme.accentColor)}
        </div>

        {/* Başlık (İsimler) */}
        <div
          className="font-bold tracking-tight px-1 leading-tight break-words max-w-[90%]"
          style={{
            fontSize: `${Math.max(9, Math.min(14, selectedTemplate.widthMm * 0.28)) * scale}px`,
          }}
        >
          {titleText || 'İsimler'}
        </div>

        {/* Alt Başlık / Tarih */}
        {subtitleText && (
          <div
            className="tracking-widest font-medium uppercase mt-0.5"
            style={{
              fontSize: `${Math.max(7, selectedTemplate.widthMm * 0.18) * scale}px`,
              color: selectedTheme.subTextColor,
            }}
          >
            {subtitleText}
          </div>
        )}

        {/* Dipnot / Koku / Teşekkür */}
        {footnoteText && (
          <div
            className="text-[8px] italic opacity-85 mt-1 px-2 truncate max-w-[85%]"
            style={{
              fontSize: `${Math.max(6.5, selectedTemplate.widthMm * 0.15) * scale}px`,
              color: selectedTheme.accentColor,
            }}
          >
            {footnoteText}
          </div>
        )}

        {/* Kesim Kılavuz Çerçevesi (Opsiyonel) */}
        {showBleedBorder && (
          <div
            className={`absolute inset-0 pointer-events-none border ${
              isRound ? 'rounded-full' : 'rounded-none'
            } border-black/15 border-dashed`}
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. ÜST BAŞLIK & YAZDIR BUTONLARI */}
      <div className="no-print bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D96B27]">
            <Printer className="w-4 h-4" />
            <span>Web-to-Print Otomatik Montajlama</span>
          </div>
          <h1 className="text-2xl font-black text-[#1B2A4A] tracking-tight mt-1">
            Atölye Etiket Montaj & Tabaka Çıktısı
          </h1>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl">
            Sipariş isimlerini ve tarihlerini A4 tabakaya otomatik dizin (imposition). Kesim krosları ve milimetrik yazıcı kalibrasyonuyla 1:1 ölçekli hazır baskı çıktısı alın.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D96B27] hover:bg-[#c25a1e] text-white text-xs font-bold shadow-md shadow-[#D96B27]/25 transition active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>A4 Tabakayı Yazdır / PDF Al</span>
          </button>
        </div>
      </div>

      {/* 2. ANA PANEL: SOL KONTROLLER + SAĞ A4 CANLI ÖNİZLEME */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* SOL PANEL (5 Sütun): Ayarlar ve Kişiselleştirme */}
        <div className="no-print lg:col-span-5 space-y-4">
          
          {/* Hızlı Sipariş Seçimi */}
          <div className="bg-white p-4 rounded-xl border border-[#E8E2D9] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1B2A4A] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#D96B27]" />
                <span>Siparişten Otomatik Bilgi Çek</span>
              </label>
              {selectedOrder && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  #{selectedOrder.orderNumber} Yüklendi
                </span>
              )}
            </div>

            <select
              value={selectedOrder ? selectedOrder.id : ''}
              onChange={(e) => {
                const o = orders.find((ord) => ord.id === e.target.value);
                if (o) handleSelectOrder(o);
              }}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
            >
              <option value="">-- Listeden Sipariş Seçin --</option>
              {orders.map((ord) => {
                const custom = ord.items.find((i) => i.customization?.customText);
                return (
                  <option key={ord.id} value={ord.id}>
                    #{ord.orderNumber} - {ord.customerName} {custom ? `("${custom.customization?.customText}")` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Etiket Şablonu & Ebat Seçimi */}
          <div className="bg-white p-4 rounded-xl border border-[#E8E2D9] shadow-sm space-y-3">
            <label className="text-xs font-bold text-[#1B2A4A] flex items-center gap-1.5">
              <Grid className="w-4 h-4 text-[#D96B27]" />
              <span>Etiket Kesim & Ebat Şablonu</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TEMPLATES.map((tmpl) => (
                <button
                  type="button"
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition flex flex-col justify-between cursor-pointer ${
                    selectedTemplate.id === tmpl.id
                      ? 'border-[#D96B27] bg-[#FFF8F3] text-[#D96B27] ring-1 ring-[#D96B27]'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>{tmpl.name}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">
                    {tmpl.cols} × {tmpl.rows} Düzen ({tmpl.labelsPerPage} adet/sayfa)
                  </div>
                </button>
              ))}
            </div>

            <p className="text-[11px] text-gray-500 italic bg-amber-50/70 p-2 rounded-lg border border-amber-200/50">
              💡 {selectedTemplate.description}
            </p>
          </div>

          {/* Tasarım Teması & Zemin Seçimi */}
          <div className="bg-white p-4 rounded-xl border border-[#E8E2D9] shadow-sm space-y-3">
            <label className="text-xs font-bold text-[#1B2A4A] flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-[#D96B27]" />
              <span>Zanaatkar Tasarım Teması</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {THEMES.map((theme) => (
                <button
                  type="button"
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition flex items-center gap-2 cursor-pointer ${
                    selectedTheme.id === theme.id
                      ? 'border-[#D96B27] bg-[#FFF8F3] text-[#1B2A4A] font-bold ring-1 ring-[#D96B27]'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-gray-300 shrink-0 shadow-xs"
                    style={{ backgroundColor: theme.bgColor }}
                  />
                  <span className="truncate text-[11px]">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Metin & İsim Alanları */}
          <div className="bg-white p-4 rounded-xl border border-[#E8E2D9] shadow-sm space-y-3">
            <label className="text-xs font-bold text-[#1B2A4A] flex items-center gap-1.5">
              <Type className="w-4 h-4 text-[#D96B27]" />
              <span>Etiket Üzerine Basılacak Bilgiler</span>
            </label>

            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                  Ana Başlık / İsimler
                </label>
                <input
                  type="text"
                  value={titleText}
                  onChange={(e) => setTitleText(e.target.value)}
                  placeholder="Örn: Selin & Emre"
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                    Alt Başlık / Tarih
                  </label>
                  <input
                    type="text"
                    value={subtitleText}
                    onChange={(e) => setSubtitleText(e.target.value)}
                    placeholder="Örn: 18.06.2026"
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                    İstenen Toplam Adet
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={requiredQuantity}
                    onChange={(e) => setRequiredQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                  Dipnot / Teşekkür Cümlesi
                </label>
                <input
                  type="text"
                  value={footnoteText}
                  onChange={(e) => setFootnoteText(e.target.value)}
                  placeholder="Örn: Sevgiyle Teşekkür Ederiz"
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                />
              </div>
            </div>
          </div>

          {/* Kılavuz ve Milimetrik Kalibrasyon */}
          <div className="bg-white p-4 rounded-xl border border-[#E8E2D9] shadow-sm space-y-3">
            <label className="text-xs font-bold text-[#1B2A4A] flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-[#D96B27]" />
              <span>Yazıcı Kılavuzları & Milimetrik Kalibrasyon</span>
            </label>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCutMarks}
                  onChange={(e) => setShowCutMarks(e.target.checked)}
                  className="rounded text-[#D96B27] focus:ring-[#D96B27]"
                />
                <span>Köşe kesim krosları ve kılavuz çizgilerini göster (Kros)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBleedBorder}
                  onChange={(e) => setShowBleedBorder(e.target.checked)}
                  className="rounded text-[#D96B27] focus:ring-[#D96B27]"
                />
                <span>Etiket soyma sınır çizgisini göster</span>
              </label>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
              <span>Baskı Doldurma Modu:</span>
              <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setFillMode('exact-qty')}
                  className={`px-2 py-1 rounded cursor-pointer ${
                    fillMode === 'exact-qty' ? 'bg-white font-bold text-[#D96B27] shadow-xs' : 'text-gray-600'
                  }`}
                >
                  Tam Adet ({requiredQuantity} Adet)
                </button>
                <button
                  type="button"
                  onClick={() => setFillMode('fill-sheet')}
                  className={`px-2 py-1 rounded cursor-pointer ${
                    fillMode === 'fill-sheet' ? 'bg-white font-bold text-[#D96B27] shadow-xs' : 'text-gray-600'
                  }`}
                >
                  Tam Sayfa ({selectedTemplate.labelsPerPage} Adet)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ PANEL (7 Sütun): Canlı A4 Montaj Önizleme */}
        <div className="lg:col-span-7 space-y-3">
          
          {/* Önizleme Barı & Zoom Kontrolü */}
          <div className="no-print bg-white p-3 rounded-xl border border-[#E8E2D9] shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setActiveViewTab('sheet')}
                  className={`px-3 py-1 rounded cursor-pointer font-bold transition ${
                    activeViewTab === 'sheet'
                      ? 'bg-white text-[#D96B27] shadow-xs'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  A4 Tabaka Görünümü ({selectedTemplate.labelsPerPage} Etiket)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveViewTab('single')}
                  className={`px-3 py-1 rounded cursor-pointer font-bold transition ${
                    activeViewTab === 'single'
                      ? 'bg-white text-[#D96B27] shadow-xs'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Tek Etiket Yakın Plan
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.1))}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer"
                title="Küçült"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] font-bold w-12 text-center">
                %{Math.round(zoomLevel * 100)}
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(1.2, z + 0.1))}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer"
                title="Büyüt"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Sayfa Özeti Bilgi Şeridi */}
          <div className="no-print flex items-center justify-between text-xs text-gray-600 bg-orange-50/60 border border-orange-200/60 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#D96B27]" />
              <span>
                Toplam <strong>{totalLabelsToPrint}</strong> etiket basılacak ({totalSheetsNeeded} A4 Tabaka gereklidir).
              </span>
            </div>
            <span className="font-bold text-[#1B2A4A]">Standart A4: 210 × 297 mm</span>
          </div>

          {/* CANLI A4 ÖNİZLEME ALANI (Ekran Görünümü ve Print Çıktısı) */}
          <div className="overflow-auto bg-stone-200/70 p-4 sm:p-8 rounded-2xl flex justify-center items-center min-h-[600px] border border-stone-300">
            {activeViewTab === 'single' ? (
              <div className="bg-white p-12 rounded-2xl shadow-xl flex flex-col items-center justify-center space-y-4">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Tekil Etiket Birebir Yakın Plan
                </div>
                <SingleLabelBadge scale={1.8} isPreview />
                <div className="text-[11px] text-gray-400">
                  {selectedTemplate.widthMm} × {selectedTemplate.heightMm} mm
                </div>
              </div>
            ) : (
              /* A4 SANAL TABAKA (210 x 297 mm) */
              <div
                id="print-sheet-container"
                className="print-sheet bg-white shadow-2xl relative transition-transform origin-top"
                style={{
                  width: '210mm',
                  minHeight: '297mm',
                  transform: `scale(${zoomLevel})`,
                  marginBottom: `calc((297mm * ${zoomLevel}) - 297mm)`,
                  paddingTop: `${selectedTemplate.marginTopMm}mm`,
                  paddingLeft: `${selectedTemplate.marginLeftMm}mm`,
                  boxSizing: 'border-box',
                }}
              >
                {/* Köşe Kesim Krosları (Baskıcılar için kros izleri) */}
                {showCutMarks && (
                  <>
                    <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-black/40" />
                    <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-black/40" />
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-black/40" />
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-black/40" />
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-gray-400">
                      SAFİRYA ATÖLYE WEB-TO-PRINT — A4 TABAKA (1:1 ÖLÇEK)
                    </div>
                  </>
                )}

                {/* Grid Montaj Tablosu */}
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `repeat(${selectedTemplate.cols}, ${selectedTemplate.widthMm}mm)`,
                    gridTemplateRows: `repeat(${selectedTemplate.rows}, ${selectedTemplate.heightMm}mm)`,
                    columnGap: `${selectedTemplate.gapXMm}mm`,
                    rowGap: `${selectedTemplate.gapYMm}mm`,
                  }}
                >
                  {Array.from({ length: selectedTemplate.labelsPerPage }).map((_, idx) => {
                    const isVisible = idx < totalLabelsToPrint;
                    if (!isVisible) {
                      return (
                        <div
                          key={idx}
                          className="border border-dashed border-gray-200 rounded-sm opacity-30 flex items-center justify-center text-[8px] text-gray-300"
                          style={{
                            width: `${selectedTemplate.widthMm}mm`,
                            height: `${selectedTemplate.heightMm}mm`,
                          }}
                        >
                          #{idx + 1}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-center"
                        style={{
                          width: `${selectedTemplate.widthMm}mm`,
                          height: `${selectedTemplate.heightMm}mm`,
                        }}
                      >
                        <SingleLabelBadge scale={1} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* YAZDIRMA CSS STİLLERİ (Strict 1:1 Scale Print) */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          #print-sheet-container {
            transform: none !important;
            margin: 0 !important;
            box-shadow: none !important;
            width: 210mm !important;
            height: 297mm !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function EtiketMontajPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-500">Etiket Montaj Stüdyosu Yükleniyor...</div>}>
      <EtiketMontajContent />
    </Suspense>
  );
}
