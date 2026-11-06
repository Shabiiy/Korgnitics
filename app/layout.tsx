import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kognitics.edu.in"),
  title: "Kognitics – The International School | Mysuru, India",
  description:
    "A thinking-first international school in Mysuru where curiosity grows, ideas take shape and every child is prepared for life. Cognitive excellence, character, and future-readiness.",
  keywords: [
    "Kognitics",
    "International School Mysuru",
    "Thinking First School",
    "CBSE International",
    "Best school in Mysore",
    "Child-first admissions",
  ],
  authors: [{ name: "Kognitics Educational Trust" }],
  openGraph: {
    title: "Kognitics – The International School | Mysuru",
    description:
      "Education is not about what to think. It's about how to think. Admissions open for 2026–2027.",
    url: "https://kognitics.edu.in",
    siteName: "Kognitics International School",
    images: [
      {
        url: "/assets/school_front.png",
        width: 1200,
        height: 630,
        alt: "Kognitics International School Campus, Mysuru",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kognitics – The International School",
    description: "A thinking-first school in Mysuru. Cognitive Excellence · Character · Future-Ready.",
    images: ["/assets/school_front.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Kognitics – The International School",
    description:
      "A thinking-first international school in Mysuru fostering cognitive excellence, character, and future-readiness.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Mysuru",
      addressRegion: "Karnataka",
      addressCountry: "IN",
    },
    url: "https://kognitics.edu.in",
    logo: "/assets/logo-transparent.png",
    image: "/assets/school_front.png",
    telephone: "[PHONE]",
    email: "[EMAIL]",
    openingHours: "[OFFICE HOURS]",
  };

  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-yellow-cream text-indigo-deep selection:bg-yellow-golden selection:text-indigo-deep">
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
