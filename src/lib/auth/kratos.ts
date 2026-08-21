import 'server-only'

/**
 * Public URL of the staff Kratos instance. A deployed environment must set it:
 * falling back there would point sign-in at localhost and surface as "wrong
 * password" rather than as the misconfiguration it is.
 */
export function kratosStaffURL(): string {
  const url = process.env.BOKARN_KRATOS_STAFF_URL
  if (url) return url
  if (process.env.NODE_ENV === 'production') {
    throw new Error('BOKARN_KRATOS_STAFF_URL is not set')
  }
  return 'http://auth-staff.bokarn.localhost'
}
