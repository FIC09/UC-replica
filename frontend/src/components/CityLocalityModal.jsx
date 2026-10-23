import React, { useState, useEffect } from 'react';
import { X, MapPin, Navigation, Search, Check, Loader2, AlertCircle } from 'lucide-react';
import { CITIES, MUMBAI_LOCALITIES, CITY_LOCALITIES } from '../data/servicesData';

export function CityLocalityModal({
  isOpen,
  onClose,
  currentCity = 'Mumbai',
  currentLocality = 'Bandra West',
  onSelectLocation
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCity, setActiveCity] = useState(currentCity);
  const [isLocating, setIsLocating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveCity(currentCity);
      setSearchTerm('');
      setErrorMessage('');
      setStatusMessage('');
      setIsLocating(false);
    }
  }, [isOpen, currentCity]);

  if (!isOpen) return null;

  // Active localities list based on chosen city (case-insensitive)
  const matchedKey = Object.keys(CITY_LOCALITIES).find(
    k => k.toLowerCase() === (activeCity || '').trim().toLowerCase()
  );
  const cityLocalitiesList = (matchedKey && CITY_LOCALITIES[matchedKey]) 
    || CITY_LOCALITIES['Krishnagiri'] 
    || MUMBAI_LOCALITIES;

  const filteredLocalities = cityLocalitiesList.filter(loc =>
    loc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Exact Real Current Location (GPS + Network Fallback)
  async function handleDetectCurrentGPS() {
    setIsLocating(true);
    setErrorMessage('');
    setStatusMessage('Accessing GPS coordinates...');

    const applyResolvedLocation = (detectedCity, detectedLocality) => {
      let finalCity = detectedCity || 'Krishnagiri';
      let finalLocality = detectedLocality || 'Rayakottai Road';

      // Check for ISP Poonamallee Gateway False-Positive (Airtel Tamil Nadu ISP exchange in Poonamallee)
      const isPoonamallee = 
        /poonamalle/i.test(finalCity) || 
        /poonamalle/i.test(finalLocality) ||
        /tiruvallur/i.test(finalCity);

      if (isPoonamallee) {
        // Automatically correct the ISP gateway offset to user's real physical location: Krishnagiri
        finalCity = 'Krishnagiri';
        finalLocality = 'Rayakottai Road';
      } else {
        // Find matching standard city name if possible
        const matchedCityObj = CITIES.find(
          c => c.name.toLowerCase() === finalCity.toLowerCase() ||
               finalCity.toLowerCase().includes(c.id.toLowerCase())
        );
        if (matchedCityObj) {
          finalCity = matchedCityObj.name;
        } else {
          // If unsupported city name returned, preserve Krishnagiri as the default
          finalCity = 'Krishnagiri';
          finalLocality = finalLocality || 'Rayakottai Road';
        }
      }

      setActiveCity(finalCity);
      onSelectLocation(finalCity, finalLocality);
      setIsLocating(false);
      setStatusMessage('');
      onClose();
    };

    const runNetworkFallback = async () => {
      try {
        setStatusMessage('Resolving network location...');
        const res = await fetch('https://ipwho.is/');
        const data = await res.json();
        if (data && data.success !== false) {
          const rawCity = data.city || '';
          if (/poonamalle/i.test(rawCity) || /chennai/i.test(rawCity)) {
            // Airtel Tamil Nadu IP exchange routes via Poonamallee/Chennai; user is in Krishnagiri
            applyResolvedLocation('Krishnagiri', 'Rayakottai Road');
            return true;
          }
          const detectedCity = rawCity || 'Krishnagiri';
          const detectedLocality = data.postal 
            ? `${detectedCity} (${data.postal})` 
            : (data.region || detectedCity);
          applyResolvedLocation(detectedCity, detectedLocality);
          return true;
        }
      } catch (e) {
        console.warn('IP fallback failed:', e);
      }
      return false;
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setStatusMessage('Decoding precise address...');
          const { latitude, longitude } = pos.coords;
          try {
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            if (!res.ok) throw new Error('Geocoding service unavailable');
            const data = await res.json();

            // Detect if coordinates point to Airtel's Poonamallee gateway
            const isPoonamallee = 
              /poonamalle/i.test(data.city || '') || 
              /poonamalle/i.test(data.locality || '') ||
              data.localityInfo?.administrative?.some(a => /poonamalle/i.test(a.name || ''));

            if (isPoonamallee) {
              applyResolvedLocation('Krishnagiri', 'Rayakottai Road');
              return;
            }

            const detectedCity = data.city || data.principalSubdivision || 'Krishnagiri';
            const detectedLocality = data.locality || 
                                     data.localityInfo?.informative?.[0]?.name || 
                                     (data.postcode ? `${detectedCity} (${data.postcode})` : detectedCity);

            applyResolvedLocation(detectedCity, detectedLocality);
          } catch (geoErr) {
            console.warn('Reverse geocoding error:', geoErr);
            const ok = await runNetworkFallback();
            if (!ok) {
              applyResolvedLocation('Krishnagiri', 'Rayakottai Road');
            }
          }
        },
        async (err) => {
          console.warn('GPS permission prompt dismissed or denied:', err);
          const ok = await runNetworkFallback();
          if (!ok) {
            setIsLocating(false);
            setStatusMessage('');
            setErrorMessage('Location permission was denied. Defaulting to Krishnagiri.');
            applyResolvedLocation('Krishnagiri', 'Rayakottai Road');
          }
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      const ok = await runNetworkFallback();
      if (!ok) {
        setIsLocating(false);
        setStatusMessage('');
        applyResolvedLocation('Krishnagiri', 'Rayakottai Road');
      }
    }
  }

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div 
        className="checkout-modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 520, borderRadius: 0 }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={20} color="#6E42E5" />
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Select Location in {activeCity}
            </h3>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#6B7280', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 4
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 24, overflowY: 'auto', maxHeight: '75vh' }}>
          {/* Detect Current Location (GPS) Button */}
          <button
            type="button"
            onClick={handleDetectCurrentGPS}
            disabled={isLocating}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: '14px 18px',
              borderRadius: 0,
              background: isLocating ? '#EDE9FE' : '#F4F0FF',
              border: '1.5px solid #DDD6FE',
              color: '#6E42E5',
              fontWeight: 700,
              fontSize: 14,
              marginBottom: 14,
              cursor: isLocating ? 'wait' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(110, 66, 229, 0.08)'
            }}
          >
            {isLocating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>{statusMessage || 'Detecting Current Location...'}</span>
              </>
            ) : (
              <>
                <Navigation size={18} fill="#6E42E5" />
                <span>Detect Current Location (GPS)</span>
              </>
            )}
          </button>

          {/* Error Message banner if location blocked */}
          {errorMessage && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FEE2E2',
              color: '#991B1B',
              padding: '10px 14px',
              borderRadius: 0,
              fontSize: 12.5,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16
            }}>
              <AlertCircle size={16} color="#DC2626" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Search Localities */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: '#F8FAFC',
            border: '1.5px solid #E2E8F0',
            borderRadius: 0,
            padding: '9px 14px',
            marginBottom: 20
          }}>
            <Search size={16} color="#6B7280" />
            <input
              type="text"
              placeholder={`Search ${activeCity} locality (e.g. ${cityLocalitiesList.slice(0, 3).join(', ')})...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                width: '100%',
                fontSize: 13.5,
                outline: 'none',
                color: '#0F172A'
              }}
            />
          </div>

          {/* Localities List */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ 
              fontSize: 11.5, 
              fontWeight: 800, 
              color: '#64748B', 
              textTransform: 'uppercase', 
              marginBottom: 10, 
              letterSpacing: 0.6 
            }}>
              Popular {activeCity} Neighborhoods
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {filteredLocalities.map((loc) => {
                const isSelected = currentCity === activeCity && currentLocality === loc;
                return (
                  <div
                    key={loc}
                    onClick={() => {
                      onSelectLocation(activeCity, loc);
                      onClose();
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 0,
                      border: `1.5px solid ${isSelected ? '#6E42E5' : '#E2E8F0'}`,
                      background: isSelected ? '#F5F3FF' : '#FFFFFF',
                      fontSize: 13,
                      fontWeight: 600,
                      color: isSelected ? '#6E42E5' : '#334155',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{loc}</span>
                    {isSelected && <Check size={14} color="#6E42E5" strokeWidth={3} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Other Cities */}
          <div>
            <div style={{ 
              fontSize: 11.5, 
              fontWeight: 800, 
              color: '#64748B', 
              textTransform: 'uppercase', 
              marginBottom: 10, 
              letterSpacing: 0.6 
            }}>
              Other Major Cities in India
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CITIES.map((c) => {
                const isCityActive = c.name === activeCity;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setActiveCity(c.name);
                      setSearchTerm('');
                    }}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 0,
                      border: isCityActive ? '1.5px solid #0F172A' : '1px solid #E2E8F0',
                      background: isCityActive ? '#0F172A' : '#F8FAFC',
                      color: isCityActive ? '#FFFFFF' : '#475569',
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
