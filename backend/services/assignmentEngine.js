import mongoose from 'mongoose';
import { WorkerApplication } from '../models/WorkerApplication.js';
import { Booking } from '../models/Booking.js';
import { TrackingSession } from '../models/TrackingSession.js';
import { getOrCreateConversation } from './chatService.js';
import { cacheActiveOffer, getActiveOffer, deleteActiveOffer, getOnlineWorkerIds } from '../config/redis.js';
import { emitEvent } from './websocketService.js';
import { assignWorkerTransactionally, syncBookingToPostgres } from './postgresService.js';

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
 * Multi-factor Scoring Algorithm strictly driven by:
 * 30% Attendance & Schedule Fit (Present on duty, not on leave, within operational hours)
 * 30% Workload Fairness & Active Capacity (Fewer active jobs = highest priority, daily cap protection)
 * 20% Skill & Category Match
 * 15% Travel Distance / ETA
 * 5% Customer Rating
 */
export function calculateWorkerScore(worker, booking, customerCoords, activeJobsCount = 0, isSlotConflict = false) {
  const workerLocality = worker.locality || worker.operationalHub || 'Rayakottai Road';
  const workerCoords = resolveCoordinates('', workerLocality, worker.city || 'Krishnagiri');
  const distanceKm = calculateDistanceKm(workerCoords, customerCoords);

  // 1. Attendance & Schedule Fit (30% Weight)
  const bookingDateStr = (booking.slot || '').toLowerCase();
  const hasApprovedLeave = (worker.leaves || []).some(leave => {
    if (leave.status !== 'Approved') return false;
    const lDate = (leave.date || '').toLowerCase();
    if (!lDate) return false;
    return bookingDateStr.includes(lDate) || lDate.includes('today') || lDate === new Date().toISOString().slice(0, 10);
  });

  let attendanceStatus = 'PRESENT';
  let attendanceLabel = 'Present & Clocked In';
  let attendanceScore = 30; // Max 30 pts

  if (hasApprovedLeave) {
    attendanceStatus = 'ON_LEAVE';
    attendanceLabel = 'On Approved Leave';
    attendanceScore = 0;
  } else if (worker.dispatchState === 'Offline') {
    attendanceStatus = 'OFFLINE';
    attendanceLabel = 'Offline / Off Duty';
    attendanceScore = 0;
  } else if (worker.dispatchState === 'Suspended') {
    attendanceStatus = 'SUSPENDED';
    attendanceLabel = 'Account Suspended';
    attendanceScore = 0;
  } else if (worker.dispatchState === 'Busy on Booking') {
    attendanceStatus = 'BUSY';
    attendanceLabel = 'Present (On Live Job)';
    attendanceScore = 18;
  }

  // 2. Workload Fairness & Active Capacity (30% Weight)
  const maxDailyJobs = worker.availabilityPreferences?.maxDailyJobs || 4;
  const isCapacityReached = activeJobsCount >= maxDailyJobs;
  let workloadScore = 30; // Max 30 pts
  let workloadStatus = 'OPTIMAL';
  let workloadLabel = `Optimal (0/${maxDailyJobs} active)`;

  if (isCapacityReached) {
    workloadScore = 0;
    workloadStatus = 'CAPACITY_REACHED';
    workloadLabel = `Max Capacity (${activeJobsCount}/${maxDailyJobs} active)`;
  } else if (activeJobsCount === 0) {
    workloadScore = 30;
    workloadStatus = 'OPTIMAL';
    workloadLabel = `Optimal (0/${maxDailyJobs} active)`;
  } else if (activeJobsCount === 1) {
    workloadScore = 22;
    workloadStatus = 'MODERATE';
    workloadLabel = `Moderate (1/${maxDailyJobs} active)`;
  } else if (activeJobsCount === 2) {
    workloadScore = 14;
    workloadStatus = 'MODERATE';
    workloadLabel = `Moderate (2/${maxDailyJobs} active)`;
  } else {
    workloadScore = 6;
    workloadStatus = 'HEAVY';
    workloadLabel = `Heavy (${activeJobsCount}/${maxDailyJobs} active)`;
  }

  if (isSlotConflict) {
    workloadScore = Math.max(0, workloadScore - 20);
  }

  // 3. Skill & Category Compatibility (20% Weight)
  let skillScore = 10;
  const bookingCategory = (booking.serviceCategory || booking.serviceName || '').toLowerCase();
  const workerTrade = (worker.trade || worker.tradeName || '').toLowerCase();
  const workerSkills = (worker.skills || []).map(s => s.toLowerCase());
  const workerCategories = (worker.categories || []).map(c => c.toLowerCase());

  if (workerTrade.includes(bookingCategory) || bookingCategory.includes(workerTrade) || workerTrade.includes('all services')) {
    skillScore += 5;
  }
  const matchedSkill = workerSkills.some(s => bookingCategory.includes(s) || s.includes(bookingCategory)) ||
                       workerCategories.some(c => bookingCategory.includes(c) || c.includes(bookingCategory));
  if (matchedSkill) {
    skillScore = 20;
  }

  // 4. Travel ETA Score (15% Weight)
  const travelScore = Math.max(0, (1 - Math.min(distanceKm, 15) / 15)) * 15;

  // 5. Customer Rating (5% Weight)
  const rating = worker.rating || 4.85;
  const ratingScore = (Math.min(5, Math.max(1, rating)) / 5) * 5;

  const totalScore = parseFloat((attendanceScore + workloadScore + skillScore + travelScore + ratingScore).toFixed(2));

  return {
    worker,
    totalScore,
    attendanceStatus,
    attendanceLabel,
    attendanceScore: parseFloat(attendanceScore.toFixed(2)),
    workloadStatus,
    workloadLabel,
    workloadScore: parseFloat(workloadScore.toFixed(2)),
    activeJobsCount,
    maxDailyJobs,
    isCapacityReached,
    breakdown: {
      attendanceScore: parseFloat(attendanceScore.toFixed(2)),
      workloadScore: parseFloat(workloadScore.toFixed(2)),
      skillScore: parseFloat(skillScore.toFixed(2)),
      travelScore: parseFloat(travelScore.toFixed(2)),
      ratingScore: parseFloat(ratingScore.toFixed(2)),
      distanceKm,
      workerCoords
    }
  };
}

