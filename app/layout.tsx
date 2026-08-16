import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SplashScreenWrapper from "@/components/uiComponents/SplashScreenWrapper";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Sizer.io | Institutional Risk Operating System",
  description: "Calculate exact position sizing, enforce prop firm drawdown limits, and trade with mathematical confidence.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Sizer.io | Institutional Risk Operating System",
    description: "Risk Management Made Easy",
    siteName: "Sizer.io",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sizer.io",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sizer.io | Institutional Risk Operating System",
    description: "Risk Management Made Easy",
  },
};

const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('sizer-theme');
    var isDark = stored === 'dark' || (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (_) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground antialiased">
        <ThemeProvider>
          <SplashScreenWrapper>{children}</SplashScreenWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
