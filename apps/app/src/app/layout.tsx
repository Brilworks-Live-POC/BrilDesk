import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/components/providers/auth-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'BrilDesk - WhatsApp Shared Inbox',
  description: 'Shared WhatsApp inbox for sales teams',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BrilDesk',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for (var i = 0; i < registrations.length; i++) {
                    registrations[i].unregister();
                  }
                });
                caches.keys().then(function(names) {
                  for (var i = 0; i < names.length; i++) {
                    caches.delete(names[i]);
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
