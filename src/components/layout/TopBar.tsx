import React from 'react';
import { SystemSettingsData } from '@/lib/settings';

interface TopBarProps {
  settings: SystemSettingsData;
}

export function TopBar({ settings }: TopBarProps) {
  if (!settings.isAnnouncementActive) return null;

  const threshold = settings.freeShippingThreshold || 500;
  const primaryText = settings.announcementText || `${threshold}TL Ve Üzeri Alışverişlerinizde Kargo Bedava!`;
  const secondaryText = settings.brandTagline || 'Hayatınıza keyif katan ürünler tasarlıyoruz.';

  return (
    <div className="bg-[#FEF5C8] text-[#231B18] py-2 px-4 border-b border-[#F5E898] transition-all">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center space-y-0.5">
        <div className="text-[12px] sm:text-[13px] font-medium tracking-wide text-[#231B18]">
          {primaryText}
        </div>
        <div className="text-[10px] sm:text-[11px] text-[#554D46] tracking-wider">
          {secondaryText}
        </div>
      </div>
    </div>
  );
}
