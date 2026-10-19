import type { Metadata } from 'next';
import './globals.scss';

export const metadata: Metadata = {
  title: 'CobblERP - Footwear Manufacturing ERP',
  description: 'Enterprise ERP & MES for Footwear Manufacturing powered by IBM Carbon Design System, NestJS, and Neon DB',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-carbon-theme="g100">
      <body>{children}</body>
    </html>
  );
}
