import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Home,
  Flame,
  Palette,
  Gem,
  PackageSearch,
} from 'lucide-react';

export const metadata = {
  title: 'Sayfa Bulunamadı (404)',
  description: 'Aradığınız sayfa Safirya Atölyesi bünyesinde bulunamadı.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  const quickCategories = [
    {
      title: 'Doğal Soya Mumları',
      href: '/kategoriler/dogal-mumlar',
      icon: <Flame className="w-4 h-4 text-[#C85A32]" />,
      desc: 'Bitkisel vaks & ahşap fitilli dökümler',
    },
    {
      title: 'Kokulu Taş Figürler',
      href: '/kategoriler/kokulu-tas',
      icon: <Gem className="w-4 h-4 text-[#15803D]" />,
      desc: 'Kalıcı esanslı heykelsi objeler',
    },
    {
      title: 'Epoksi Ahşap Tepsiler',
      href: '/kategoriler/epoksi-tasarimlar',
      icon: <Palette className="w-4 h-4 text-[#231B18]" />,
      desc: 'Doğal ceviz & safir reçine sunumluklar',
    },
    {
      title: 'Miyuki Boncuk Dokuma',
      href: '/kategoriler/miyuki-taki',
      icon: <Sparkles className="w-4 h-4 text-[#C85A32]" />,
      desc: 'Japon Delica boncuk el işçiliği',
    },
  ];

  return (
    <div className="bg-white min-h-[75vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        
        {/* Görsel / İkon Alanı */}
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-full bg-[#FAF8F5] border border-stone-200 flex items-center justify-center mx-auto">
            <PackageSearch className="w-10 h-10 text-[#231B18] stroke-[1.5]" />
          </div>
          <span className="absolute -top-1 -right-1 px-2.5 py-0.5 rounded-xs bg-[#231B18] text-white text-[10px] uppercase font-mono tracking-wider">
            404
          </span>
        </div>

        {/* Başlık ve Açıklama */}
        <div className="space-y-3">
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#231B18]">
            Aradığınız Parça Atölyemizde Bulunamadı
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] max-w-lg mx-auto leading-relaxed">
            Aradığınız ürün veya sayfa taşınmış, kaldırılmış ya da adresi yanlış yazılmış olabilir.
            Atölyemizin diğer el emeği koleksiyonlarını aşağıdan keşfedebilirsiniz.
          </p>
        </div>

        {/* Ana Aksiyon Butonları */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xs bg-[#231B18] hover:bg-[#3A2E29] text-white text-xs uppercase tracking-widest font-medium transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Anasayfaya Dön</span>
          </Link>
          <Link
            href="/kategoriler"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xs bg-white border border-[#231B18] text-[#231B18] hover:bg-[#231B18] hover:text-white text-xs uppercase tracking-widest font-medium transition"
          >
            <span>Tüm Koleksiyonları Gör</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Hızlı Kategori Önerileri */}
        <div className="pt-8 border-t border-stone-200">
          <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-[#7A7067] block mb-4">
            Popüler Atölye Koleksiyonları
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {quickCategories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="flex items-center gap-3 p-3.5 rounded-xs bg-[#FAF8F5] border border-stone-200 hover:border-[#231B18] transition group"
              >
                <div className="p-2 rounded-xs bg-white border border-stone-200 shrink-0">
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-sm font-normal text-[#231B18] group-hover:text-[#C85A32] transition truncate">
                    {cat.title}
                  </h3>
                  <p className="text-[11px] text-[#7A7067] truncate">
                    {cat.desc}
                  </p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#231B18] group-hover:translate-x-0.5 transition" />
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
