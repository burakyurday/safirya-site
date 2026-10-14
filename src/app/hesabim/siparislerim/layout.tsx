import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Siparişlerim',
  description: 'Safirya atölye siparişlerinizin geçmişi ve üretim durumları.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
