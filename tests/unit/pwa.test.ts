import { describe, it, expect } from 'vitest';
import manifest from '@/app/manifest';
import fs from 'fs';
import path from 'path';

describe('pwa - Progressive Web App (PWA) Yapılandırması', () => {
  it('manifest() doğru PWA meta verilerini ve kimliğini döndürmelidir', () => {
    const pwaManifest = manifest();

    expect(pwaManifest.name).toContain('Safirya');
    expect(pwaManifest.short_name).toBe('Safirya');
    expect(pwaManifest.display).toBe('standalone');
    expect(pwaManifest.orientation).toBe('portrait');
    expect(pwaManifest.start_url).toContain('source=pwa');
    expect(pwaManifest.theme_color).toBe('#231B18');
    expect(pwaManifest.background_color).toBe('#FAF8F5');
    expect(pwaManifest.lang).toBe('tr');
  });

  it('manifest() 192x192, 512x512 ve maskable ikonları içermelidir', () => {
    const pwaManifest = manifest();
    const icons = pwaManifest.icons || [];

    expect(icons.length).toBeGreaterThanOrEqual(3);

    const icon192 = icons.find((i) => i.sizes === '192x192');
    expect(icon192).toBeDefined();
    expect(icon192?.src).toBe('/icons/icon-192x192.svg');

    const icon512 = icons.find((i) => i.sizes === '512x512' && i.purpose !== 'maskable');
    expect(icon512).toBeDefined();
    expect(icon512?.src).toBe('/icons/icon-512x512.svg');

    const iconMaskable = icons.find((i) => i.purpose === 'maskable');
    expect(iconMaskable).toBeDefined();
    expect(iconMaskable?.src).toBe('/icons/icon-maskable-512x512.svg');
  });

  it('hızlı erişim kısayolları (shortcuts) tanımlanmış olmalıdır', () => {
    const pwaManifest = manifest();
    const shortcuts = pwaManifest.shortcuts || [];

    expect(shortcuts.length).toBeGreaterThanOrEqual(4);

    const urls = shortcuts.map((s) => s.url);
    expect(urls).toContain('/kategoriler');
    expect(urls).toContain('/hesabim/sadakat');
    expect(urls).toContain('/siparis-takip');
    expect(urls).toContain('/sepet');
  });

  it('public/sw.js service worker dosyası mevcut ve önbellekleme kurallarına sahip olmalıdır', () => {
    const swPath = path.resolve(process.cwd(), 'public/sw.js');
    expect(fs.existsSync(swPath)).toBe(true);

    const swContent = fs.readFileSync(swPath, 'utf-8');
    expect(swContent).toContain('CACHE_NAME');
    expect(swContent).toContain('/offline');
    expect(swContent).toContain('navigate');
  });
});
