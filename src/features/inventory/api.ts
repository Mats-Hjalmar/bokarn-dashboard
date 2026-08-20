import { apiFetch } from '@/lib/api/client'
import type { Category, Unit } from './types'

export function fetchCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/admin/categories', { cache: 'no-store' })
}

export function fetchUnits(): Promise<Unit[]> {
  return apiFetch<Unit[]>('/admin/units', { cache: 'no-store' })
}
