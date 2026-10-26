import { WorkerApplication } from '../models/WorkerApplication.js';
import { Booking } from '../models/Booking.js';
import { TrackingSession } from '../models/TrackingSession.js';
import { getOrCreateConversation } from './chatService.js';

// High-Precision Coordinates for Krishnagiri Town and operational locations
export const CITY_COORDINATES = {
  // Krishnagiri Town Core Localities (Primary Launch Zone - Direct Dispatch)
  'Rayakottai Road': { lat: 12.5200, lng: 78.2090 },
  'Bangalore Road': { lat: 12.5400, lng: 78.2050 },
  'Kattiganapalli': { lat: 12.5120, lng: 78.2250 },
  'Old Pet': { lat: 12.5265, lng: 78.2140 },
  'Pazhaya Pettai': { lat: 12.5265, lng: 78.2140 },
  'Old Pet (Pazhaya Pettai)': { lat: 12.5265, lng: 78.2140 },
  'New Pet': { lat: 12.5240, lng: 78.2160 },
  'Pudhu Pettai': { lat: 12.5240, lng: 78.2160 },
  'New Pet (Pudhu Pettai)': { lat: 12.5240, lng: 78.2160 },
  'Gandhi Nagar': { lat: 12.5230, lng: 78.2195 },
  'TNHB Colony': { lat: 12.5320, lng: 78.2230 },
  'TNHB Colony (Housing Board)': { lat: 12.5320, lng: 78.2230 },
  'Housing Board': { lat: 12.5320, lng: 78.2230 },
  'Roundana': { lat: 12.5245, lng: 78.2142 },
  'Roundana & Bus Stand': { lat: 12.5245, lng: 78.2142 },
  'Bus Stand': { lat: 12.5245, lng: 78.2142 },
  'Londonpet': { lat: 12.5310, lng: 78.2120 },
  'Collectorate': { lat: 12.5350, lng: 78.2200 },
  'Collectorate & Master Plan': { lat: 12.5350, lng: 78.2200 },
  'Master Plan': { lat: 12.5350, lng: 78.2200 },
  'Anna Nagar': { lat: 12.5270, lng: 78.2210 },
  'Salem Road': { lat: 12.5190, lng: 78.2155 },
  'Venkateswara Colony': { lat: 12.5290, lng: 78.2180 },
  'SIPCOT': { lat: 12.5050, lng: 78.2000 },
  'SIPCOT Industrial Zone': { lat: 12.5050, lng: 78.2000 },
  'SIPCOT & Bargur Road': { lat: 12.5050, lng: 78.2000 },
  'Periyar Nagar': { lat: 12.5210, lng: 78.2220 },
  'Jakkaappan Nagar': { lat: 12.5280, lng: 78.2070 },
  'Krishnagiri Central': { lat: 12.5245, lng: 78.2142 },
  'Krishnagiri Town': { lat: 12.5186, lng: 78.2138 },
  'Krishnagiri': { lat: 12.5186, lng: 78.2138 },

  // Chennai Reference Hubs & Localities
  'T. Nagar': { lat: 13.0418, lng: 80.2341 },
  'Adyar': { lat: 13.0012, lng: 80.2565 },
  'Anna Nagar Chennai': { lat: 13.0850, lng: 80.2101 },
  'Velachery': { lat: 12.9759, lng: 80.2212 },
  'Mylapore': { lat: 13.0368, lng: 80.2676 },
  'Alwarpet': { lat: 13.0336, lng: 80.2515 },
  'Nungambakkam': { lat: 13.0569, lng: 80.2425 },
  'OMR': { lat: 12.9348, lng: 80.2312 },
  'Chennai Central': { lat: 13.0827, lng: 80.2707 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },

  // Mumbai Localities
  'Bandra West': { lat: 19.0596, lng: 72.8295 },
  'Andheri West': { lat: 19.1197, lng: 72.8468 },
  'Powai': { lat: 19.1176, lng: 72.9060 },
  'Juhu': { lat: 19.1075, lng: 72.8263 },
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
};

/**
 * Calculates Haversine spherical distance between two coordinate points in kilometers
 */
