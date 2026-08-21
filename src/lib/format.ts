/**
 * The dashboard is Swedish, so formatting is pinned to sv-SE rather than to the
 * browser's locale. Staff at a Swedish campsite reading a total as 1,234.00
 * because their laptop is set to English is a bug, not a preference.
 *
 * The locale is a constant here rather than a parameter because the i18n
 * plumbing exists for translating the interface, and a Norwegian operator will
 * want nb-NO for both at once — one place to change, not two.
 */
const locale = 'sv-SE'

/** Money is stored and passed as minor units. It becomes a decimal only here. */
export function money(minor: number, currency: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: minor % 100 === 0 ? 0 : 2,
  }).format(minor / 100)
}

export function shortDate(iso: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${iso}T12:00:00`))
}

export function longDate(iso: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${iso}T12:00:00`))
}

/** A stay, as one cell: "22–25 aug." */
export function shortRange(arrival: string, departure: string): string {
  return `${shortDate(arrival)} – ${shortDate(departure)}`
}

export function dateTime(iso: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso))
}

/** Today as the YYYY-MM-DD a date input and the API both want. */
export function today(): string {
  return new Date().toISOString().slice(0, 10)
}
