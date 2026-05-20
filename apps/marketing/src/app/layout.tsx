import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | BrilDesk',
    default: 'BrilDesk - WhatsApp Shared Inbox for Sales Teams',
  },
  description: 'Shared WhatsApp inbox for sales teams',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen bg-white">
          <header className="border-b border-gray-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <a href="/" className="text-xl font-bold text-gray-900">
                Bril<span className="text-green-600">Desk</span>
              </a>
              <nav className="hidden items-center gap-6 md:flex">
                <a href="/compare" className="text-sm text-gray-600 hover:text-gray-900">
                  Compare
                </a>
                <a
                  href="/beta"
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  Join the Beta
                </a>
              </nav>
            </div>
          </header>
          <main>{children}</main>
          <footer className="border-t border-gray-200 bg-gray-50">
            <div className="mx-auto max-w-6xl px-6 py-12">
              <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-gray-900">Product</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><a href="/inbox" className="hover:text-gray-900">Shared Inbox</a></li>
                    <li><a href="#" className="hover:text-gray-900">CRM &amp; Deals</a></li>
                    <li><a href="#" className="hover:text-gray-900">Agent Routing</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-gray-900">Compare</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><a href="/compare/brildesk-vs-wati" className="hover:text-gray-900">vs WATI</a></li>
                    <li><a href="/compare/brildesk-vs-respond-io" className="hover:text-gray-900">vs Respond.io</a></li>
                    <li><a href="/compare/brildesk-vs-trengo" className="hover:text-gray-900">vs Trengo</a></li>
                    <li><a href="/compare/brildesk-vs-interakt" className="hover:text-gray-900">vs Interakt</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-gray-900">Resources</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><a href="#" className="hover:text-gray-900">Blog</a></li>
                    <li><a href="#" className="hover:text-gray-900">Help Center</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-gray-900">Company</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><a href="#" className="hover:text-gray-900">About</a></li>
                    <li><a href="#" className="hover:text-gray-900">Contact</a></li>
                  </ul>
                </div>
              </div>
              <p className="mt-8 text-sm text-gray-500">&copy; 2026 BrilDesk. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
