'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Award,
  Crown,
  Gem,
  Gift,
  Users,
  TrendingUp,
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  Percent,
  Coins,
  RefreshCw,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { LOYALTY_TIERS, LoyaltyTierKey, LOYALTY_CONFIG } from '@/types/loyalty';

interface MemberDemo {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: LoyaltyTierKey;
  points: number;
  totalSpent: number;
  ordersCount: number;
  joinDate: string;
}

const INITIAL_MEMBERS: MemberDemo[] = [
  {
    id: 'm-1',
    name: 'Selin & Emre Demir',
    email: 'selin.demir@example.com',
    phone: '+90 532 987 6543',
    tier: 'ALTIN',
    points: 850,
    totalSpent: 11980,
    ordersCount: 2,
    joinDate: '14.10.2026',
  },
  {
    id: 'm-2',
    name: 'Ayşe Yılmaz',
    email: 'ayse.yilmaz@example.com',
    phone: '+90 532 555 72 34',
    tier: 'GUMUS',
    points: 420,
    totalSpent: 3450,
    ordersCount: 3,
    joinDate: '10.10.2026',
  },
  {
    id: 'm-3',
    name: 'Merve Çelik',
    email: 'merve.celik@example.com',
    phone: '+90 533 222 33 44',
    tier: 'PLATIN',
    points: 1650,
    totalSpent: 18400,
    ordersCount: 7,
    joinDate: '01.09.2026',
  },
  {
    id: 'm-4',
    name: 'Canan Özdemir',
    email: 'canan.ozdemir@example.com',
    phone: '+90 535 888 99 00',
    tier: 'BRONZ',
    points: 180,
    totalSpent: 920,
    ordersCount: 1,
    joinDate: '15.10.2026',
  },
];