/**
 * Discovers and ranks eligible professionals for a booking based on
 * MongoDB 2dsphere / GeoJSON distance, trade/skills match, availability, and business scope.
 */
export async function findEligibleProfessionals(bookingIdOrDoc, { scopePartnerId = null, excludeProIds = [] } = {}) {
  let booking = bookingIdOrDoc;
  if (typeof booking === 'string' || !booking.id) {
    booking = await Booking.findOne({ $or: [{ id: bookingIdOrDoc }, { bookingReference: bookingIdOrDoc }] });
    if (!booking) throw new Error(`Booking ${bookingIdOrDoc} not found`);
  }

  // 1. Resolve customer coordinates (GeoJSON 2dsphere priority)
  let customerCoords;
  if (booking.location?.coordinates && booking.location.coordinates.length === 2 &&
      (booking.location.coordinates[0] !== 0 || booking.location.coordinates[1] !== 0)) {
    customerCoords = { lng: booking.location.coordinates[0], lat: booking.location.coordinates[1] };
  } else {
    const customerLocality = booking.serviceZone || booking.addressDetails?.locality || 'Rayakottai Road';
    const customerCity = booking.city || 'Krishnagiri';
    customerCoords = resolveCoordinates(booking.address, customerLocality, customerCity);
  }

  // 2. Query Approved Workers from MongoDB
  const query = {
    status: 'Approved'
  };

  // Partner Scope Check (Requirement A.11)
  if (scopePartnerId) {
    query.partnerAgencyId = scopePartnerId;
  }

  if (excludeProIds && excludeProIds.length > 0) {
    query.id = { $nin: excludeProIds };
  }

  const allWorkers = await WorkerApplication.find(query).lean();
  if (!allWorkers || allWorkers.length === 0) {
    return { customerCoords, candidates: [] };
  }

  // 3. Concurrency check: find any conflicting active bookings
  const activeBookings = await Booking.find({
    id: { $ne: booking.id },
    status: { $in: ['Assigned', 'En Route', 'In Progress'] }
  }).lean();

  const busyWorkerIds = new Set();
  const workerActiveCountMap = {};

  for (const b of activeBookings) {
    const proId = b.assignedProfessional?.id;
    if (proId) {
      workerActiveCountMap[proId] = (workerActiveCountMap[proId] || 0) + 1;
      // If slot matches, flag conflict
      if (b.slot === booking.slot) {
        busyWorkerIds.add(proId);
      }
    }
  }

  // 4. Redis online presence check
  let onlineWorkerIds = [];
  try {
    onlineWorkerIds = await getOnlineWorkerIds();
  } catch {}

  // 5. Score & Rank Each Worker based on Attendance, Workload Fairness, Distance & Skills
  const scoredCandidates = allWorkers.map(worker => {
    // Determine worker coordinates
    let workerCoords;
    if (worker.location?.coordinates && worker.location.coordinates.length === 2 &&
        (worker.location.coordinates[0] !== 0 || worker.location.coordinates[1] !== 0)) {
      workerCoords = { lng: worker.location.coordinates[0], lat: worker.location.coordinates[1] };
    } else {
      const workerLocality = worker.locality || worker.operationalHub || 'Rayakottai Road';
      const workerCity = worker.city || 'Krishnagiri';
      workerCoords = resolveCoordinates('', workerLocality, workerCity);
    }

    const distanceKm = calculateDistanceKm(workerCoords, customerCoords);
    const etaMinutes = Math.max(4, Math.round(distanceKm * 3.0 + 3));

    const activeJobsCount = workerActiveCountMap[worker.id] || 0;
    const isSlotConflict = busyWorkerIds.has(worker.id);
    const scoreResult = calculateWorkerScore(worker, booking, customerCoords, activeJobsCount, isSlotConflict);

    const isAvailable = (scoreResult.attendanceStatus === 'PRESENT') && !isSlotConflict && !scoreResult.isCapacityReached;
    const isOnline = onlineWorkerIds.includes(worker.id) || worker.dispatchState !== 'Offline';
    const isBusy = isSlotConflict || worker.dispatchState === 'Busy on Booking';

    return {
      worker: {
        id: worker.id,
        applicantName: worker.applicantName,
        phone: worker.phone,
        email: worker.email,
        avatar: worker.avatar,
        trade: worker.trade,
        tradeName: worker.tradeName,
        skills: worker.skills || [],
        categories: worker.categories || [],
        locality: worker.locality,
        city: worker.city,
        status: worker.status,
        dispatchState: worker.dispatchState,
        rating: worker.rating || 0,
        jobsCompleted: worker.jobsCompleted || 0,
        partnerAgencyId: worker.partnerAgencyId || '',
        partnerAgencyName: worker.partnerAgencyName || '',
        tier: worker.tier || 'Verified Partner',
        location: worker.location,
        leaves: worker.leaves || []
      },
      distanceKm,
      etaMinutes,
      workerCoords,
      isOnline,
      isBusy,
      isSlotConflict,
      isAvailable,
      attendanceStatus: scoreResult.attendanceStatus,
      attendanceLabel: scoreResult.attendanceLabel,
      attendanceScore: scoreResult.attendanceScore,
      workloadStatus: scoreResult.workloadStatus,
      workloadLabel: scoreResult.workloadLabel,
      workloadScore: scoreResult.workloadScore,
      activeBookingsCount: activeJobsCount,
      maxDailyJobs: scoreResult.maxDailyJobs,
      isCapacityReached: scoreResult.isCapacityReached,
      totalScore: scoreResult.totalScore,
      scoreBreakdown: scoreResult.breakdown
    };
  });

  // Sort by:
  // 1. Available first (present & not capacity reached)
  // 2. Least active jobs (Workload fairness)
  // 3. Highest overall score
  // 4. Closest distance
  scoredCandidates.sort((a, b) => {
    if (a.isAvailable !== b.isAvailable) {
      return a.isAvailable ? -1 : 1;
    }
    if (a.activeBookingsCount !== b.activeBookingsCount) {
      return a.activeBookingsCount - b.activeBookingsCount;
    }
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    return a.distanceKm - b.distanceKm;
  });

  return { customerCoords, candidates: scoredCandidates };
}

