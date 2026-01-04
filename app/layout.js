import { Poppins, Open_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-body",
});

export const metadata = {
  title: "Registro Animal Mundial",
  description: "El centro digital de protección, vínculo y cuidado animal",
  manifest: "/manifest.json",
  themeColor: "#1C77C3",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0", // Optimization for mobile-app feel
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${poppins.variable} ${openSans.variable}`}>
        <div className="container">
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  );
}
