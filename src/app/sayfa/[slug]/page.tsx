import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  Shield,
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  ExternalLink,
  Sparkles,
  FileText,
  Lock,
  Scale,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { DynamicCmsPage } from '@/components/cms/DynamicCmsPage';
import { ContactForm } from '@/components/cms/ContactForm';
import { JsonLd, getBreadcrumbSchema } from '@/components/seo/JsonLd';

interface Props {
  params: Promise<{ slug: string }>;
}

const slugAliases: Record<string, string> = {
  'gizlilik-politikasi': 'gizlilik-ve-kvkk',
  kvkk: 'gizlilik-ve-kvkk',
  'cerez-politikasi': 'gizlilik-ve-kvkk',
  'on-bilgilendirme-formu': 'mesafeli-satis-sozlesmesi',
};

const pagesContent: Record<
  string,
  {
    title: string;
    subtitle: string;
    metaDescription: string;
    content: React.ReactNode;
  }
> = {
  hakkimizda: {
    title: 'Hakkımızda',
    subtitle: 'Safirya: El Emeğinin, Zarafetin ve Doğallığın Zanaati',
    metaDescription:
      'Safirya, Kadıköy atölyesinde petrol türevi parafin yerine %100 bitkisel soya mumu, kokulu taşlar, ahşap epoksi tepsiler ve Miyuki boncuk takılar üreten bağımsız tasarım atölyesidir.',
    content: (
      <div className="space-y-6 text-sm sm:text-base text-[#1B2A4A]/80 leading-relaxed">
        <p>
          Safirya, seri üretimin mekanik ruhuna inat; her bir objeyi zanaatkar dokunuşuyla, sevgiyle ve özenle üreten bağımsız bir tasarım atölyesidir.
        </p>
        <p>
          Kadıköy&apos;deki atölyemizde döktüğümüz her bir soya mumu, zımparaladığımız her bir epoksi ahşap sunumluk ve tek tek ipe dizdiğimiz her bir Japon Miyuki boncuğu; yaşam alanlarınıza sıcaklık, huzur ve estetik katmak için üretilir.
        </p>
        <h3 className="text-xl font-bold text-[#1B2A4A] pt-4">Değerlerimiz</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>%100 Doğallık:</strong> Petrol türevi parafin yerine sadece bitkisel soya vaksı ve IFRA sertifikalı saf esanslar kullanıyoruz.
          </li>
          <li>
            <strong>Şeffaf Üretim:</strong> Siparişinizin dökümünden paketlenmesine kadar tüm aşamaları fotoğraf kareleriyle sizlerle paylaşıyoruz.
          </li>
          <li>
            <strong>Zanaatkar Dokunuşu:</strong> Her bir Miyuki boncuk elde dokunur, her epoksi sunumluk ahşabın doğal damarlarına göre benzersizdir.
          </li>
        </ul>
      </div>
    ),
  },

  'iade-kosullari': {
    title: 'İade ve Değişim Koşulları',
    subtitle: '14 Gün Koşulsuz İade ve Atölye Hasarsız Teslimat Güvencesi',
    metaDescription:
      'Safirya siparişlerinizde 14 gün koşulsuz iade hakkı, hasarlı kargo tespit tutanağı ve kişiselleştirilmiş siparişlerin iade kapsamı hakkında detaylar.',
    content: (
      <div className="space-y-8 text-sm sm:text-base text-[#1B2A4A]/80 leading-relaxed">
        <div className="p-4 rounded-2xl bg-[#DCFCE7] border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-medium flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong>14 Gün Koşulsuz İade Güvencesi:</strong>
            <p className="mt-0.5 text-emerald-800">
              Standart atölye koleksiyonu ürünlerimizde, teslimat tarihinden itibaren 14 gün içerisinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin iade hakkınız bulunmaktadır.
            </p>
          </div>
        </div>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-[#1B2A4A] flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-[#D96B27]" />
            1. Adım Adım İade Süreci
          </h3>
          <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm">
            <li>
              <strong>İade Bildirimi:</strong> Ürününüzü teslim aldığınız tarihten itibaren 14 gün içinde <a href="mailto:destek@safirya.tr" className="text-[#D96B27] font-semibold underline">destek@safirya.tr</a> adresine sipariş numaranızla birlikte yazılı bildirimde bulununuz veya WhatsApp hattımızdan (+90 532 555 7234) atölyemize ulaşınız.
            </li>
            <li>
              <strong>Özenli Ambalajlama:</strong> El yapımı tasarımların kırılgan yapısı gereği, ürünün orijinal kraft kutusu, dolgu ambalajları ve varsa hediye aksesuarları ile birlikte eksiksiz olarak paketlenmesi gerekmektedir.
            </li>
            <li>
              <strong>Ücretsiz Kargo Gönderimi:</strong> Müşteri temsilcimizin tarafınıza ileteceği anlaşmalı kargo iade kodu ile paketi en yakın Yurtiçi Kargo şubesine teslim edebilirsiniz. İade kargo ücreti Safirya tarafından karşılanır.
            </li>
            <li>
              <strong>Atölye İncelemesi ve Geri Ödeme:</strong> İade edilen ürün atölyemize ulaştıktan sonra 2 iş günü içinde kontrol edilir. İade onaylandığında, ödeme yaptığınız kredi kartınıza veya banka hesabınıza 3-5 iş günü içerisinde kesintisiz olarak iade edilir.
            </li>
          </ol>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-[#1B2A4A] flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            2. İade Kapsamı Dışındaki Ürünler (Yasal İstisnalar)
          </h3>
          <p className="text-xs sm:text-sm">
            6502 sayılı Tüketicinin Korunması Hakkında Kanun ve 29188 sayılı Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesi uyarınca;
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
            <li>
              <strong>Kişiselleştirilmiş Tasarımlar:</strong> ALICI&apos;nın özel talebi doğrultusunda üzerine isim, tarih, baş harf yazılan soya mumları, özel renk dökülen epoksi sunumluklar ve kişiye özel Miyuki takılar,
            </li>
            <li>
              <strong>Etkinlik Toplu Siparişleri:</strong> Söz, nişan, nikah, düğün ve kurumsal organizasyonlar için özel adet baremleriyle toplu döküm/üretim yapılan siparişler,
            </li>
            <li>
              <strong>Kullanılmış veya Açılmış Ürünler:</strong> Koruyucu ambalajı, fitil emniyet mührü açılmış, yakılmış, kokulandırılmış veya hijyen/sağlık açısından uygunluğunu yitirmiş mum ve kokulu taş ürünleri iade kapsamı dışındadır.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-[#1B2A4A] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#16A34A]" />
            3. Kargoda Hasar Gören Ürünler (Hasarsız Teslimat Garantisi)
          </h3>
          <p className="text-xs sm:text-sm leading-relaxed">
            Safirya olarak tüm gönderilerimizde darbe emici özel hava kanallı petek kraft ambalajlar kullanıyoruz. Buna rağmen kargo teslimatı sırasında kolide ıslanma, ezilme veya kırılma tespit ederseniz; paketi teslim almayarak kargo görevlisine derhal <strong>&quot;Hasar Tespit Tutanağı&quot;</strong> tutturunuz.
          </p>
          <p className="text-xs sm:text-sm leading-relaxed">
            Tutanağın fotoğrafını bize ilettiğinizde, hasar gören ürününüz atölyemizde öncelikli üretim bandına alınarak <strong>derhal yeniden üretilir ve hiçbir ek ücret talep edilmeksizin adresinize sevk edilir</strong> veya talebiniz doğrultusunda paranız iade edilir.
          </p>
        </section>
      </div>
    ),
  },

  'gizlilik-ve-kvkk': {
    title: 'KVKK Aydınlatma Metni & Gizlilik Politikası',
    subtitle: '6698 Sayılı Kişisel Verilerin Korunması Kanunu Kapsamında Bilgilendirme',
    metaDescription:
      'Safirya El Yapımı Tasarım Atölyesi (safirya.tr) 6698 sayılı KVKK aydınlatma metni, veri sorumlusu bilgileri, işlenen veriler, çerez politikası ve yasal haklarınız.',
    content: (
      <div className="space-y-8 text-sm sm:text-base text-[#1B2A4A]/80 leading-relaxed">
        <div className="p-4 rounded-2xl bg-[#FFF7ED] border border-[#D96B27]/30 text-[#1B2A4A] text-xs sm:text-sm space-y-1">
          <strong className="text-[#D96B27] block font-bold">safirya.tr Veri Güvenliği ve Mahremiyet Taahhüdü:</strong>
          <p>
            Safirya El Yapımı Tasarım Atölyesi olarak, müşterilerimizin ve ziyaretçilerimizin kişisel verilerinin korunmasına, gizliliğine ve güvenliğine en üst düzeyde hassasiyet gösteriyoruz. Kişisel verileriniz 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) ve ilgili mevzuata tam uyumlu olarak işlenmektedir.
          </p>
        </div>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-[#1B2A4A]">1. Veri Sorumlusunun Kimliği</h3>
          <p className="text-xs sm:text-sm">
            KVKK uyarınca Veri Sorumlusu sıfatıyla hareket eden atölyemize ait kimlik ve iletişim bilgileri şöyledir:
          </p>
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E2D9] text-xs space-y-1.5">
            <p><strong>Ticari Ünvan:</strong> Safirya El Yapımı Tasarım Atölyesi</p>
            <p><strong>Alan Adı:</strong> https://safirya.tr</p>
            <p><strong>Atölye Adresi:</strong> Caferağa Mah. Şair Nefi Sk. No:18 Kadıköy / İstanbul</p>
            <p><strong>Müşteri Hizmetleri:</strong> +90 (212) 555 7234</p>
            <p><strong>WhatsApp İletişim:</strong> +90 (532) 555 7234</p>
            <p><strong>KVKK & Gizlilik E-Posta:</strong> kvkk@safirya.tr / destek@safirya.tr</p>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-[#1B2A4A]">2. İşlenen Kişisel Veri Kategorileri</h3>
          <p className="text-xs sm:text-sm">
            safirya.tr üzerinden gerçekleştirdiğiniz işlemler kapsamında aşağıdaki veri kategorileri işlenmektedir:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
            <li>
              <strong>Kimlik Bilgileri:</strong> Ad, soyad, T.C. kimlik numarası (213 sayılı Vergi Usul Kanunu ve e-Arşiv fatura zorunluluğu kapsamında veya kurumsal siparişlerde Vergi Kimlik Numarası).
            </li>
            <li>
              <strong>İletişim Bilgileri:</strong> Teslimat adresi, fatura adresi, cep telefonu numarası, e-posta adresi.
            </li>
            <li>
              <strong>Müşteri İşlem & Sipariş Verileri:</strong> Sipariş numarası, sipariş edilen ürünler, adet baremleri, koku notaları, kişiselleştirme metinleri (ürünlere yazılacak isim, tarih veya nişan/düğün notları), hediye paketi notları, kargo takip bilgileri, talep ve şikayet kayıtları.
            </li>
            <li>
              <strong>Finansal Güvenlik ve Ödeme Verileri:</strong> Seçilen ödeme yöntemi, sipariş tutarı, banka işlem referans kodu. <em>(Önemli Not: Kredi kartı numaranız, son kullanma tarihiniz ve CVV güvenlik kodunuz kesinlikle Safirya sunucularında SAKLANMAZ; 256-Bit SSL şifrelemeyle doğrudan TCMB/BDDK lisanslı ödeme kuruluşu İyzico altyapısına iletilir ve 3D Secure ile tahsil edilir.)</em>
            </li>
            <li>
              <strong>İşlem Güvenliği ve Dijital İz Verileri:</strong> IP adresi, internet sitesi giriş-çıkış logları, kullanıcı oturum çerezleri, gezinme ve sepet verileri.
            </li>
            <li>
              <strong>Üretim Aşama Görselleri:</strong> Canlı sipariş takip modülümüzde müşterinin onayına sunulan atölye üretim aşaması fotoğrafları (döküm, etiketleme ve mühürleme anı fotoğrafları).
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-[#1B2A4A]">3. Kişisel Verilerin İşlenme Amaçları</h3>
          <p className="text-xs sm:text-sm">
            Kişisel verileriniz aşağıdaki amaçlarla (&quot;Amaçlar&quot;) KVKK&apos;nın 5. ve 6. maddelerine uygun olarak işlenmektedir:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>safirya.tr üzerinden siparişlerin oluşturulması, teyidi ve ifası,</li>
            <li>Kişiye özel tasarım taleplerinin (isim, koku, kurdele rengi) atölyemizde zanaatkar dokunuşuyla hazırlanması,</li>
            <li>Siparişlerin darbe emici ambalajla paketlenip anlaşmalı kargo firmaları aracılığıyla adresinize teslim edilmesi,</li>
            <li>Sipariş takip SMS ve e-posta bildirimlerinin (hazırlık, kargo takip numarası vb.) iletilmesi,</li>
            <li>213 sayılı Vergi Usul Kanunu uyarınca e-fatura veya e-arşiv fatura düzenlenmesi,</li>
            <li>Satış sonrası müşteri desteği, iade, hasarlı ürün telafisi ve tüketici taleplerinin yönetimi,</li>
            <li>5651 sayılı İnternet Ortamında Yapılan Yayınların Düzenlenmesi Hakkında Kanun uyarınca işlem loglarının tutulması,</li>
            <li>Açık rıza vermeniz halinde atölyemizin yeni el emeği serileri, mevsimsel kokuları ve baremli indirimleri hakkında ticari elektronik ileti gönderilmesi,</li>
            <li>Adli ve idari makamlarca talep edilen yasal bilgi ve belgelerin temin edilmesi.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-[#1B2A4A]">4. Kişisel Veri Toplamanın Yöntemi ve Hukuki Sebepleri</h3>
          <p className="text-xs sm:text-sm">
            Kişisel verileriniz, safirya.tr internet sitemiz, mobil arayüzümüz, sipariş formları, üyelik ekranı, iletişim formları, WhatsApp hızlı sipariş hattı ve e-posta yazışmaları kanalıyla tamamen veya kısmen otomatik yollarla toplanmaktadır.
          </p>
          <div className="space-y-2 text-xs sm:text-sm">
            <p><strong>Hukuki Sebepler:</strong></p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li><strong>KVKK m. 5/2-c:</strong> Bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması (Siparişin alınması, el yapımı üretimi, kargo teslimatı).</li>
              <li><strong>KVKK m. 5/2-ç:</strong> Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi (Vergi mevzuatı, 6502 sayılı Tüketici Kanunu, e-ticaret düzenlemeleri).</li>
              <li><strong>KVKK m. 5/2-f:</strong> İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla meşru menfaatlerimiz (Sistem güvenliği, sahtecilik önleme, müşteri hizmet kalitesi).</li>
              <li><strong>KVKK m. 5/1:</strong> Açık rıza (İsteğe bağlı pazarlama iletileri ve üçüncü taraf analitik çerezler).</li>
            </ul>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-[#1B2A4A]">5. Kişisel Verilerin Aktarıldığı Taraflar</h3>
          <p className="text-xs sm:text-sm">
            Kişisel verileriniz hiçbir surette üçüncü şahıslara ticari amaçla satılmaz veya kiralanmaz. Yalnızca siparişin ifası ve kanuni yükümlülükler doğrultusunda şu alıcı gruplarına aktarılır:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Anlaşmalı Kargo Şirketleri:</strong> (Yurtiçi Kargo vb.) Siparişin teslim edilebilmesi için ad-soyad, teslimat adresi ve telefon bilgisi.</li>
            <li><strong>Lisanslı Ödeme Kuruluşları:</strong> (İyzico vb.) Güvenli kart tahsilatının sağlanması ve 3D Secure doğrulaması için.</li>
            <li><strong>Mali Müşavir ve e-Fatura Entegratörleri:</strong> Yasal muhasebe ve vergi denetim kayıtları için.</li>
            <li><strong>Yetkili Kamu Kurum ve Kuruluşları:</strong> Mahkemeler, Tüketici Hakem Heyetleri, Maliye Bakanlığı ve kolluk kuvvetlerinin yasal talepleri halinde.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-[#1B2A4A]">6. Kredi Kartı ve Ödeme Güvenliği</h3>
          <p className="text-xs sm:text-sm">
            safirya.tr üzerinde alışveriş yaparken kullandığınız kredi kartı bilgileri atölyemiz sunucularında asla tutulmaz ve kaydedilmez. Sitemiz 256-Bit SSL şifreleme sertifikası ile korunmaktadır. Ödeme ekranında girdiğiniz kart bilgileri doğrudan bankanız ile TCMB/BDDK lisanslı ödeme kuruluşu (İyzico) arasında kurulan şifreli tünel üzerinden aktarılır. 3D Secure onay kodu cep telefonunuza iletilmeden çekim yapılamaz.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-[#1B2A4A]">7. Kapsamlı Çerez (Cookie) Politikası</h3>
          <p className="text-xs sm:text-sm">
            safirya.tr sitemizde kullanıcı deneyiminizi zenginleştirmek ve sepetinizi korumak için çerezler kullanılmaktadır:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Zorunlu Çerezler:</strong> Sepetinize ürün ekleme, oturum açma ve güvenli ödeme adımlarının çalışması için teknik zorunluluktur; kapatılamaz.</li>
            <li><strong>Analitik Çerezler:</strong> Sitemizi kaç kişinin ziyaret ettiğini, hangi kategorilerin ilgi gördüğünü ölçmek için anonim olarak veri toplar.</li>
            <li><strong>Pazarlama / Tercih Çerezleri:</strong> İlgi duyduğunuz el yapımı kokulara veya tasarımlara göre özel bildirimler sunar.</li>
          </ul>
          <p className="text-xs text-gray-500 pt-1">
            Çerez tercihlerinizi sitemizin alt çubuğundaki &quot;Çerez Tercihleriniz&quot; panelinden dilediğiniz zaman değiştirebilir veya tarayıcınızın (Chrome, Safari, Edge vb.) gizlilik ayarlarından tüm çerezleri silebilirsiniz.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-[#1B2A4A]">8. Veri Saklama Süreleri</h3>
          <p className="text-xs sm:text-sm">
            Kişisel verileriniz, mevzuatta öngörülen zamanaşımı süreleri boyunca saklanır:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Fatura, sipariş ve muhasebe kayıtları: 10 yıl (6102 sayılı TTK ve 213 sayılı VUK),</li>
            <li>Tüketici uyuşmazlığı ve talep kayıtları: 3 yıl (6502 sayılı Tüketici Kanunu),</li>
            <li>İnternet sitesi IP trafik logları: 2 yıl (5651 sayılı Kanun).</li>
          </ul>
          <p className="text-xs text-gray-500">
            Süre bitiminde verileriniz KVKK mevzuatına uygun olarak silinir, yok edilir veya anonimleştirilir.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-[#1B2A4A]">9. KVKK Madde 11 Uyarınca İlgili Kişinin Hakları</h3>
          <p className="text-xs sm:text-sm">
            KVKK&apos;nın 11. maddesi uyarınca Safirya&apos;ya başvurarak kendinizle ilgili şu haklara sahipsiniz:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li>a) Kişisel verinizin işlenip işlenmediğini öğrenme,</li>
            <li>b) Kişisel veriniz işlenmişse buna ilişkin bilgi talep etme,</li>
            <li>c) Kişisel verinizin işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
            <li>ç) Yurt içinde veya yurt dışında kişisel verinizin aktarıldığı üçüncü kişileri bilme,</li>
            <li>d) Kişisel verinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,</li>
            <li>e) KVKK 7. maddede öngörülen şartlar çerçevesinde kişisel verinizin silinmesini veya yok edilmesini isteme,</li>
            <li>f) (d) ve (e) bentleri uyarınca yapılan işlemlerin, kişisel verinizin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
            <li>g) İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,</li>
            <li>ğ) Kişisel verinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-[#1B2A4A]">10. Başvuru Usulü ve İletişim</h3>
          <p className="text-xs sm:text-sm">
            Yukarıda belirtilen haklarınızı kullanmak için kimliğinizi tespit edici belgelerle birlikte:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Islak imzalı dilekçe ile: <em>Caferağa Mah. Şair Nefi Sk. No:18 Kadıköy / İstanbul</em> adresimize şahsen veya noter kanalıyla,</li>
            <li>Elektronik posta ile: Sistemimizde kayıtlı e-posta adresiniz üzerinden <strong>kvkk@safirya.tr</strong> adresine iletebilirsiniz.</li>
          </ul>
          <p className="text-xs text-gray-500">
            Talebiniz en geç 30 (otuz) gün içerisinde ücretsiz olarak sonuçlandırılacaktır.
          </p>
        </section>
      </div>
    ),
  },

  'kullanim-kosullari': {
    title: 'Kullanım Koşulları',
    subtitle: 'safirya.tr Web Sitesi Ziyaret, Üyelik ve Hizmet Kullanım Şartları',
    metaDescription:
      'safirya.tr web sitesi kullanım koşulları, fikri mülkiyet hakları, el yapımı zanaat toleransı, sipariş kuralları ve hukuki şartlar.',
    content: (
      <div className="space-y-8 text-sm sm:text-base text-[#1B2A4A]/80 leading-relaxed">
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D9] text-xs sm:text-sm space-y-1">
          <strong className="text-[#1B2A4A] block font-bold">safirya.tr Kullanıcı Sözleşmesi Özeti:</strong>
          <p>
            Bu internet sitesini ziyaret eden, üye olan veya sipariş veren her kullanıcı; işbu Kullanım Koşulları metninde yer alan tüm maddeleri peşinen okumuş, anlamış ve kabul etmiş sayılır.
          </p>
        </div>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-[#1B2A4A]">1. Giriş ve Taraflar</h3>
          <p className="text-xs sm:text-sm">
            Bu internet sitesi (<strong>https://safirya.tr</strong>), Caferağa Mah. Şair Nefi Sk. No:18 Kadıköy / İstanbul adresinde mukim Safirya El Yapımı Tasarım Atölyesi (&quot;Safirya&quot;) tarafından işletilmektedir. safirya.tr sitesini ziyaret eden, üye olan veya alışveriş yapan gerçek veya tüzel kişiler bundan böyle &quot;Kullanıcı&quot; veya &quot;Müşteri&quot; olarak anılacaktır.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-[#1B2A4A]">2. Hizmetin Niteliği ve Atölye Esaslı Üretim Modeli</h3>
          <p className="text-xs sm:text-sm">
            Safirya, seri bant üretimi yapan fabrikasyon bir kuruluş değildir; zanaatkar ellerle, doğal hammadde ve özel reçetelerle siparişe özel el emeği üreten butik bir tasarım atölyesidir. Sitede sergilenen soya mumları, kokulu taşlar, ahşap epoksi tepsiler ve Japon Miyuki takılar sipariş üzerine özenle hazırlanır.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-[#1B2A4A]">3. Fikri ve Sınai Mülkiyet Hakları</h3>
          <p className="text-xs sm:text-sm">
            safirya.tr alan adı, &quot;Safirya&quot; marka ve logosu, web sitesinin tasarımı, veritabanı, yazılım kodları, ürün fotoğrafları, videoları, tescilli Miyuki dokuma şablonları ve metin içerikleri 5846 sayılı Fikir ve Sanat Eserleri Kanunu ile 6769 sayılı Sınai Mülkiyet Kanunu koruması altındadır.
          </p>
          <p className="text-xs sm:text-sm">
            Safirya&apos;nın yazılı açık izni olmaksızın site içeriğinin kısmen veya tamamen kopyalanması, çoğaltılması, taranması (scraping/bot), dağıtılması, başka mecralarda yayınlanması veya ticari amaçla kullanılması kesinlikle yasaktır ve yasal takip konusudur.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-[#1B2A4A]">4. El Emeği Zanaat Toleransı ve Doğal Malzeme Karakteristiği</h3>
          <p className="text-xs sm:text-sm">
            Müşteri, sipariş verdiği ürünlerin zanaatkar ellerle tek tek üretildiğini ve aşağıdaki doğal malzeme karakteristiklerini peşinen kabul eder:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>
              <strong>Doğal Soya Vaksı:</strong> Petrol türevi parafin içermeyen saf soya mumu; ortam sıcaklığına bağlı olarak yüzeyde hafif kristallenme (frosting), mikro döküm dalgalanması veya fitil çevresinde doğal renk nüansı gösterebilir. Bu durum soya vaksının %100 bitkisel ve katkısız olduğunun kanıtıdır.
            </li>
            <li>
              <strong>Ceviz Ağacı ve Epoksi:</strong> Epoksi sunumluklarda kullanılan doğal ceviz ağaçlarının damar deseni, ahşap lif yönü ve tonu her kütükte benzersizdir; sitedeki görselle birebir aynı damar deseni garantisi verilemez.
            </li>
            <li>
              <strong>Kokulu Taş Objeler:</strong> Doğal taş tozunun dökümünde oluşan mikro hava gözenek dokusu el dökümü zanaatin doğal yapısıdır.
            </li>
            <li>
              <strong>Miyuki Takılar:</strong> Orijinal Japon cam boncukların elde iğneyle ilmek ilmek dokunması neticesinde organik mikro-farklılıklar bulunabilir.
            </li>
            <li>
              <strong>Ekran Renk Kalibrasyonu:</strong> Kullanıcının cihaz ekranındaki (telefon, monitör) renk kalibrasyonuna bağlı olarak %5-10 ton farklılıkları oluşabilir.
            </li>
          </ul>
          <p className="text-xs text-gray-500">
            Yukarıda belirtilen doğal zanaat nüansları hiçbir surette &quot;ayıplı mal&quot; teşkil etmez; her bir parçanın dünyada eşsiz olduğunun tescilidir.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-[#1B2A4A]">5. Kullanıcı Yükümlülükleri ve Hesap Güvenliği</h3>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>Kullanıcı, sipariş ve fatura alanlarında doğru, eksiksiz ve güncel bilgiler girmekle yükümlüdür. Yanlış adres veya telefon sebebiyle kargonun gecikmesinden veya teslim edilememesinden Safirya sorumlu tutulamaz.</li>
            <li>Site altyapısını bozmaya, sunucuları aşırı yüklemeye veya güvenlik duvarlarını aşmaya yönelik bot, spam ve siber saldırı girişimleri derhal adli mercilere bildirilir.</li>
            <li>Kullanıcı, hesap şifresinin güvenliğini sağlamakla bizzat yükümlüdür.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-[#1B2A4A]">6. Sipariş, Fiyatlandırma ve Tipografik Hatalar</h3>
          <p className="text-xs sm:text-sm">
            safirya.tr üzerindeki tüm fiyatlar Türk Lirası (TL) cinsinden olup yasal KDV dahildir. Safirya, hammadde (soya vaksı, ithal esanslar vb.) piyasasındaki ani dalgalanmalara bağlı olarak ürün fiyatlarını önceden bildirmeksizin güncelleme hakkını saklı tutar.
          </p>
          <p className="text-xs sm:text-sm">
            Sistemsel, teknik veya dizgi hatası neticesinde aşikar bir şekilde yanlış fiyatlandırılan ürünlerde (örneğin 950 TL&apos;lik ceviz epoksi tepsinin sehven 9.50 TL olarak listelenmesi), Safirya siparişi iptal ederek tahsil edilen bedeli müşteriye derhal iade etme hakkına sahiptir.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-[#1B2A4A]">7. Özel Barem ve Toplu Sipariş Hükümleri</h3>
          <p className="text-xs sm:text-sm">
            Söz, nişan, düğün ve kurumsal etkinlikler için 25, 50, 100+ adet gibi baremli indirim avantajıyla sipariş edilen ürünlerde; numune/dijital etiket onayı alınıp atölyede üretime başlandıktan sonra siparişten tek taraflı vazgeçilemez veya iade talep edilemez.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-[#1B2A4A]">8. Mücbir Sebepler ve Sorumluluğun Sınırlandırılması</h3>
          <p className="text-xs sm:text-sm">
            Deprem, yangın, sel, salgın hastalık, hammadde tedarik ambargoları veya kargo grevleri gibi Safirya&apos;nın kontrolü dışında gelişen mücbir sebep hallerinde teslimat süreleri mücbir sebebin devamı süresince uzayabilir. Safirya bu gecikmelerden ötürü tazminatla sorumlu tutulamaz.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-[#1B2A4A]">9. Yürürlük ve Yetkili Mahkeme</h3>
          <p className="text-xs sm:text-sm">
            İşbu Kullanım Koşulları Türkiye Cumhuriyeti Hukuku&apos;na tabidir. Kullanım Koşulları&apos;ndan doğabilecek her türlü ihtilafın çözümünde <strong>İstanbul Anadolu Mahkemeleri ve İcra Daireleri</strong> münhasıran yetkilidir.
          </p>
        </section>
      </div>
    ),
  },

  'mesafeli-satis-sozlesmesi': {
    title: 'Mesafeli Satış Sözleşmesi',
    subtitle: '6502 Sayılı Tüketicinin Korunması Hakkında Kanun ve Yönetmelik Uyarınca E-Ticaret Sözleşmesi',
    metaDescription:
      'safirya.tr Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Formu: Satıcı ve alıcı hakları, sipariş teslimat kuralları, cayma hakkı ve yasal şartlar.',
    content: (
      <div className="space-y-8 text-sm sm:text-base text-[#1B2A4A]/80 leading-relaxed">
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D9] text-xs space-y-1">
          <strong className="text-[#1B2A4A] block font-bold">Yasal Bilgilendirme:</strong>
          <p>
            İşbu sözleşme, ALICI&apos;nın safirya.tr internet sitesi üzerinden elektronik ortamda sipariş vermesi ve ödemeyi onaylamasıyla birlikte taraflar arasında akdedilmiş sayılır.
          </p>
        </div>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-[#1B2A4A]">MADDE 1 - TARAFLAR</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
            <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E8E2D9] space-y-1">
              <strong className="text-[#D96B27] block font-bold">1.1. SATICI BİLGİLERİ:</strong>
              <p><strong>Ünvan:</strong> Safirya El Yapımı Tasarım Atölyesi</p>
              <p><strong>Web Sitesi:</strong> https://safirya.tr</p>
              <p><strong>Adres:</strong> Caferağa Mah. Şair Nefi Sk. No:18 Kadıköy / İstanbul</p>
              <p><strong>Telefon:</strong> +90 (212) 555 7234</p>
              <p><strong>WhatsApp:</strong> +90 (532) 555 7234</p>
              <p><strong>E-Posta:</strong> destek@safirya.tr</p>
            </div>
            <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E8E2D9] space-y-1">
              <strong className="text-[#16A34A] block font-bold">1.2. ALICI (TÜKETİCİ) BİLGİLERİ:</strong>
              <p>safirya.tr web sitesi üzerinden elektronik ortamda siparişi oluşturan ve sipariş formunda adı-soyadı, teslimat adresi, fatura adresi ve iletişim bilgileri kayıt altına alınan gerçek veya tüzel kişi.</p>
            </div>
          </div>
        </section>

        <section className="space-y-2 text-xs sm:text-sm">
          <h3 className="text-base font-bold text-[#1B2A4A]">MADDE 2 - SÖZLEŞMENİN KONUSU</h3>
          <p>
            İşbu Sözleşme&apos;nin konusu, ALICI&apos;nın SATICI&apos;ya ait <strong>https://safirya.tr</strong> internet sitesinden elektronik ortamda siparişini yaptığı, sitede ve faturada temel nitelikleri ve satış fiyatı belirtilen el yapımı tasarım ürününün satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve 29188 sayılı Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.
          </p>
        </section>

        <section className="space-y-2 text-xs sm:text-sm">
          <h3 className="text-base font-bold text-[#1B2A4A]">MADDE 3 - SÖZLEŞME KONUSU ÜRÜN, FİYAT VE ÖDEME KOŞULLARI</h3>
          <p>
            Sözleşme konusu malın veya hizmetin temel nitelikleri (türü, adedi, seçilen koku notaları, kişiselleştirme etiket metni, kurdele rengi vb.), satış bedeli ve kargo ücreti sipariş özeti ekranında ve ALICI&apos;ya gönderilen sipariş teyit e-postasında açıkça belirtilmiştir.
          </p>
          <p>
            Ödeme Yöntemi: 256-Bit SSL şifrelemeyle korunan Kredi Kartı / Banka Kartı (İyzico lisanslı ödeme altyapısı) veya SATICI&apos;nın resmi banka hesabına Havale / EFT ile gerçekleştirilir.
          </p>
          <p>
            Kargo Ücreti: Sitede ilan edilen sepet tutarı (örneğin ₺500 ve üzeri) aşıldığında kargo ücreti SATICI tarafından karşılanır; kampanya eşiği altındaki siparişlerde kargo bedeli sipariş anında faturaya eklenir ve ALICI tarafından ödenir.
          </p>
        </section>

        <section className="space-y-2 text-xs sm:text-sm">
          <h3 className="text-base font-bold text-[#1B2A4A]">MADDE 4 - TESLİMAT VE İFA ŞARTLARI</h3>
          <p>
            <strong>4.1.</strong> Sözleşme konusu ürün, yasal 30 (otuz) günlük azami süreyi aşmamak koşuluyla, ALICI&apos;nın sipariş formunda belirttiği teslimat adresine anlaşmalı kargo firması aracılığıyla teslim edilir.
          </p>
          <p>
            <strong>4.2.</strong> Standart koleksiyon ürünleri atölyemizden 1-3 iş günü içinde kargoya verilir. Söz, nişan ve kurumsal toplu siparişlerde hazırlık süresi bareme ve ürün detayına göre belirlenir.
          </p>
          <p>
            <strong>4.3.</strong> Kargo teslimatı esnasında ALICI&apos;nın adresinde bulunmaması durumunda SATICI edimini tam ve eksiksiz yerine getirmiş kabul edilir; bu nedenle oluşabilecek gecikmelerden SATICI sorumlu tutulamaz.
          </p>
        </section>

        <section className="space-y-2 text-xs sm:text-sm">
          <h3 className="text-base font-bold text-[#1B2A4A]">MADDE 5 - CAYMA HAKKI</h3>
          <p>
            <strong>5.1.</strong> ALICI, standart koleksiyon kapsamındaki ürünlerde, malın kendisine veya gösterdiği adresteki kişiye teslim tarihinden itibaren <strong>14 (on dört) gün</strong> içerisinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir.
          </p>
          <p>
            <strong>5.2.</strong> Cayma hakkının kullanılması için 14 günlük süre içinde SATICI&apos;ya <strong>destek@safirya.tr</strong> adresine e-posta ile veya yazılı olarak bildirimde bulunulması şarttır.
          </p>
          <p>
            <strong>5.3.</strong> Cayma hakkı kullanılan ürün, bildirimi takip eden 10 gün içinde orijinal ambalajı, kraft kutusu ve tüm aksesuarlarıyla birlikte eksiksiz olarak anlaşmalı kargo firmasıyla SATICI&apos;ya gönderilmelidir. Cayma hakkı kapsamındaki iade kargo bedeli SATICI&apos;ya aittir.
          </p>
          <p>
            <strong>5.4.</strong> Cayma bildiriminin ve iade edilen ürünün SATICI&apos;ya ulaşmasını takip eden en geç 14 gün içinde ürün bedeli, ALICI&apos;nın ödeme yaptığı araca uygun olarak kesintisiz iade edilir.
          </p>
        </section>

        <section className="space-y-2 text-xs sm:text-sm">
          <h3 className="text-base font-bold text-[#1B2A4A]">MADDE 6 - CAYMA HAKKININ KULLANILAMAYACAĞI İSTİSNAİ HALLER</h3>
          <p>
            Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesi uyarınca aşağıdaki ürünlerde ALICI cayma hakkını <strong>kullanamaz</strong>:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>
              <strong>Kişiye Özel Hazırlanan Ürünler:</strong> ALICI&apos;nın istekleri veya kişisel ihtiyaçları doğrultusunda üzerine isim, baş harf, tarih, özel metin baskısı yapılan veya özel renk dökülen tasarımlar,
            </li>
            <li>
              <strong>Toplu Etkinlik Siparişleri:</strong> Söz, nişan, nikah, düğün, kına, baby shower ve kurumsal etkinlikler için müşteriye özel adet baremleriyle toplu döküm yapılan hediyelikler,
            </li>
            <li>
              <strong>Açılmış Mum ve Kokulu Taşlar:</strong> Koruyucu ambalajı, fitil emniyet mührü açılmış, yakılmış, kokulandırılmış veya kullanılmış olan ürünler (hijyen ve sağlık gereği).
            </li>
          </ul>
        </section>

        <section className="space-y-2 text-xs sm:text-sm">
          <h3 className="text-base font-bold text-[#1B2A4A]">MADDE 7 - KARGODA HASAR GÖREN ÜRÜNLER</h3>
          <p>
            Safirya atölyesi darbe emici özel ambalajlama ile &quot;Hasarsız Teslimat Garantisi&quot; sunar. ALICI, teslimat anında kargo paketinde hasar, yırtılma, ıslanma veya kırılma görürse paketi teslim almayarak kargo kuryesine <strong>&quot;Hasar Tespit Tutanağı&quot;</strong> tutturmalıdır. Tutanağın fotoğrafı <a href="mailto:destek@safirya.tr" className="text-[#D96B27] font-semibold underline">destek@safirya.tr</a> adresine iletildiğinde ürün atölyemizde derhal ücretsiz yeniden üretilerek ALICI&apos;ya sevk edilir.
          </p>
        </section>

        <section className="space-y-2 text-xs sm:text-sm">
          <h3 className="text-base font-bold text-[#1B2A4A]">MADDE 8 - GENEL HÜKÜMLER VE ZANAAT TOLERANSI</h3>
          <p>
            ALICI, sitede satılan ürünlerin %100 doğal bitkisel soya vaksı, doğal ceviz kütüğü ve el dokuması Miyuki boncuktan üretildiğini bilir. Malzemenin doğası gereği ahşap damar farklılıkları, doğal soya kristallenmesi veya boncuk dizilim organik nüansları kusur teşkil etmez; el yapımı zanaatin doğal karakteridir.
          </p>
        </section>

        <section className="space-y-2 text-xs sm:text-sm">
          <h3 className="text-base font-bold text-[#1B2A4A]">MADDE 9 - GİZLİLİK VE GÜVENLİK</h3>
          <p>
            SATICI, ALICI&apos;nın sipariş sürecinde bildirdiği kişisel verileri 6698 sayılı KVKK ve safirya.tr Gizlilik Politikası&apos;na uygun olarak saklamayı ve üçüncü şahıslara aktarmamayı taahhüt eder. Kredi kartı bilgileri 256-Bit SSL şifrelemeyle doğrudan lisanslı ödeme kuruluşuna iletilir ve sunucularda saklanmaz.
          </p>
        </section>

        <section className="space-y-2 text-xs sm:text-sm">
          <h3 className="text-base font-bold text-[#1B2A4A]">MADDE 10 - MÜCBİR SEBEPLER</h3>
          <p>
            Sözleşmenin akdedildiği tarihte öngörülemeyen ve tarafların kontrolü dışında gelişen deprem, yangın, sel, salgın hastalık veya kargo grevleri gibi mücbir sebeplerden ötürü edimler gecikirse taraflar kusurlu sayılamaz. Bu durumda ALICI siparişi iptal etme veya mücbir sebebin sona ermesini bekleme hakkına sahiptir.
          </p>
        </section>

        <section className="space-y-2 text-xs sm:text-sm">
          <h3 className="text-base font-bold text-[#1B2A4A]">MADDE 11 - UYUŞMAZLIKLARIN ÇÖZÜMÜ</h3>
          <p>
            İşbu sözleşmeden doğan uyuşmazlıklarda, T.C. Ticaret Bakanlığı tarafından her yıl ilan edilen parasal sınırlar dahilinde ALICI&apos;nın yerleşim yerindeki <strong>İl veya İlçe Tüketici Hakem Heyetleri</strong>, bu değerin üzerindeki uyuşmazlıklarda ise <strong>Tüketici Mahkemeleri</strong> yetkilidir. Tüketici Mahkemesi bulunmayan yerlerde Asliye Hukuk Mahkemeleri görevlidir.
          </p>
        </section>

        <section className="space-y-2 text-xs sm:text-sm">
          <h3 className="text-base font-bold text-[#1B2A4A]">MADDE 12 - YÜRÜRLÜK</h3>
          <p>
            ALICI, safirya.tr internet sitesi üzerinden siparişini verdiğinde ve ödemesini gerçekleştirdiğinde işbu 12 maddeden oluşan Mesafeli Satış Sözleşmesi&apos;nin tüm koşullarını eksiksiz okuduğunu, anladığını ve elektronik ortamda kabul ettiğini beyan ve taahhüt eder.
          </p>
        </section>
      </div>
    ),
  },

  iletisim: {
    title: 'İletişim & Atölye Ziyareti',
    subtitle: 'Bir Kahve Eşliğinde Kadıköy Atölyemizi Ziyaret Edin',
    metaDescription:
      'Safirya Kadıköy tasarım atölyesi adresi, telefon, e-posta, çalışma saatleri ve hızlı iletişim formu.',
    content: (
      <div className="space-y-10">
        <p className="text-sm sm:text-base text-[#1B2A4A]/80 leading-relaxed">
          Söz, nişan ve etkinlik hediyeliklerinizi birebir numuneler üzerinden incelemek, koku notalarını koklamak veya özel bir tasarım projenizi konuşmak için Kadıköy Moda paralelindeki atölyemize her zaman bekleriz.
        </p>

        {/* 4 Ana Bilgi Kartı */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="https://maps.google.com/?q=Caferaga+Mah+Sair+Nefi+Sk+No:18+Kadikoy+Istanbul"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#FAF8F5] p-5 rounded-xs border border-stone-200 hover:border-[#231B18] transition group block"
          >
            <div className="flex items-center justify-between text-[#231B18] mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#231B18]" />
                <h4 className="font-serif text-sm font-normal text-[#231B18] group-hover:text-[#C85A32] transition">
                  Atölye Adresi
                </h4>
              </div>
              <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-[#231B18] transition" />
            </div>
            <p className="text-xs sm:text-sm text-[#7A7067] leading-relaxed">
              Caferağa Mah. Şair Nefi Sk. No:18 Kadıköy / İstanbul (Moda Caddesi Paraleli)
            </p>
            <span className="text-[11px] uppercase tracking-wider font-medium text-[#231B18] mt-2 inline-block">
              Haritada Gör →
            </span>
          </a>

          <div className="bg-[#FAF8F5] p-5 rounded-xs border border-stone-200 space-y-2">
            <div className="flex items-center gap-2 text-[#231B18] mb-1">
              <Phone className="w-5 h-5 text-[#231B18]" />
              <h4 className="font-serif text-sm font-normal text-[#231B18]">Telefon & WhatsApp</h4>
            </div>
            <p className="text-xs sm:text-sm text-[#7A7067] leading-relaxed">
              Müşteri Hizmetleri:{' '}
              <a href="tel:+902125557234" className="font-medium text-[#231B18] hover:text-[#C85A32]">
                +90 (212) 555 7234
              </a>
              <br />
              WhatsApp Hızlı Sipariş:{' '}
              <a
                href="https://wa.me/905325557234"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#15803D] hover:underline"
              >
                +90 (532) 555 7234
              </a>
            </p>
            <a
              href="https://wa.me/905325557234"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-[#231B18] text-white text-[11px] uppercase tracking-wider font-medium hover:bg-[#3A2E29] transition mt-1"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp ile Yazın</span>
            </a>
          </div>

          <div className="bg-[#FAF8F5] p-5 rounded-xs border border-stone-200 space-y-2">
            <div className="flex items-center gap-2 text-[#231B18] mb-1">
              <Mail className="w-5 h-5 text-[#231B18]" />
              <h4 className="font-serif text-sm font-normal text-[#231B18]">E-Posta</h4>
            </div>
            <p className="text-xs sm:text-sm text-[#7A7067] leading-relaxed">
              Genel Bilgi:{' '}
              <a href="mailto:destek@safirya.tr" className="font-medium text-[#231B18] hover:text-[#C85A32]">
                destek@safirya.tr
              </a>
              <br />
              Kurumsal & Toptan:{' '}
              <a href="mailto:toptan@safirya.tr" className="font-medium text-[#231B18] hover:text-[#C85A32]">
                toptan@safirya.tr
              </a>
            </p>
          </div>

          <div className="bg-[#FAF8F5] p-5 rounded-xs border border-stone-200 space-y-2">
            <div className="flex items-center gap-2 text-[#231B18] mb-1">
              <Clock className="w-5 h-5 text-[#231B18]" />
              <h4 className="font-serif text-sm font-normal text-[#231B18]">Çalışma Saatleri</h4>
            </div>
            <p className="text-xs sm:text-sm text-[#7A7067] leading-relaxed">
              Pazartesi - Cumartesi: 10:00 - 19:00
              <br />
              Pazar: Atölyemiz dinlenme günündedir.
            </p>
          </div>
        </div>

        {/* İnteraktif İletişim Formu */}
        <div className="pt-4">
          <ContactForm />
        </div>
      </div>
    ),
  },
};

// Sayfa Başlığı ve Meta Açıklaması
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const canonicalSlug = slugAliases[slug] || slug;
  const page = pagesContent[canonicalSlug];

  if (!page) {
    return {
      title: 'Sayfa Bulunamadı',
    };
  }

  const canonicalUrl = `/sayfa/${canonicalSlug}`;

  return {
    title: page.title,
    description: page.metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${page.title} | Safirya Atölye`,
      description: page.metaDescription,
      url: canonicalUrl,
    },
  };
}

export default async function CmsPageRoute({ params }: Props) {
  const { slug } = await params;
  const canonicalSlug = slugAliases[slug] || slug;
  const page = pagesContent[canonicalSlug];

  if (!page) {
    notFound();
  }

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Anasayfa', item: '/' },
    { name: 'Kurumsal', item: '/sayfa/hakkimizda' },
    { name: page.title, item: `/sayfa/${canonicalSlug}` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <DynamicCmsPage
        slug={canonicalSlug}
        defaultTitle={page.title}
        defaultSubtitle={page.subtitle}
        defaultContent={page.content}
      />
    </>
  );
}
