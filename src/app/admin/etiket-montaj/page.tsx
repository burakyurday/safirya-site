'use client';

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
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
  Share2,
  ChevronLeft,
  ChevronRight,
  QrCode as QrIcon,
  Barcode as BarcodeIcon,
  Upload,
  Plus,
  Trash2,
  Settings2,
  Maximize2,
  Ruler,
  Crosshair,
  Bookmark,
  Sparkle,
  AlertTriangle,
  RefreshCw,
  X,
  Compass,
  Paperclip,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { AdminOrder } from '@/types/admin';
import { generateBarcodeSvgPath, generateQrMatrix } from '@/lib/barcodeAndQr';

// ==========================================
// 1. TİPLER VE VERİ YAPILARI
// ==========================================

export type LabelShape = 'circle' | 'square' | 'rectangle' | 'tag' | 'arch' | 'oval';
export type PaperSize = 'A4' | 'A3' | 'Roll';
export type PaperOrientation = 'portrait' | 'landscape';
export type PaperMaterial = 'kraft' | 'white-matte' | 'white-gloss' | 'transparent' | 'textured-card';
export type FontFamilyChoice = 'serif' | 'script' | 'sans' | 'antiqua' | 'mono';

export interface LabelTemplate {
  id: string;
  name: string;
  category: 'Yuvarlak' | 'Kare & Dikdörtgen' | 'Sallama Kart & Oval' | 'Rulo & Özel';
  shape: LabelShape;
  widthMm: number;
  heightMm: number;
  cols: number;
  rows: number;
  labelsPerPage: number;
  marginTopMm: number;
  marginLeftMm: number;
  gapXMm: number;
  gapYMm: number;
  paperSize: PaperSize;
  orientation: PaperOrientation;
  description: string;
}

export interface DesignTheme {
  id: string;
  name: string;
  material: PaperMaterial;
  bgColor: string;
  textColor: string;
  subTextColor: string;
  accentColor: string;
  borderStyle: string;
  motif: string;
}

export interface GangOrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  title: string;
  subtitle: string;
  footnote: string;
  scent: string;
  quantity: number;
}

// Hazır Standart Tabaka Şablonları (Tanex, Avery ve Atölye Standartları)
const PRESET_TEMPLATES: LabelTemplate[] = [
  {
    id: 'round-40',
    name: '40 mm Daire (24 Adet / A4)',
    category: 'Yuvarlak',
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
    paperSize: 'A4',
    orientation: 'portrait',
    description: 'Mum kapağı, kokulu taş kutusu ve nikah şekeri şişesi için en popüler standart boyut.',
  },
  {
    id: 'round-50',
    name: '50 mm Daire (15 Adet / A4)',
    category: 'Yuvarlak',
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
    paperSize: 'A4',
    orientation: 'portrait',
    description: 'Geniş kavanoz kapakları, hediye kutusu mühürleri ve oda kokusu gövdesi için ideal.',
  },
  {
    id: 'round-35',
    name: '35 mm Daire (35 Adet / A4)',
    category: 'Yuvarlak',
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
    paperSize: 'A4',
    orientation: 'portrait',
    description: 'Mantar tıpalı mini şişeler, tealight mumlar ve tüp hediyelikler için kompakt boyut.',
  },
  {
    id: 'round-60',
    name: '60 mm Daire (12 Adet / A4)',
    category: 'Yuvarlak',
    shape: 'circle',
    widthMm: 60,
    heightMm: 60,
    cols: 3,
    rows: 4,
    labelsPerPage: 12,
    marginTopMm: 15,
    marginLeftMm: 12,
    gapXMm: 5,
    gapYMm: 8,
    paperSize: 'A4',
    orientation: 'portrait',
    description: 'Büyük boy masif ahşap kutular ve lüks seramik hediye setleri için geniş dairesel etiket.',
  },
  {
    id: 'rect-tanex-21',
    name: '63.5 × 38.1 mm Dikdörtgen (21 Adet / A4)',
    category: 'Kare & Dikdörtgen',
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
    paperSize: 'A4',
    orientation: 'portrait',
    description: 'Tanex ve Avery 21’li hazır kraft sticker kağıtlarıyla birebir uyumlu kavanoz gövde etiketi.',
  },
  {
    id: 'rect-tanex-24',
    name: '64.6 × 33.8 mm Dikdörtgen (24 Adet / A4)',
    category: 'Kare & Dikdörtgen',
    shape: 'rectangle',
    widthMm: 64.6,
    heightMm: 33.8,
    cols: 3,
    rows: 8,
    labelsPerPage: 24,
    marginTopMm: 13.1,
    marginLeftMm: 4.0,
    gapXMm: 3.0,
    gapYMm: 0,
    paperSize: 'A4',
    orientation: 'portrait',
    description: 'Tanex 24’lü standart lazer etiket kağıdı. Dengeli yatay form.',
  },
  {
    id: 'rect-tanex-40',
    name: '48.5 × 25.4 mm Kompakt Dikdörtgen (40 Adet / A4)',
    category: 'Kare & Dikdörtgen',
    shape: 'rectangle',
    widthMm: 48.5,
    heightMm: 25.4,
    cols: 4,
    rows: 10,
    labelsPerPage: 40,
    marginTopMm: 21.5,
    marginLeftMm: 4.0,
    gapXMm: 2.5,
    gapYMm: 0,
    paperSize: 'A4',
    orientation: 'portrait',
    description: 'Mini kibrit kutuları, test tüpleri ve mum koku bilgi etiketleri için çoklu dizilim.',
  },
  {
    id: 'square-40',
    name: '40 × 40 mm Kare (24 Adet / A4)',
    category: 'Kare & Dikdörtgen',
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
    paperSize: 'A4',
    orientation: 'portrait',
    description: 'Küp soya mumları, kare asetat kutular ve minimalist karton ambalajlar için modern kare.',
  },
  {
    id: 'square-50',
    name: '50 × 50 mm Kare (15 Adet / A4)',
    category: 'Kare & Dikdörtgen',
    shape: 'square',
    widthMm: 50,
    heightMm: 50,
    cols: 3,
    rows: 5,
    labelsPerPage: 15,
    marginTopMm: 11,
    marginLeftMm: 15,
    gapXMm: 10,
    gapYMm: 6,
    paperSize: 'A4',
    orientation: 'portrait',
    description: 'Geniş kare hediye kutuları ve epoksi sunumluk ahşap ambalajları için dengeli kare.',
  },
  {
    id: 'tag-flag',
    name: '50 × 25 mm Delikli / Sallama Kart (32 Adet / A4)',
    category: 'Sallama Kart & Oval',
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
    paperSize: 'A4',
    orientation: 'portrait',
    description: 'Keten veya jüt iple kavanoz boğazına bağlanan üstten delikli zarif sallama etiket.',
  },
  {
    id: 'tag-arch',
    name: '45 × 65 mm Kemerli (Arch) Sallama Kart (16 Adet / A4)',
    category: 'Sallama Kart & Oval',
    shape: 'arch',
    widthMm: 45,
    heightMm: 65,
    cols: 4,
    rows: 4,
    labelsPerPage: 16,
    marginTopMm: 14,
    marginLeftMm: 9,
    gapXMm: 4,
    gapYMm: 4,
    paperSize: 'A4',
    orientation: 'portrait',
    description: 'Düğün ve nişan hediyeliklerinde trend olan lüks kemerli (dome/arch) tual sallama kart.',
  },
  {
    id: 'oval-50',
    name: '50 × 35 mm Zarif Oval (18 Adet / A4)',
    category: 'Sallama Kart & Oval',
    shape: 'oval',
    widthMm: 50,
    heightMm: 35,
    cols: 3,
    rows: 6,
    labelsPerPage: 18,
    marginTopMm: 16,
    marginLeftMm: 15,
    gapXMm: 8,
    gapYMm: 6,
    paperSize: 'A4',
    orientation: 'portrait',
    description: 'Klasik Fransız parfüm ve kokulu taş kutularında kullanılan kavisli eliptik form.',
  },
  {
    id: 'rect-a3-pro',
    name: '50 × 50 mm A3 Tabaka Dijital Baskı (40 Adet / A3)',
    category: 'Rulo & Özel',
    shape: 'square',
    widthMm: 50,
    heightMm: 50,
    cols: 5,
    rows: 8,
    labelsPerPage: 40,
    marginTopMm: 10,
    marginLeftMm: 15,
    gapXMm: 5,
    gapYMm: 5,
    paperSize: 'A3',
    orientation: 'portrait',
    description: 'Profesyonel dijital matbaa makineleri için geniş A3 tabaka montajı.',
  },
  {
    id: 'roll-thermal-50',
    name: '50 × 50 mm Rulo / Tekil Termal Etiket',
    category: 'Rulo & Özel',
    shape: 'square',
    widthMm: 50,
    heightMm: 50,
    cols: 1,
    rows: 1,
    labelsPerPage: 1,
    marginTopMm: 0,
    marginLeftMm: 0,
    gapXMm: 0,
    gapYMm: 0,
    paperSize: 'Roll',
    orientation: 'portrait',
    description: 'Zebra, Xprinter, Dymo rulo etiket yazıcıları için tekil kesintisiz rulo baskısı.',
  },
];

