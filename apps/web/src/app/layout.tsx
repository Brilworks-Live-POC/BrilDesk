import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BrilDesk - WhatsApp Shared Inbox',
  description: 'Shared WhatsApp inbox for sales teams',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
