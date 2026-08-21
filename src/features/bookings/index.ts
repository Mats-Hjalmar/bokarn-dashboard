/**
 * The server-side entry: data access, components and types.
 *
 * The mutations are deliberately not re-exported here. This module reaches
 * lib/api/client, which is server-only, so a client component importing
 * anything from it drags server-only code into the browser bundle and the build
 * fails. A 'use server' module is the one kind a client component may import a
 * function from — so ./actions is this feature's second public entry, and
 * client components import from there by design rather than by leaking.
 */
export { fetchBooking, fetchBookings, fetchFrontdesk } from './api'
export { BookingList } from './components/booking-list'
export { BookingDetailView } from './components/booking-detail'
export type {
  BookingDetail,
  BookingEvent,
  BookingSummary,
  Frontdesk,
  PriceLine,
  Requirement,
} from './types'
