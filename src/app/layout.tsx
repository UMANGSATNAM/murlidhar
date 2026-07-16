import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Murlidhar Offset — Quality Printing, Lasting Impression | Unjha, Gujarat",
  description:
    "Murlidhar Offset — premium printing press in Unjha, Gujarat. Visiting cards, letterheads, bill books, flex banners, wedding cards (kankotri), brochures, packaging & more. Konica Minolta AccurioPrint C4065 digital press.",
  keywords: [
    "printing press Unjha",
    "visiting card printing Gujarat",
    "wedding card printing kankotri",
    "offset printing Unjha",
    "business cards India",
    "flex banners",
    "Murlidhar Offset",
    "brochure printing",
    "letterhead printing",
  ],
  authors: [{ name: "Murlidhar Offset" }],
  openGraph: {
    title: "Murlidhar Offset — Quality Printing, Lasting Impression",
    description:
      "Premium printing press in Unjha, Gujarat. Visiting cards, wedding cards, brochures, banners & more.",
    siteName: "Murlidhar Offset",
    type: "website",
    locale: "en_IN",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
          <Toaster />
          <SonnerToaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
