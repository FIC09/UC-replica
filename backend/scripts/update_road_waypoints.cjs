const mongoose = require('mongoose');
const https = require('https');

function fetchRoad(origin, dest) {
  return new Promise((resolve) => {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson&steps=true`;
    https.get(url, { headers: { 'User-Agent': 'UrbanCompanyLiveMap/1.0' } }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          if (j.code === 'Ok' && j.routes && j.routes[0]) {
            const raw = j.routes[0].geometry.coordinates;
            const stepInterval = Math.max(1, Math.floor(raw.length / 26));
            const pts = [];
            for (let i = 0; i < raw.length; i += stepInterval) {
              pts.push({ lat: Number(raw[i][1].toFixed(6)), lng: Number(raw[i][0].toFixed(6)) });
            }
            if (pts[pts.length - 1].lat !== dest.lat || pts[pts.length - 1].lng !== dest.lng) {
              pts.push({ lat: Number(dest.lat.toFixed(6)), lng: Number(dest.lng.toFixed(6)) });
            }
            resolve(pts);
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/urban_company');
  const db = mongoose.connection.db;
  const hub = { lat: 13.0569, lng: 80.2425 }; // Nungambakkam Hub
  const customer = { lat: 13.0418, lng: 80.2341 }; // T. Nagar Customer Home

  const roadWaypoints = await fetchRoad(hub, customer);
  console.log('Fetched road waypoints:', roadWaypoints?.length);

  if (roadWaypoints && roadWaypoints.length > 5) {
    const result = await db.collection('trackingsessions').updateMany(
      { status: { $in: ['assigned', 'en_route', 'arrived'] } },
      {
        $set: {
          routePolyline: roadWaypoints,
          currentCoords: roadWaypoints[3],
          currentWaypointIndex: 3,
          heading: 195,
          speed: 26,
          status: 'en_route',
          remainingDistanceKm: 2.1,
          remainingEtaMinutes: 5,
          customerCoords: customer
        }
      }
    );
    console.log('Updated tracking sessions in DB:', result.modifiedCount);
  }
  await mongoose.disconnect();
}

main().catch(console.error);