/**
 * Sends a real assignment offer to a professional (Manual or Automatic)
 * Updates MongoDB conditionally, caches in Redis with TTL, and emits real-time offer event.
 */
export async function sendAssignmentOffer(bookingId, proId, { mode = 'MANUAL', timeoutSeconds = 90, offeredBy = 'Operations' } = {}) {
  const booking = await Booking.findOne({ $or: [{ id: bookingId }, { bookingReference: bookingId }] });
  if (!booking) {
    throw new Error(`Booking ${bookingId} not found`);
  }

  if (['Assigned', 'In Progress', 'Completed', 'Cancelled'].includes(booking.status)) {
    throw new Error(`Booking ${bookingId} cannot be offered because it is already '${booking.status}'`);
  }

  const worker = await WorkerApplication.findOne({ $or: [{ id: proId }, { applicationNumber: proId }] });
  if (!worker) {
    throw new Error(`Professional ${proId} not found`);
  }
  const effectiveProId = worker.id || worker.applicationNumber || proId;

  if (worker.status !== 'Approved') {
    throw new Error(`Professional ${worker.applicantName} is not approved (${worker.status})`);
  }

  if (worker.dispatchState === 'Suspended') {
    throw new Error(`Professional ${worker.applicantName} is currently suspended`);
  }

  if (worker.dispatchState === 'Offline') {
    throw new Error(`Professional ${worker.applicantName} is currently offline`);
  }

  const expiresAt = new Date(Date.now() + timeoutSeconds * 1000);

  // Atomic update
  const updated = await Booking.findOneAndUpdate(
    {
      id: booking.id,
      status: { $in: ['Pending', 'Confirmed'] }
    },
    {
      $set: {
        assignmentMode: mode,
        assignmentStatus: 'OFFERED',
        offerStatus: 'offered',
        offerExpiry: expiresAt,
        offeredTo: {
          proId: effectiveProId,
          proName: worker.applicantName,
          proPhone: worker.phone,
          offeredAt: new Date(),
          expiresAt,
          mode,
          attemptCount: (booking.offeredTo?.attemptCount || 0) + 1
        }
      },
      $push: {
        assignmentAttempts: {
          proId: effectiveProId,
          proName: worker.applicantName,
          status: 'offered',
          attemptedAt: new Date(),
          reason: `Offer dispatched via ${mode} assignment engine`
        },
        timeline: {
          id: `tl-${Date.now()}`,
          status: 'Offered',
          title: `Assignment Offer Dispatched (${mode})`,
          description: `Offer dispatched to ${worker.applicantName} (${worker.tradeName || worker.trade}). Offer expires in ${timeoutSeconds}s.`,
          actor: offeredBy,
          actorRole: mode === 'MANUAL' ? 'Admin / Partner' : 'Auto Engine',
          timestamp: new Date()
        }
      }
    },
    { new: true }
  );

  if (!updated) {
    throw new Error(`Could not dispatch offer: Booking ${booking.id} is no longer eligible for offers.`);
  }

  // Cache in Redis
  const offerPayload = {
    offerId: `off-${booking.id}-${worker.id}`,
    bookingId: updated.id,
    bookingReference: updated.bookingReference || updated.id,
    serviceName: updated.serviceName,
    serviceCategory: updated.serviceCategory,
    customerArea: updated.serviceZone || updated.addressDetails?.locality || updated.city || 'Krishnagiri',
    address: updated.address,
    slot: updated.slot,
    scheduledDate: updated.scheduledDate,
    totalAmount: updated.totalAmount,
    expectedEarnings: Math.round((updated.totalAmount || 500) * 0.8),
    proId: worker.id,
    proName: worker.applicantName,
    mode,
    offeredAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    timeoutSeconds
  };

  try {
    await cacheActiveOffer(updated.id, offerPayload, timeoutSeconds);
  } catch (err) {
    console.warn('[Redis cacheActiveOffer Warning]:', err.message);
  }

  // Real-time Socket.IO dispatch
  emitEvent('DISPATCH_OFFER', {
    entityId: updated.id,
    room: `worker:${worker.id}`,
    payload: offerPayload
  });

  emitEvent('ASSIGNMENT_OFFERED', {
    entityId: updated.id,
    room: 'admin:operations',
    payload: {
      booking: updated,
      offer: offerPayload
    }
  });

  emitEvent('ASSIGNMENT_OFFERED', {
    entityId: updated.id,
    room: `booking:${updated.id}`,
    payload: {
      booking: updated,
      offer: offerPayload
    }
  });

  return { success: true, booking: updated, offer: offerPayload };
}

