import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Müşteri Girişi & Kayıt',
  description: 'Safirya atölye müşteri hesabınıza giriş yapın veya yeni hesap oluşturun.',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
