import type { Metadata, Viewport } from "next"
import "./globals.css"
import LenisScroll from "@/app/components/LenisScroll"
import Header from "@/app/components/Header"
import PageTransition from "@/app/components/PageTransition"
import ScrollProgress from "@/app/components/ScrollProgress"
import YearStamp from "@/app/components/YearStamp"
import AdaptiveChrome from "@/app/components/AdaptiveChrome"
import DynamicCursor from "@/app/components/DynamicCursor"
import Loader from "@/app/components/Loader"
import { SITE_URL } from "@/app/lib/site"

export const metadata: Metadata = {
  /* Basis voor alle relatieve OG/canonical-URL's (en nodig om de
     "metadataBase not set" warning + localhost-URL's in social
     previews te voorkomen). */
  metadataBase: new URL(SITE_URL),
  title: {
    default: "V Creative · Content en strategie",
    template: "%s · V Creative",
  },
  description:
    "Vienna helpt ondernemers en merken hun verhaal vertalen naar content die werkt. Strategie, fotografie en maandelijks contentbeheer vanuit Heerlen.",
  keywords: [
    "social media",
    "content creatie",
    "social media beheer",
    "Heerlen",
    "fotografie",
    "Vienna",
    "V-Creative",
  ],
  authors: [{ name: "Vienna Wachelder" }],
  openGraph: {
    title: "V-Creative · Social media partner voor merken met karakter",
    description: "Jij runt je bedrijf, ik regel je socials.",
    locale: "nl_NL",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "V-Creative",
    description: "Jij runt je bedrijf, ik regel je socials.",
    images: ["/og-image.jpg"],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  /* Site-cream so the iOS Safari top status-bar + bottom toolbar tint to
     match the page instead of a near-white bar that reads as off/transparent. */
  themeColor: "#faf8f2",
}

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <html lang="nl">
      <head>
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://use.typekit.net/uvq1lml.css" />
      </head>
      <body>
        <LenisScroll />
        <Header />
        {children}
        <YearStamp />
        <ScrollProgress />
        <AdaptiveChrome />
        <DynamicCursor />
        <PageTransition />
        <Loader />
      </body>
    </html>
  )
}

export default RootLayout
