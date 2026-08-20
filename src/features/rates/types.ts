export type Season = {
  id: string
  name: string
  starts_on: string
  ends_on: string
  priority: number
  base_minor: number
  included_adults: number
  adult_extra_minor: number
  pet_minor: number
  min_stay: number
  arrival_mask: number
}

export type Plan = {
  id: string
  code: string
  name: string
  category_code: string
  currency: string
  vat_code: string
  seasons: Season[]
}

export type CalendarDay = {
  day: string
  base_minor: number
  min_stay: number
  arrival_mask: number
  closed: boolean
  season_id: string
  season_name: string
}

export type QuoteLine = {
  seq: number
  kind: string
  stay_date?: string
  description: string
  gross_minor: number
  net_minor: number
  vat_minor: number
  vat_rate_bp: number
}

export type QuoteStep = {
  rule: string
  detail: string
  effect_minor: number
}

export type Quote = {
  id: string
  nights: number
  expires_at: string
  breakdown_hash: string
  lines: QuoteLine[]
  totals: { gross_minor: number; net_minor: number; vat_minor: number }
  explain: QuoteStep[]
}
