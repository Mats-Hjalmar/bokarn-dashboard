import Link from 'next/link'
import { fetchPlans, fetchRateCalendar } from '@/features/rates'

const kr = (minor: number) => (minor / 100).toFixed(0)

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default async function RateCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; from?: string }>
}) {
  const { plan: requested, from: requestedFrom } = await searchParams
  const plans = await fetchPlans()

  const plan = plans.find((p) => p.id === requested) ?? plans[0]
  const from =
    requestedFrom && /^\d{4}-\d{2}-\d{2}$/.test(requestedFrom)
      ? requestedFrom
      : isoDate(new Date())

  const to = isoDate(new Date(new Date(from).getTime() + 60 * 864e5))
  const days = plan ? await fetchRateCalendar(plan.id, from, to) : []

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Prislista</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Det kompilerade priset per natt, och vilken säsong som satte det.
        </p>
      </header>

      <nav className="flex flex-wrap gap-2 text-sm">
        {plans.map((p) => (
          <Link
            key={p.id}
            href={`/priser/kalender?plan=${p.id}&from=${from}`}
            className={`rounded-md border px-3 py-1.5 ${
              p.id === plan?.id ? 'bg-muted font-medium' : 'hover:bg-muted'
            }`}
          >
            {p.category_code}
          </Link>
        ))}
      </nav>

      {days.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Inga priser är kompilerade för den här perioden.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-left">
              <tr>
                <th className="px-3 py-2 font-medium">Datum</th>
                <th className="px-3 py-2 font-medium">Pris</th>
                <th className="px-3 py-2 font-medium">Min nätter</th>
                <th className="px-3 py-2 font-medium">Säsong</th>
              </tr>
            </thead>
            <tbody>
              {days.map((d) => (
                <tr key={d.day} className="border-t">
                  <td className="px-3 py-1.5 font-mono text-xs">{d.day}</td>
                  <td className="px-3 py-1.5 font-mono">
                    {kr(d.base_minor)} kr
                  </td>
                  <td className="px-3 py-1.5">{d.min_stay}</td>
                  <td className="text-muted-foreground px-3 py-1.5">
                    {d.season_name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
