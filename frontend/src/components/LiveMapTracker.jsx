import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Navigation, MapPin, Play, Pause, RotateCcw,
  Compass, Maximize2, Crosshair, Sparkles, CheckCircle2,
  CornerUpLeft, CornerUpRight, ArrowUp
} from 'lucide-react';

/**
 * Rapido, Swiggy & Zomato Grade Live GPS Road Navigation Tracker
 * Features real street snapping, moving delivery scooter with directional heading,
 * pulsing beacon wave, customer doorstep pin, depot hub, turn-by-turn guidance banner,
 * and autonomous road driving simulation.
 */
export function LiveMapTracker({
  session,
  bookingId,
  height = 540,
  showControls = true,
  onStepAdvanced
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const workerMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const hubMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const outerGlowPolylineRef = useRef(null);
  const traveledPolylineRef = useRef(null);

  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [followVehicle, setFollowVehicle] = useState(true);

  // User Device GPS Location State
  const [userLocation, setUserLocation] = useState(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('');
  const userMarkerRef = useRef(null);
  const userCircleRef = useRef(null);

  // High-accuracy Krishnagiri Town coordinates (Rayakottai Road to Gandhi Nagar Doorstep)
  const defaultCustomerCoords = { lat: 12.5230, lng: 78.2195 }; // Gandhi Nagar, Krishnagiri
  const defaultWorkerCoords = { lat: 12.5200, lng: 78.2090 }; // Rayakottai Road, Krishnagiri

  const customerCoords = session?.customerCoords || defaultCustomerCoords;
  const waypoints = session?.routePolyline && session.routePolyline.length > 0
    ? session.routePolyline
    : [defaultWorkerCoords, { lat: 12.5215, lng: 78.2140 }, defaultCustomerCoords];

  // Optimistic local waypoint index to eliminate network round-trip lag
  const isArrivedState = session?.status === 'arrived' || session?.status === 'in_progress' || session?.status === 'completed';
  const [localWaypointIndex, setLocalWaypointIndex] = useState(
    isArrivedState ? Math.max(0, waypoints.length - 1) : (session?.currentWaypointIndex || 0)
  );

  // Sync local index when session booking changes
  useEffect(() => {
    if (session?.status === 'arrived' || session?.status === 'in_progress' || session?.status === 'completed') {
      setLocalWaypointIndex(Math.max(0, waypoints.length - 1));
    } else if (session?.currentWaypointIndex !== undefined) {
      setLocalWaypointIndex(session.currentWaypointIndex);
    }
  }, [session?.id, session?.bookingId, session?.status, session?.currentWaypointIndex, waypoints.length]);

  const currentWaypoint = waypoints[localWaypointIndex] || waypoints[0] || defaultWorkerCoords;
  const nextWaypoint = waypoints[localWaypointIndex + 1] || currentWaypoint;

  // Compute instantaneous bearing
  const currentHeading = localWaypointIndex > 0
    ? calculateInstantBearing(waypoints[localWaypointIndex - 1], currentWaypoint)
    : calculateInstantBearing(currentWaypoint, nextWaypoint);

  function calculateInstantBearing(p1, p2) {
    if (!p1 || !p2) return 180;
    const dLng = (p2.lng - p1.lng) * (Math.PI / 180);
    const lat1 = p1.lat * (Math.PI / 180);
    const lat2 = p2.lat * (Math.PI / 180);
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    return Math.round((Math.atan2(y, x) * 180 / Math.PI + 360) % 360);
  }

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const centerLat = (currentWaypoint.lat + customerCoords.lat) / 2;
    const centerLng = (currentWaypoint.lng + customerCoords.lng) / 2;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false
    });

    // 100% Free OpenStreetMap Humanitarian Street Tiles (Zero API key, Zero Watermarks)
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c'],
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(timer);
      if (resizeObserver) resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const lastSessionIdRef = useRef(null);

  // Initialize or update planned static route geometry (only runs when route geometry changes)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const latLngWaypoints = waypoints.map(pt => [pt.lat, pt.lng]);

    // 1. Road corridor casing buffer
    if (!outerGlowPolylineRef.current) {
      outerGlowPolylineRef.current = L.polyline(latLngWaypoints, {
        color: '#DDD6FE',
        weight: 12,
        opacity: 0.65,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
    } else {
      outerGlowPolylineRef.current.setLatLngs(latLngWaypoints);
    }

    // 2. Full planned dashed route line
    if (!routePolylineRef.current) {
      routePolylineRef.current = L.polyline(latLngWaypoints, {
        color: '#7C3AED',
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: '8, 8'
      }).addTo(map);
    } else {
      routePolylineRef.current.setLatLngs(latLngWaypoints);
    }

    // 3. Traveled route line
    const traveledPoints = latLngWaypoints.slice(0, localWaypointIndex + 1);
    if (!traveledPolylineRef.current) {
      traveledPolylineRef.current = L.polyline(traveledPoints, {
        color: '#4C1D95',
        weight: 7,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
    } else {
      traveledPolylineRef.current.setLatLngs(traveledPoints);
    }

    // 4. Professional Direct Dispatch Origin Marker (No Hub / Warehouse - Direct Travel)
    if (waypoints.length > 0) {
      const originPoint = waypoints[0];
      const originIcon = L.divIcon({
        className: 'uc-hub-leaflet-marker',
        html: `
          <div style="position: relative; width: 96px; height: 60px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; pointer-events: none;">
            <div style="position: absolute; top: 0; background: #312E81; color: #EEF2FF; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 12px; white-space: nowrap; box-shadow: 0 3px 8px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.3);">
              Pro Origin 🛵
            </div>
            <div style="width: 30px; height: 30px; border-radius: 50%; background: #4F46E5; border: 3px solid #FFFFFF; box-shadow: 0 3px 10px rgba(79,70,229,0.4); display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-size: 13px;">
              🛠️
            </div>
          </div>
        `,
        iconSize: [96, 60],
        iconAnchor: [48, 58]
      });

      if (hubMarkerRef.current) {
        hubMarkerRef.current.setLatLng([originPoint.lat, originPoint.lng]);
      } else {
        hubMarkerRef.current = L.marker([originPoint.lat, originPoint.lng], { icon: originIcon }).addTo(map);
      }
    }

    // 5. Customer Doorstep Home Destination Marker
    const destIcon = L.divIcon({
      className: 'uc-dest-leaflet-marker',
      html: `
        <div style="position: relative; width: 96px; height: 68px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; pointer-events: none;">
          <div style="position: absolute; top: 0; background: #065F46; color: #ECFDF5; font-size: 10.5px; font-weight: 800; padding: 2.5px 8px; border-radius: 12px; white-space: nowrap; box-shadow: 0 4px 10px rgba(0,0,0,0.25); display: flex; align-items: center; gap: 4px; border: 1.5px solid rgba(255,255,255,0.4);">
            <span>Customer Doorstep</span>
            <span style="font-size: 10px;">📍</span>
          </div>
          <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; inset: -5px; border-radius: 50%; background: rgba(16, 185, 129, 0.4); animation: uc-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #10B981; border: 3px solid #FFFFFF; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.65); display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-size: 15px;">
              🏠
            </div>
          </div>
        </div>
      `,
      iconSize: [96, 68],
      iconAnchor: [48, 64]
    });

    if (destMarkerRef.current) {
      destMarkerRef.current.setLatLng([customerCoords.lat, customerCoords.lng]);
    } else {
      destMarkerRef.current = L.marker([customerCoords.lat, customerCoords.lng], { icon: destIcon }).addTo(map);
    }

    // Auto-fit bounds on initial session switch
    const currentSessionId = session?.id || session?.bookingId;
    if (currentSessionId !== lastSessionIdRef.current && latLngWaypoints.length > 0) {
      lastSessionIdRef.current = currentSessionId;
      const bounds = L.latLngBounds(latLngWaypoints);
      bounds.extend([customerCoords.lat, customerCoords.lng]);
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 16, animate: true });
    }
  }, [session?.id, session?.bookingId, waypoints]);

  // Zero-Lag 60FPS Marker Position and Directional Heading Update
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const workerName = session?.workerName || 'Technician';
    const workerSpeed = session?.speed || (localWaypointIndex === waypoints.length - 1 ? 0 : 26);

    const workerIcon = L.divIcon({
      className: 'uc-custom-leaflet-marker',
      html: `
        <div style="position: relative; width: 130px; height: 94px; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none;">
          <!-- Floating Partner Name Tag -->
          <div style="position: absolute; top: 2px; background: #0F172A; color: #FFFFFF; font-size: 11px; font-weight: 800; padding: 3px 9px; border-radius: 999px; white-space: nowrap; box-shadow: 0 4px 14px rgba(0,0,0,0.35); display: flex; align-items: center; gap: 6px; border: 1.5px solid rgba(255,255,255,0.4); z-index: 20;">
            <span>${workerName}</span>
            <span style="background: #7C3AED; font-size: 9.5px; padding: 1px 5px; border-radius: 6px; font-weight: 800;">${workerSpeed} km/h</span>
          </div>

          <!-- Pulsing Radar Vehicle Icon with Rotational Heading -->
          <div style="position: absolute; bottom: 8px; width: 54px; height: 54px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; inset: -8px; border-radius: 50%; background: rgba(124, 58, 237, 0.3); animation: uc-ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; inset: -3px; border-radius: 50%; background: rgba(124, 58, 237, 0.45); animation: uc-ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite; animation-delay: 0.3s;"></div>

            <div style="position: relative; width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%); border: 3.5px solid #FFFFFF; box-shadow: 0 4px 16px rgba(109, 40, 217, 0.75); display: flex; align-items: center; justify-content: center; color: #FFFFFF; transform: rotate(${currentHeading}deg); transition: transform 0.35s ease-out; z-index: 10;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.7 16 10 16 10l-1.5-4.5A2 2 0 0 0 12.6 4H8.5a1.5 1.5 0 0 0-1.5 1.5V10H4a2 2 0 0 0-2 2v4c0 .6.4 1 1 1h2" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="7" cy="17" r="2.5" fill="#38BDF8" stroke="#FFFFFF" stroke-width="1.5"/>
                <circle cx="17" cy="17" r="2.5" fill="#38BDF8" stroke="#FFFFFF" stroke-width="1.5"/>
                <path d="M9 10h5" stroke="#FDE047" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
          </div>
        </div>
      `,
      iconSize: [130, 94],
      iconAnchor: [65, 66]
    });

    if (workerMarkerRef.current) {
      workerMarkerRef.current.setLatLng([currentWaypoint.lat, currentWaypoint.lng]);
      workerMarkerRef.current.setIcon(workerIcon);
    } else {
      workerMarkerRef.current = L.marker([currentWaypoint.lat, currentWaypoint.lng], { icon: workerIcon }).addTo(map);
    }

    // Update traveled line seamlessly without redrawing whole map
    if (traveledPolylineRef.current) {
      const latLngWaypoints = waypoints.map(pt => [pt.lat, pt.lng]);
      traveledPolylineRef.current.setLatLngs(latLngWaypoints.slice(0, localWaypointIndex + 1));
    }

    // Follow vehicle with camera if auto-center is active
    if (followVehicle && mapInstanceRef.current) {
      mapInstanceRef.current.panTo([currentWaypoint.lat, currentWaypoint.lng], {
        animate: true,
        duration: 0.6
      });
    }
  }, [localWaypointIndex, currentHeading, session?.speed]);

  // Center camera on delivery partner
  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo([currentWaypoint.lat, currentWaypoint.lng], 16, { animate: true, duration: 0.8 });
  };

  // Center camera on user's real browser device GPS location
  const handleLocateMyDevice = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Geolocation not supported by browser.');
      return;
    }
    setLocatingUser(true);
    setGpsStatus('Acquiring real device GPS...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingUser(false);
        const { latitude, longitude, accuracy } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude, accuracy });
        setGpsStatus(`GPS Locked: ±${Math.round(accuracy)}m`);

        const map = mapInstanceRef.current;
        if (!map) return;

        // Render pulsating blue user location marker
        const userIcon = L.divIcon({
          className: 'uc-user-gps-marker',
          html: `
            <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; pointer-events: none;">
              <div style="position: absolute; inset: -4px; border-radius: 50%; background: rgba(59, 130, 246, 0.4); animation: uc-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="width: 24px; height: 24px; border-radius: 50%; background: #2563EB; border: 3.5px solid #FFFFFF; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.85); display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-size: 11px;">
                🎯
              </div>
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 22]
        });

        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([latitude, longitude]);
        } else {
          userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
          userMarkerRef.current.bindPopup('<strong>📍 Your Live Device Location</strong><br/>Accuracy: ±' + Math.round(accuracy) + 'm').openPopup();
        }

        // Draw accuracy circle
        if (userCircleRef.current) {
          userCircleRef.current.setLatLng([latitude, longitude]);
          userCircleRef.current.setRadius(accuracy);
        } else {
          userCircleRef.current = L.circle([latitude, longitude], {
            radius: Math.min(accuracy, 300),
            color: '#3B82F6',
            weight: 1.5,
            fillColor: '#93C5FD',
            fillOpacity: 0.18
          }).addTo(map);
        }

        map.flyTo([latitude, longitude], 16, { animate: true, duration: 1.2 });
      },
      (err) => {
        setLocatingUser(false);
        console.warn('Geolocation error:', err.message);
        setGpsStatus('GPS Permission Denied. Centering on customer doorstep.');
        mapInstanceRef.current?.flyTo([customerCoords.lat, customerCoords.lng], 16);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Fit all bounds
  const handleFitBounds = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const latLngWaypoints = waypoints.map(pt => [pt.lat, pt.lng]);
    const bounds = L.latLngBounds(latLngWaypoints);
    bounds.extend([customerCoords.lat, customerCoords.lng]);
    if (userLocation) {
      bounds.extend([userLocation.lat, userLocation.lng]);
    }
    map.fitBounds(bounds, { padding: [60, 60], animate: true });
  };

  // Zoom controls
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  // Instant Optimistic Step Advancement (Zero Network Lag)
  const handleAdvanceStep = async () => {
    if (!bookingId || waypoints.length === 0) return;

    // 1. Immediately advance local index (0ms UI latency)
    const nextIndex = (localWaypointIndex + 1) >= waypoints.length ? 0 : localWaypointIndex + 1;
    setLocalWaypointIndex(nextIndex);

    // 2. Sync to server asynchronously in background without freezing UI
    setAdvancing(true);
    try {
      const res = await fetch(`/api/tracking/advance-step/${bookingId}`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.tracking) {
        onStepAdvanced?.(data.tracking);
      }
    } catch (e) {
      console.warn('Simulation error:', e.message);
    } finally {
      setAdvancing(false);
    }
  };

  // Auto-play interval (Rapido / Swiggy Auto-Drive mode)
  useEffect(() => {
    let timer = null;
    if (isAutoPlaying && bookingId) {
      timer = setInterval(() => {
        handleAdvanceStep();
      }, 1500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAutoPlaying, bookingId, localWaypointIndex]);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: typeof height === 'number' ? `${height}px` : height,
      minHeight: typeof height === 'number' ? `${height}px` : undefined,
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid #E2E8F0',
      boxShadow: '0 4px 24px -2px rgba(0,0,0,0.08)'
    }}>
      {/* CSS Pulse Animation & Clean Leaflet Marker Overrides */}
      <style>{`
        @keyframes uc-ping {
          75%, 100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
        .leaflet-div-icon {
          background: transparent !important;
          border: none !important;
        }
        .uc-custom-leaflet-marker,
        .uc-dest-leaflet-marker,
        .uc-hub-leaflet-marker {
          background: transparent !important;
          border: none !important;
          overflow: visible !important;
        }
        .leaflet-tile {
          filter: saturate(1.08) contrast(1.02);
        }
      `}</style>

      {/* Leaflet DOM Canvas */}
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '100%', background: '#F8FAFC' }}
      />

      {/* Rapido / Swiggy Turn-by-Turn Navigation HUD Banner */}
      <div style={{
        position: 'absolute',
        top: 14,
        left: 14,
        right: 14,
        zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 14,
        padding: '10px 16px',
        color: '#FFFFFF',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        {/* Turn Direction Icon & Turn Instruction */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: localWaypointIndex >= waypoints.length - 1 ? '#059669' : '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: 18,
            boxShadow: '0 2px 10px rgba(16, 185, 129, 0.45)'
          }}>
            {isArrivedState || localWaypointIndex >= waypoints.length - 2 ? '📍' :
             localWaypointIndex > 20 ? '↩️' :
             localWaypointIndex > 10 ? '➡️' : '⬆️'}
          </div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.01em' }}>
              {isArrivedState || localWaypointIndex >= waypoints.length - 1
                ? (session?.status === 'in_progress' ? 'Service In Progress (Customer Doorstep)' : 'Arrived at Customer Doorstep (Krishnagiri Town)')
                : localWaypointIndex > 20
                  ? 'In 180m, Turn Left onto Gandhi Nagar Main Road'
                  : localWaypointIndex > 10
                    ? 'Continue onto Bangalore Road past Krishnagiri Roundana'
                    : 'Direct Dispatch: Heading via Rayakottai Main Road towards Customer Address'}
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Direct Visit by {session?.workerName || 'Assigned Specialist'}</span>
              <span>•</span>
              <span style={{ color: '#FDE047', fontWeight: 700 }}>🔐 Start PIN: {session?.safetyPin || '----'}</span>
              {gpsStatus && (
                <>
                  <span>•</span>
                  <span style={{ color: '#60A5FA', fontWeight: 600 }}>{gpsStatus}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Live GPS Telemetry Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(16, 185, 129, 0.2)',
            color: '#34D399',
            padding: '4px 10px',
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 800,
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <span style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: '#10B981',
              boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.4)'
            }} />
            <span>LIVE GPS</span>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 10,
            padding: '4px 10px',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#F8FAFC' }}>
              ⏱️ {Math.max(1, Math.round(((waypoints.length - 1 - localWaypointIndex) / Math.max(1, waypoints.length - 1)) * (session?.remainingEtaMinutes || 5)))} mins
            </div>
            <div style={{ fontSize: 10.5, color: '#CBD5E1', fontWeight: 600 }}>
              {Math.max(0.05, (((waypoints.length - 1 - localWaypointIndex) / Math.max(1, waypoints.length - 1)) * (session?.remainingDistanceKm || 2.4))).toFixed(1)} km • 🛵 {localWaypointIndex === waypoints.length - 1 ? 0 : (session?.speed || 26)} km/h
            </div>
          </div>
        </div>
      </div>

      {/* Floating Right Navigation Controls */}
      <div style={{
        position: 'absolute',
        right: 14,
        bottom: showControls ? 64 : 14,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }}>
        {/* Real Device Live GPS Geolocation Button */}
        <button
          type="button"
          onClick={handleLocateMyDevice}
          title="Locate My Live GPS Device Position"
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: locatingUser ? '#EFF6FF' : userLocation ? '#DBEAFE' : '#FFFFFF',
            border: userLocation ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
            color: userLocation ? '#1D4ED8' : '#1E293B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          {locatingUser ? (
            <div style={{ width: 16, height: 16, border: '2px solid #2563EB', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          ) : (
            <Navigation size={18} color={userLocation ? '#2563EB' : '#1E293B'} />
          )}
        </button>

        {/* Center on Delivery Partner Scooter */}
        <button
          type="button"
          onClick={handleRecenter}
          title="Center on Delivery Partner"
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: '#FFFFFF',
            border: '1px solid #CBD5E1',
            color: '#1E293B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
            cursor: 'pointer'
          }}
        >
          <Crosshair size={18} />
        </button>

        {/* Auto-Camera Follow Vehicle Toggle */}
        <button
          type="button"
          onClick={() => setFollowVehicle(!followVehicle)}
          title={followVehicle ? 'Camera Tracking: ON (Tap to unlock)' : 'Camera Tracking: OFF (Tap to follow vehicle)'}
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: followVehicle ? '#EDE9FE' : '#FFFFFF',
            border: followVehicle ? '1.5px solid #7C3AED' : '1px solid #CBD5E1',
            color: followVehicle ? '#6D28D9' : '#64748B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
            cursor: 'pointer'
          }}
        >
          <Compass size={18} />
        </button>

        {/* Fit Route Bounds */}
        <button
          type="button"
          onClick={handleFitBounds}
          title="Fit Route Bounds"
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: '#FFFFFF',
            border: '1px solid #CBD5E1',
            color: '#1E293B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
            cursor: 'pointer'
          }}
        >
          <Maximize2 size={16} />
        </button>

        {/* Zoom Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          background: '#FFFFFF',
          borderRadius: 10,
          border: '1px solid #CBD5E1',
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
        }}>
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            style={{
              width: 38,
              height: 34,
              background: '#FFFFFF',
              border: 'none',
              borderBottom: '1px solid #E2E8F0',
              color: '#1E293B',
              fontSize: 16,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            +
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            style={{
              width: 38,
              height: 34,
              background: '#FFFFFF',
              border: 'none',
              color: '#1E293B',
              fontSize: 16,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            −
          </button>
        </div>
      </div>

      {/* Floating Bottom Control Bar (Interactive Step Simulator & Auto-Drive) */}
      {showControls && (
        <div style={{
          position: 'absolute',
          bottom: 12,
          left: 14,
          right: 64,
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(8px)',
          borderRadius: 12,
          padding: '8px 14px',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          boxShadow: '0 4px 18px rgba(0,0,0,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: '#334155', fontWeight: 700 }}>
              Waypoint {localWaypointIndex + 1} of {waypoints.length}
            </span>
            <div style={{
              width: 90,
              height: 6,
              borderRadius: 3,
              background: '#E2E8F0',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${Math.round(((localWaypointIndex + 1) / waypoints.length) * 100)}%`,
                height: '100%',
                background: '#7C3AED',
                borderRadius: 3,
                transition: 'width 0.25s ease'
              }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Reset to Start Button */}
            <button
              type="button"
              onClick={() => {
                setLocalWaypointIndex(0);
                mapInstanceRef.current?.flyTo([waypoints[0].lat, waypoints[0].lng], 16, { duration: 0.8 });
              }}
              title="Reset Route to Start Depot"
              style={{
                background: '#F8FAFC',
                color: '#475569',
                border: '1px solid #CBD5E1',
                borderRadius: 8,
                padding: '6px 10px',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>

            {/* Auto-Drive Simulation Toggle */}
            <button
              type="button"
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              style={{
                background: isAutoPlaying ? '#FEF2F2' : '#F8FAFC',
                color: isAutoPlaying ? '#DC2626' : '#334155',
                border: isAutoPlaying ? '1px solid #FECACA' : '1px solid #CBD5E1',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              {isAutoPlaying ? <Pause size={12} /> : <Play size={12} fill="#334155" />}
              <span>{isAutoPlaying ? 'Pause Auto-Drive' : 'Auto-Drive 🛵'}</span>
            </button>

            {/* Advance 1 Step Button */}
            <button
              type="button"
              onClick={handleAdvanceStep}
              style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                padding: '6px 14px',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                boxShadow: '0 2px 10px rgba(124, 58, 237, 0.35)'
              }}
            >
              <Navigation size={12} />
              <span>Advance Step</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