// Tasarım Temaları & Renk Paletleri
const THEMES: DesignTheme[] = [
  {
    id: 'rustic-kraft',
    name: 'Rustik Kraft & Çelenk',
    material: 'kraft',
    bgColor: '#EAD7BE',
    textColor: '#3A2616',
    subTextColor: '#664E3A',
    accentColor: '#8C5E38',
    borderStyle: 'border-dashed border-[#8C5E38]/50',
    motif: 'wreath',
  },
  {
    id: 'safirya-gold',
    name: 'Safirya İmzalı Altın Yaldız',
    material: 'textured-card',
    bgColor: '#FDFCF7',
    textColor: '#1B2A4A',
    subTextColor: '#8C7355',
    accentColor: '#C5A059',
    borderStyle: 'border-double border-[#C5A059]',
    motif: 'rings',
  },
  {
    id: 'olive-botanic',
    name: 'Akdeniz Zeytin Dalı',
    material: 'white-matte',
    bgColor: '#FFFFFF',
    textColor: '#2E3A23',
    subTextColor: '#5C6D4C',
    accentColor: '#4A6B32',
    borderStyle: 'border border-[#4A6B32]/40',
    motif: 'olive',
  },
  {
    id: 'baby-angel',
    name: 'Melek & Bebek Hatırası',
    material: 'textured-card',
    bgColor: '#FFFBF2',
    textColor: '#4A3E3D',
    subTextColor: '#8C7775',
    accentColor: '#D97A7A',
    borderStyle: 'border-dotted border-[#D97A7A]/60',
    motif: 'baby',
  },
  {
    id: 'baby-blue',
    name: 'Bebek Mavisi & Bulut',
    material: 'white-matte',
    bgColor: '#F4F9FD',
    textColor: '#1E3A5F',
    subTextColor: '#52789E',
    accentColor: '#3B82F6',
    borderStyle: 'border border-[#3B82F6]/30',
    motif: 'angel',
  },
  {
    id: 'romantic-rose',
    name: 'Gül Kurusu & Kına Zarafeti',
    material: 'textured-card',
    bgColor: '#FAF3F3',
    textColor: '#4A1D24',
    subTextColor: '#854D56',
    accentColor: '#BE185D',
    borderStyle: 'border border-[#BE185D]/40',
    motif: 'floral-arch',
  },
  {
    id: 'minimal-modern',
    name: 'Minimalist Geometrik Monokrom',
    material: 'white-matte',
    bgColor: '#FFFFFF',
    textColor: '#111827',
    subTextColor: '#6B7280',
    accentColor: '#D96B27',
    borderStyle: 'border border-gray-300',
    motif: 'geometric',
  },
  {
    id: 'emerald-gold',
    name: 'Kraliyet Zümrüt & Varak',
    material: 'white-gloss',
    bgColor: '#0F291E',
    textColor: '#FDFBF7',
    subTextColor: '#D4AF37',
    accentColor: '#E5C07B',
    borderStyle: 'border border-[#D4AF37]/50',
    motif: 'crown',
  },
  {
    id: 'terracotta-boho',
    name: 'Terakota & Kuru Çiçek Bohem',
    material: 'kraft',
    bgColor: '#EAD0C3',
    textColor: '#4D2619',
    subTextColor: '#7D4A3A',
    accentColor: '#B8502A',
    borderStyle: 'border-dashed border-[#B8502A]/40',
    motif: 'candle',
  },
];

// Hazır Etkinlik Başlıkları
const EVENT_PRESETS = [
  'Söz & Nişan Hatırası',
  'Düğün Hatırası',
  'Hoş Geldin Bebek',
  'Kına Gecesi Hatırası',
  'Mevlit Hatırası',
  'Sünnet Hatırası',
  'Doğum Günü Hatırası',
  'Özel Koleksiyon',
  'Mum Yakma Talimatı',
  'Safirya Atelier Teşekkürler',
];

// ==========================================
// 2. ANA ETİKET MONTAJ BİLEŞENİ
// ==========================================

