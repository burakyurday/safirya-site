import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Truck,
  HeartHandshake,
  Sparkles,
} from 'lucide-react';
import { SystemSettingsData } from '@/lib/settings';

interface FooterProps {
  settings: SystemSettingsData;
}

export function Footer({ settings }: FooterProps) {
  return (
    <footer className="bg-[#231B18] text-[#F6F3EC] pt-16 pb-10 border-t border-[#2C221E] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Üst Güven & Atölye Değerleri Bandı */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-[#2C221E]">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xs bg-[#2C221E] border border-[#3A2E29] text-[#C85A32] shrink-0">
              <Sparkles className="w-4 h-4 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F6F3EC]">
                %100 El Emeği Zanaat
              </h4>
              <p className="text-xs text-[#B8AEA5] mt-1 leading-relaxed">
                Her ürün atölyemizde tek tek, özenle ve doğal malzemelerle şekillendirilir.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xs bg-[#2C221E] border border-[#3A2E29] text-[#5F6F52] shrink-0">
              <Truck className="w-4 h-4 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F6F3EC]">
                Hasarsız Teslimat Güvencesi
              </h4>
              <p className="text-xs text-[#B8AEA5] mt-1 leading-relaxed">
                Darbe emici özel kraft ambalajlama ve ₺{settings.freeShippingThreshold} üzeri ücretsiz kargo fırsatı.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xs bg-[#2C221E] border border-[#3A2E29] text-[#C85A32] shrink-0">
              <HeartHandshake className="w-4 h-4 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F6F3EC]">
                Kişiye Özel & Toplu Tasarım
              </h4>
              <p className="text-xs text-[#B8AEA5] mt-1 leading-relaxed">
                Söz, nişan ve kurumsal etkinlikleriniz için baremli indirim avantajı.
              </p>
            </div>
          </div>
        </div>

        {/* Ana Footer Sütunları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          
          {/* Sütun 1: Atölye Hakkında & Marka */}
          <div className="space-y-4">
            <Link href="/" className="inline-block group">
              {settings.logoDarkUrl || settings.logoUrl ? (
                <img
                  src={settings.logoDarkUrl || settings.logoUrl}
                  alt={settings.logoText || 'Safirya'}
                  className="h-9 w-auto max-w-[160px] object-contain transition group-hover:scale-102 rounded-xs"
                />
              ) : (
                <>
                  <span className="font-serif text-2xl font-normal tracking-[0.2em] text-[#F6F3EC] uppercase">
                    {settings.logoText || 'SAFİRYA'}
                  </span>
                  <p className="text-[10px] font-sans font-medium tracking-[0.25em] text-[#C85A32] uppercase -mt-0.5">
                    {settings.brandTagline || 'Tasarım Atölyesi'}
                  </p>
                </>
              )}
            </Link>
            <p className="text-xs text-[#B8AEA5] leading-relaxed">
              Doğal soya mumları, kalıcı kokulu taş objeler, el dökümü epoksi sunumluklar ve Japon Miyuki boncuk takılarla yaşam alanlarınıza ruh katan butik zanaat atölyesi.
            </p>
            <div className="pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-medium text-[#F6F3EC] hover:text-[#C85A32] transition"
              >
                <svg
                  className="w-4 h-4 text-[#C85A32]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
                <span>{settings.instagramHandle}</span>
              </a>
            </div>
          </div>

          {/* Sütun 2: Kurumsal ve Sözleşmeler */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#F6F3EC] uppercase tracking-wider">
              Kurumsal & Bilgilendirme
            </h4>
            <ul className="space-y-2 text-xs text-[#B8AEA5]">
              <li>
                <Link
                  href="/sayfa/hakkimizda"
                  className="hover:text-[#C85A32] transition-colors"
                >
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link
                  href="/sayfa/iade-kosullari"
                  className="hover:text-[#C85A32] transition-colors"
                >
                  İade ve Değişim Koşulları
                </Link>
              </li>
              <li>
                <Link
                  href="/sayfa/gizlilik-ve-kvkk"
                  className="hover:text-[#C85A32] transition-colors"
                >
                  Gizlilik ve KVKK Politikası
                </Link>
              </li>
              <li>
                <Link
                  href="/sayfa/kullanim-kosullari"
                  className="hover:text-[#C85A32] transition-colors"
                >
                  Kullanım Koşulları
                </Link>
              </li>
              <li>
                <Link
                  href="/sayfa/mesafeli-satis-sozlesmesi"
                  className="hover:text-[#C85A32] transition-colors"
                >
                  Mesafeli Satış Sözleşmesi
                </Link>
              </li>
              <li>
                <Link
                  href="/sayfa/iletisim"
                  className="hover:text-[#C85A32] transition-colors"
                >
                  Atölye İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Sütun 3: Atölye Koleksiyonları */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#F6F3EC] uppercase tracking-wider">
              Atölye Koleksiyonları
            </h4>
            <ul className="space-y-2 text-xs text-[#B8AEA5]">
              <li>
                <Link href="/kategoriler/dogal-mumlar" className="hover:text-[#C85A32] transition-colors">
                  Doğal Soya Mumları
                </Link>
              </li>
              <li>
                <Link href="/kategoriler/kokulu-tas" className="hover:text-[#C85A32] transition-colors">
                  Heykelsi Kokulu Taşlar
                </Link>
              </li>
              <li>
                <Link href="/kategoriler/epoksi-tasarimlar" className="hover:text-[#C85A32] transition-colors">
                  Ahşap Epoksi Tepsiler
                </Link>
              </li>
              <li>
                <Link href="/kategoriler/miyuki-taki" className="hover:text-[#C85A32] transition-colors">
                  Miyuki Boncuk Dokuma Takı
                </Link>
              </li>
              <li>
                <Link href="/kisiye-ozel-toplu-siparis" className="hover:text-[#C85A32] transition-colors text-[#C85A32] font-medium">
                  Toplu Sipariş & Teklif Al →
                </Link>
              </li>
            </ul>
          </div>

          {/* Sütun 4: Atölye İletişim Bilgileri */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#F6F3EC] uppercase tracking-wider">
              Atölye Ziyareti & İletişim
            </h4>
            <div className="space-y-2.5 text-xs text-[#B8AEA5]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-[#C85A32] shrink-0 mt-0.5" />
                <span>{settings.atelierAddress}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-[#5F6F52] shrink-0" />
                <a
                  href={`tel:${settings.contactPhone}`}
                  className="hover:text-[#F6F3EC] transition-colors"
                >
                  {settings.contactPhone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="hover:text-[#F6F3EC] transition-colors"
                >
                  {settings.contactEmail}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Alt Telif ve Güvenli Ödeme */}
        <div className="pt-8 border-t border-[#2C221E] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A7067]">
          <p className="text-center sm:text-left">
            © 2026 {settings.storeName}. Tüm hakları saklıdır. Butik Zanaatkar Üretimi.
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4 text-[#B8AEA5]">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-[#2C221E] border border-[#3A2E29]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[11px] font-medium text-[#F6F3EC]">256-Bit SSL Sertifikalı</span>
            </div>
            <span className="text-[#3A2E29] hidden sm:inline">|</span>
            <div className="flex items-center gap-2 text-[11px] tracking-wider uppercase font-medium">
              <span className="text-emerald-400 font-bold">PayTR</span>
              <span>•</span>
              <span>3D Secure</span>
              <span>•</span>
              <span>Havale / EFT</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
