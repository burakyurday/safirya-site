import { test, expect } from '@playwright/test';

test.describe('Safirya E-Ticaret & Atölye Vitrin E2E Testleri', () => {
  test('Ana sayfa başarıyla yüklenmeli, başlık ve güven rozetleri görünmelidir', async ({ page }) => {
    await page.goto('/');

    // Başlık kontrolü
    await expect(page).toHaveTitle(/Safirya/i);

    // Güven rozetleri
    await expect(page.getByText('Kargo Hasar Garantisi')).toBeVisible();
    await expect(page.getByText('₺500 Üzeri Ücretsiz Kargo')).toBeVisible();
    await expect(page.getByText('Güvenli Ödeme Altyapısı')).toBeVisible();

    // Sıkça Sorulan Sorular bölümü
    await expect(page.getByText('Sıkça Sorulan Sorular')).toBeVisible();
  });

  test('Katalog sayfasına gidilebilmeli ve ürünler listelenmelidir', async ({ page }) => {
    await page.goto('/kategoriler');

    // Kategoriler veya filtreler görünür olmalı
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('Ürün detay sayfasında baremli fiyatlandırma ve fotoğraf yorum sistemi görünmelidir', async ({ page }) => {
    await page.goto('/urunler/dogal-kehribar-cam-kavanoz-soya-mumu');

    // Ürün başlığı
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Doğal Kehribar Cam Kavanoz');

    // Barem tablosu
    await expect(page.getByText('Adet Baremine Göre İndirimler')).toBeVisible();

    // Değerlendirmeler ve fotoğraf duvarı
    await expect(page.getByText('MÜŞTERİ DENEYİMİ')).toBeVisible();
    await expect(page.getByRole('button', { name: /Değerlendirme Yaz/i })).toBeVisible();
  });
});
