import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mindraxia - La Galaxia del Conocimiento",
  description: "Bienvenido a Mindraxia, un blog donde compartimos conocimiento. Cada post es una estrella en la galaxia del aprendizaje.",
  keywords: ["blog", "conocimiento", "aprendizaje", "tecnología", "desarrollo"],
  authors: [{ name: "Mindraxia" }],
  openGraph: {
    title: "Mindraxia - La Galaxia del Conocimiento",
    description: "Bienvenido a Mindraxia, un blog donde compartimos conocimiento.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-space-dark text-text-primary`}
      >
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
