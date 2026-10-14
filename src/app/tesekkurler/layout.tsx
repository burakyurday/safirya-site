import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Siparişiniz Alındı | Teşekkür Ederiz',
  description: 'Safirya atölyesinden verdiğiniz el yapımı siparişiniz başarıyla alındı. Teşekkür ederiz.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThankYouLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
