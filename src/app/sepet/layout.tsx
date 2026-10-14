import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alışveriş Sepetim',
  description: 'Safirya alışveriş sepetinizdeki el emeği tasarım ürünleri, indirimler ve hediye paketi seçenekleri.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
