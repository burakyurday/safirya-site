import React from 'react';
import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';

export default function MyOrdersPage() {
  return (
    <div className="bg-white min-h-[70vh] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#231B18]">
            Siparişlerim
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-1">
            Atölyemizden verdiğiniz geçmiş ve devam eden tüm el yapımı siparişleriniz.
          </p>
        </div>

        <div className="space-y-4">
          {/* Sipariş Kartı */}
          <div className="bg-white rounded-xs border border-stone-200 p-6 hover:border-[#231B18] transition">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#7A7067]">Sipariş No:</span>
                <h3 className="font-mono text-sm font-medium text-[#231B18]">SFR-2026-1042</h3>
                <span className="text-[11px] text-[#7A7067]">14 Ekim 2026 • 10:45</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="bg-[#FAF8F5] text-[#231B18] border border-stone-200 text-xs px-3 py-1 rounded-xs font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Atölyede Üretimde (Aşama 2/5)</span>
                </span>
                <span className="text-sm font-semibold text-[#231B18]">₺676.00</span>
              </div>
            </div>

            <div className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=150&q=80"
                  alt="Safir Gece Botanik Soya Mumu - Sipariş Kalemi"
                  loading="lazy"
                  decoding="async"
                  className="w-14 h-14 object-cover rounded-xs border border-stone-200"
                />
                <div>
                  <h4 className="font-serif text-sm font-normal text-[#231B18]">
                    Safir Gece Botanik Soya Mumu + 1 Ürün
                  </h4>
                  <p className="text-[11px] text-[#7A7067]">
                    Özel Hediye Paketli • İsim Baskılı
                  </p>
                </div>
              </div>

              <Link
                href="/siparis-takip?orderNumber=SFR-2026-1042"
                className="bg-[#231B18] hover:bg-[#3A2E29] text-white text-xs uppercase tracking-widest font-medium px-4 py-2.5 rounded-xs flex items-center gap-1.5 shrink-0 transition"
              >
                <span>Canlı Takip Et</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
