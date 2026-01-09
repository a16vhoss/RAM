import { Spline_Sans, Noto_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const splineSans = Spline_Sans({
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-spline'
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto'
});

export const metadata = {
  title: "RAM - Registro Animal Municipal",
  description: "Plataforma de bienestar animal",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#2791e7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${splineSans.variable} ${notoSans.variable} antialiased overflow-x-hidden`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
