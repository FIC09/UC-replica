/**
 * Krishnagiri Town Geofencing & Service Boundary Service
 * Enforces Phase 14 operational boundary: Platform operates exclusively in Krishnagiri Town.
 * PostGIS-equivalent polygon ray-casting and locality resolution.
 * Rejects unsupported locations (Hosur, Bargur, Chennai, Bangalore, etc.) gracefully.
 */

// Krishnagiri Town municipal & urban service boundary polygon [latitude, longitude]
export const KRISHNAGIRI_TOWN_POLYGON = [
  [12.5650, 78.1950], // NW (Bangalore Rd approach, toll gate perimeter)
  [12.5650, 78.2350], // NE (Master Plan Complex / Collectorate North)
  [12.5350, 78.2550], // East (Londonpet / KRP reservoir approach perimeter)
  [12.4900, 78.2450], // SE (Salem Rd / Kattiganapalli South boundary)
  [12.4800, 78.2050], // SW (SIPCOT Phase 1 / Rayakottai Rd South)
  [12.5100, 78.1750], // West (Rayakottai Rd West perimeter)
  [12.5500, 78.1800]  // NW return
];

// High-precision coordinates for all official Krishnagiri Town sectors and localities
export const KRISHNAGIRI_LOCALITY_COORDINATES = {
  'rayakottai road': { lat: 12.5200, lng: 78.2090 },
  'bangalore road': { lat: 12.5400, lng: 78.2050 },
  'kattiganapalli': { lat: 12.5120, lng: 78.2250 },
  'old pet': { lat: 12.5265, lng: 78.2140 },
  'pazhaya pettai': { lat: 12.5265, lng: 78.2140 },
  'old pet (pazhaya pettai)': { lat: 12.5265, lng: 78.2140 },
  'new pet': { lat: 12.5240, lng: 78.2160 },
  'pudhu pettai': { lat: 12.5240, lng: 78.2160 },
  'new pet (pudhu pettai)': { lat: 12.5240, lng: 78.2160 },
  'gandhi nagar': { lat: 12.5230, lng: 78.2195 },
  'tnhb colony': { lat: 12.5320, lng: 78.2230 },
  'tnhb colony (housing board)': { lat: 12.5320, lng: 78.2230 },
  'housing board': { lat: 12.5320, lng: 78.2230 },
  'roundana': { lat: 12.5245, lng: 78.2142 },
  'roundana & bus stand': { lat: 12.5245, lng: 78.2142 },
  'bus stand': { lat: 12.5245, lng: 78.2142 },
  'londonpet': { lat: 12.5310, lng: 78.2120 },
  'collectorate': { lat: 12.5350, lng: 78.2200 },
  'collectorate & master plan': { lat: 12.5350, lng: 78.2200 },
  'master plan': { lat: 12.5350, lng: 78.2200 },
  'anna nagar': { lat: 12.5270, lng: 78.2210 },
  'salem road': { lat: 12.5190, lng: 78.2155 },
  'venkateswara colony': { lat: 12.5290, lng: 78.2180 },
  'sipcot': { lat: 12.5050, lng: 78.2000 },
  'sipcot industrial zone': { lat: 12.5050, lng: 78.2000 },
  'sipcot & bargur road': { lat: 12.5050, lng: 78.2000 },
  'periyar nagar': { lat: 12.5210, lng: 78.2220 },
  'jakkaappan nagar': { lat: 12.5280, lng: 78.2070 },
  'krishnagiri central': { lat: 12.5245, lng: 78.2142 },
  'krishnagiri town': { lat: 12.5186, lng: 78.2138 },
  'krishnagiri': { lat: 12.5186, lng: 78.2138 }
};

// Towns explicitly outside Phase 1 Krishnagiri Town scope
export const EXCLUDED_REGIONS = [
  'hosur',
  'bargur',
  'kaveripattinam',
  'dharmapuri',
  'chennai',
  'bangalore',
  'bengaluru',
  'mumbai',
  'coimbatore'
];

/**
 * Standard Ray-casting algorithm to test whether a coordinate point [lat, lng]
 * is strictly inside a closed polygon (PostGIS ST_Contains equivalent).
 */
export function isPointInPolygon(point, polygon = KRISHNAGIRI_TOWN_POLYGON) {
  const [lat, lng] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];

    const intersect = ((yi > lng) !== (yj > lng)) &&
      (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Validates whether an address or locality lies strictly within Krishnagiri Town service area.
 * Gracefully rejects out-of-town addresses (Hosur, Bargur, Chennai, etc.) with informative responses.
 */
export function validateKrishnagiriServiceArea({
  address = '',
  locality = '',
  city = 'Krishnagiri',
  lat = null,
  lng = null
} = {}) {
  const combined = `${locality} ${address} ${city}`.toLowerCase().trim();

  // 1. Check for explicit out-of-boundary regions (e.g. Hosur, Bargur, Chennai, etc.)
  for (const excl of EXCLUDED_REGIONS) {
    // If text contains "hosur" or "bargur" and does NOT specify Krishnagiri town center
    if (combined.includes(excl)) {
      // Special case: "salem road" in Krishnagiri is valid, but "salem" city itself is not
      if (excl === 'salem' && combined.includes('salem road')) {
        continue;
      }
      return {
        allowed: false,
        reason: 'OUT_OF_SERVICE_AREA',
        serviceZone: null,
        message: `Krishnagiri Home Services currently operates exclusively within Krishnagiri Town. Service to ${excl.toUpperCase()} is scheduled for launch in Phase 2.`
      };
    }
  }

  // 2. If numerical coordinates are provided, perform geometric PostGIS-equivalent polygon test
  if (lat != null && lng != null) {
    const isInside = isPointInPolygon([parseFloat(lat), parseFloat(lng)]);
    if (!isInside) {
      return {
        allowed: false,
        reason: 'COORDINATES_OUTSIDE_GEOFENCE',
        serviceZone: null,
        message: 'The selected GPS coordinates are outside the active Krishnagiri Town service boundary.'
      };
    }
  }

  // 3. Match against known Krishnagiri localities
  let matchedLocality = 'Rayakottai Road';
  let resolvedCoords = { ...KRISHNAGIRI_LOCALITY_COORDINATES['rayakottai road'] };
  let foundMatch = false;

  for (const [key, coords] of Object.entries(KRISHNAGIRI_LOCALITY_COORDINATES)) {
    if (combined.includes(key)) {
      matchedLocality = key.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      resolvedCoords = { ...coords };
      foundMatch = true;
      break;
    }
  }

  // 4. If city is Krishnagiri or address contains Krishnagiri, accept with default town center
  if (foundMatch || combined.includes('krishnagiri') || city.toLowerCase().includes('krishnagiri') || !city) {
    return {
      allowed: true,
      serviceZone: matchedLocality,
      city: 'Krishnagiri',
      coordinates: resolvedCoords,
      message: 'Address verified within active Krishnagiri Town service boundary.'
    };
  }

  // 5. Unrecognized address outside Krishnagiri Town
  return {
    allowed: false,
    reason: 'UNSUPPORTED_LOCATION',
    serviceZone: null,
    message: 'Krishnagiri Home Services is currently operational only in Krishnagiri Town, Tamil Nadu.'
  };
}