export function calculateDistanceKm(coord1, coord2) {
  if (!coord1 || !coord2) return 2.5;
  const R = 6371; // Earth radius in km
  const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
  const dLng = (coord2.lng - coord1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * (Math.PI / 180)) *
      Math.cos(coord2.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

/**
 * Calculates compass bearing (heading angle 0-360 deg) between two points
 */
export function calculateBearing(coord1, coord2) {
  if (!coord1 || !coord2) return 0;
  const dLng = (coord2.lng - coord1.lng) * (Math.PI / 180);
  const lat1 = coord1.lat * (Math.PI / 180);
  const lat2 = coord2.lat * (Math.PI / 180);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return Math.round((Math.atan2(y, x) * 180 / Math.PI + 360) % 360);
}

/**
 * Generates realistic urban road waypoints using OSRM Snap-to-Roads or fallback.
 * Strictly adheres to DIRECT DISPATCH (NO hubs, NO warehouses, professional travels
 * directly from worker origin to customer service address).
 */
export async function fetchRoadRouteWaypoints(start, end) {
  let origin = { ...start };
  // If worker start and customer end are identical or very close (< 400m),
  // offset start slightly along the Krishnagiri street grid (e.g. 700m away)
  // so the travel trajectory accurately models worker departing from workshop/home.
  if (calculateDistanceKm(origin, end) < 0.4) {
    origin = {
      lat: parseFloat((end.lat + 0.0055).toFixed(6)),
      lng: parseFloat((end.lng - 0.0045).toFixed(6))
    };
  }

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&steps=true`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'KrishnagiriHomeServicesLiveMap/1.0' } });
    clearTimeout(timeout);
    const data = await res.json();
    if (data.code === 'Ok' && data.routes && data.routes[0]) {
      const rawCoords = data.routes[0].geometry.coordinates;
      // Downsample to 20-25 clean waypoints for smooth stepping
      const stepInterval = Math.max(1, Math.floor(rawCoords.length / 22));
      const waypoints = [];
      for (let i = 0; i < rawCoords.length; i += stepInterval) {
        waypoints.push({
          lat: parseFloat(rawCoords[i][1].toFixed(6)),
          lng: parseFloat(rawCoords[i][0].toFixed(6))
        });
      }
      if (waypoints[waypoints.length - 1].lat !== end.lat || waypoints[waypoints.length - 1].lng !== end.lng) {
        waypoints.push({ lat: parseFloat(end.lat.toFixed(6)), lng: parseFloat(end.lng.toFixed(6)) });
      }
      return {
        waypoints,
        distanceKm: parseFloat((data.routes[0].distance / 1000).toFixed(2)),
        etaMinutes: Math.max(3, Math.round(data.routes[0].duration / 60)),
        origin
      };
    }
  } catch (err) {
    console.warn('[OSRM Routing Fallback]:', err.message);
  }

  // Fallback to S-curve
  const waypoints = generateRouteWaypoints(origin, end, 16);
  return {
    waypoints,
    distanceKm: calculateDistanceKm(origin, end),
    etaMinutes: 6,
    origin
  };
}

/**
 * Generates realistic urban road waypoints with minor street curves (Direct Dispatch)
 */
export function generateRouteWaypoints(start, end, numSteps = 12) {
  let origin = { ...start };
  if (calculateDistanceKm(origin, end) < 0.4) {
    origin = {
      lat: parseFloat((end.lat + 0.0055).toFixed(6)),
      lng: parseFloat((end.lng - 0.0045).toFixed(6))
    };
  }
  const waypoints = [];
  for (let i = 0; i <= numSteps; i++) {
    const t = i / numSteps;
    // S-curve slight offset to simulate real road turns
    const curveOffset = Math.sin(t * Math.PI) * 0.0035;
    const lat = origin.lat + (end.lat - origin.lat) * t + curveOffset * 0.5;
    const lng = origin.lng + (end.lng - origin.lng) * t - curveOffset * 0.8;
    waypoints.push({
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lng.toFixed(6))
    });
  }
  return waypoints;
}

/**
 * Resolves coordinate from locality, address text or city (Krishnagiri Town default)
 */
export function resolveCoordinates(addressText = '', locality = '', city = 'Krishnagiri') {
  const text = `${locality} ${addressText} ${city}`.toLowerCase();
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (text.includes(key.toLowerCase())) {
      return { ...coords };
    }
  }
  if (city.toLowerCase().includes('chennai') || text.includes('chennai')) {
    return { ...CITY_COORDINATES['Chennai'] };
  }
  if (city.toLowerCase().includes('mumbai') || text.includes('mumbai')) {
    return { ...CITY_COORDINATES['Bandra West'] };
  }
  // Default to Krishnagiri Town Center
  return { ...CITY_COORDINATES['Krishnagiri'] };
}

/**
 * Multi-factor Scoring Algorithm as mandated by Module 4.2:
 * 35% Travel ETA / Distance
 * 25% Skill Compatibility
 * 15% Availability & Schedule Fit
 * 10% Worker Reliability
 * 10% Workload Fairness
 * 5% Customer Rating
 */
export function calculateWorkerScore(worker, booking, customerCoords) {
  const workerLocality = worker.locality || worker.operationalHub || 'T. Nagar';
  const workerCoords = resolveCoordinates('', workerLocality, worker.city || 'Chennai');
  const distanceKm = calculateDistanceKm(workerCoords, customerCoords);

  // 1. Travel ETA Score (35%)
  // Workers within 2km get near full 35 pts, drops down to 0 at 15km
  const travelScore = Math.max(0, (1 - Math.min(distanceKm, 15) / 15)) * 35;

  // 2. Skill Compatibility (25%)
  let skillScore = 15; // baseline trade match
  const bookingCategory = (booking.serviceCategory || booking.serviceName || '').toLowerCase();
  const workerTrade = (worker.trade || worker.tradeName || '').toLowerCase();
  const workerSkills = (worker.skills || []).map(s => s.toLowerCase());
  const workerCategories = (worker.categories || []).map(c => c.toLowerCase());

  if (workerTrade.includes(bookingCategory) || bookingCategory.includes(workerTrade)) {
    skillScore += 5;
  }
  const matchedSkill = workerSkills.some(s => bookingCategory.includes(s) || s.includes(bookingCategory)) ||
                       workerCategories.some(c => bookingCategory.includes(c) || c.includes(bookingCategory));
  if (matchedSkill) {
    skillScore = 25;
  }

  // 3. Availability & Schedule Fit (15%)
  let availScore = 10;
  if (worker.dispatchState === 'Available') {
    availScore = 15;
  } else if (worker.dispatchState === 'Busy on Booking') {
    availScore = 4;
  }

  // 4. Worker Reliability (10%)
  const onTimeRate = worker.onTimeArrivalRate != null ? worker.onTimeArrivalRate : 98;
  const cancelRate = worker.cancellationRate != null ? worker.cancellationRate : 1.5;
  const reliabilityScore = ((onTimeRate / 100) * 6) + (((100 - cancelRate) / 100) * 4);

  // 5. Workload Fairness (10%)
  // Lower recent jobs completed today = higher score to prevent burnout
  const jobsCompletedToday = worker.jobsToday || (worker.jobsCompleted % 4) || 0;
  const workloadScore = Math.max(0, (4 - jobsCompletedToday) / 4) * 10;

  // 6. Customer Rating (5%)
  const rating = worker.rating || 4.85;
  const ratingScore = (Math.min(5, Math.max(1, rating)) / 5) * 5;

  const totalScore = parseFloat((travelScore + skillScore + availScore + reliabilityScore + workloadScore + ratingScore).toFixed(2));

  return {
    worker,
    totalScore,
    breakdown: {
      travelScore: parseFloat(travelScore.toFixed(2)),
      skillScore: parseFloat(skillScore.toFixed(2)),
      availScore: parseFloat(availScore.toFixed(2)),
      reliabilityScore: parseFloat(reliabilityScore.toFixed(2)),
      workloadScore: parseFloat(workloadScore.toFixed(2)),
      ratingScore: parseFloat(ratingScore.toFixed(2)),
      distanceKm,
      workerCoords
    }
  };
}

/**
 * Intelligent Auto-Assignment Core Engine
 * Evaluates Hard Eligibility, Scores Candidates, Confirms Assignment & Initializes Tracking
 */
export async function autoAssignWorkerToBooking(booking) {
  try {
    console.log(`[Auto-Assignment] Initiating intelligent dispatch for Booking ${booking.id} (${booking.serviceName})...`);

    // Determine customer coordinates
    const customerLocality = booking.serviceZone || booking.addressDetails?.locality || 'Rayakottai Road';
    const customerCity = booking.city || 'Krishnagiri';
    const customerCoords = resolveCoordinates(booking.address, customerLocality, customerCity);

    // 1. HARD ELIGIBILITY FILTERS
    // - Must be Approved
    // - Not Suspended
    // - Not Offline
    const allWorkers = await WorkerApplication.find({
      status: 'Approved',
      dispatchState: { $nin: ['Offline', 'Suspended'] }
    });

    if (!allWorkers || allWorkers.length === 0) {
      console.warn(`[Auto-Assignment] No approved active workers found in database for Booking ${booking.id}.`);
      booking.status = 'Confirmed';
      booking.offerStatus = 'unoffered';
      await booking.save();
      return { success: false, message: 'No eligible workers online. Marked for operations queue.' };
    }

    // Filter by trade/category and prioritize Krishnagiri workers
    const reqTrade = (booking.serviceCategory || booking.serviceName || '').toLowerCase();
    
    // Priority 1: Approved workers located in Krishnagiri Town matching trade or skills
    let candidates = allWorkers.filter(w => {
      const isKrishnagiri = (w.city || '').toLowerCase().includes('krishnagiri');
      const workerTrade = (w.trade || w.tradeName || '').toLowerCase();
      const skills = (w.skills || []).map(s => s.toLowerCase());
      const categories = (w.categories || []).map(c => c.toLowerCase());

      const tradeMatch = reqTrade.includes(workerTrade) || workerTrade.includes(reqTrade) ||
                         skills.some(s => reqTrade.includes(s) || s.includes(reqTrade)) ||
                         categories.some(c => reqTrade.includes(c) || c.includes(reqTrade));

      return isKrishnagiri && tradeMatch;
    });

    // Priority 2: Any approved worker in Krishnagiri Town
    if (candidates.length === 0) {
      candidates = allWorkers.filter(w => (w.city || '').toLowerCase().includes('krishnagiri'));
    }

    // Priority 3: Fall back to all matching trade workers
    if (candidates.length === 0) {
      candidates = allWorkers.filter(w => {
        const workerTrade = (w.trade || w.tradeName || '').toLowerCase();
        const skills = (w.skills || []).map(s => s.toLowerCase());
        const categories = (w.categories || []).map(c => c.toLowerCase());

        return reqTrade.includes(workerTrade) || workerTrade.includes(reqTrade) ||
               skills.some(s => reqTrade.includes(s) || s.includes(reqTrade)) ||
               categories.some(c => reqTrade.includes(c) || c.includes(reqTrade));
      });
    }

    // Ultimate fallback if no trade match
    if (candidates.length === 0) {
      candidates = allWorkers;
    }

    // 2. MULTI-FACTOR RANKING (35% ETA/Dist, 25% Skills, 15% Availability, 10% Reliability, 10% Workload, 5% Rating)
    const rankedCandidates = candidates
      .map(worker => calculateWorkerScore(worker, booking, customerCoords))
      .sort((a, b) => b.totalScore - a.totalScore);

    const bestCandidate = rankedCandidates[0];
    if (!bestCandidate) {
      return { success: false, message: 'Could not rank workers.' };
    }

    const { worker, breakdown } = bestCandidate;
    const workerCoords = breakdown.workerCoords;
    const distanceKm = breakdown.distanceKm;
    const etaMinutes = Math.max(4, Math.round(distanceKm * 3.0 + 3)); // Krishnagiri town traffic (~25 km/h)

    console.log(`[Auto-Assignment] Worker Selected: ${worker.applicantName} (Score: ${bestCandidate.totalScore}/100, Dist: ${distanceKm}km, ETA: ${etaMinutes}m)`);

    // 3. ATOMIC CONFIRMATION & PERSISTENCE
    booking.assignedProfessional = {
      id: worker.id,
      name: worker.applicantName,
      phone: worker.phone,
      trade: worker.tradeName || worker.trade,
      avatar: worker.avatar || (worker.applicantName ? worker.applicantName.split(' ').map(n=>n[0]).join('') : 'PRO'),
      assignedAt: new Date()
    };
    booking.assignedPartner = worker.applicantName;
    if (worker.partnerAgencyId) {
      booking.partnerAgency = worker.partnerAgencyName || worker.partnerAgencyId;
      booking.assignedBusinessPartner = {
        id: worker.partnerAgencyId,
        name: worker.partnerAgencyName || 'Business Partner'
      };
    }
    booking.status = 'Assigned';
    booking.offerStatus = 'accepted';

    // Add Timeline Event (Direct Dispatch - No Hub)
    booking.timeline.push({
      id: `tl-${Date.now()}`,
      status: 'Assigned',
      title: 'Professional Assigned',
      description: `${worker.applicantName} (${worker.tradeName || worker.trade}) assigned. Direct dispatch from worker location to customer address (No Hub).`,
      actor: 'Intelligent Dispatch Engine',
      actorRole: 'System Dispatch',
      timestamp: new Date()
    });

    await booking.save();

    // 4. UPDATE WORKER ACTIVE DISPATCH STATE
    worker.dispatchState = 'Busy on Booking';
    worker.activeBookingId = booking.id;
    await worker.save();

    // 5. INITIALIZE LIVE GPS TRACKING SESSION (Real Road Network Navigation)
    const safetyPin = String(Math.floor(1000 + Math.random() * 9000));
    const roadRoute = await fetchRoadRouteWaypoints(workerCoords, customerCoords);
    const waypoints = roadRoute.waypoints;
    const initialHeading = waypoints.length >= 2 ? calculateBearing(waypoints[0], waypoints[1]) : 45;

    let trackingSession = await TrackingSession.findOne({ bookingId: booking.id });
    if (!trackingSession) {
      trackingSession = new TrackingSession({
        id: `TRK-${booking.id}`,
        bookingId: booking.id,
        bookingReference: booking.bookingReference || booking.id,
        workerId: worker.id,
        workerName: worker.applicantName,
        workerPhone: worker.phone,
        workerAvatar: worker.avatar,
        workerTrade: worker.tradeName || worker.trade,
        workerRating: worker.rating || 4.9,
        partnerId: worker.partnerAgencyId || '',
        partnerName: worker.partnerAgencyName || '',
        customerName: booking.userName || 'Customer',
        customerPhone: booking.userPhone || '',
        customerAddress: booking.address,
        customerCoords,
        currentCoords: roadRoute.origin || workerCoords,
        heading: initialHeading,
        speed: 24,
        status: 'assigned',
        routePolyline: waypoints,
        currentWaypointIndex: 0,
        remainingDistanceKm: roadRoute.distanceKm || distanceKm,
        remainingEtaMinutes: roadRoute.etaMinutes || etaMinutes,
        safetyPin,
        lastPingAt: new Date()
      });
    } else {
      trackingSession.workerId = worker.id;
      trackingSession.workerName = worker.applicantName;
      trackingSession.workerPhone = worker.phone;
      trackingSession.workerTrade = worker.tradeName || worker.trade;
      trackingSession.partnerId = worker.partnerAgencyId || '';
      trackingSession.partnerName = worker.partnerAgencyName || '';
      trackingSession.status = 'assigned';
      trackingSession.routePolyline = waypoints;
      trackingSession.remainingDistanceKm = distanceKm;
      trackingSession.remainingEtaMinutes = etaMinutes;
      trackingSession.safetyPin = safetyPin;
      trackingSession.lastPingAt = new Date();
    }
    await trackingSession.save();

    console.log(`[Auto-Assignment] ✅ Tracking session TRK-${booking.id} created with Safety PIN: ${safetyPin}`);

    // 6. INITIALIZE RAPIDO-STYLE PRIVATE CHAT CONVERSATION
    try {
      const chatConversation = await getOrCreateConversation(booking.id, worker);
      console.log(`[Auto-Assignment] ✅ Private Chat activated: ${chatConversation.id}`);
    } catch (chatErr) {
      console.warn('[Auto-Assignment] Chat activation note:', chatErr.message);
    }

    return {
      success: true,
      booking,
      assignedWorker: worker,
      ranking: bestCandidate,
      trackingSession
    };
  } catch (error) {
    console.error('[Auto-Assignment] Error executing auto-assignment:', error);
    return { success: false, error: error.message };
  }
}
