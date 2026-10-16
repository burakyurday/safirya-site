import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Safirya üretim veritabanı başlatılıyor (Demo verilerden arındırılmış temiz kurulum)...');

  // 1. DİNAMİK SİSTEM AYARLARI
  const settings = await prisma.systemSettings.upsert({
    where: { id: 'safirya_config' },
    update: {},
    create: {
      id: 'safirya_config',
      announcementText: '₺500 ve Üzeri Siparişlerde Ücretsiz Kargo!',
      isAnnouncementActive: true,
      freeShippingThreshold: 500,
      giftWrapFee: 30,
      storeName: 'Safirya El Yapımı Tasarım Atölyesi',
      contactEmail: 'destek@safirya.tr',
      contactPhone: '+90 (212) 555 7234',
      whatsappNumber: '+90 532 555 7234',
      instagramHandle: '@safirya.tr',
      atelierAddress: 'Caferağa Mah. Şair Nefi Sk. No:18 Kadıköy / İstanbul',
      exitIntentEnabled: true,
      exitIntentTitle: 'Atölyemizden Ayrılmadan Önce %10 Tanışma İndirimi!',
      exitIntentSubtitle: 'El emeği tasarımlarımızda geçerli hoş geldin hediyesi.',
      exitIntentCouponCode: 'SAFIRYA10',
      exitIntentDiscountRate: 10,
    },
  });
  console.log('✅ Sistem ayarları yüklendi:', settings.announcementText);

  // 2. YÖNETİCİ KULLANICI
  await prisma.user.upsert({
    where: { email: 'admin@safirya.tr' },
    update: {},
    create: {
      name: 'Safirya Yönetim',
      email: 'admin@safirya.tr',
      phone: '+90 532 555 7234',
      role: 'ADMIN',
    },
  });
  console.log('✅ Yetkili yönetici kullanıcısı tanımlandı.');

  // 3. ATÖLYE KATEGORİLERİ
  const categoriesData = [
    {
      name: 'Doğal Mumlar',
      slug: 'dogal-mumlar',
      description: '%100 doğal soya vaksı, ahşap fitilli ve saf esansiyel yağlarla dökülen el yapımı mumlar.',
      imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
      icon: 'Flame',
      sortOrder: 1,
    },
    {
      name: 'Kokulu Taş & Seramik',
      slug: 'kokulu-tas',
      description: 'Özel formüllü taş tozu, heykelsi figürler ve kalıcı koku hapseden dekoratif objeler.',
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      icon: 'Gem',
      sortOrder: 2,
    },
    {
      name: 'Epoksi Tasarımlar',
      slug: 'epoksi-tasarimlar',
      description: 'Ultra şeffaf döküm reçine, kurutulmuş çiçekler ve mermer efektli el emeği sunumluklar.',
      imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
      icon: 'Palette',
      sortOrder: 3,
    },
    {
      name: 'Miyuki Boncuk Takı',
      slug: 'miyuki-taki',
      description: 'Japon Miyuki Delica boncuklarıyla tek tek elde dokunan özel tasarım bileklik ve kolyeler.',
      imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      icon: 'Sparkles',
      sortOrder: 4,
    },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categories[cat.slug] = createdCat;
  }
  console.log('✅ Ana atölye kategorileri yüklendi.');

  // 4. CMS KURUMSAL VE YASAL SAYFALAR
  const cmsPages = [
    {
      slug: 'hakkimizda',
      title: 'Hakkımızda',
      metaDescription: 'Safirya Atölyesi el yapımı tasarım hikayesi',
      contentHtml: `
        <h2>Safirya: El Emeğinin ve Doğallığın Zanaati</h2>
        <p>Safirya, seri üretimin mekanik ruhuna inat; her bir objeyi zanaatkar dokunuşuyla, sevgiyle ve özenle üreten bağımsız bir tasarım atölyesidir.</p>
        <p>Kadıköy'deki atölyemizde döktüğümüz her bir soya mumu, zımparaladığımız her bir epoksi ahşap sunumluk ve tek tek ipe dizdiğimiz her bir Japon Miyuki boncuğu; hayatınıza sıcaklık ve estetik katmak için üretilir.</p>
      `,
    },
    {
      slug: 'iade-kosullari',
      title: 'İade ve Değişim Koşulları',
      metaDescription: 'Safirya ürün iade ve atölye garanti politikaları',
      contentHtml: `
        <h2>14 Gün Koşulsuz İade Güvencesi</h2>
        <p>Standart koleksiyon ürünlerimizde teslimat tarihinden itibaren 14 gün içinde ambalajı açılmamış ve hasar görmemiş ürünleri ücretsiz iade edebilirsiniz.</p>
        <p><strong>Önemli Not:</strong> Kişiye özel isim yazılan, özel koku seçimi yapılan veya söz/nişan için özel üretilen siparişlerde Tüketici Kanunu gereği iade kabul edilememektedir.</p>
      `,
    },
    {
      slug: 'gizlilik-ve-kvkk',
      title: 'Gizlilik ve KVKK Politikası',
      metaDescription: 'Kişisel Verilerin Korunması Kanunu Aydınlatma Metni',
      contentHtml: `
        <h2>Kişisel Verilerinizin Güvenliği</h2>
        <p>Safirya Atölyesi olarak 6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca müşteri bilgilerinizin gizliliğini en yüksek standartta koruyoruz.</p>
        <p>Sipariş süreçleri haricinde verileriniz hiçbir üçüncü parti kuruluşla paylaşılmaz.</p>
      `,
    },
    {
      slug: 'mesafeli-satis-sozlesmesi',
      title: 'Mesafeli Satış Sözleşmesi',
      metaDescription: 'T.C. Ticaret Bakanlığı mevzuatına uygun mesafeli satış sözleşmesi',
      contentHtml: `
        <h2>Mesafeli Satış Sözleşmesi</h2>
        <p>İşbu sözleşme 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri doğrultusunda düzenlenmiştir.</p>
      `,
    },
    {
      slug: 'iletisim',
      title: 'İletişim & Atölye Ziyareti',
      metaDescription: 'Safirya atölye adresi, telefon ve randevu bilgileri',
      contentHtml: `
        <h2>Atölyemize Kahveye Bekleriz</h2>
        <p><strong>Adres:</strong> Caferağa Mah. Şair Nefi Sk. No:18 Kadıköy / İstanbul</p>
        <p><strong>Telefon & WhatsApp:</strong> +90 (532) 555 7234</p>
        <p><strong>E-posta:</strong> atolye@safirya.tr</p>
        <p>Toplu sipariş ve etkinlik görüşmeleri için lütfen önceden randevu alınız.</p>
      `,
    },
  ];

  for (const page of cmsPages) {
    await prisma.cmsPage.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    });
  }
  console.log('✅ CMS Yasal ve kurumsal sayfaları yüklendi.');

  console.log('🎉 Safirya üretim kurulumu tamamlandı. (Tüm demo sipariş ve test hesapları temiz tutuldu.)');
}

main()
  .catch((e) => {
    console.error('❌ Seed işleminde hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