function EtiketMontajContent() {
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get('orderId') || searchParams.get('orderNumber');
  const { orders, showToast, moveOrderToColumn, kanbanColumns } = useAdmin();

  // Aktif Seçimler & Form State
  const [selectedTemplate, setSelectedTemplate] = useState<LabelTemplate>(PRESET_TEMPLATES[0]);
  const [selectedTheme, setSelectedTheme] = useState<DesignTheme>(THEMES[0]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  // Ebat ve Medya Tercihleri
  const [paperMaterial, setPaperMaterial] = useState<PaperMaterial>('kraft');
  const [paperSize, setPaperSize] = useState<PaperSize>('A4');
  const [orientation, setOrientation] = useState<PaperOrientation>('portrait');

  // Tipografi ve Görsel Tercihler
  const [fontFamily, setFontFamily] = useState<FontFamilyChoice>('serif');
  const [selectedMotif, setSelectedMotif] = useState<string>('wreath');
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);

  // Monogram Ayarları
  const [showMonogram, setShowMonogram] = useState(true);
  const [customMonogramText, setCustomMonogramText] = useState('');

  // QR Kod ve Barkod
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('https://safirya.tr');
  const [showBarcode, setShowBarcode] = useState(false);
  const [barcodeText, setBarcodeText] = useState('SF-1042');

  // Etiket Metinleri
  const [eventBadge, setEventBadge] = useState('Söz & Nişan Hatırası');
  const [titleText, setTitleText] = useState('Selin & Emre');
  const [subtitleText, setSubtitleText] = useState('18.06.2026 • Karşıyaka');
  const [footnoteText, setFootnoteText] = useState('Sevgiyle Teşekkür Ederiz');
  const [scentTag, setScentTag] = useState('%100 Doğal Soya Mumu • Madagaskar Vanilyası');
  const [requiredQuantity, setRequiredQuantity] = useState(50);
  const [fillMode, setFillMode] = useState<'exact-qty' | 'fill-scraps' | 'fill-all'>('fill-scraps');

  // Matbaa & Kesim Kılavuzları
  const [showCutMarks, setShowCutMarks] = useState(true);
  const [showBleedBorder, setShowBleedBorder] = useState(true);
  const [showOpticalMarks, setShowOpticalMarks] = useState(false); // Cameo/Plotter optik kros
  const [showColorStrip, setShowColorStrip] = useState(false); // CMYK baskı skalası
  const [showSlugHeader, setShowSlugHeader] = useState(true); // Tabaka bilgi anteti

  // Görünüm & Zoom & Çoklu Sayfa State'i
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);
  const [activeTab, setActiveTab] = useState<'sheet' | 'single' | 'proof' | 'custom-builder' | 'calibration'>('sheet');
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [viewAllPagesOnScreen, setViewAllPagesOnScreen] = useState<boolean>(false);

  // Milimetrik İnce Donanım Kalibrasyonu (Hardware Offset mm)
  const [offsetXMm, setOffsetXMm] = useState<number>(0);
  const [offsetYMm, setOffsetYMm] = useState<number>(0);

  // Müşteri Onay Mockup Modalı
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [proofCopied, setProofCopied] = useState(false);

  // Özel Şablon Sihirbazı Form State
  const [customWidth, setCustomWidth] = useState(40);
  const [customHeight, setCustomHeight] = useState(40);
  const [customShape, setCustomShape] = useState<LabelShape>('circle');
  const [customCols, setCustomCols] = useState(4);
  const [customRows, setCustomRows] = useState(6);
  const [customMarginTop, setCustomMarginTop] = useState(13.5);
  const [customMarginLeft, setCustomMarginLeft] = useState(15);
  const [customGapX, setCustomGapX] = useState(5);
  const [customGapY, setCustomGapY] = useState(5);

  // Karma Tabaka (Gang Run Printing) Listesi
  const [gangOrders, setGangOrders] = useState<GangOrderItem[]>([]);
  const [isGangMode, setIsGangMode] = useState(false);

  // Dosya Yükleme Referansı (Logo için)
  const fileInputRef = useRef<HTMLInputElement>(null);

  // LocalStorage'dan kayıtlı kalibrasyon ofsetlerini yükle
  useEffect(() => {
    try {
      const savedX = localStorage.getItem(`safirya_label_offset_x_${selectedTemplate.id}`);
      const savedY = localStorage.getItem(`safirya_label_offset_y_${selectedTemplate.id}`);
      if (savedX !== null) setOffsetXMm(parseFloat(savedX));
      if (savedY !== null) setOffsetYMm(parseFloat(savedY));
    } catch {
      // LocalStorage desteği yoksa atla
    }
  }, [selectedTemplate.id]);

  // Kalibrasyon ofsetlerini kaydet
  const handleSaveCalibration = () => {
    try {
      localStorage.setItem(`safirya_label_offset_x_${selectedTemplate.id}`, offsetXMm.toString());
      localStorage.setItem(`safirya_label_offset_y_${selectedTemplate.id}`, offsetYMm.toString());
      showToast(`Yazıcı kalibrasyonu (${selectedTemplate.name}) için kaydedildi: X: ${offsetXMm}mm, Y: ${offsetYMm}mm`);
    } catch {
      showToast('Kalibrasyon tarayıcı hafızasına kaydedilemedi.');
    }
  };

  // Sipariş ID parametresiyle açılmışsa siparişi otomatik yükle
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

  // Siparişten Bilgileri Aktar
  const handleSelectOrder = (order: AdminOrder) => {
    setSelectedOrder(order);
    setBarcodeText(order.orderNumber);

    const customItem = order.items.find((i) => i.customization?.customText) || order.items[0];
    if (customItem) {
      if (customItem.customization?.customText) {
        const parts = customItem.customization.customText.split(/\s+(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/);
        if (parts.length > 1) {
          setTitleText(parts[0].trim());
          setSubtitleText(parts[1].trim() + ' • ' + (order.shippingAddress?.city || 'Safirya Atölye'));
        } else {
          setTitleText(customItem.customization.customText);
          setSubtitleText(order.dueDate || 'Özel Gün Hatırası');
        }
      } else {
        setTitleText(order.customerName);
        setSubtitleText(order.dueDate || 'Safirya Atölye');
      }

      if (customItem.customization?.selectedScent) {
        setScentTag(`%100 Doğal Soya Mumu • ${customItem.customization.selectedScent}`);
      }
      setRequiredQuantity(customItem.quantity || 50);
    }
    showToast(`Sipariş #${order.orderNumber} etiket verileri aktarıldı.`);
  };

  // Monogram Otomatik Hesaplama (Örn: "Selin & Emre" -> "S & E")
  const computedMonogram = useMemo(() => {
    if (customMonogramText.trim()) return customMonogramText.trim().toUpperCase();
    if (!titleText) return 'S';
    // "&", "ve", "+", "-" gibi ayırıcıları kontrol et
    const splitParts = titleText.split(/&|ve|\+|\-|veya/i).map((s) => s.trim()).filter(Boolean);
    if (splitParts.length >= 2) {
      const firstInitial = splitParts[0].charAt(0).toUpperCase();
      const secondInitial = splitParts[1].charAt(0).toUpperCase();
      return `${firstInitial} & ${secondInitial}`;
    }
    const words = titleText.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return `${words[0].charAt(0).toUpperCase()} & ${words[1].charAt(0).toUpperCase()}`;
    }
    return titleText.charAt(0).toUpperCase();
  }, [titleText, customMonogramText]);

  // Toplam Sayfa & Etiket Hesaplaması
  const totalLabelsToPrint = useMemo(() => {
    if (fillMode === 'fill-all') {
      const sheets = Math.ceil(Math.max(1, requiredQuantity) / selectedTemplate.labelsPerPage);
      return sheets * selectedTemplate.labelsPerPage;
    }
    return Math.max(1, requiredQuantity);
  }, [fillMode, requiredQuantity, selectedTemplate.labelsPerPage]);

  const totalSheetsNeeded = useMemo(() => {
    if (selectedTemplate.labelsPerPage <= 0) return 1;
    return Math.ceil(totalLabelsToPrint / selectedTemplate.labelsPerPage);
  }, [totalLabelsToPrint, selectedTemplate.labelsPerPage]);

  // Sayfa indeksi sınırlarını koru
  useEffect(() => {
    if (currentPageIndex >= totalSheetsNeeded) {
      setCurrentPageIndex(Math.max(0, totalSheetsNeeded - 1));
    }
  }, [totalSheetsNeeded, currentPageIndex]);

  // Özel Şablon Uygulama
  const handleApplyCustomTemplate = () => {
    const labelsPerPage = customCols * customRows;
    const customTmpl: LabelTemplate = {
      id: `custom-${Date.now()}`,
      name: `Özel Ebat (${customWidth} × ${customHeight} mm - ${labelsPerPage}'li)`,
      category: 'Rulo & Özel',
      shape: customShape,
      widthMm: customWidth,
      heightMm: customHeight,
      cols: customCols,
      rows: customRows,
      labelsPerPage,
      marginTopMm: customMarginTop,
      marginLeftMm: customMarginLeft,
      gapXMm: customGapX,
      gapYMm: customGapY,
      paperSize,
      orientation,
      description: 'Atölye tarafından milimetrik olarak özelleştirilmiş özel bıçaklı tabaka şablonu.',
    };
    setSelectedTemplate(customTmpl);
    setActiveTab('sheet');
    showToast('Özel montaj şablonu başarıyla oluşturuldu ve uygulandı.');
  };

  // Otomatik Optimum Ebat Hesaplama (A4 için)
  const handleAutoFitOptimalGrid = () => {
    const pageW = orientation === 'portrait' ? (paperSize === 'A4' ? 210 : 297) : (paperSize === 'A4' ? 297 : 420);
    const pageH = orientation === 'portrait' ? (paperSize === 'A4' ? 297 : 420) : (paperSize === 'A4' ? 210 : 297);

    const safeMarginX = 10;
    const safeMarginY = 10;
    const availW = pageW - safeMarginX * 2;
    const availH = pageH - safeMarginY * 2;

    const gap = 3;
    const cols = Math.max(1, Math.floor((availW + gap) / (customWidth + gap)));
    const rows = Math.max(1, Math.floor((availH + gap) / (customHeight + gap)));

    const usedW = cols * customWidth + (cols - 1) * gap;
    const usedH = rows * customHeight + (rows - 1) * gap;

    const marginLeft = Math.max(0, (pageW - usedW) / 2);
    const marginTop = Math.max(0, (pageH - usedH) / 2);

    setCustomCols(cols);
    setCustomRows(rows);
    setCustomGapX(gap);
    setCustomGapY(gap);
    setCustomMarginLeft(Math.round(marginLeft * 10) / 10);
    setCustomMarginTop(Math.round(marginTop * 10) / 10);

    showToast(`Optimum yerleşim hesaplandı: ${cols} sütun × ${rows} satır (${cols * rows} etiket/sayfa).`);
  };

  // Karma Baskı Listesine Sipariş Ekle
  const handleAddGangOrder = () => {
    if (!selectedOrder) return;
    const newGangItem: GangOrderItem = {
      id: `${selectedOrder.id}-${Date.now()}`,
      orderNumber: selectedOrder.orderNumber,
      customerName: selectedOrder.customerName,
      title: titleText,
      subtitle: subtitleText,
      footnote: footnoteText,
      scent: scentTag,
      quantity: 12,
    };
    setGangOrders((prev) => [...prev, newGangItem]);
    showToast(`Sipariş #${selectedOrder.orderNumber} karma baskı kuyruğuna eklendi.`);
  };

  // Özel Logo Dosyası Yükleme
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCustomLogoUrl(reader.result as string);
        showToast('Özel logo başarıyla yüklendi.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Siparişi "Etiketlendi / Hazırlanıyor" Durumuna Aktar
  const handleMarkLabelsPrinted = () => {
    if (!selectedOrder) {
      showToast('Lütfen önce bir sipariş seçin.');
      return;
    }
    // Eğer üretim bandı kolonlarında "hazırlanıyor" veya "etiket" kolonu varsa taşı
    const targetCol = kanbanColumns.find(
      (c) =>
        c.title.toLowerCase().includes('hazır') ||
        c.title.toLowerCase().includes('etiket') ||
        c.title.toLowerCase().includes('üretim')
    );
    if (targetCol) {
      moveOrderToColumn(selectedOrder.id, targetCol.id);
    }
    showToast(`Sipariş #${selectedOrder.orderNumber} etiketleri basıldı olarak işaretlendi ve üretim bandı güncellendi!`);
  };

  // 1:1 Doğrudan Tarayıcı Yazdırma (Ctrl+P / Command+P)
  const handlePrint = () => {
    window.print();
  };

  // Vektör Motif SVG Çizimi (10 Farklı Zanaatkar Motif)
  const renderMotifSvg = (motifName: string, color: string) => {
    if (motifName === 'none') return null;

    if (motifName === 'wreath') {
      return (
        <svg viewBox="0 0 100 100" className="w-8 h-8 mx-auto opacity-85" fill="none" stroke={color} strokeWidth="1.5">
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

    if (motifName === 'rings') {
      return (
        <svg viewBox="0 0 100 60" className="w-8 h-5 mx-auto opacity-90" fill="none" stroke={color} strokeWidth="2">
          <circle cx="42" cy="30" r="16" />
          <circle cx="58" cy="30" r="16" />
          <path d="M42 14 L 39 9 L 45 9 Z" fill={color} />
        </svg>
      );
    }

    if (motifName === 'olive') {
      return (
        <svg viewBox="0 0 100 40" className="w-9 h-4 mx-auto opacity-85" fill="none" stroke={color} strokeWidth="1.5">
          <path d="M10 20 Q 50 5 90 20 Q 50 35 10 20" />
          <ellipse cx="30" cy="15" rx="5" ry="3" fill={color} opacity="0.5" />
          <ellipse cx="50" cy="25" rx="5" ry="3" fill={color} opacity="0.5" />
          <ellipse cx="70" cy="15" rx="5" ry="3" fill={color} opacity="0.5" />
        </svg>
      );
    }

    if (motifName === 'baby' || motifName === 'angel') {
      return (
        <svg viewBox="0 0 60 50" className="w-6 h-5 mx-auto opacity-80" fill={color}>
          <path d="M15 15 C 20 8, 30 12, 30 20 C 30 12, 40 8, 45 15 C 50 25, 30 40, 30 40 C 30 40, 10 25, 15 15 Z" fill="none" stroke={color} strokeWidth="2" />
          <circle cx="25" cy="20" r="2" />
          <circle cx="35" cy="20" r="2" />
        </svg>
      );
    }

    if (motifName === 'floral-arch') {
      return (
        <svg viewBox="0 0 80 50" className="w-8 h-5 mx-auto opacity-85" fill="none" stroke={color} strokeWidth="1.5">
          <path d="M15 45 C 15 20, 65 20, 65 45" strokeDasharray="2 2" />
          <circle cx="40" cy="18" r="4" fill={color} opacity="0.4" />
          <circle cx="28" cy="24" r="3" fill={color} opacity="0.3" />
          <circle cx="52" cy="24" r="3" fill={color} opacity="0.3" />
        </svg>
      );
    }

    if (motifName === 'heart') {
      return (
        <svg viewBox="0 0 50 50" className="w-5 h-5 mx-auto opacity-80" fill="none" stroke={color} strokeWidth="1.8">
          <path d="M25 39 C 10 28, 5 18, 12 11 C 18 5, 25 10, 25 15 C 25 10, 32 5, 38 11 C 45 18, 40 28, 25 39 Z" />
        </svg>
      );
    }

    if (motifName === 'candle') {
      return (
        <svg viewBox="0 0 40 50" className="w-5 h-6 mx-auto opacity-85" fill="none" stroke={color} strokeWidth="1.5">
          <path d="M20 5 C 18 10, 16 15, 20 20 C 24 15, 22 10, 20 5 Z" fill={color} opacity="0.4" />
          <rect x="12" y="20" width="16" height="25" rx="2" />
          <line x1="20" y1="20" x2="20" y2="17" />
        </svg>
      );
    }

    if (motifName === 'crown') {
      return (
        <svg viewBox="0 0 60 40" className="w-6 h-4 mx-auto opacity-85" fill="none" stroke={color} strokeWidth="1.6">
          <path d="M10 32 L 50 32 L 48 16 L 38 24 L 30 12 L 22 24 L 12 16 Z" />
          <circle cx="30" cy="10" r="2" fill={color} />
          <circle cx="12" cy="14" r="1.5" fill={color} />
          <circle cx="48" cy="14" r="1.5" fill={color} />
        </svg>
      );
    }

    // Default: geometric
    return (
      <svg viewBox="0 0 60 40" className="w-6 h-4 mx-auto opacity-70" fill="none" stroke={color} strokeWidth="1.5">
        <rect x="15" y="10" width="30" height="20" />
        <line x1="10" y1="20" x2="50" y2="20" strokeDasharray="2 2" />
      </svg>
    );
  };

  // Font Stili CSS Sınıfı
  const getFontFamilyClass = (choice: FontFamilyChoice) => {
    switch (choice) {
      case 'serif':
        return 'font-serif';
      case 'script':
        return 'font-serif italic tracking-wide';
      case 'sans':
        return 'font-sans';
      case 'antiqua':
        return 'font-serif uppercase tracking-widest';
      case 'mono':
        return 'font-mono';
      default:
        return 'font-serif';
    }
  };

  // QR Kod Matriksi
  const qrMatrix = useMemo(() => {
    if (!showQrCode || !qrCodeUrl) return null;
    return generateQrMatrix(qrCodeUrl);
  }, [showQrCode, qrCodeUrl]);

  // Barkod SVG Yolu
  const barcodeData = useMemo(() => {
    if (!showBarcode || !barcodeText) return null;
    return generateBarcodeSvgPath(barcodeText, 120, 24);
  }, [showBarcode, barcodeText]);

  // Tekil Etiket Bileşeni (Responsive, Vector, 100% Print Ready)
  const SingleLabelBadge = ({
    scale = 1,
    isPreview = false,
    customData,
    isFiller = false,
  }: {
    scale?: number;
    isPreview?: boolean;
    customData?: GangOrderItem;
    isFiller?: boolean;
  }) => {
    const isRound = selectedTemplate.shape === 'circle';
    const isSquare = selectedTemplate.shape === 'square';
    const isTag = selectedTemplate.shape === 'tag';
    const isArch = selectedTemplate.shape === 'arch';
    const isOval = selectedTemplate.shape === 'oval';

    const currentTitle = isFiller ? 'Safirya Atölye' : customData ? customData.title : titleText;
    const currentSub = isFiller ? 'Sevgiyle El Yapımı' : customData ? customData.subtitle : subtitleText;
    const currentFoot = isFiller ? 'safirya.tr • Karşıyaka' : customData ? customData.footnote : footnoteText;
    const currentScent = isFiller ? 'Doğal Soya & Kokulu Taş' : customData ? customData.scent : scentTag;

    // Etiket Şekli Sınıfı
    const getShapeClasses = () => {
      if (isRound) return 'rounded-full';
      if (isOval) return 'rounded-[50%]';
      if (isArch) return 'rounded-t-[38px] rounded-b-md';
      if (isTag) return 'rounded-md';
      if (isSquare) return 'rounded-sm';
      return 'rounded-xs';
    };

    // Kağıt Dokusu Arka Plan Stili
    const getBackgroundStyle = () => {
      if (paperMaterial === 'kraft') {
        return {
          backgroundColor: '#E6D3BC',
          backgroundImage: 'radial-gradient(#D8C1A4 1px, transparent 1px)',
          backgroundSize: '8px 8px',
        };
      }
      if (paperMaterial === 'white-gloss') {
        return {
          backgroundColor: '#FFFFFF',
          boxShadow: isPreview ? 'inset 0 0 10px rgba(0,0,0,0.05)' : 'none',
        };
      }
      if (paperMaterial === 'transparent') {
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.45)',
          backdropFilter: 'blur(1px)',
        };
      }
      if (paperMaterial === 'textured-card') {
        return {
          backgroundColor: '#FDFBF7',
          backgroundImage: 'radial-gradient(#EDE8DF 1px, transparent 1px)',
          backgroundSize: '6px 6px',
        };
      }
      return { backgroundColor: selectedTheme.bgColor };
    };

    return (
      <div
        className={`relative flex flex-col items-center justify-between text-center select-none overflow-hidden transition-all ${getShapeClasses()} ${
          selectedTheme.borderStyle
        }`}
        style={{
          width: `${selectedTemplate.widthMm * 3.78 * scale}px`,
          height: `${selectedTemplate.heightMm * 3.78 * scale}px`,
          color: selectedTheme.textColor,
          fontFamily: getFontFamilyClass(fontFamily),
          padding: `${Math.max(3, selectedTemplate.heightMm * 0.08) * scale}px`,
          boxShadow: isPreview ? '0 4px 14px rgba(0,0,0,0.07)' : 'none',
          ...getBackgroundStyle(),
        }}
      >
        {/* Sallama etiket için üst delik kılavuzu */}
        {(isTag || isArch) && (
          <div
            className="absolute top-1.5 left-1/2 -translate-x-1/2 rounded-full border border-gray-400 bg-white"
            style={{ width: `${3 * scale}px`, height: `${3 * scale}px` }}
          />
        )}

        {/* 1. ÜST KISIM: Rozet veya Monogram veya Motif */}
        <div className="w-full flex flex-col items-center shrink-0">
          {eventBadge && !isFiller && (
            <div
              className="font-medium tracking-widest uppercase opacity-85 px-1 truncate max-w-[95%]"
              style={{
                fontSize: `${Math.max(6, Math.min(9, selectedTemplate.widthMm * 0.14)) * scale}px`,
                color: selectedTheme.accentColor,
                letterSpacing: '0.12em',
              }}
            >
              {eventBadge}
            </div>
          )}

          {/* Logo veya Monogram veya Motif */}
          {customLogoUrl ? (
            <div className="my-0.5 max-h-7 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={customLogoUrl}
                alt="Logo"
                className="max-h-6 max-w-[80%] object-contain"
                style={{ maxHeight: `${18 * scale}px` }}
              />
            </div>
          ) : showMonogram && !isFiller ? (
            <div
              className="my-0.5 inline-flex items-center justify-center border rounded-full px-2 py-0.5 font-serif font-bold tracking-wider"
              style={{
                fontSize: `${Math.max(7, Math.min(11, selectedTemplate.widthMm * 0.2)) * scale}px`,
                borderColor: selectedTheme.accentColor,
                color: selectedTheme.accentColor,
              }}
            >
              {computedMonogram}
            </div>
          ) : (
            <div className="shrink-0 my-0.5">
              {renderMotifSvg(selectedMotif, selectedTheme.accentColor)}
            </div>
          )}
        </div>

        {/* 2. ORTA KISIM: Ana İsimler ve Tarih */}
        <div className="w-full flex flex-col items-center justify-center px-1">
          <div
            className="font-bold tracking-tight leading-tight break-words max-w-[95%]"
            style={{
              fontSize: `${Math.max(8.5, Math.min(15, selectedTemplate.widthMm * 0.26)) * scale}px`,
            }}
          >
            {currentTitle || 'İsimler'}
          </div>

          {currentSub && (
            <div
              className="font-medium tracking-wider mt-0.5 uppercase opacity-90 truncate max-w-[95%]"
              style={{
                fontSize: `${Math.max(6, Math.min(9.5, selectedTemplate.widthMm * 0.16)) * scale}px`,
                color: selectedTheme.subTextColor,
              }}
            >
              {currentSub}
            </div>
          )}
        </div>

        {/* 3. ALT KISIM: Koku / Dipnot / QR / Barkod */}
        <div className="w-full flex flex-col items-center shrink-0">
          {currentScent && !showQrCode && !showBarcode && (
            <div
              className="italic opacity-85 truncate max-w-[90%]"
              style={{
                fontSize: `${Math.max(5.5, Math.min(8, selectedTemplate.widthMm * 0.13)) * scale}px`,
                color: selectedTheme.textColor,
              }}
            >
              {currentScent}
            </div>
          )}

          {currentFoot && !showQrCode && !showBarcode && (
            <div
              className="font-semibold uppercase tracking-widest mt-0.5 truncate max-w-[90%]"
              style={{
                fontSize: `${Math.max(5.5, Math.min(7.5, selectedTemplate.widthMm * 0.12)) * scale}px`,
                color: selectedTheme.accentColor,
              }}
            >
              {currentFoot}
            </div>
          )}

          {/* Vektörel QR Kod (Varsa) */}
          {showQrCode && qrMatrix && (
            <div className="my-0.5 flex flex-col items-center">
              <svg
                viewBox={`0 0 ${qrMatrix.length} ${qrMatrix.length}`}
                style={{
                  width: `${Math.min(32, selectedTemplate.widthMm * 0.35) * scale}px`,
                  height: `${Math.min(32, selectedTemplate.widthMm * 0.35) * scale}px`,
                }}
              >
                {qrMatrix.map((row, rIdx) =>
                  row.map((col, cIdx) =>
                    col ? <rect key={`${rIdx}-${cIdx}`} x={cIdx} y={rIdx} width={1} height={1} fill={selectedTheme.textColor} /> : null
                  )
                )}
              </svg>
              <span style={{ fontSize: `${5 * scale}px` }} className="opacity-70 font-mono">
                Şarkımızı Dinleyin
              </span>
            </div>
          )}

          {/* Vektörel Barkod (Varsa) */}
          {showBarcode && barcodeData && (
            <div className="my-0.5 flex flex-col items-center">
              <svg
                viewBox="0 0 120 24"
                style={{
                  width: `${Math.min(60, selectedTemplate.widthMm * 0.6) * scale}px`,
                  height: `${12 * scale}px`,
                }}
              >
                <path d={barcodeData.path} fill={selectedTheme.textColor} />
              </svg>
              <span style={{ fontSize: `${5 * scale}px` }} className="font-mono tracking-widest">
                {barcodeData.text}
              </span>
            </div>
          )}
        </div>

        {/* Kesim / Paspartu Kılavuz Çerçevesi (Bleed Guide) */}
        {showBleedBorder && (
          <div
            className={`absolute inset-0 pointer-events-none border border-black/15 border-dashed ${getShapeClasses()}`}
          />
        )}
      </div>
    );
  };

  // Tek Tabakanın Grid Yerleşimini Çizen Yardımcı Fonksiyon
  const renderSheetGrid = (sheetIndex: number) => {
    const startIndex = sheetIndex * selectedTemplate.labelsPerPage;
    const isSingleRoll = selectedTemplate.paperSize === 'Roll';

    return (
      <div
        key={sheetIndex}
        className="print-sheet-page bg-white shadow-2xl relative transition-transform origin-top mb-12 last:mb-0"
        style={{
          width: isSingleRoll
            ? `${selectedTemplate.widthMm}mm`
            : orientation === 'portrait'
            ? paperSize === 'A4'
              ? '210mm'
              : '297mm'
            : paperSize === 'A4'
            ? '297mm'
            : '420mm',
          minHeight: isSingleRoll
            ? `${selectedTemplate.heightMm}mm`
            : orientation === 'portrait'
            ? paperSize === 'A4'
              ? '297mm'
              : '420mm'
            : paperSize === 'A4'
            ? '210mm'
            : '297mm',
          paddingTop: `${selectedTemplate.marginTopMm + offsetYMm}mm`,
          paddingLeft: `${selectedTemplate.marginLeftMm + offsetXMm}mm`,
          boxSizing: 'border-box',
          breakAfter: 'page',
          pageBreakAfter: 'always',
        }}
      >
        {/* Tabaka Bilgi Anteti (Sheet Slug) */}
        {showSlugHeader && !isSingleRoll && (
          <div className="absolute top-1.5 left-4 right-4 flex items-center justify-between text-[7.5px] font-mono text-gray-400 select-none border-b border-gray-100 pb-0.5">
            <div>
              SAFİRYA ATÖLYE • {selectedOrder ? `SİPARİŞ #${selectedOrder.orderNumber}` : 'ÖZEL İMALAT'} • {titleText}
            </div>
            <div>
              TABAKA {sheetIndex + 1} / {totalSheetsNeeded} • {selectedTemplate.name} • {paperMaterial.toUpperCase()}
            </div>
            <div>
              {new Date().toLocaleDateString('tr-TR')} • KALİBRASYON: X:{offsetXMm}mm Y:{offsetYMm}mm
            </div>
          </div>
        )}

        {/* Köşe Kesim Krosları (Corner Crop Marks) */}
        {showCutMarks && !isSingleRoll && (
          <>
            {/* Sol Üst */}
            <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-black/50" />
            {/* Sağ Üst */}
            <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-black/50" />
            {/* Sol Alt */}
            <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-black/50" />
            {/* Sağ Alt */}
            <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-black/50" />
          </>
        )}

        {/* Optik Registrasyon Hedefleri (Silhouette Cameo & Cricut Plotter Target) */}
        {showOpticalMarks && !isSingleRoll && (
          <>
            <div className="absolute top-3 left-3 w-3 h-3 bg-black" />
            <div className="absolute top-3 right-3 w-3 h-0.5 bg-black" />
            <div className="absolute bottom-3 left-3 w-0.5 h-3 bg-black" />
          </>
        )}

        {/* CMYK Renk Kontrol Şeridi (Color Calibration Strip) */}
        {showColorStrip && !isSingleRoll && (
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-70">
            <span className="w-2.5 h-2.5 bg-cyan-500 inline-block" />
            <span className="w-2.5 h-2.5 bg-pink-500 inline-block" />
            <span className="w-2.5 h-2.5 bg-yellow-400 inline-block" />
            <span className="w-2.5 h-2.5 bg-black inline-block" />
            <span className="text-[6px] font-mono ml-1 text-gray-500">CMYK PASS</span>
          </div>
        )}

        {/* Etiket Montaj Grid Tablosu */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${selectedTemplate.cols}, ${selectedTemplate.widthMm}mm)`,
            gridTemplateRows: `repeat(${selectedTemplate.rows}, ${selectedTemplate.heightMm}mm)`,
            columnGap: `${selectedTemplate.gapXMm}mm`,
            rowGap: `${selectedTemplate.gapYMm}mm`,
          }}
        >
          {Array.from({ length: selectedTemplate.labelsPerPage }).map((_, slotIdx) => {
            const globalLabelIdx = startIndex + slotIdx;
            const isWithinOrderQuantity = globalLabelIdx < totalLabelsToPrint;

            // Karma Sipariş (Gang Run) Modu
            if (isGangMode && gangOrders.length > 0) {
              let accumulated = 0;
              let matchedGangItem: GangOrderItem | null = null;
              for (const go of gangOrders) {
                if (globalLabelIdx >= accumulated && globalLabelIdx < accumulated + go.quantity) {
                  matchedGangItem = go;
                  break;
                }
                accumulated += go.quantity;
              }

              if (matchedGangItem) {
                return (
                  <div
                    key={slotIdx}
                    className="flex items-center justify-center"
                    style={{ width: `${selectedTemplate.widthMm}mm`, height: `${selectedTemplate.heightMm}mm` }}
                  >
                    <SingleLabelBadge customData={matchedGangItem} />
                  </div>
                );
              }
            }

            // Normal Tek Sipariş Modu
            if (isWithinOrderQuantity) {
              return (
                <div
                  key={slotIdx}
                  className="flex items-center justify-center"
                  style={{ width: `${selectedTemplate.widthMm}mm`, height: `${selectedTemplate.heightMm}mm` }}
                >
                  <SingleLabelBadge />
                </div>
              );
            }

            // Sipariş adedi bitti ama sayfa tamamlanmadı:
            if (fillMode === 'fill-scraps') {
              // İsraf Önleyici Yedek Dolgu Modu: Boş yuvaları Safirya Teşekkürler ile doldur
              return (
                <div
                  key={slotIdx}
                  className="flex items-center justify-center opacity-90"
                  style={{ width: `${selectedTemplate.widthMm}mm`, height: `${selectedTemplate.heightMm}mm` }}
                >
                  <SingleLabelBadge isFiller />
                </div>
              );
            }

            // Boş Kılavuz Çizgisi Modu (exact-qty)
            return (
              <div
                key={slotIdx}
                className="border border-dashed border-gray-200 rounded-sm opacity-25 flex flex-col items-center justify-center text-[7.5px] text-gray-400 select-none"
                style={{ width: `${selectedTemplate.widthMm}mm`, height: `${selectedTemplate.heightMm}mm` }}
              >
                <span>#{globalLabelIdx + 1}</span>
                <span className="text-[6px]">BOŞ YUVA</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16">
      {/* 1. ÜST BAŞLIK VE HIZLI EYLEMLER */}
      <div className="no-print bg-white p-5 lg:p-6 rounded-2xl border border-[#E8E2D9] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D96B27]">
            <Printer className="w-4 h-4" />
            <span>Web-to-Print Atölye Montaj İstasyonu</span>
            <span className="bg-[#D96B27]/10 text-[#D96B27] px-2 py-0.5 rounded-full text-[10px]">v2.5 PRO</span>
          </div>
          <h1 className="text-2xl font-black text-[#1B2A4A] tracking-tight mt-1">
            Atölye Etiket Montaj & Tabaka Çıktısı
          </h1>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl">
            Sipariş isimlerini Tanex/Avery A4-A3 tabakalarına milimetrik dizin. Kesim krosları, rulo etiket, QR kod ve WhatsApp numune onayıyla kusursuz 1:1 ölçekli baskı alın.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Müşteri Onay Mockup'ı */}
          <button
            type="button"
            onClick={() => setIsProofModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-gray-100 text-[#1B2A4A] border border-gray-200 text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs"
          >
            <Eye className="w-4 h-4 text-[#D96B27]" />
            <span>Müşteri Onay Mockup'ı</span>
          </button>

          {/* Etiket Basıldı Durumuna Geçir */}
          {selectedOrder && (
            <button
              type="button"
              onClick={handleMarkLabelsPrinted}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Etiket Basıldı İşaretle</span>
            </button>
          )}

          {/* Yazdır Butonu */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D96B27] hover:bg-[#c25a1e] text-white text-xs font-bold shadow-md shadow-[#D96B27]/25 transition active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Tabakayı Yazdır / PDF Al (1:1)</span>
          </button>
        </div>
      </div>

      {/* 2. ANA PANEL: SOL KONTROLLER + SAĞ A4 CANLI ÖNİZLEME */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* SOL PANEL (5 Sütun): Ayarlar, Şablonlar, Tipografi */}
        <div className="no-print lg:col-span-5 space-y-4">
          
          {/* MOD SEKMELERİ */}
          <div className="bg-white p-1.5 rounded-xl border border-[#E8E2D9] shadow-sm flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('sheet')}
              className={`flex-1 py-2 px-2 rounded-lg font-bold transition text-center cursor-pointer ${
                activeTab === 'sheet'
                  ? 'bg-[#1B2A4A] text-white shadow-xs'
                  : 'text-gray-600 hover:text-black hover:bg-gray-50'
              }`}
            >
              Montaj & Metinler
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('custom-builder')}
              className={`flex-1 py-2 px-2 rounded-lg font-bold transition text-center cursor-pointer ${
                activeTab === 'custom-builder'
                  ? 'bg-[#1B2A4A] text-white shadow-xs'
                  : 'text-gray-600 hover:text-black hover:bg-gray-50'
              }`}
            >
              Özel Ebat Sihirbazı
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('calibration')}
              className={`flex-1 py-2 px-2 rounded-lg font-bold transition text-center cursor-pointer ${
                activeTab === 'calibration'
                  ? 'bg-[#1B2A4A] text-white shadow-xs'
                  : 'text-gray-600 hover:text-black hover:bg-gray-50'
              }`}
            >
              Yazıcı Kalibrasyonu
            </button>
          </div>

          {/* TAB 1: MONTAJ & METİNLER */}
          {activeTab === 'sheet' && (
            <>
              {/* Sipariş Seçimi */}
              <div className="bg-white p-4 rounded-xl border border-[#E8E2D9] shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1B2A4A] flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#D96B27]" />
                    <span>Siparişten Otomatik Bilgi Çek</span>
                  </label>
                  {selectedOrder && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      #{selectedOrder.orderNumber} Aktif
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
                        #{ord.orderNumber} - {ord.customerName} ({ord.items.length} Kalem {custom ? `| "${custom.customization?.customText}"` : ''})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Kağıt Medyası & Sayfa Türü */}
              <div className="bg-white p-4 rounded-xl border border-[#E8E2D9] shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1B2A4A] flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#D96B27]" />
                    <span>Kağıt Materyali & Formatı</span>
                  </label>
                  <span className="text-[11px] font-bold text-gray-500">
                    {paperSize} {orientation === 'portrait' ? 'Dikey' : 'Yatay'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaperMaterial('kraft')}
                    className={`p-2 rounded-lg text-xs font-semibold border flex flex-col items-center gap-1 transition cursor-pointer ${
                      paperMaterial === 'kraft'
                        ? 'border-[#D96B27] bg-[#FAF3EC] text-[#D96B27] ring-1 ring-[#D96B27]'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-[#EAD7BE] border border-gray-300" />
                    <span className="text-[11px]">Kraft Sticker</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaperMaterial('white-matte')}
                    className={`p-2 rounded-lg text-xs font-semibold border flex flex-col items-center gap-1 transition cursor-pointer ${
                      paperMaterial === 'white-matte'
                        ? 'border-[#D96B27] bg-[#FAF3EC] text-[#D96B27] ring-1 ring-[#D96B27]'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white border border-gray-300" />
                    <span className="text-[11px]">1. Hamur Mat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaperMaterial('white-gloss')}
                    className={`p-2 rounded-lg text-xs font-semibold border flex flex-col items-center gap-1 transition cursor-pointer ${
                      paperMaterial === 'white-gloss'
                        ? 'border-[#D96B27] bg-[#FAF3EC] text-[#D96B27] ring-1 ring-[#D96B27]'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-amber-50 border border-gray-300 shadow-xs" />
                    <span className="text-[11px]">Kuşe Parlak</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaperMaterial('textured-card')}
                    className={`p-2 rounded-lg text-xs font-semibold border flex flex-col items-center gap-1 transition cursor-pointer ${
                      paperMaterial === 'textured-card'
                        ? 'border-[#D96B27] bg-[#FAF3EC] text-[#D96B27] ring-1 ring-[#D96B27]'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-[#FDFCF7] border border-amber-300" />
                    <span className="text-[11px]">300gr Tual Kart</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaperMaterial('transparent')}
                    className={`p-2 rounded-lg text-xs font-semibold border flex flex-col items-center gap-1 transition cursor-pointer ${
                      paperMaterial === 'transparent'
                        ? 'border-[#D96B27] bg-[#FAF3EC] text-[#D96B27] ring-1 ring-[#D96B27]'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-blue-50/50 border border-dashed border-blue-400" />
                    <span className="text-[11px]">Şeffaf PVC</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaperSize((s) => (s === 'A4' ? 'A3' : 'A4'));
                    }}
                    className="p-2 rounded-lg text-xs font-semibold border border-gray-200 hover:bg-gray-50 text-gray-700 flex flex-col items-center gap-1 transition cursor-pointer"
                  >
                    <span className="text-[10px] font-mono font-bold bg-gray-200 px-1 rounded">
                      {paperSize}
                    </span>
                    <span className="text-[10px] text-gray-500">Boyut Değiştir</span>
                  </button>
                </div>
              </div>

              {/* Etiket Kesim Şablonu Seçici */}
              <div className="bg-white p-4 rounded-xl border border-[#E8E2D9] shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1B2A4A] flex items-center gap-1.5">
                    <Grid className="w-4 h-4 text-[#D96B27]" />
                    <span>Kesim & Ebat Şablonu</span>
                  </label>
                  <span className="text-[11px] text-[#D96B27] font-bold">
                    {selectedTemplate.labelsPerPage} Adet / Tabaka
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                  {PRESET_TEMPLATES.map((tmpl) => (
                    <button
                      type="button"
                      key={tmpl.id}
                      onClick={() => {
                        setSelectedTemplate(tmpl);
                        setPaperSize(tmpl.paperSize);
                        setOrientation(tmpl.orientation);
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between cursor-pointer ${
                        selectedTemplate.id === tmpl.id
                          ? 'border-[#D96B27] bg-[#FFF8F3] text-[#1B2A4A] ring-1 ring-[#D96B27]'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold">{tmpl.name}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          {tmpl.cols} × {tmpl.rows} Düzen • {tmpl.widthMm} × {tmpl.heightMm} mm ({tmpl.category})
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        {tmpl.paperSize}
                      </span>
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-gray-500 italic bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/50">
                  💡 {selectedTemplate.description}
                </p>
              </div>

              {/* Tema, Renk ve Tipografi */}
              <div className="bg-white p-4 rounded-xl border border-[#E8E2D9] shadow-sm space-y-3">
                <label className="text-xs font-bold text-[#1B2A4A] flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-[#D96B27]" />
                  <span>Zanaatkar Teması & Tipografi</span>
                </label>

                {/* Tema Butonları */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {THEMES.map((th) => (
                    <button
                      type="button"
                      key={th.id}
                      onClick={() => {
                        setSelectedTheme(th);
                        setPaperMaterial(th.material);
                        setSelectedMotif(th.motif);
                      }}
                      className={`p-2 rounded-lg border text-left text-xs transition flex items-center gap-2 cursor-pointer ${
                        selectedTheme.id === th.id
                          ? 'border-[#D96B27] bg-[#FFF8F3] text-[#1B2A4A] font-bold ring-1 ring-[#D96B27]'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0"
                        style={{ backgroundColor: th.bgColor }}
                      />
                      <span className="truncate text-[10.5px]">{th.name}</span>
                    </button>
                  ))}
                </div>

                {/* Font Ailesi Seçimi */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-600 font-semibold text-[11px]">Yazı Tipi Karakteri:</span>
                  <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-[10.5px]">
                    <button
                      type="button"
                      onClick={() => setFontFamily('serif')}
                      className={`px-2 py-1 rounded cursor-pointer ${
                        fontFamily === 'serif' ? 'bg-white font-bold text-[#D96B27] shadow-xs' : 'text-gray-600'
                      }`}
                    >
                      Zarif Serif
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontFamily('script')}
                      className={`px-2 py-1 rounded cursor-pointer ${
                        fontFamily === 'script' ? 'bg-white font-bold text-[#D96B27] shadow-xs' : 'text-gray-600'
                      }`}
                    >
                      Kaligrafi
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontFamily('sans')}
                      className={`px-2 py-1 rounded cursor-pointer ${
                        fontFamily === 'sans' ? 'bg-white font-bold text-[#D96B27] shadow-xs' : 'text-gray-600'
                      }`}
                    >
                      Modern
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontFamily('antiqua')}
                      className={`px-2 py-1 rounded cursor-pointer ${
                        fontFamily === 'antiqua' ? 'bg-white font-bold text-[#D96B27] shadow-xs' : 'text-gray-600'
                      }`}
                    >
                      Lüks Klasik
                    </button>
                  </div>
                </div>

                {/* Motif Seçimi */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-600 font-semibold text-[11px]">Vektörel Motif:</span>
                  <select
                    value={selectedMotif}
                    onChange={(e) => setSelectedMotif(e.target.value)}
                    className="px-2 py-1 text-xs bg-[#FAF8F5] border border-gray-200 rounded-lg text-gray-800 focus:outline-none"
                  >
                    <option value="wreath">Botanik Çelenk</option>
                    <option value="rings">Alyans & Evlilik Yüzüğü</option>
                    <option value="olive">Akdeniz Zeytin Dalı</option>
                    <option value="baby">Melek & Bebek Kanadı</option>
                    <option value="floral-arch">Kemerli Çiçek Buketi</option>
                    <option value="heart">Sonsuzluk Kalbi</option>
                    <option value="candle">Mum Alevi & Lavanta</option>
                    <option value="crown">Kraliyet Tacı / Asalet</option>
                    <option value="geometric">Minimal Geometrik</option>
                    <option value="none">Motifsiz (Sade)</option>
                  </select>
                </div>
              </div>

              {/* Metin & İsim Alanları */}
              <div className="bg-white p-4 rounded-xl border border-[#E8E2D9] shadow-sm space-y-3">
                <label className="text-xs font-bold text-[#1B2A4A] flex items-center gap-1.5">
                  <Type className="w-4 h-4 text-[#D96B27]" />
                  <span>Etiket Üzerine Basılacak Metinler</span>
                </label>

                {/* Hazır Etkinlik Rozeti */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-gray-600">Etkinlik Türü Başlığı</label>
                    <select
                      onChange={(e) => setEventBadge(e.target.value)}
                      className="text-[10px] text-[#D96B27] bg-transparent border-0 font-semibold cursor-pointer outline-none"
                    >
                      <option value="">-- Hazır Seç --</option>
                      {EVENT_PRESETS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    value={eventBadge}
                    onChange={(e) => setEventBadge(e.target.value)}
                    placeholder="Örn: Söz & Nişan Hatırası"
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>

                {/* Ana Başlık */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                    Ana İsimler / Çift İsmi
                  </label>
                  <input
                    type="text"
                    value={titleText}
                    onChange={(e) => setTitleText(e.target.value)}
                    placeholder="Örn: Selin & Emre"
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>

                {/* Alt Başlık & Adet */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                      Tarih & Mekan
                    </label>
                    <input
                      type="text"
                      value={subtitleText}
                      onChange={(e) => setSubtitleText(e.target.value)}
                      placeholder="Örn: 18.06.2026 • İstanbul"
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
                      max={5000}
                      value={requiredQuantity}
                      onChange={(e) => setRequiredQuantity(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                    />
                  </div>
                </div>

                {/* Koku & Teşekkür Cümlesi */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                      Koku / Ürün Bilgisi
                    </label>
                    <input
                      type="text"
                      value={scentTag}
                      onChange={(e) => setScentTag(e.target.value)}
                      placeholder="Örn: Madagaskar Vanilyası"
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                      Teşekkür / Dipnot
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

                {/* Monogram, QR Kod, Barkod ve Özel Logo Aç/Kapa Seçenekleri */}
                <div className="pt-2 border-t border-gray-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-1.5 text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showMonogram}
                        onChange={(e) => setShowMonogram(e.target.checked)}
                        className="rounded text-[#D96B27] focus:ring-[#D96B27]"
                      />
                      <span>Monogram Baş Harfler Rozeti ({computedMonogram})</span>
                    </label>

                    {showMonogram && (
                      <input
                        type="text"
                        value={customMonogramText}
                        onChange={(e) => setCustomMonogramText(e.target.value)}
                        placeholder="Özel Harf"
                        maxLength={5}
                        className="w-16 px-1.5 py-0.5 text-center text-[11px] bg-gray-50 border border-gray-200 rounded"
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-1.5 text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showQrCode}
                        onChange={(e) => setShowQrCode(e.target.checked)}
                        className="rounded text-[#D96B27] focus:ring-[#D96B27]"
                      />
                      <span>Vektörel QR Kod Ekle (Spotify / Şarkı / Instagram)</span>
                    </label>

                    {showQrCode && (
                      <input
                        type="text"
                        value={qrCodeUrl}
                        onChange={(e) => setQrCodeUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-36 px-2 py-0.5 text-[10px] bg-gray-50 border border-gray-200 rounded font-mono"
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-1.5 text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showBarcode}
                        onChange={(e) => setShowBarcode(e.target.checked)}
                        className="rounded text-[#D96B27] focus:ring-[#D96B27]"
                      />
                      <span>Code-128 Barkod Ekle</span>
                    </label>

                    {showBarcode && (
                      <input
                        type="text"
                        value={barcodeText}
                        onChange={(e) => setBarcodeText(e.target.value)}
                        placeholder="SF-1042"
                        className="w-24 px-2 py-0.5 text-[10px] bg-gray-50 border border-gray-200 rounded font-mono"
                      />
                    )}
                  </div>

                  {/* Logo Yükleme */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-gray-700">Özel Logo / Görsel:</span>
                    <div className="flex items-center gap-2">
                      {customLogoUrl ? (
                        <button
                          type="button"
                          onClick={() => setCustomLogoUrl(null)}
                          className="text-[10px] text-red-600 hover:underline cursor-pointer"
                        >
                          Logoyu Kaldır
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold bg-gray-100 hover:bg-gray-200 rounded text-gray-700 cursor-pointer"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Logo Yükle</span>
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dolgu Modu ve İsrafı Önleme */}
              <div className="bg-white p-4 rounded-xl border border-[#E8E2D9] shadow-sm space-y-3">
                <label className="text-xs font-bold text-[#1B2A4A] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Scissors className="w-4 h-4 text-[#D96B27]" />
                    <span>Tabaka Boşluklarını Değerlendirme</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Sıfır Kağıt İsrafı
                  </span>
                </label>

                <div className="grid grid-cols-3 gap-1.5 bg-gray-100 p-1 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setFillMode('fill-scraps')}
                    className={`p-2 rounded-lg text-center cursor-pointer font-bold transition ${
                      fillMode === 'fill-scraps'
                        ? 'bg-white text-[#D96B27] shadow-xs'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    <div className="text-[11px]">Yedek Dolgu</div>
                    <div className="text-[9px] font-normal text-gray-500">Safirya Teşekkürler</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFillMode('exact-qty')}
                    className={`p-2 rounded-lg text-center cursor-pointer font-bold transition ${
                      fillMode === 'exact-qty'
                        ? 'bg-white text-[#D96B27] shadow-xs'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    <div className="text-[11px]">Tam Adet</div>
                    <div className="text-[9px] font-normal text-gray-500">{requiredQuantity} Adet</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFillMode('fill-all')}
                    className={`p-2 rounded-lg text-center cursor-pointer font-bold transition ${
                      fillMode === 'fill-all'
                        ? 'bg-white text-[#D96B27] shadow-xs'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    <div className="text-[11px]">Tüm Sayfalar</div>
                    <div className="text-[9px] font-normal text-gray-500">Tam Tabaka</div>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: ÖZEL EBAT VE MONTAJ SİHİRBAZI */}
          {activeTab === 'custom-builder' && (
            <div className="bg-white p-5 rounded-xl border border-[#E8E2D9] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#D96B27]" />
                  <h3 className="text-sm font-bold text-[#1B2A4A]">Özel Bıçaklı Montaj Motoru</h3>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFitOptimalGrid}
                  className="px-2.5 py-1 text-[11px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg cursor-pointer transition"
                >
                  ⚡ Otomatik Sığdır
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                    Etiket Genişliği (mm)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={200}
                    value={customWidth}
                    onChange={(e) => setCustomWidth(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-gray-200 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                    Etiket Yüksekliği (mm)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={200}
                    value={customHeight}
                    onChange={(e) => setCustomHeight(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-gray-200 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">Şekil</label>
                  <select
                    value={customShape}
                    onChange={(e) => setCustomShape(e.target.value as LabelShape)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-gray-200 rounded-lg text-xs"
                  >
                    <option value="circle">Daire (Yuvarlak)</option>
                    <option value="square">Kare</option>
                    <option value="rectangle">Dikdörtgen</option>
                    <option value="arch">Kemerli (Arch / Dome)</option>
                    <option value="tag">Delikli Sallama Kart</option>
                    <option value="oval">Zarif Oval</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">Tabaka Formatı</label>
                  <select
                    value={paperSize}
                    onChange={(e) => setPaperSize(e.target.value as PaperSize)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-gray-200 rounded-lg text-xs"
                  >
                    <option value="A4">A4 Tabaka (210 × 297 mm)</option>
                    <option value="A3">A3 Tabaka (297 × 420 mm)</option>
                    <option value="Roll">Rulo Tekli Etiket</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">Sütun Sayısı (Cols)</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={customCols}
                    onChange={(e) => setCustomCols(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-gray-200 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">Satır Sayısı (Rows)</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={customRows}
                    onChange={(e) => setCustomRows(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-gray-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">Üst Kenar Marjini (mm)</label>
                  <input
                    type="number"
                    step={0.5}
                    value={customMarginTop}
                    onChange={(e) => setCustomMarginTop(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-gray-200 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">Sol Kenar Marjini (mm)</label>
                  <input
                    type="number"
                    step={0.5}
                    value={customMarginLeft}
                    onChange={(e) => setCustomMarginLeft(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-gray-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">Yatay Aralık - Gap X (mm)</label>
                  <input
                    type="number"
                    step={0.5}
                    value={customGapX}
                    onChange={(e) => setCustomGapX(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-gray-200 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">Dikey Aralık - Gap Y (mm)</label>
                  <input
                    type="number"
                    step={0.5}
                    value={customGapY}
                    onChange={(e) => setCustomGapY(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-gray-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleApplyCustomTemplate}
                className="w-full py-2.5 bg-[#1B2A4A] hover:bg-[#D96B27] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md"
              >
                Özel Şablonu Oluştur ve Canlı Tabakaya Uygula ({customCols * customRows} Etiket/Sayfa)
              </button>
            </div>
          )}

          {/* TAB 3: YAZICI KALİBRASYONU VE İNCE DONANIM AYARLARI */}
          {activeTab === 'calibration' && (
            <div className="bg-white p-5 rounded-xl border border-[#E8E2D9] shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <SlidersHorizontal className="w-5 h-5 text-[#D96B27]" />
                <div>
                  <h3 className="text-sm font-bold text-[#1B2A4A]">Milimetrik Yazıcı Kalibrasyonu</h3>
                  <p className="text-[11px] text-gray-500">
                    Fiziksel yazıcıların kağıt besleme kaymasını milimetrik olarak sıfırlayın.
                  </p>
                </div>
              </div>

              {/* X ve Y Ofset Stepper'ları */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs bg-[#FAF8F5] p-3 rounded-xl border border-gray-200">
                  <div>
                    <span className="font-bold text-[#1B2A4A] block">Yatay Kaydırma (X Ofset)</span>
                    <span className="text-[10px] text-gray-500">Pozitif: Sağa / Negatif: Sola</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOffsetXMm((x) => Math.round((x - 0.5) * 10) / 10)}
                      className="w-7 h-7 bg-white rounded border border-gray-300 font-bold hover:bg-gray-100 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-xs w-14 text-center">
                      {offsetXMm > 0 ? `+${offsetXMm}` : offsetXMm} mm
                    </span>
                    <button
                      type="button"
                      onClick={() => setOffsetXMm((x) => Math.round((x + 0.5) * 10) / 10)}
                      className="w-7 h-7 bg-white rounded border border-gray-300 font-bold hover:bg-gray-100 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs bg-[#FAF8F5] p-3 rounded-xl border border-gray-200">
                  <div>
                    <span className="font-bold text-[#1B2A4A] block">Dikey Kaydırma (Y Ofset)</span>
                    <span className="text-[10px] text-gray-500">Pozitif: Aşağı / Negatif: Yukarı</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOffsetYMm((y) => Math.round((y - 0.5) * 10) / 10)}
                      className="w-7 h-7 bg-white rounded border border-gray-300 font-bold hover:bg-gray-100 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-xs w-14 text-center">
                      {offsetYMm > 0 ? `+${offsetYMm}` : offsetYMm} mm
                    </span>
                    <button
                      type="button"
                      onClick={() => setOffsetYMm((y) => Math.round((y + 0.5) * 10) / 10)}
                      className="w-7 h-7 bg-white rounded border border-gray-300 font-bold hover:bg-gray-100 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Matbaa ve Kesim Kılavuzları Anahtarları */}
              <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
                <span className="font-bold text-gray-700 block text-[11px]">Baskı Kılavuz İşaretleri:</span>

                <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                  <input
                    type="checkbox"
                    checked={showCutMarks}
                    onChange={(e) => setShowCutMarks(e.target.checked)}
                    className="rounded text-[#D96B27] focus:ring-[#D96B27]"
                  />
                  <span>Köşe Kesim Krosları (Giyotin Kesim Kılavuzu)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                  <input
                    type="checkbox"
                    checked={showBleedBorder}
                    onChange={(e) => setShowBleedBorder(e.target.checked)}
                    className="rounded text-[#D96B27] focus:ring-[#D96B27]"
                  />
                  <span>Etiket Soyma / Paspartu Sınırını Göster (Bleed Guide)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                  <input
                    type="checkbox"
                    checked={showOpticalMarks}
                    onChange={(e) => setShowOpticalMarks(e.target.checked)}
                    className="rounded text-[#D96B27] focus:ring-[#D96B27]"
                  />
                  <span>Cameo / Cricut Optik Plotter Registrasyon İşaretleri</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                  <input
                    type="checkbox"
                    checked={showColorStrip}
                    onChange={(e) => setShowColorStrip(e.target.checked)}
                    className="rounded text-[#D96B27] focus:ring-[#D96B27]"
                  />
                  <span>CMYK Renk Kontrol Skalası</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                  <input
                    type="checkbox"
                    checked={showSlugHeader}
                    onChange={(e) => setShowSlugHeader(e.target.checked)}
                    className="rounded text-[#D96B27] focus:ring-[#D96B27]"
                  />
                  <span>Tabaka Üst Bilgi Anteti (Sipariş No, Müşteri, Sayfa X/Y)</span>
                </label>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveCalibration}
                  className="flex-1 py-2 rounded-xl bg-[#D96B27] hover:bg-[#c25a1e] text-white text-xs font-bold transition cursor-pointer"
                >
                  Ayarları Bu Yazıcı İçin Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOffsetXMm(0);
                    setOffsetYMm(0);
                  }}
                  className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 cursor-pointer"
                  title="Sıfırla"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SAĞ PANEL (7 Sütun): CANLI A4/A3 MONTAJ ÖNİZLEME */}
        <div className="lg:col-span-7 space-y-3">
          
          {/* ÜST ÖNİZLEME KONTROL BARI */}
          <div className="no-print bg-white p-3 rounded-xl border border-[#E8E2D9] shadow-sm flex flex-wrap items-center justify-between gap-3">
            
            {/* Görünüm Modları */}
            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('sheet')}
                className={`px-3 py-1.5 rounded cursor-pointer font-bold transition ${
                  activeTab === 'sheet'
                    ? 'bg-white text-[#D96B27] shadow-xs'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Tabaka Görünümü ({selectedTemplate.labelsPerPage} Etiket)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('single')}
                className={`px-3 py-1.5 rounded cursor-pointer font-bold transition ${
                  activeTab === 'single'
                    ? 'bg-white text-[#D96B27] shadow-xs'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Birebir Yakın Plan
              </button>
            </div>

            {/* Sayfa Gezgini (Eğer 1'den fazla sayfa gerekiyorsa) */}
            {totalSheetsNeeded > 1 && activeTab === 'sheet' && (
              <div className="flex items-center gap-1.5 text-xs bg-orange-50 px-2 py-1 rounded-lg border border-orange-200">
                <button
                  type="button"
                  disabled={currentPageIndex === 0}
                  onClick={() => setCurrentPageIndex((p) => Math.max(0, p - 1))}
                  className="p-1 rounded hover:bg-orange-100 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-orange-900" />
                </button>
                <span className="font-bold text-orange-900 text-[11px]">
                  Tabaka {currentPageIndex + 1} / {totalSheetsNeeded}
                </span>
                <button
                  type="button"
                  disabled={currentPageIndex >= totalSheetsNeeded - 1}
                  onClick={() => setCurrentPageIndex((p) => Math.min(totalSheetsNeeded - 1, p + 1))}
                  className="p-1 rounded hover:bg-orange-100 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-orange-900" />
                </button>

                <button
                  type="button"
                  onClick={() => setViewAllPagesOnScreen((v) => !v)}
                  className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                    viewAllPagesOnScreen ? 'bg-orange-600 text-white' : 'bg-white text-orange-900'
                  }`}
                >
                  {viewAllPagesOnScreen ? 'Tek Tabaka' : 'Tüm Tabakalar'}
                </button>
              </div>
            )}

            {/* Zoom Kontrolleri */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.4, Math.round((z - 0.1) * 10) / 10))}
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
                onClick={() => setZoomLevel((z) => Math.min(1.4, Math.round((z + 0.1) * 10) / 10))}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer"
                title="Büyüt"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Sayfa Özeti Bilgi Şeridi */}
          <div className="no-print flex flex-wrap items-center justify-between text-xs text-gray-600 bg-amber-50/70 border border-amber-200/60 p-3 rounded-xl gap-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#D96B27]" />
              <span>
                Toplam <strong>{totalLabelsToPrint}</strong> etiket basılacak (
                <strong>{totalSheetsNeeded} {paperSize}</strong> Tabaka gereklidir).
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#1B2A4A]">
                {selectedTemplate.widthMm} × {selectedTemplate.heightMm} mm ({selectedTemplate.shape})
              </span>
              <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-gray-300">
                1:1 Vektörel Baskı
              </span>
            </div>
          </div>

          {/* CANLI ÖNİZLEME SAHNESİ */}
          <div className="overflow-auto bg-stone-200/80 p-4 sm:p-8 rounded-2xl flex flex-col justify-start items-center min-h-[640px] border border-stone-300">
            {activeTab === 'single' ? (
              /* TEKİL ETİKET YAKIN PLAN */
              <div className="bg-white p-12 rounded-3xl shadow-xl flex flex-col items-center justify-center space-y-4 my-auto">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#D96B27]" />
                  <span>Tekil Zanaatkar Numune Önizlemesi</span>
                </div>
                <SingleLabelBadge scale={1.8} isPreview />
                <div className="text-xs font-mono text-gray-400">
                  {selectedTemplate.widthMm} × {selectedTemplate.heightMm} mm • {paperMaterial.toUpperCase()}
                </div>
              </div>
            ) : (
              /* A4 / A3 / RULO SANAL TABAKA ÖNİZLEMESİ (Ekran Görünümü ve Print Çıktısı) */
              <div
                id="print-sheet-container"
                className="transition-transform origin-top flex flex-col items-center"
                style={{
                  transform: `scale(${zoomLevel})`,
                  marginBottom: `calc((297mm * ${zoomLevel}) - 297mm)`,
                }}
              >
                {viewAllPagesOnScreen ? (
                  // Tüm Sayfaları Alt Alta Göster
                  Array.from({ length: totalSheetsNeeded }).map((_, idx) => renderSheetGrid(idx))
                ) : (
                  <>
                    <div className="print:hidden w-full flex flex-col items-center">
                      {renderSheetGrid(currentPageIndex)}
                    </div>
                    <div className="hidden print:block w-full">
                      {Array.from({ length: totalSheetsNeeded }).map((_, idx) => renderSheetGrid(idx))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. MODAL: MÜŞTERİ ONAY MOCKUP'I (WHATSAPP & PROOF SHARING) */}
      {isProofModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn no-print">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#D96B27]" />
                <div>
                  <h3 className="text-base font-bold text-[#1B2A4A]">Müşteri Dijital Numune Onayı (Proof)</h3>
                  <p className="text-xs text-gray-500">Müşteriye WhatsApp'tan atılacak lüks sunum kartı.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProofModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Gerçekçi Lüks Ahşap/Kumaş Mockup Zemin */}
            <div
              className="p-8 rounded-2xl flex flex-col items-center justify-center relative shadow-inner overflow-hidden"
              style={{
                backgroundColor: '#2F231A',
                backgroundImage:
                  'radial-gradient(#423226 15%, transparent 16%), radial-gradient(#423226 15%, transparent 16%)',
                backgroundSize: '24px 24px',
                backgroundPosition: '0 0, 12px 12px',
              }}
            >
              <div className="absolute top-3 left-4 text-[9px] font-mono tracking-widest text-[#EAD7BE]/60 uppercase">
                SAFIRYA ATELIER • KADIKÖY NUMUNE KARTI
              </div>

              {/* 3D Gölgeli Etiket Rozeti */}
              <div className="my-6 transform hover:scale-105 transition-transform duration-300 drop-shadow-2xl">
                <SingleLabelBadge scale={1.8} isPreview />
              </div>

              <div className="text-center text-[#EAD7BE]/80 text-[11px] max-w-xs space-y-1">
                <div className="font-bold">{titleText}</div>
                <div>{subtitleText}</div>
                <div className="text-[10px] opacity-70">
                  {selectedTemplate.widthMm} × {selectedTemplate.heightMm} mm {selectedTemplate.shape} • {paperMaterial}
                </div>
              </div>
            </div>

            {/* Modal Aksiyon Butonları */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-gray-500">
                Müşteri onay verdikten sonra 1 tıkla üretime geçebilirsiniz.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Merhaba ${selectedOrder?.customerName || titleText}! Safirya Atölye'den hazırladığımız etiket numune tasarımınız hazır: "${titleText} - ${subtitleText}" (${selectedTemplate.widthMm}x${selectedTemplate.heightMm}mm). Beğendiyseniz onayınızı rica ederiz!`
                    );
                    setProofCopied(true);
                    setTimeout(() => setProofCopied(false), 2500);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1B2A4A] text-xs font-bold transition cursor-pointer"
                >
                  {proofCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{proofCopied ? 'Kopyalandı!' : 'Metni Kopyala'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsProofModalOpen(false);
                    handlePrint();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D96B27] hover:bg-[#c25a1e] text-white text-xs font-bold transition cursor-pointer shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>Şimdi Yazdır</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. YAZDIRMA CSS STİLLERİ (Strict 1:1 Scale Print) */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                size: ${paperSize === 'Roll' ? `${selectedTemplate.widthMm}mm ${selectedTemplate.heightMm}mm` : `${paperSize} ${orientation}`};
                margin: 0mm !important;
              }
              html, body {
                background: #ffffff !important;
                background-color: #ffffff !important;
                margin: 0mm !important;
                padding: 0mm !important;
                width: 100% !important;
                height: auto !important;
                overflow: visible !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              body * {
                visibility: hidden;
              }
              #print-sheet-container,
              #print-sheet-container * {
                visibility: visible;
              }
              #print-sheet-container {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                margin-bottom: 0 !important;
                padding: 0 !important;
                transform: none !important;
                box-shadow: none !important;
                display: block !important;
              }
              .print-sheet-page {
                box-shadow: none !important;
                border: none !important;
                margin: 0 auto !important;
                page-break-after: always !important;
                break-after: page !important;
              }
              .no-print,
              .no-print * {
                display: none !important;
                visibility: hidden !important;
              }
            }
          `,
        }}
      />
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
