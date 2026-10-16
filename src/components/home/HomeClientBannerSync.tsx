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

    window.addEventListener('safirya_concept_banners_updated', handleUpdate);
    window.addEventListener('safirya_products_updated', handleUpdate);

    return () => {
      window.removeEventListener('safirya_concept_banners_updated', handleUpdate);
      window.removeEventListener('safirya_products_updated', handleUpdate);
    };
  }, [router]);

  return null;
}
