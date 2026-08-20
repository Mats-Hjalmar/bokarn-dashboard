import { sv } from './dictionaries/sv'

/**
 * The staff dashboard ships in Swedish only. The dictionary indirection is
 * here from the start because reception vocabulary (registerkort, säsongsplats)
 * is the product's language, and a Norwegian or Danish operator must be a
 * translation file rather than a sweep through every component.
 */
export const locales = ['sv'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'sv'

const dictionaries = { sv } as const

export type Dictionary = (typeof dictionaries)[Locale]

export function getDictionary(locale: Locale = defaultLocale): Dictionary {
  return dictionaries[locale]
}
