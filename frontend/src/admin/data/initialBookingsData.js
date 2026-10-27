// Authoritative bookings dataset - zero synthetic demo bookings
try {
  localStorage.removeItem('uc_admin_143_bookings');
} catch {}

export function generate143Bookings() {
  return [];
}

export function getSeeded143Bookings() {
  return [];
}

export function saveSeeded143Bookings() {
  // no-op
}
