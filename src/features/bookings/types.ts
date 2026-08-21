/** Money is minor units — öre — everywhere it crosses the API. */
export type Minor = number

export type BookingSummary = {
  id: string
  reference: string
  guest_name: string
  email: string
  phone: string
  category_code: string
  category_name: string
  unit_code: string
  unit_pinned: boolean
  arrival: string
  departure: string
  nights: number
  state: string
  adults: number
  children: number
  pets: number
  currency: string
  total_gross_minor: Minor
  channel: string
  confirmed_at: string
}

export type PriceLine = {
  seq: number
  kind: string
  stay_date?: string
  description: string
  qty: number
  unit_gross_minor: Minor
  gross_minor: Minor
  net_minor: Minor
  vat_minor: Minor
  vat_code: string
  vat_rate_bp: number
}

export type BookingEvent = {
  kind: string
  actor: string
  actor_name?: string
  detail?: Record<string, string>
  created_at: string
}

export type Requirement = {
  attr_key: string
  op: string
  value: string
  required: boolean
}

export type BookingDetail = BookingSummary & {
  country_of_residence: string
  locale: string
  notes?: string
  total_net_minor: Minor
  total_vat_minor: Minor
  lines: PriceLine[]
  events: BookingEvent[]
  requirements: Requirement[]
}

export type Frontdesk = {
  date: string
  arrivals: BookingSummary[]
  departures: BookingSummary[]
  in_house: BookingSummary[]
}
