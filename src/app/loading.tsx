import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
      <div className="flex flex-col items-center space-y-4 max-w-sm w-full text-center">
        {/* Animated Brand Sparkle Loader */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF4EC] border-2 border-[#D96B27]/40 flex items-center justify-center shadow-md animate-pulse">
            <Sparkles className="w-8 h-8 text-[#D96B27] animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-[#D96B27]/20 blur-sm -z-10 animate-ping opacity-30" />
        </div>

        <div>
          <h3 className="text-base font-extrabold text-[#1B2A4A] tracking-wide">
            Safirya Atölyesi
          </h3>
          <p className="text-xs text-[#1B2A4A]/60 mt-1">
            El emeği tasarımlar yükleniyor...
          </p>
        </div>

        {/* Skeleton lines preview */}
        <div className="w-full space-y-2 pt-4">
          <div className="h-2 bg-[#E8E2D9]/70 rounded-full w-3/4 mx-auto animate-pulse" />
          <div className="h-2 bg-[#E8E2D9]/40 rounded-full w-1/2 mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  );
}