/**
 * Handles explicit professional acceptance of an offer.
 * Uses atomic conditional MongoDB update to prevent race conditions or duplicate acceptance.
 */
export async function acceptAssignmentOffer(bookingId, proId) {
  const pro = await WorkerApplication.findOne({ $or: [{ id: proId }, { applicationNumber: proId }] });
  if (!pro) {
    return { success: false, code: 404, error: `Professional ${proId} not found` };
  }
  const effectiveProId = pro.id || pro.applicationNumber || proId;

  // Atomic conditional update ensuring concurrency protection:
  // ONLY if status is Pending/Confirmed, offerStatus is offered, and offeredTo.proId is this worker!
  const updated = await Booking.findOneAndUpdate(
    {
      $or: [{ id: bookingId }, { bookingReference: bookingId }],
      status: { $in: ['Pending', 'Confirmed'] },
      offerStatus: 'offered',
      'offeredTo.proId': { $in: [proId, effectiveProId, pro.applicationNumber, pro.id].filter(Boolean) }
    },
    {
      $set: {
        status: 'Assigned',
        offerStatus: 'accepted',
        assignmentStatus: 'ASSIGNED',
        assignedPartner: pro.applicantName,
        assignedProfessional: {
          id: effectiveProId,
          name: pro.applicantName,
          phone: pro.phone,
          trade: pro.tradeName || pro.trade,
          avatar: pro.avatar || (pro.applicantName ? pro.applicantName.split(' ').map(n=>n[0]).join('') : 'PRO'),
          assignedAt: new Date()
        },
        partnerAgency: pro.partnerAgencyName || pro.partnerAgencyId || '',
        assignedBusinessPartner: pro.partnerAgencyId ? {
          id: pro.partnerAgencyId,
          name: pro.partnerAgencyName || 'Business Partner'
        } : undefined
      },
      $push: {
        timeline: {
          id: `tl-${Date.now()}`,
          status: 'Assigned',
          title: 'Offer Accepted by Professional',
          description: `${pro.applicantName} (${pro.tradeName || pro.trade}) accepted the offer. Direct dispatch activated.`,
          actor: pro.applicantName,
          actorRole: 'Professional',
          timestamp: new Date()
        }
      }
    },
    { new: true }
  );

  if (!updated) {
    return {
      success: false,
      code: 409,
      error: 'Cannot accept offer: Offer has already been accepted, expired, or was reassigned to another professional.'
    };
  }

  // Update assignmentAttempts history
  try {
    await Booking.updateOne(
      { id: updated.id, 'assignmentAttempts.proId': proId, 'assignmentAttempts.status': 'offered' },
      { $set: { 'assignmentAttempts.$.status': 'accepted', 'assignmentAttempts.$.respondedAt': new Date() } }
    );
  } catch {}

  // Update worker dispatch state
  try {
    await WorkerApplication.updateOne(
      { _id: pro._id },
      { $set: { dispatchState: 'Busy on Booking', activeBookingId: updated.id } }
    );
  } catch (err) {
    console.warn('[acceptAssignmentOffer pro update warning]:', err.message);
  }

  // Delete active offer from Redis
  try {
    await deleteActiveOffer(updated.id);
  } catch {}

  // Initialize TrackingSession
  try {
    const customerLocality = updated.serviceZone || updated.addressDetails?.locality || 'Rayakottai Road';
    const customerCity = updated.city || 'Krishnagiri';
    const customerCoords = resolveCoordinates(updated.address, customerLocality, customerCity);

    let workerCoords;
    if (pro.location?.coordinates && pro.location.coordinates.length === 2 &&
        (pro.location.coordinates[0] !== 0 || pro.location.coordinates[1] !== 0)) {
      workerCoords = { lng: pro.location.coordinates[0], lat: pro.location.coordinates[1] };
    } else {
      workerCoords = resolveCoordinates('', pro.locality, pro.city);
    }

    const roadRoute = await fetchRoadRouteWaypoints(workerCoords, customerCoords);
    const waypoints = roadRoute.waypoints;
    const initialHeading = waypoints.length >= 2 ? calculateBearing(waypoints[0], waypoints[1]) : 45;
    const safetyPin = String(Math.floor(1000 + Math.random() * 9000));

    let trackingSession = await TrackingSession.findOne({ bookingId: updated.id });
    if (!trackingSession) {
      trackingSession = new TrackingSession({
        id: `TRK-${updated.id}`,
        bookingId: updated.id,
        bookingReference: updated.bookingReference || updated.id,
        workerId: pro.id,
        workerName: pro.applicantName,
        workerPhone: pro.phone,
        workerAvatar: pro.avatar,
        workerTrade: pro.tradeName || pro.trade,
        workerRating: pro.rating || 4.9,
        partnerId: pro.partnerAgencyId || '',
        partnerName: pro.partnerAgencyName || '',
        customerName: updated.userName || 'Customer',
        customerPhone: updated.userPhone || '',
        customerAddress: updated.address,
        customerCoords,
        currentCoords: roadRoute.origin || workerCoords,
        heading: initialHeading,
        speed: 24,
        status: 'assigned',
        routePolyline: waypoints,
        currentWaypointIndex: 0,
        remainingDistanceKm: roadRoute.distanceKm || 2.5,
        remainingEtaMinutes: roadRoute.etaMinutes || 6,
        safetyPin,
        lastPingAt: new Date()
      });
    } else {
      trackingSession.workerId = pro.id;
      trackingSession.workerName = pro.applicantName;
      trackingSession.workerPhone = pro.phone;
      trackingSession.workerTrade = pro.tradeName || pro.trade;
      trackingSession.status = 'assigned';
      trackingSession.routePolyline = waypoints;
      trackingSession.safetyPin = safetyPin;
      trackingSession.lastPingAt = new Date();
    }
    await trackingSession.save();
  } catch (trkErr) {
    console.warn('[Tracking Init Warning]:', trkErr.message);
  }

  // Initialize private chat conversation
  try {
    await getOrCreateConversation(updated.id, pro);
  } catch (chatErr) {
    console.warn('[Chat Init Warning]:', chatErr.message);
  }

  // Transactionally confirm exclusive worker assignment in PostgreSQL
  try {
    await assignWorkerTransactionally({
      bookingId: updated.id,
      workerId: pro.id,
      workerName: pro.applicantName,
      partnerId: pro.partnerAgencyId || '',
      assignedBy: 'worker_acceptance'
    });
    await syncBookingToPostgres(updated);
  } catch (pgErr) {
    console.warn('PostgreSQL transactional assign note:', pgErr.message);
  }

  // Real-time WebSocket emissions
  emitEvent('ASSIGNMENT_ACCEPTED', {
    entityId: updated.id,
    room: 'admin:operations',
    payload: {
      bookingId: updated.id,
      worker: updated.assignedProfessional,
      status: 'Assigned',
      timestamp: new Date().toISOString()
    }
  });

  emitEvent('ASSIGNMENT_ACCEPTED', {
    entityId: updated.id,
    room: `booking:${updated.id}`,
    payload: {
      bookingId: updated.id,
      worker: updated.assignedProfessional,
      status: 'Assigned',
      timestamp: new Date().toISOString()
    }
  });

  emitEvent('ASSIGNMENT_ACCEPTED', {
    entityId: updated.id,
    room: `worker:${pro.id}`,
    payload: {
      bookingId: updated.id,
      status: 'Assigned',
      timestamp: new Date().toISOString()
    }
  });

  return { success: true, booking: updated };
}

