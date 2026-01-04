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
  themeColor: "#2791e7", // Updated to new primary
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${splineSans.variable} ${notoSans.variable} antialiased`}>
        <div className="container">
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  );
}
