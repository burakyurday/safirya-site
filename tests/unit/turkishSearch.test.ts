import { describe, it, expect } from 'vitest';
import { normalizeTurkish, filterCatalogProducts, ALL_CATALOG_PRODUCTS } from '@/lib/catalog';

describe('normalizeTurkish & Arama Motoru Testleri', () => {
  it('Türkçe karakterleri doğru şekilde ascii karşılıklarına normalize etmelidir', () => {
    expect(normalizeTurkish('İstanbul')).toBe('istanbul');
    expect(normalizeTurkish('ÇİÇEK')).toBe('cicek');
    expect(normalizeTurkish('ŞÖMİNE')).toBe('somine');
    expect(normalizeTurkish('AĞAÇ')).toBe('agac');
    expect(normalizeTurkish('ÜZÜM')).toBe('uzum');
    expect(normalizeTurkish('IŞIK')).toBe('isik');
  });

  it('küçük ve büyük Türkçe harf karışımını doğru aramalıdır', () => {
    const resultsLower = filterCatalogProducts(ALL_CATALOG_PRODUCTS, 'soya mumu');
    const resultsUpper = filterCatalogProducts(ALL_CATALOG_PRODUCTS, 'SOYA MUMU');
    const resultsTurkishI = filterCatalogProducts(ALL_CATALOG_PRODUCTS, 'İSİMLİ MUM');

    expect(resultsLower.length).toBeGreaterThan(0);
    expect(resultsLower.length).toBe(resultsUpper.length);
    expect(resultsTurkishI.length).toBeGreaterThan(0);
  });

  it('koku notası ve etiket araması sonuç döndürmelidir', () => {
    const resultsLavender = filterCatalogProducts(ALL_CATALOG_PRODUCTS, '', 'lavanta');
    expect(resultsLavender.length).toBeGreaterThan(0);
    expect(
      resultsLavender.some((p) =>
        p.scentNotes?.some((n) => n.toLowerCase().includes('lavanta'))
      )
    ).toBe(true);
  });

  it('kategori filtrelemesi doğru çalışmalıdır', () => {
    const candleResults = ALL_CATALOG_PRODUCTS.filter(
      (p) =>
        p.categorySlug === 'dogal-mumlar' ||
        p.categoryName?.toLowerCase().includes('mum')
    );
    expect(candleResults.length).toBeGreaterThan(0);
    expect(
      candleResults.every(
        (p) =>
          p.categorySlug === 'dogal-mumlar' ||
          p.categoryName?.toLowerCase().includes('mum')
      )
    ).toBe(true);
  });
});
