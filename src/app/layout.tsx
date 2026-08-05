import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Economic Pattern Database",
  description: "Research database for business patterns and market observations",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="border-b bg-white">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/" className="font-semibold text-sm tracking-tight">
              Economic Pattern DB
            </Link>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Queue</Link>
              <Link href="/companies" className="hover:text-foreground transition-colors">Companies</Link>
              <Link href="/companies/new" className="bg-black text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-gray-800 transition-colors">
                + Add Company
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
