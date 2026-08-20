import { getDictionary } from '@/lib/i18n'
import type { Unit } from '../types'

const t = getDictionary()

function label(map: Record<string, string>, key: string | null): string {
  if (!key) return '—'
  return map[key] ?? key
}

function features(u: Unit): string {
  const on = [
    u.accessible && t.attributes.accessible,
    u.pets_allowed && t.attributes.pets,
    u.has_water && t.attributes.water,
    u.has_greywater && t.attributes.greywater,
    u.has_sewer && t.attributes.sewer,
    u.drive_through && t.attributes.driveThrough,
    u.sanitary && t.attributes.sanitary,
    u.view && t.attributes.view,
  ].filter(Boolean)
  return on.length ? on.join(' · ') : '—'
}

export function UnitTable({ units }: { units: Unit[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-muted-foreground text-left">
          <tr>
            <th className="px-3 py-2 font-medium">{t.units.code}</th>
            <th className="px-3 py-2 font-medium">{t.units.category}</th>
            <th className="px-3 py-2 font-medium">{t.units.occupancy}</th>
            <th className="px-3 py-2 font-medium">{t.units.electricity}</th>
            <th className="px-3 py-2 font-medium">{t.units.area}</th>
            <th className="px-3 py-2 font-medium">{t.units.surface}</th>
            <th className="px-3 py-2 font-medium">{t.units.shade}</th>
            <th className="px-3 py-2 font-medium">{t.units.features}</th>
          </tr>
        </thead>
        <tbody>
          {units.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="px-3 py-2 font-medium">{u.code}</td>
              <td className="text-muted-foreground px-3 py-2">
                {u.category_code}
              </td>
              <td className="px-3 py-2">{u.max_occupancy}</td>
              <td className="px-3 py-2">
                {u.electricity_amp ? `${u.electricity_amp} A` : '—'}
              </td>
              <td className="px-3 py-2">
                {u.area_m2 ? `${u.area_m2} m²` : '—'}
              </td>
              <td className="px-3 py-2">{label(t.surface, u.surface)}</td>
              <td className="px-3 py-2">{label(t.shade, u.shade)}</td>
              <td className="text-muted-foreground px-3 py-2">{features(u)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
