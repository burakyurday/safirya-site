'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Admin panelinde banner veya ürün güncellendiğinde
 * ana sayfa Server Component'ini otomatik olarak yeniden doğrular (refresh).
 */
export function HomeClientBannerSync() {
  const router = useRouter();

  useEffect(() => {
    const handleUpdate = () => {
      router.refresh();
    };

    // 1. Aynı pencere içi event
    window.addEventListener('safirya_concept_banners_updated', handleUpdate);
    window.addEventListener('safirya_products_updated', handleUpdate);

    // 2. Farklı sekmeler arası senkronizasyon (Admin panelinde güncellendiğinde ana sayfa anında tazelensin)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'safirya_concept_banners' || e.key === 'safirya_products') {
        router.refresh();
      }
    };
    window.addEventListener('storage', handleStorage);

    // 3. Sekmeye geri dönüldüğünde en güncel vitrini çek
    const handleFocus = () => {
      router.refresh();
    };
    window.addEventListener('focus', handleFocus);

    // 4. Mount anında: Eğer bu tarayıcıda vitrin görseli yüklenmiş ama bulutta eksik kalmışsa arka planda eşitle
    try {
      const saved = localStorage.getItem('safirya_concept_banners');
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasAnyImage = Object.values(parsed).some(
          (b: any) => Boolean(b?.imageUrl) || Boolean(b?.mobileImageUrl)
        );
        if (hasAnyImage) {
          fetch('/api/banners')
            .then((r) => r.json())
            .then((data) => {
              const cloud = data?.banners || {};
              let needsSync = false;
              for (const [k, v] of Object.entries(parsed)) {
                const item = v as any;
                const cloudItem = cloud[k] || {};
                if ((item.imageUrl && !cloudItem.imageUrl) || (item.mobileImageUrl && !cloudItem.mobileImageUrl)) {
                  needsSync = true;
                  break;
                }
              }
              if (needsSync) {
                const merged = { ...cloud, ...parsed };
                fetch('/api/banners', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ banners: merged }),
                }).then(() => {
                  router.refresh();
                }).catch(() => {});
              }
            })
            .catch(() => {});
        }
      }
    } catch {}

    return () => {
      window.removeEventListener('safirya_concept_banners_updated', handleUpdate);
      window.removeEventListener('safirya_products_updated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
    };
  }, [router]);

  return null;
}