/**
 * Handles professional rejection of an offer.
 * If in AUTO mode, automatically tries the next eligible candidate.
 * If in MANUAL mode, updates assignment status to REJECTED for owner intervention.
 */
export async function rejectAssignmentOffer(bookingId, proId, reason = 'Declined by professional') {
  const pro = await WorkerApplication.findOne({ $or: [{ id: proId }, { applicationNumber: proId }] });
  const possibleIds = [proId, pro?.id, pro?.applicationNumber].filter(Boolean);

  const booking = await Booking.findOne({
    $or: [{ id: bookingId }, { bookingReference: bookingId }],
    'offeredTo.proId': { $in: possibleIds },
    offerStatus: 'offered'
  });

  if (!booking) {
    return { success: false, error: 'Offer not found or not currently offered to this professional' };
  }

  try {
    await deleteActiveOffer(booking.id);
  } catch {}

  // Update attempt history in booking
  await Booking.updateOne(
    { id: booking.id, 'assignmentAttempts.proId': { $in: possibleIds }, 'assignmentAttempts.status': 'offered' },
    {
      $set: {
        'assignmentAttempts.$.status': 'rejected',
        'assignmentAttempts.$.respondedAt': new Date(),
        'assignmentAttempts.$.reason': reason
      }
    }
  );

  const timelineEvent = {
    id: `tl-${Date.now()}`,
    status: 'Rejected',
    title: 'Assignment Offer Rejected',
    description: `${booking.offeredTo?.proName || proId} rejected the offer: ${reason}`,
    actor: booking.offeredTo?.proName || proId,
    actorRole: 'Professional',
    timestamp: new Date()
  };

  if (booking.assignmentMode === 'AUTO') {
    booking.offerStatus = 'declined';
    booking.timeline.push(timelineEvent);
    await booking.save();

    emitEvent('OFFER_REJECTED', {
      entityId: booking.id,
      room: 'admin:operations',
      payload: { bookingId: booking.id, proId, reason, mode: 'AUTO' }
    });

    // Automatically try the next eligible candidate!
    const attemptedIds = (booking.assignmentAttempts || []).map(a => a.proId);
    return await triggerAutoAssignment(booking.id, { excludeProIds: [...new Set([...attemptedIds, proId])] });
  } else {
    // MANUAL MODE
    booking.assignmentStatus = 'REJECTED';
    booking.offerStatus = 'declined';
    booking.timeline.push(timelineEvent);
    await booking.save();

    emitEvent('OFFER_REJECTED', {
      entityId: booking.id,
      room: 'admin:operations',
      payload: { bookingId: booking.id, proId, reason, mode: 'MANUAL' }
    });

    emitEvent('OFFER_REJECTED', {
      entityId: booking.id,
      room: `booking:${booking.id}`,
      payload: { bookingId: booking.id, proId, reason }
    });

    return {
      success: true,
      message: 'Offer rejected. Owner can manually reassign or switch to auto.',
      booking
    };
  }
}

