import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CasePage from '@/app/cases/CasePage'
import { CASES, type CaseSlug } from '@/app/cases/caseData'

/* Alle cases worden statisch gegenereerd uit caseData.ts; onbekende
   slugs geven een 404 in plaats van een lege pagina. Case toevoegen =
   alleen een entry in caseData.ts — route + metadata volgen vanzelf. */
export const dynamicParams = false

export function generateStaticParams() {
  return Object.keys(CASES).map((slug) => ({ slug }))
}

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const data = CASES[slug as CaseSlug]
  if (!data) return {}
  const titleLine = `${data.heroTitle.script}${data.heroTitle.rest.replace(/\n/g, ' ')}`
  return {
    title: data.name,
    description: `${titleLine}. ${data.heroTags.join(' · ')}.`,
    openGraph: {
      title: data.name,
      description: titleLine,
      images: [{ url: data.heroImage }],
    },
  }
}

const Page = async ({ params }: Params) => {
  const { slug } = await params
  if (!(slug in CASES)) notFound()
  return <CasePage slug={slug as CaseSlug} />
}

export default Page
