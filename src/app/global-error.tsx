'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to console or error reporting service
    console.error('Safirya Atölyesi Global Kök Hata:', error);
  }, [error]);

  return (
    <html lang="tr">
      <head>
        <meta charSet="utf-8" />
        <title>Sistem Hatası | Safirya El Yapımı Tasarım Atölyesi</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        style={{
          margin: 0,
          padding: '24px 16px',
          backgroundColor: '#FAF8F5',
          color: '#231B18',
          fontFamily:
            '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            maxWidth: '580px',
            width: '100%',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2DCD3',
            borderRadius: '2px',
            padding: '48px 32px',
            textAlign: 'center',
            boxShadow: '0 4px 20px -2px rgba(35, 27, 24, 0.05)',
            boxSizing: 'border-box',
          }}
        >
          {/* İkon Rozeti */}
          <div
            style={{
              position: 'relative',
              display: 'inline-block',
              marginBottom: '28px',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#FAF8F5',
                border: '1px solid #E2DCD3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
              }}
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C85A32"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                padding: '2px 8px',
                borderRadius: '2px',
                backgroundColor: '#C85A32',
                color: '#FFFFFF',
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: 'monospace',
              }}
            >
              SİSTEM
            </span>
          </div>

          {/* Üst Başlık & Açıklama */}
          <div style={{ marginBottom: '32px' }}>
            <span
              style={{
                display: 'block',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.25em',
                fontWeight: 600,
                color: '#C85A32',
                marginBottom: '10px',
              }}
            >
              Safirya Tasarım Atölyesi
            </span>
            <h1
              style={{
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontSize: '32px',
                fontWeight: 500,
                color: '#231B18',
                margin: '0 0 14px 0',
                lineHeight: 1.25,
              }}
            >
              Kritik Bir Hata Meydana Geldi
            </h1>
            <p
              style={{
                fontSize: '13px',
                color: '#7A7067',
                lineHeight: 1.65,
                margin: '0 auto',
                maxWidth: '440px',
              }}
            >
              Atölye altyapımız yüklenirken ana şablonda beklenmeyen bir aksaklık oluştu. 
              Lütfen sayfayı yenilemeyi deneyin veya doğrudan ana sayfaya dönün.
            </p>
            {error?.digest && (
              <div style={{ marginTop: '14px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: '2px',
                    backgroundColor: '#FAF8F5',
                    border: '1px solid #E2DCD3',
                    color: '#7A7067',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                >
                  Referans Kodu: {error.digest}
                </span>
              </div>
            )}
          </div>

          {/* Aksiyon Butonları */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: '12px',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px 28px',
                borderRadius: '2px',
                backgroundColor: '#231B18',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              <span>Tekrar Dene</span>
            </button>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '13px 28px',
                borderRadius: '2px',
                backgroundColor: '#FFFFFF',
                color: '#231B18',
                border: '1px solid #231B18',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Anasayfaya Dön</span>
            </Link>
          </div>

          {/* Alt Atölye İmzası */}
          <div
            style={{
              marginTop: '36px',
              paddingTop: '20px',
              borderTop: '1px solid #E2DCD3',
              fontSize: '11px',
              color: '#7A7067',
              letterSpacing: '0.05em',
            }}
          >
            İzmir Karşıyaka • El Yapımı Tasarım Atölyesi
          </div>
        </div>
      </body>
    </html>
  );
}
