import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSessionServer } from '@/lib/adminAuth';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        variants: true,
        bulkTiers: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    // Veritabanı henüz bağlı değilse boş dizi veya hata mesajı
    return NextResponse.json(
      { success: false, message: 'Veritabanı bağlantısı henüz yapılandırılmadı.', data: [] },
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSessionServer();
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Yetkisiz erişim. Ürün eklemek için yönetici girişi gereklidir.' },
        { status: 401 }
      );
    }
    const body = await request.json();
    const {
      name,
      slug,
      shortDesc,
      description,
      sku,
      barcode,
      price,
      discountRate = 0,
      preparationDays = 3,
      isCustomizable = false,
      inStock = true,
      stockQuantity = 50,
      isFeatured = false,
      isBestSeller = false,
      isActive = true,
      images = [],
      scentNotes = [],
      colorOptions = [],
      categoryId,
      categoryName,
    } = body;

    if (!name || !sku) {
      return NextResponse.json(
        { success: false, message: 'Ürün adı ve stok kodu (SKU) zorunludur.' },
        { status: 400 }
      );
    }

    // Prisma veritabanı denemesi
    try {
      // Eğer categoryId yoksa kategori adına göre bul ya da oluştur
      let finalCategoryId = categoryId;
      if (!finalCategoryId && categoryName) {
        const cat = await prisma.category.findFirst({
          where: { name: categoryName },
        });
        if (cat) finalCategoryId = cat.id;
      }

      if (finalCategoryId) {
        const newProduct = await prisma.product.create({
          data: {
            name,
            slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            shortDesc,
            description: description || name,
            sku,
            barcode,
            netPrice: price,
            discountRate: Number(discountRate),
            preparationDays: Number(preparationDays),
            isCustomizable: Boolean(isCustomizable),
            inStock: Boolean(inStock),
            stockQuantity: Number(stockQuantity),
            isFeatured: Boolean(isFeatured),
            isBestSeller: Boolean(isBestSeller),
            isActive: Boolean(isActive),
            images,
            scentNotes,
            colorOptions,
            categoryId: finalCategoryId,
          },
        });

        return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
      }
    } catch {
      // Prisma başarısız olursa istemci tarafı context'i çalışmaya devam eder
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Ürün yerel hafızaya kaydedildi.',
        data: {
          id: `prod-${Date.now()}`,
          name,
          slug,
          sku,
          price,
          images,
          stockQuantity,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Ürün kaydedilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
