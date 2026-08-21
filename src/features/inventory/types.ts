export type Category = {
  id: string
  site_id: string
  code: string
  name: string
  kind: string
  revenue_class: string
  max_occupancy: number
  min_electricity_amp: number | null
  pets_allowed: boolean
  accessible: boolean
  sanitary: boolean
  sort_order: number
  units: number
}

export type Unit = {
  id: string
  site_id: string
  category_id: string
  category_code: string
  code: string
  status: string
  electricity_amp: number | null
  area_m2: number | null
  max_vehicle_length_m: number | null
  max_occupancy: number
  pets_allowed: boolean
  accessible: boolean
  has_water: boolean
  has_greywater: boolean
  has_sewer: boolean
  surface: string | null
  shade: string | null
  drive_through: boolean
  sanitary: boolean
  view: string | null
  cleanliness: string
  sort_order: number
}

export type Allocation = {
  id: string
  unit_id: string
  kind: string
  state: string
  arrival: string
  departure: string
  block_reason: string | null
  unit_pinned: boolean
  /** Present on a booking, absent on a hold or a maintenance block. */
  booking_id?: string
  reference?: string
  guest_name?: string
}

export type CalendarRow = {
  unit: Unit
  allocations: Allocation[]
}
