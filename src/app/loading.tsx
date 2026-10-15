import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 bg-white">
      <div className="flex flex-col items-center space-y-4 max-w-sm w-full text-center">
        {/* Animated Brand Sparkle Loader */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-stone-200 flex items-center justify-center shadow-xs animate-pulse">
            <Sparkles className="w-7 h-7 text-[#C85A32] animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          <div className="absolute -inset-1 rounded-full bg-[#C85A32]/10 blur-xs -z-10 animate-ping opacity-25" />
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#C85A32] block mb-1">
            Zanaat &amp; Atölye
          </span>
          <h3 className="font-serif text-xl font-normal text-[#231B18] tracking-wide">
            Safirya Atölyesi
          </h3>
          <p className="text-xs text-[#7A7067] mt-1">
            El emeği tasarımlar hazırlanıyor...
          </p>
        </div>

        {/* Skeleton lines preview */}
        <div className="w-full space-y-2 pt-2">
          <div className="h-1.5 bg-stone-100 rounded-full w-3/4 mx-auto animate-pulse" />
          <div className="h-1.5 bg-stone-100/60 rounded-full w-1/2 mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  );
}
