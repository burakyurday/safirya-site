import { NextRequest, NextResponse } from 'next/server';
import { verifyPaytrCallback } from '@/lib/paytr';
import { supabaseAdmin } from '@/lib/supabase';
import { generateSafiryaEmailHtml } from '@/lib/notifications/email';
import { sendEmail } from '@/lib/email/sender';

export const dynamic = 'force-dynamic';

const BUCKET_NAME = 'safirya-media';

export async function POST(req: NextRequest) {
  try {
    // 1. PayTR'den gelen form-urlencoded verisini oku
    const rawText = await req.text();
    const params = new URLSearchParams(rawText);
    const body: Record<string, string> = {};

    params.forEach((value, key) => {
      body[key] = value;
    });

    // 2. Hash ve Güvenlik Doğrulaması
    const verification = verifyPaytrCallback(body);

    if (!verification.isValid) {
      console.error('PAYTR CALLBACK HASH UYUMSUZLUĞU!', {
        receivedHash: body.hash,
        orderNumber: body.merchant_oid,
      });
      return new NextResponse('PAYTR BAD HASH', { status: 400 });
    }

    const { orderNumber, status, totalAmountKurus, failedReasonMsg } = verification;

    // 3. Başarılı Ödeme İşleme
    if (status === 'success') {
      let orderData: any = null;

      // Bekleyen siparişi Supabase Storage'dan çek
      if (supabaseAdmin) {
        try {
          const pendingPath = `orders/pending/${orderNumber}.json`;
          const { data, error } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .download(pendingPath);

          if (!error && data) {
            const text = await data.text();
            orderData = JSON.parse(text);
          }
        } catch (downloadErr) {
          console.warn('Pending order download error:', downloadErr);
        }

        // Mükerrer PayTR çağrısını kontrol et: sipariş zaten tamamlandıysa e-posta göndermeden hemen OK dön
        try {
          const completedPath = `orders/completed/${orderNumber}.json`;
          const { data: alreadyDone } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .download(completedPath);
          if (alreadyDone || orderData?.paymentStatus === 'ODENDI') {
            console.log(`[PayTR Callback] #${orderNumber} nolu sipariş zaten önceden işlenmiş. Mükerrer e-posta engellendi.`);
            return new NextResponse('OK', {
              status: 200,
              headers: { 'Content-Type': 'text/plain' },
            });
          }
        } catch {}
      }

      // Sipariş verisini tamamlandı olarak güncelle
      const completedOrder = {
        ...(orderData || {}),
        orderNumber,
        paymentStatus: 'ODENDI',
        paymentMethod: 'PAYTR_KREDI_KARTI',
        stage: 'SIPARIS_ALINDI',
        paidAmountTL: totalAmountKurus / 100,
        paidAt: new Date().toISOString(),
      };

      // Tamamlanan siparişi buluta kalıcı olarak kaydet
      if (supabaseAdmin) {
        try {
          const completedPath = `orders/completed/${orderNumber}.json`;
          const payload = Buffer.from(JSON.stringify(completedOrder, null, 2), 'utf-8');
          await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .upload(completedPath, payload, {
              contentType: 'application/json',
              upsert: true,
            });

          // Toplu sipariş listesini (orders/all.json) de güncelle
          try {
            const allPath = 'orders/all.json';
            const { data: allData } = await supabaseAdmin.storage
              .from(BUCKET_NAME)
              .download(allPath);
            let ordersList: any[] = [];
            if (allData) {
              const text = await allData.text();
              ordersList = JSON.parse(text);
            }
            // Başa ekle veya güncelle
            const existingIndex = ordersList.findIndex((o) => o.orderNumber === orderNumber);
            if (existingIndex >= 0) {
              ordersList[existingIndex] = completedOrder;
            } else {
              ordersList.unshift(completedOrder);
            }
            await supabaseAdmin.storage.from(BUCKET_NAME).upload(
              allPath,
              Buffer.from(JSON.stringify(ordersList, null, 2), 'utf-8'),
              { contentType: 'application/json', upsert: true }
            );
          } catch {}
        } catch (saveErr) {
          console.error('Completed order save error:', saveErr);
        }
      }

      // Müşteriye Sipariş Onay E-postası Gönder (Resend / SMTP)
      if (completedOrder.email) {
        try {
          const emailHtml = generateSafiryaEmailHtml({
            to: completedOrder.email,
            customerName: completedOrder.customerName || 'Değerli Müşterimiz',
            orderNumber,
            stageName: 'Siparişiniz Alındı & Ödeme Onaylandı',
            caption: `₺${(totalAmountKurus / 100).toFixed(2)} tutarındaki ödemeniz PayTR 3D Secure güvencesiyle başarıyla alındı. Atölye ustalarımız siparişinizi özenle hazırlamaya başladı.`,
          });

          await sendEmail({
            to: completedOrder.email,
            subject: `Siparişiniz Alındı! #${orderNumber} - Safirya Atölye`,
            html: emailHtml,
            from: process.env.SMTP_FROM || 'Safirya Atölyesi <bildirim@safirya.tr>',
          });
        } catch (emailErr) {
          console.warn('PayTR order confirmation email error:', emailErr);
        }
      }

      console.log(`✓ PayTR Başarılı Ödeme: ${orderNumber} - ₺${totalAmountKurus / 100}`);
    } else {
      // Başarısız Ödeme
      console.warn(`✕ PayTR Başarısız Ödeme: ${orderNumber} - Sebep: ${failedReasonMsg}`);
      if (supabaseAdmin) {
        try {
          const failedPath = `orders/failed/${orderNumber}.json`;
          const payload = Buffer.from(
            JSON.stringify(
              {
                orderNumber,
                status: 'failed',
                failedReasonMsg,
                failedAt: new Date().toISOString(),
                rawBody: body,
              },
              null,
              2
            ),
            'utf-8'
          );
          await supabaseAdmin.storage.from(BUCKET_NAME).upload(failedPath, payload, {
            contentType: 'application/json',
            upsert: true,
          });
        } catch {}
      }
    }

    // 4. PayTR'ye Kesinlikle "OK" yanıtı dönülmelidir
    // (PayTR bu cevabı alamazsa ödemeyi onaylamaz ve periyodik olarak tekrar çağrı yapar)
    return new NextResponse('OK', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (error: any) {
    console.error('PayTR Callback Error:', error);
    // Hata durumunda dahi PayTR döngüye girmesin diye loglayıp OK dönebiliriz veya 500 dönebiliriz
    return new NextResponse(error?.message || 'Server Error', { status: 500 });
  }
}
