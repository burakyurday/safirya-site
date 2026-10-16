import React from 'react';
import { AdminProvider } from '@/context/AdminContext';

export default function SozlesmeOnayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminProvider>{children}</AdminProvider>;
}
