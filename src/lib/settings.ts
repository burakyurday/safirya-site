import prisma from '@/lib/prisma';

export interface SystemSettingsData {
  announcementText: string;
  isAnnouncementActive: boolean;
  freeShippingThreshold: number;
  giftWrapFee: number;
  storeName: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  instagramHandle: string;
  atelierAddress: string;
  exitIntentTitle: string;
  exitIntentCouponCode: string;
  logoUrl?: string;
  logoDarkUrl?: string;
  logoText?: string;
  brandTagline?: string;
}

export const defaultSettings: SystemSettingsData = {
  announcementText: '₺500 ve Üzeri Ücretsiz Kargo',
  isAnnouncementActive: true,
  freeShippingThreshold: 500,
  giftWrapFee: 30,
  storeName: 'Safirya El Yapımı Tasarım Atölyesi',
  contactEmail: 'destek@safirya.tr',
  contactPhone: '+90 (212) 555 7234',
  whatsappNumber: '+90 532 555 7234',
  instagramHandle: '@safirya.craft',
  atelierAddress: 'Caferağa Mah. Şair Nefi Sk. No:18 Kadıköy / İstanbul',
  exitIntentTitle: 'Atölyemizden Ayrılmadan Önce %10 Tanışma İndirimi!',
  exitIntentCouponCode: 'SAFIRYA10',
  logoUrl: '',
  logoDarkUrl: '',
  logoText: 'SAFİRYA',
  brandTagline: 'El Yapımı Tasarım Atölyesi',
};

export async function getSystemSettings(): Promise<SystemSettingsData> {
  // Build sırasında veya DB bağlantısı yokken güvenli fallback
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return defaultSettings;
  }

  try {
    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'safirya_config' },
    });
    if (settings) {
      return {
        announcementText: settings.announcementText,
        isAnnouncementActive: settings.isAnnouncementActive,
        freeShippingThreshold: Number(settings.freeShippingThreshold),
        giftWrapFee: Number(settings.giftWrapFee),
        storeName: settings.storeName,
        contactEmail: settings.contactEmail,
        contactPhone: settings.contactPhone,
        whatsappNumber: settings.whatsappNumber,
        instagramHandle: settings.instagramHandle,
        atelierAddress: settings.atelierAddress,
        exitIntentTitle: settings.exitIntentTitle,
        exitIntentCouponCode: settings.exitIntentCouponCode,
      };
    }
  } catch {
    // Veritabanı henüz hazır değilse varsayılan değerleri döndür
  }

  return defaultSettings;
}
