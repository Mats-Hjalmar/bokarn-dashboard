import { fetchPlans, QuoteSimulator } from '@/features/rates'

export default async function SimulatePage() {
  const plans = await fetchPlans()
  const categories = [...new Set(plans.map((p) => p.category_code))]

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Varför detta pris?
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Räknar exakt som gästsidan gör, och visar varje steg på vägen.
        </p>
      </header>

      <QuoteSimulator categories={categories} />
    </div>
  )
}
