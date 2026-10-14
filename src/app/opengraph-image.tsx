import { ImageResponse } from 'next/og';

export const alt = 'Safirya El Yapımı Tasarım Atölyesi';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1B2A4A',
          backgroundImage: 'radial-gradient(circle at 80% 20%, #D96B27 0%, transparent 40%), radial-gradient(circle at 20% 80%, #2A3F6D 0%, transparent 40%)',
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'rgba(217, 107, 39, 0.15)',
            border: '1px solid rgba(217, 107, 39, 0.4)',
            borderRadius: '9999px',
            padding: '10px 24px',
            marginBottom: '28px',
          }}
        >
          <span
            style={{
              color: '#FAF8F5',
              fontSize: '18px',
              fontWeight: 600,
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            KADIKÖY ATÖLYEMİZDEN %100 EL EMEĞİ ZANAAT
          </span>
        </div>

        <h1
          style={{
            fontSize: '76px',
            fontWeight: 900,
            color: '#FFFFFF',
            margin: '0',
            letterSpacing: '6px',
            textAlign: 'center',
          }}
        >
          SAFİRYA
        </h1>

        <p
          style={{
            fontSize: '26px',
            color: '#D96B27',
            fontWeight: 700,
            letterSpacing: '4px',
            textTransform: 'uppercase',
            marginTop: '8px',
            marginBottom: '32px',
          }}
        >
          El Yapımı Tasarım Atölyesi
        </p>

        <p
          style={{
            fontSize: '22px',
            color: 'rgba(250, 248, 245, 0.85)',
            maxWidth: '850px',
            textAlign: 'center',
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          Doğal Soya Mumları | Epoksi Ahşap Sunumluklar | Kokulu Taşlar | Miyuki Takılar
        </p>

        <div
          style={{
            display: 'flex',
            gap: '24px',
            marginTop: '44px',
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.75)',
            fontWeight: 600,
          }}
        >
          <span>Kişiye Özel Tasarım</span>
          <span>|</span>
          <span>Söz & Nişan Hediyelikleri</span>
          <span>|</span>
          <span>Hasarsız Teslimat</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
