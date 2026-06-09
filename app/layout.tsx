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

export const metadata: Metadata = {
  title: {
    default: "V-Creative · Social media partner voor merken met karakter",
    template: "%s · V-Creative",
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
    description:
      "Strategie, fotografie en maandelijks contentbeheer voor merken die hun verhaal serieus nemen.",
    locale: "nl_NL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "V-Creative",
    description:
      "Social media partner voor merken met karakter. Vanuit Heerlen, op locatie in heel Nederland.",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  /* Site-cream so the iOS Safari top status-bar + bottom toolbar tint to
     match the page instead of a near-white bar that reads as off/transparent. */
  themeColor: "#F2EBD9",
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
