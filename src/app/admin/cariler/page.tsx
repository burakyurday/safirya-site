'use client';

import React, { useState } from 'react';
import {
  Users,
  PlusCircle,
  Search,
  Filter,
  FileText,
  Phone,
  Mail,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Building,
  Briefcase,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { Account, AccountType } from '@/types/admin';

export default function CarilerPage() {
  const {
    accounts,
    accountMovements,
    addAccount,
    updateAccount,
    addAccountMovement,
  } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [balanceFilter, setBalanceFilter] = useState<'ALL' | 'DEBT' | 'RECEIVABLE'>('ALL');

  // Modallar
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);

  // Yeni Cari Formu
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<AccountType>('TEDARIKCI');
  const [newTaxId, setNewTaxId] = useState('');
  const [newTaxOffice, setNewTaxOffice] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newBalance, setNewBalance] = useState<number>(0);
  const [newNotes, setNewNotes] = useState('');

  // Yeni Cari Hareketi Formu
  const [movType, setMovType] = useState<'BORC' | 'ALACAK'>('ALACAK');
  const [movAmount, setMovAmount] = useState<number>(0);
  const [movDescription, setMovDescription] = useState('');
  const [movRefNo, setMovRefNo] = useState('');

  // Finansal KPI Hesapları
  // Tedarikçilere Borç (Negatif bakiyeler)
  const totalPayableToSuppliers = accounts
    .filter((a) => a.type === 'TEDARIKCI' && a.balance < 0)
    .reduce((acc, a) => acc + Math.abs(a.balance), 0);

  // Müşterilerden Alacak (Pozitif bakiyeler)
  const totalReceivableFromCustomers = accounts
    .filter((a) => a.type === 'MUSTERI' && a.balance > 0)
    .reduce((acc, a) => acc + a.balance, 0);

  const netCariBalance = totalReceivableFromCustomers - totalPayableToSuppliers;

  // Filtreleme
  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.taxId && acc.taxId.includes(searchTerm));

    const matchesType = filterType === 'ALL' || acc.type === filterType;

    const matchesBalance =
      balanceFilter === 'ALL' ||
      (balanceFilter === 'DEBT' && acc.balance < 0) ||
      (balanceFilter === 'RECEIVABLE' && acc.balance > 0);

    return matchesSearch && matchesType && matchesBalance;
  });

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const selectedMovements = accountMovements.filter(
    (m) => m.accountId === selectedAccountId
  );

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) return;

    addAccount({
      code: newCode.trim().toUpperCase(),
      name: newName.trim(),
      type: newType,
      taxId: newTaxId || undefined,
      taxOffice: newTaxOffice || undefined,
      email: newEmail || undefined,
      phone: newPhone || undefined,
      address: newAddress || undefined,
      balance: Number(newBalance),
      notes: newNotes || undefined,
    });

    // Formu temizle
    setNewCode('');
    setNewName('');
    setNewTaxId('');
    setNewEmail('');
    setNewPhone('');
    setNewAddress('');
    setNewBalance(0);
    setIsAddModalOpen(false);
  };

  const handleAddMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId || movAmount <= 0) return;

    addAccountMovement(
      selectedAccountId,
      movType,
      Number(movAmount),
      movDescription || 'Cari hesap hareketi',
      movRefNo || undefined
    );

    setMovAmount(0);
    setMovDescription('');
    setMovRefNo('');
    setIsMovementModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 1. ÜST BAŞLIK & AKSİYON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D96B27]">
            <Users className="w-4 h-4" />
            <span>Ticari İlişkiler & Bakiye Takibi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A4A] mt-1">
            Cari Hesaplar
          </h1>
          <p className="text-xs sm:text-sm text-[#1B2A4A]/70 mt-1">
            Hammadde tedarikçileri, kurumsal müşteriler, etkinlik ajansları ve borç/alacak hareket dökümü.
          </p>
        </div>

        <button
          onClick={() => {
            const nextCode = `CAR-${accounts.length + 101}`;
            setNewCode(nextCode);
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#D96B27] hover:bg-[#c25a1e] text-white text-xs font-bold shadow-md shadow-[#D96B27]/20 flex items-center gap-2 transition active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Yeni Cari Kart Ekle</span>
        </button>
      </div>

      {/* 2. KPI BAKİYE KARTLARI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-[#E8E2D9] shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Tedarikçilere Borçlarımız
          </span>
          <div className="text-2xl font-black text-red-600 mt-2">
            ₺{totalPayableToSuppliers.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Vadesi gelen veya açık hesap hammadde faturaları
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E8E2D9] shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Müşterilerden Alacaklarımız
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            ₺{totalReceivableFromCustomers.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Toplu sipariş ve ajans kalan ödemeleri
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E8E2D9] shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Net Cari Denge
          </span>
          <div className={`text-2xl font-black mt-2 ${netCariBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            ₺{netCariBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Toplam Alacak - Toplam Borç farkı
          </p>
        </div>
      </div>

      {/* 3. ARAMA VE FİLTRELER */}
      <div className="bg-white p-5 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Firma unvanı, cari kodu veya VKN ile ara..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E2D9] text-xs focus:outline-none focus:ring-2 focus:ring-[#D96B27] bg-[#FAF8F5]/50"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
          >
            <option value="ALL">Tüm Cari Tipleri</option>
            <option value="TEDARIKCI">Tedarikçiler (Hammadde)</option>
            <option value="MUSTERI">Kurumsal / Toplu Müşteriler</option>
            <option value="ATOLYE_PARTNER">Atölye Partnerleri</option>
          </select>

          <select
            value={balanceFilter}
            onChange={(e) => setBalanceFilter(e.target.value as any)}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
          >
            <option value="ALL">Tüm Bakiyeler</option>
            <option value="DEBT">Borçlu Olduklarımız (&lt; 0)</option>
            <option value="RECEIVABLE">Alacaklı Olduklarımız (&gt; 0)</option>
          </select>
        </div>
      </div>

      {/* 4. CARİ HESAPLAR TABLOSU */}
      <div className="bg-white rounded-3xl border border-[#E8E2D9] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E8E2D9] text-gray-600 uppercase tracking-wider font-bold text-[11px]">
                <th className="py-4 px-5">Cari Kodu & Ünvan</th>
                <th className="py-4 px-4">Cari Türü</th>
                <th className="py-4 px-4">Vergi Dairesi / VKN</th>
                <th className="py-4 px-4">İletişim</th>
                <th className="py-4 px-4 text-right">Güncel Bakiye</th>
                <th className="py-4 px-4 text-center">Bakiye Durumu</th>
                <th className="py-4 px-5 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    Kayıtlı cari hesap bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => {
                  const isDebt = acc.balance < 0;
                  const isReceivable = acc.balance > 0;

                  return (
                    <tr key={acc.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-5">
                        <div className="font-mono font-bold text-xs text-[#1B2A4A]">
                          {acc.code}
                        </div>
                        <div className="font-bold text-gray-800 text-xs mt-0.5">
                          {acc.name}
                        </div>
                        {acc.notes && (
                          <div className="text-[10px] text-gray-400 mt-0.5 truncate max-w-xs">
                            {acc.notes}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                            acc.type === 'TEDARIKCI'
                              ? 'bg-amber-100 text-amber-800'
                              : acc.type === 'MUSTERI'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {acc.type === 'TEDARIKCI'
                            ? 'Tedarikçi'
                            : acc.type === 'MUSTERI'
                            ? 'Kurumsal Müşteri'
                            : 'Atölye Partner'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-gray-600">
                        {acc.taxId ? (
                          <div>
                            <div className="font-mono font-semibold">{acc.taxId}</div>
                            <div className="text-[10px] text-gray-400">{acc.taxOffice || 'V.D.'}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-gray-600">
                        <div className="space-y-0.5">
                          {acc.phone && (
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span>{acc.phone}</span>
                            </div>
                          )}
                          {acc.email && (
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <span className="truncate max-w-[150px]">{acc.email}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-black text-sm">
                        <span
                          className={
                            isDebt
                              ? 'text-red-600'
                              : isReceivable
                              ? 'text-emerald-600'
                              : 'text-gray-500'
                          }
                        >
                          ₺{Math.abs(acc.balance).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {isDebt ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-bold border border-red-200">
                            Borçluyuz
                          </span>
                        ) : isReceivable ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            Alacaklıyız
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold">
                            Sıfır Bakiye
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => {
                            setSelectedAccountId(acc.id);
                            setIsMovementModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#1B2A4A] hover:bg-[#D96B27] text-white text-xs font-bold transition shadow-sm active:scale-95"
                        >
                          Ekstre & Hareket
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL: YENİ CARİ KART EKLE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D96B27]">
                  Cari Kart Açılışı
                </span>
                <h3 className="text-base font-bold text-[#1B2A4A]">
                  Yeni Cari Hesap Tanımla
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Cari Kodu *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="Örn: TED-005"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono text-xs uppercase focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Cari Türü *
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as AccountType)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-[#D96B27]"
                  >
                    <option value="TEDARIKCI">Tedarikçi (Hammadde Alınan)</option>
                    <option value="MUSTERI">Kurumsal / Toplu Müşteri</option>
                    <option value="ATOLYE_PARTNER">Atölye Partneri / Taşeron</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Cari Ünvanı / Şahıs Adı *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Örn: Ege Cam Sanayi ve Şişe İmalatı"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#D96B27]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    VKN / TCKN
                  </label>
                  <input
                    type="text"
                    value={newTaxId}
                    onChange={(e) => setNewTaxId(e.target.value)}
                    placeholder="10 veya 11 Haneli No"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Vergi Dairesi
                  </label>
                  <input
                    type="text"
                    value={newTaxOffice}
                    onChange={(e) => setNewTaxOffice(e.target.value)}
                    placeholder="Örn: Karşıyaka V.D."
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Telefon
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+90 5..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    E-Posta
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="muhasebe@firma.com"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#D96B27]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Adres
                </label>
                <textarea
                  rows={2}
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Açık adres, ilçe, şehir..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#D96B27]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Özel Notlar
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Vade koşulları, özel iskonto oranı vb."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#D96B27]"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold text-xs hover:bg-gray-200 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#D96B27] hover:bg-[#c25a1e] text-white font-bold text-xs shadow-md shadow-[#D96B27]/20 transition"
                >
                  Cari Kartı Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: CARİ EKSTRE & HAREKET EKLE */}
      {isMovementModalOpen && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D96B27]">
                  {selectedAccount.code} • {selectedAccount.type}
                </span>
                <h3 className="text-base font-bold text-[#1B2A4A]">
                  {selectedAccount.name}
                </h3>
              </div>
              <button
                onClick={() => setIsMovementModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bakiye Özeti */}
            <div className="p-4 my-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500">Güncel Cari Bakiye</div>
                <div className={`text-xl font-black mt-0.5 ${selectedAccount.balance < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  ₺{Math.abs(selectedAccount.balance).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  <span className="text-xs font-bold ml-1">
                    {selectedAccount.balance < 0 ? '(Bizim Borcumuz)' : '(Alacağımız)'}
                  </span>
                </div>
              </div>

              <div className="text-right text-xs text-gray-500">
                <div>VKN: {selectedAccount.taxId || '-'}</div>
                <div>Telefon: {selectedAccount.phone || '-'}</div>
              </div>
            </div>

            {/* Hızlı Hareket Ekle Formu */}
            <form onSubmit={handleAddMovement} className="p-4 rounded-2xl border border-dashed border-[#D96B27]/40 bg-amber-50/40 space-y-3 text-xs mb-4">
              <div className="font-bold text-[#1B2A4A] flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-[#D96B27]" />
                <span>Yeni Borç / Alacak / Tahsilat Hareketi İşle</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Hareket Türü
                  </label>
                  <select
                    value={movType}
                    onChange={(e) => setMovType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs font-bold"
                  >
                    <option value="ALACAK">Alacak (+) / Tahsilat</option>
                    <option value="BORC">Borç (-) / Fatura</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Tutar (₺)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={movAmount || ''}
                    onChange={(e) => setMovAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Açıklama
                  </label>
                  <input
                    type="text"
                    value={movDescription}
                    onChange={(e) => setMovDescription(e.target.value)}
                    placeholder="Örn: Avans EFT ödemesi"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-1.5 px-3 rounded-lg bg-[#D96B27] hover:bg-[#c25a1e] text-white font-bold text-xs shadow-sm transition"
                  >
                    Hareketi Ekle
                  </button>
                </div>
              </div>
            </form>

            {/* Hareketler Listesi */}
            <div className="flex-1 overflow-y-auto space-y-2">
              <div className="text-xs font-bold text-gray-500 mb-2">
                Geçmiş Ekstre Hareketleri
              </div>

              {selectedMovements.length === 0 ? (
                <div className="py-6 text-center text-gray-400 text-xs">
                  Bu cariye ait henüz işlem kaydı bulunmuyor.
                </div>
              ) : (
                selectedMovements.map((mov) => (
                  <div
                    key={mov.id}
                    className="p-3 rounded-xl border border-gray-100 flex items-center justify-between hover:bg-slate-50 transition text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#1B2A4A]">
                        {mov.description}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {mov.date} {mov.referenceNo ? `• Ref: ${mov.referenceNo}` : ''}
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`font-black text-sm ${
                          mov.type === 'ALACAK' ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {mov.type === 'ALACAK' ? '+' : '-'}₺{mov.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {mov.type}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setIsMovementModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