/**
 * Expires an assignment offer upon timeout.
 * If in AUTO mode, automatically cascades to next eligible candidate.
 * If in MANUAL mode, marks as EXPIRED for owner reassignment.
 */
export async function expireAssignmentOffer(bookingId) {
  const booking = await Booking.findOne({
    $or: [{ id: bookingId }, { bookingReference: bookingId }],
    offerStatus: 'offered'
  });

  if (!booking) {
    return { success: false, error: 'No active offer found to expire' };
  }

  const proId = booking.offeredTo?.proId;

  try {
    await deleteActiveOffer(booking.id);
  } catch {}

  // Update attempt history in booking
  if (proId) {
    const updateRes = await Booking.updateOne(
      { id: booking.id, 'assignmentAttempts.proId': proId, 'assignmentAttempts.status': 'offered' },
      {
        $set: {
          'assignmentAttempts.$.status': 'expired',
          'assignmentAttempts.$.respondedAt': new Date(),
          'assignmentAttempts.$.reason': 'Offer timed out without response'
        }
      }
    );

    if (!updateRes || updateRes.matchedCount === 0) {
      await Booking.updateOne(
        { id: booking.id },
        {
          $push: {
            assignmentAttempts: {
              proId,
              proName: booking.offeredTo?.proName || 'Professional',
              status: 'expired',
              attemptedAt: new Date(),
              respondedAt: new Date(),
              reason: 'Offer timed out without response'
            }
          }
        }
      );
    }
  }

  const timelineEvent = {
    id: `tl-${Date.now()}`,
    status: 'Expired',
    title: 'Assignment Offer Expired',
    description: `Offer to ${booking.offeredTo?.proName || proId} expired after timeout without response.`,
    actor: 'System Engine',
    actorRole: 'System Dispatch',
    timestamp: new Date()
  };

  emitEvent('OFFER_EXPIRED', {
    entityId: booking.id,
    room: `worker:${proId}`,
    payload: { bookingId: booking.id, proId }
  });

  if (booking.assignmentMode === 'AUTO') {
    booking.offerStatus = 'expired';
    booking.timeline.push(timelineEvent);
    await booking.save();

    emitEvent('OFFER_EXPIRED', {
      entityId: booking.id,
      room: 'admin:operations',
      payload: { bookingId: booking.id, proId, mode: 'AUTO' }
    });

    // Automatically try next candidate!
    const attemptedIds = (booking.assignmentAttempts || []).map(a => a.proId);
    return await triggerAutoAssignment(booking.id, { excludeProIds: [...new Set(attemptedIds)] });
  } else {
    // MANUAL MODE
    booking.assignmentStatus = 'EXPIRED';
    booking.offerStatus = 'expired';
    booking.timeline.push(timelineEvent);
    await booking.save();

    emitEvent('OFFER_EXPIRED', {
      entityId: booking.id,
      room: 'admin:operations',
      payload: { bookingId: booking.id, proId, mode: 'MANUAL' }
    });

    emitEvent('OFFER_EXPIRED', {
      entityId: booking.id,
      room: `booking:${booking.id}`,
      payload: { bookingId: booking.id, proId }
    });

    return {
      success: true,
      message: 'Offer expired. Owner can manually reassign or switch to auto.',
      booking
    };
  }
}

