import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Favorilerim',
  description: 'Safirya atölyesinden beğendiğiniz ve daha sonra incelemek üzere kaydettiğiniz el emeği tasarımlar.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: '/favoriler',
  },
};

export default function FavoritesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
