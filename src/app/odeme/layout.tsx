import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Güvenli & Hızlı Ödeme',
  description: 'Safirya üyeliksiz ve 256-Bit SSL güvencesiyle hızlı sipariş ve ödeme sayfası.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