/**
 * Triggers Automatic Assignment engine for a booking.
 * Evaluates candidates, sends real offer to top candidate, or marks awaiting attention.
 */
export async function triggerAutoAssignment(bookingIdOrDoc, { excludeProIds = [] } = {}) {
  let booking = bookingIdOrDoc;
  if (typeof booking === 'string' || !booking.id) {
    booking = await Booking.findOne({ $or: [{ id: bookingIdOrDoc }, { bookingReference: bookingIdOrDoc }] });
    if (!booking) throw new Error(`Booking ${bookingIdOrDoc} not found`);
  }

  if (booking.assignmentMode !== 'AUTO') {
    return { success: false, message: 'Booking is set to MANUAL assignment mode.' };
  }

  if (['Assigned', 'In Progress', 'Completed', 'Cancelled'].includes(booking.status)) {
    return { success: false, message: `Booking is already ${booking.status}` };
  }

  const existingAttemptIds = (booking.assignmentAttempts || []).map(a => a.proId);
  const combinedExcluded = [...new Set([...existingAttemptIds, ...excludeProIds])];

  const { candidates } = await findEligibleProfessionals(booking, { excludeProIds: combinedExcluded });

  // Pick top available candidate (strictly based on attendance: PRESENT & not on leave, and workload: not capacity reached & not slot conflict, plus trade-compatible)
  const availableCandidate = candidates.find(c => {
    if (c.attendanceStatus !== 'PRESENT') return false;
    if (c.isCapacityReached || c.isSlotConflict) return false;
    if (!c.isAvailable) return false;
    
    // Check trade/category compatibility
    const wTrade = (c.worker.trade || '').toLowerCase();
    const wTradeName = (c.worker.tradeName || '').toLowerCase();
    const wCats = (c.worker.categories || []).map(cat => cat.toLowerCase());
    const bCat = (booking.serviceCategory || '').toLowerCase();
    const bService = (booking.serviceName || '').toLowerCase();

    if (wTrade === 'all services' || wTrade.includes('all services')) return true;
    if (!bCat || bCat === 'all services') return true;

    const matchesCat = (wTrade && (wTrade.includes(bCat) || bCat.includes(wTrade))) ||
                       (wTradeName && (wTradeName.includes(bCat) || bCat.includes(wTradeName))) ||
                       wCats.some(cat => cat && (cat.includes(bCat) || bCat.includes(cat)));
    const matchesService = (wTrade && (wTrade.includes(bService) || bService.includes(wTrade))) ||
                           (wTradeName && (wTradeName.includes(bService) || bService.includes(wTradeName)));

    return Boolean(matchesCat || matchesService);
  });

  if (availableCandidate) {
    console.log(`[Auto-Assignment] Dispatching offer for Booking ${booking.id} to ${availableCandidate.worker.applicantName} (Score: ${availableCandidate.totalScore})`);
    return await sendAssignmentOffer(booking.id, availableCandidate.worker.id, {
      mode: 'AUTO',
      timeoutSeconds: 60,
      offeredBy: 'Auto Assignment Engine'
    });
  }

  // No eligible candidates available
  console.warn(`[Auto-Assignment] No eligible professionals available for Booking ${booking.id}. Transitioning to AWAITING_OWNER_ATTENTION.`);
  booking.assignmentStatus = 'AWAITING_OWNER_ATTENTION';
  booking.offerStatus = 'unoffered';
  booking.timeline.push({
    id: `tl-${Date.now()}`,
    status: 'Awaiting Attention',
    title: 'Awaiting Owner Attention',
    description: 'Automatic assignment exhausted all candidates or no approved professionals were available in range. Manual owner intervention required.',
    actor: 'Auto Assignment Engine',
    actorRole: 'System Dispatch',
    timestamp: new Date()
  });
  await booking.save();

  emitEvent('ASSIGNMENT_FAILED', {
    entityId: booking.id,
    room: 'admin:operations',
    payload: {
      bookingId: booking.id,
      assignmentStatus: 'AWAITING_OWNER_ATTENTION',
      reason: 'No eligible professionals available in coverage area'
    }
  });

  emitEvent('ASSIGNMENT_FAILED', {
    entityId: booking.id,
    room: `booking:${booking.id}`,
    payload: {
      bookingId: booking.id,
      assignmentStatus: 'AWAITING_OWNER_ATTENTION',
      message: 'Looking for available professionals in your area...'
    }
  });

  return {
    success: false,
    awaitingOwnerAttention: true,
    message: 'No eligible professionals available. Marked for Owner Attention.'
  };
}

/**
 * Watchdog runner: reliably checks and processes expired offers across server restarts.
 * Runs against authoritative MongoDB records with offerStatus === 'offered' and offerExpiry < now.
 */
export async function checkAndProcessExpiredOffers() {
  if (mongoose.connection?.readyState !== 1) return;
  try {
    const expiredBookings = await Booking.find({
      offerStatus: 'offered',
      offerExpiry: { $lt: new Date() }
    });

    for (const b of expiredBookings) {
      console.log(`[Watchdog] Offer for booking ${b.id} expired at ${b.offerExpiry}. Processing timeout...`);
      await expireAssignmentOffer(b.id);
    }
  } catch (err) {
    console.warn('[Watchdog Check Warning]:', err.message);
  }
}

let watchdogInterval = null;
export function startAssignmentWatchdog(intervalMs = 5000) {
  if (watchdogInterval) clearInterval(watchdogInterval);
  watchdogInterval = setInterval(checkAndProcessExpiredOffers, intervalMs);
  console.log(`⏱️ Assignment Offer Expiration Watchdog started (interval: ${intervalMs}ms)`);
}

// Backward-compatible alias
export const autoAssignWorkerToBooking = triggerAutoAssignment;

