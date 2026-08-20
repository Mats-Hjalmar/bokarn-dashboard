import Link from 'next/link'
import { fetchPlans, SeasonEditor } from '@/features/rates'

export default async function RatesPage() {
  const plans = await fetchPlans()

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Priser</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Säsonger är det du redigerar. Prislistan räknas om automatiskt.
          </p>
        </div>
        <nav className="flex gap-2 text-sm">
          <Link
            href="/priser/kalender"
            className="hover:bg-muted rounded-md border px-3 py-1.5"
          >
            Prislista
          </Link>
          <Link
            href="/priser/simulera"
            className="hover:bg-muted rounded-md border px-3 py-1.5"
          >
            Varför detta pris?
          </Link>
        </nav>
      </header>

      {plans.map((plan) => (
        <section key={plan.id} className="flex flex-col gap-3">
          <h2 className="text-sm font-medium">
            {plan.name}
            <span className="text-muted-foreground ml-2 font-normal">
              {plan.category_code} · moms {plan.vat_code}
            </span>
          </h2>
          {plan.seasons.map((season) => (
            <SeasonEditor key={season.id} season={season} />
          ))}
        </section>
      ))}
    </div>
  )
}
