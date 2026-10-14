'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Props {
  slug: string;
  defaultTitle: string;
  defaultSubtitle: string;
  defaultContent: React.ReactNode;
}

export function DynamicCmsPage({
  slug,
  defaultTitle,
  defaultSubtitle,
  defaultContent,
}: Props) {
  const [data] = useState<{
    title: string;
    subtitle: string;
    customHtml: string | null;
  }>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('safirya_cms_pages');
        if (saved) {
          const pages = JSON.parse(saved);
          if (pages && pages[slug]) {
            const page = pages[slug];
            let customHtml: string | null = null;
            if (page.content) {
              const html = page.content
                .replace(/^### (.*$)/gim, '<h3 class="font-serif text-lg font-normal text-[#231B18] pt-4 mb-2">$1</h3>')
                .replace(/^## (.*$)/gim, '<h2 class="font-serif text-xl font-normal text-[#231B18] pt-6 mb-3 border-b border-stone-200 pb-2">$1</h2>')
                .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
                .replace(/\*(.*)\*/gim, '<em>$1</em>')
                .replace(/^- (.*$)/gim, '<li class="ml-5 list-disc text-[#7A7067] my-1">$1</li>')
                .replace(/\n\n/gim, '</p><p class="mt-4 text-[#7A7067] leading-relaxed">')
                .replace(/\n$/gim, '<br />');

              customHtml = `<p class="text-[#7A7067] leading-relaxed">${html}</p>`;
            }
            return {
              title: page.title || defaultTitle,
              subtitle: page.subtitle || defaultSubtitle,
              customHtml,
            };
          }
        }
      } catch {}
    }
    return { title: defaultTitle, subtitle: defaultSubtitle, customHtml: null };
  });

  return (
    <div className="bg-white min-h-[70vh] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#7A7067] hover:text-[#231B18] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>

        <div className="bg-white rounded-xs border border-stone-200 p-6 sm:p-12">
          <div className="border-b border-stone-200 pb-8 mb-8">
            <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-[#7A7067]">
              Safirya Kurumsal
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#231B18] mt-1">
              {data.title}
            </h1>
            {data.subtitle && (
              <p className="text-sm text-[#7A7067] mt-2 font-normal">
                {data.subtitle}
              </p>
            )}
          </div>

          <div>
            {data.customHtml ? (
              <div
                className="prose prose-sm sm:prose-base max-w-none text-[#7A7067] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: data.customHtml }}
              />
            ) : (
              defaultContent
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