export default function AdminLoyaltyManagementPage() {
  const { showToast } = useAdmin();
  const [members, setMembers] = useState<MemberDemo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<'ALL' | LoyaltyTierKey>('ALL');

  // Manuel Puan Formu
  const [selectedMemberEmail, setSelectedMemberEmail] = useState('');
  const [pointsDelta, setPointsDelta] = useState(100);
  const [adjustmentReason, setAdjustmentReason] = useState('Müşteri Memnuniyeti Hediyesi');

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/loyalty');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.members)) {
        setMembers(data.members);
      } else {
        // Fallback demo üyeler
        setMembers(INITIAL_MEMBERS);
      }
    } catch {
      setMembers(INITIAL_MEMBERS);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMembers();
  }, []);

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === 'ALL' || m.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const handleAdjustPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberEmail.trim()) {
      showToast('Lütfen bir üye e-postası seçin veya yazın.');
      return;
    }

    if (!pointsDelta || pointsDelta === 0) {
      showToast('Lütfen sıfırdan farklı bir puan miktarı girin.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/loyalty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: selectedMemberEmail.trim(),
          pointsDelta,
          reason: adjustmentReason,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || `${selectedMemberEmail} hesabına ${pointsDelta > 0 ? '+' : ''}${pointsDelta} Safir Puan tanımlandı!`);
        // Listeyi anında yenile
        await fetchMembers();
        setSelectedMemberEmail('');
      } else {
        showToast(`Hata: ${data.error || 'Puan yüklenemedi.'}`);
      }
    } catch (err: any) {
      showToast(`Bağlantı hatası: ${err.message || 'Puan yükleme servisine ulaşılamadı.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPointsInCirculation = members.reduce((sum, m) => sum + (m.points || 0), 0);
  const totalCirculationTL = totalPointsInCirculation * LOYALTY_CONFIG.POINT_VALUE_TL;

  return (
    <div className="space-y-8 animate-fadeIn pb-12 text-[#231B18]">
      {/* 1. ÜST BAŞLIK */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E2DCD3] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-widest text-[#C85A32] uppercase font-bold">
              Safirya Atölye Kulübü
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              <Crown className="w-3 h-3 text-[#C85A32]" />
              Sadakat & VIP
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#231B18] font-normal mt-1">
            Müşteri Sadakat Programı Yönetimi
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            Atölye Kulübü seviyeleri, puan çarpanları, müşteri bakiyeleri ve manuel puan transferleri.
          </p>
        </div>

        <Link
          href="/hesabim/sadakat"
          target="_blank"
          className="px-4 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#231B18] text-xs font-medium transition border border-stone-200 flex items-center gap-1.5 shrink-0"
        >
          <span>Müşteri Ekranını Gör</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 2. KPI KARTLARI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E2DCD3] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
              Dolaşımdaki Puan
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-normal text-[#231B18] mt-2">
            {totalPointsInCirculation.toLocaleString('tr-TR')}{' '}
            <span className="text-sm font-sans text-stone-500">Puan</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            ≈ ₺{totalCirculationTL.toLocaleString('tr-TR')} indirim değeri
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2DCD3] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
              Kayıtlı Kulüp Üyeleri
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-normal text-[#231B18] mt-2">
            {members.length}{' '}
            <span className="text-sm font-sans text-stone-500">Üye</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            %100 Hoş geldin bonusu aktif
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2DCD3] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
              Tekrar Alışveriş Oranı
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-normal text-[#231B18] mt-2">
            %42.8
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Kulüp üyelerinde sadakat etkisi
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2DCD3] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
              Puan Değişim Oranı
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-normal text-[#231B18] mt-2">
            1 Puan = ₺0.50
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Her ₺10 siparişte 1 puan
          </div>
        </div>
      </div>

      {/* 3. SEVİYE YAPILANDIRMASI & MANUEL PUAN JESTİ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seviyeler (2 Kolon) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E2DCD3] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#231B18]">Atölye Kulübü Seviye Kuralları</h2>
              <p className="text-xs text-stone-500 mt-0.5">Müşteri harcama baremleri ve kademe çarpanları</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
              4 Kademe Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {(Object.keys(LOYALTY_TIERS) as LoyaltyTierKey[]).map((tierKey) => {
              const tier = LOYALTY_TIERS[tierKey];
              return (
                <div key={tierKey} className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-semibold text-sm text-[#231B18]">{tier.name}</span>
                    <span className="text-xs font-bold text-[#C85A32]">{tier.pointsMultiplier}x Çarpan</span>
                  </div>
                  <div className="text-[11px] text-stone-500 font-medium">
                    Harcama Eşiği: {tier.maxSpend ? `₺${tier.minSpend} - ₺${tier.maxSpend}` : `₺${tier.minSpend}+`}
                  </div>
                  <ul className="text-[10px] text-stone-600 space-y-1 pt-1">
                    {tier.perks.slice(0, 2).map((p, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <span className="text-emerald-600">✓</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Manuel Puan Formu (1 Kolon) */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2DCD3] shadow-2xs space-y-4">
          <div>
            <h2 className="text-base font-semibold text-[#231B18]">Manuel Puan Tanımla</h2>
            <p className="text-xs text-stone-500 mt-0.5">VIP müşteri jesti veya telafi amacıyla puan yükleyin</p>
          </div>

          <form onSubmit={handleAdjustPoints} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-stone-700 block mb-1">Müşteri E-Postası</label>
              <input
                type="email"
                required
                list="members-email-list"
                placeholder="ornek@example.com"
                value={selectedMemberEmail}
                onChange={(e) => setSelectedMemberEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
              />
              <datalist id="members-email-list">
                {members.map((m) => (
                  <option key={m.id} value={m.email}>
                    {m.name} ({m.tier} - {m.points} Puan)
                  </option>
                ))}
              </datalist>
            </div>

            <div>
              <label className="text-xs font-medium text-stone-700 block mb-1">Puan Miktarı (+ / -)</label>
              <input
                type="number"
                step="10"
                required
                value={pointsDelta}
                onChange={(e) => setPointsDelta(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">
                İndirim Değeri: ₺{((pointsDelta || 0) * LOYALTY_CONFIG.POINT_VALUE_TL).toFixed(2)}
              </span>
            </div>

            <div>
              <label className="text-xs font-medium text-stone-700 block mb-1">İşlem Açıklaması</label>
              <select
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
              >
                <option value="Müşteri Memnuniyeti Hediyesi">Müşteri Memnuniyeti Hediyesi</option>
                <option value="VIP Sadakat Bonusu">VIP Sadakat Bonusu</option>
                <option value="Gecikme Telafi Puanı">Gecikme Telafi Puanı</option>
                <option value="Özel Etkinlik Çekilişi">Özel Etkinlik Çekilişi</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-[#C85A32] hover:bg-[#B34E2A] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Puan Tanımlanıyor...' : 'Puanı Hesaba Yükle'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* 4. KULÜP ÜYELERİ LİSTESİ */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2DCD3] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[#231B18]">Atölye Kulübü Üyeleri</h2>
            <p className="text-xs text-stone-500 mt-0.5">Sadakat puanı biriktiren ve VIP kademedeki müşteriler</p>
          </div>

          {/* Filtre ve Arama */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Üye ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
              />
            </div>

            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as any)}
              className="text-xs border border-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="ALL">Tüm Kademeler</option>
              <option value="PLATIN">Platin</option>
              <option value="ALTIN">Altın</option>
              <option value="GUMUS">Gümüş</option>
              <option value="BRONZ">Bronz</option>
            </select>
          </div>
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-2">Müşteri</th>
                <th className="py-3 px-2">Seviye</th>
                <th className="py-3 px-2 text-right">Puan Bakiyesi</th>
                <th className="py-3 px-2 text-right">Toplam Harcama</th>
                <th className="py-3 px-2 text-center">Sipariş</th>
                <th className="py-3 px-2 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#C85A32]" />
                    <span>Kulüp üyeleri ve puan bakiyeleri yükleniyor...</span>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400">
                    <span>Aramanızla eşleşen kulüp üyesi bulunamadı.</span>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => {
                const tier = LOYALTY_TIERS[m.tier];
                return (
                  <tr key={m.id} className="hover:bg-stone-50/80 transition">
                    <td className="py-3 px-2">
                      <div className="font-medium text-[#231B18]">{m.name}</div>
                      <div className="text-[10px] text-stone-400">{m.email}</div>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tier.badgeColor} ${tier.badgeTextColor}`}>
                        {tier.name}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right font-serif font-semibold text-[#231B18]">
                      {m.points} Puan
                      <span className="block text-[10px] text-stone-400 font-sans font-normal">
                        ≈ ₺{(m.points * LOYALTY_CONFIG.POINT_VALUE_TL).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right font-semibold text-[#231B18]">
                      ₺{m.totalSpent.toLocaleString('tr-TR')}
                    </td>
                    <td className="py-3 px-2 text-center text-stone-600">{m.ordersCount} sipariş</td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => setSelectedMemberEmail(m.email)}
                        className="text-xs font-semibold text-[#C85A32] hover:underline"
                      >
                        Puan Yükle
                      </button>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
