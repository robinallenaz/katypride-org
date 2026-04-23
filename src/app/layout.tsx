import type { Metadata } from "next";
import { EB_Garamond, Montserrat } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "600", "700"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "Katy Pride",
  description: "Katy Pride – Building community, advocating for equality, celebrating diversity.",
  metadataBase: new URL('https://katypride.org'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const givebutterAccountId = process.env.NEXT_PUBLIC_GIVEBUTTER_ACCOUNT_ID || 'gmYUd1W44Y3hdT1Q';

  return (
    <html lang="en">
      <body
        className={`${ebGaramond.variable} ${montserrat.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {givebutterAccountId && (
          <Script
            id="givebutter-widget-library"
            src={`https://widgets.givebutter.com/latest.umd.cjs?acct=${encodeURIComponent(givebutterAccountId)}`}
            strategy="afterInteractive"
          />
        )}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-gray-900 focus:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#760088]"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
