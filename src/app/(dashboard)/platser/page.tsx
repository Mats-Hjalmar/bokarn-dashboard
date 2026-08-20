import { fetchCategories, fetchUnits, UnitTable } from '@/features/inventory'
import { getDictionary } from '@/lib/i18n'

const t = getDictionary()

export default async function UnitsPage() {
  const [categories, units] = await Promise.all([
    fetchCategories(),
    fetchUnits(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t.units.heading}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {units.length} {t.units.units}
        </p>
      </header>

      <section className="flex flex-wrap gap-3">
        {categories.map((c) => (
          <div key={c.id} className="rounded-lg border px-4 py-3">
            <p className="font-medium">{c.name}</p>
            <p className="text-muted-foreground text-xs">
              {c.code} · {c.units} {t.units.units} · {c.max_occupancy}{' '}
              {t.units.occupancy.toLowerCase()}
            </p>
          </div>
        ))}
      </section>

      <UnitTable units={units} />
    </div>
  )
}
