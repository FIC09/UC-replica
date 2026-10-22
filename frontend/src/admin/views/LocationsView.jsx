import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  CloudRain, 
  CheckCircle2, 
  Sliders, 
  Users, 
  IndianRupee, 
  Search, 
  Plus, 
  Clock, 
  Calendar, 
  ShieldAlert, 
  Check, 
  X, 
  ChevronRight, 
  AlertTriangle,
  RefreshCw,
  Building,
  Hash
} from 'lucide-react';
import { adminClient } from '../adminClient';

export function LocationsView({ onShowToast, onNavigate }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState(null);

  // Serviceability Test Console State
  const [testCity, setTestCity] = useState('Mumbai');
  const [testPincode, setTestPincode] = useState('400050');
  const [testResult, setTestResult] = useState(null);
  const [testingService, setTestingService] = useState(false);

  // Modals
  const [showPincodeModal, setShowPincodeModal] = useState(false);
  const [pincodeData, setPincodeData] = useState({
    cityId: '',
    pincode: '',
    area: '',
    serviceable: true,
    activeCategories: 'AC Repair, Cleaning, Salon, Electrical'
  });

  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [capacityData, setCapacityData] = useState({
    cityId: '',
    slotCapacityPerHour: 25,
    startHour: '08:00',
    endHour: '21:00'
  });

  const fetchLocationsList = () => {
    setLoading(true);
    adminClient.getLocations()
      .then(res => {
        setLocations(res.locations || []);
        if (res.locations && res.locations.length > 0 && !selectedCity) {
          setSelectedCity(res.locations[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchLocationsList();
  }, []);

  // Handle Weather Surge Toggle
  function handleToggleSurge(loc) {
    const nextSurge = !loc.activeSurge;
    adminClient.toggleLocationSurge(loc.id, nextSurge, nextSurge ? 49 : 0)
      .then(() => {
        setLocations(prev => prev.map(l => l.id === loc.id ? { ...l, activeSurge: nextSurge, surgeAmount: nextSurge ? 49 : 0 } : l));
        if (selectedCity?.id === loc.id) {
          setSelectedCity(prev => ({ ...prev, activeSurge: nextSurge, surgeAmount: nextSurge ? 49 : 0 }));
        }
        onShowToast && onShowToast(`Weather monsoon surge ${nextSurge ? 'activated (+₹49)' : 'deactivated'} for ${loc.city}`);
      });
  }

  // Handle Add/Update Pincode
  function handlePincodeSubmit(e) {
    e.preventDefault();
    if (!pincodeData.pincode) return;

    const payload = {
      ...pincodeData,
      activeCategories: pincodeData.activeCategories.split(',').map(s => s.trim()).filter(Boolean)
    };

    adminClient.updatePincodeCoverage(payload)
      .then(() => {
        onShowToast && onShowToast(`✓ Postal code ${pincodeData.pincode} updated in perimeter`);
        setShowPincodeModal(false);
        fetchLocationsList();
      })
      .catch(err => {
        onShowToast && onShowToast(`Error: ${err.message}`);
      });
  }

  // Handle Slot Capacity & Hours
  function handleCapacitySubmit(e) {
    e.preventDefault();
    const payload = {
      cityId: capacityData.cityId,
      slotCapacityPerHour: parseInt(capacityData.slotCapacityPerHour) || 25,
      workingHours: {
        start: capacityData.startHour,
        end: capacityData.endHour
      }
    };

    adminClient.updateOperatingParameters(payload)
      .then(() => {
        onShowToast && onShowToast(`✓ Operating hours & slot capacity updated`);
        setShowCapacityModal(false);
        fetchLocationsList();
      })
      .catch(err => {
        onShowToast && onShowToast(`Error: ${err.message}`);
      });
  }

  // Test Address Serviceability Console (Strict address validation)
  function handleTestServiceability(e) {
    e.preventDefault();
    setTestingService(true);
    setTestResult(null);

    adminClient.checkServiceability({ city: testCity, pincode: testPincode })
      .then(res => {
        setTestResult(res);
        setTestingService(false);
      })
      .catch(err => {
        setTestResult({
          serviceable: false,
          message: err.message || `Postal code ${testPincode} outside serviceable territory.`
        });
        setTestingService(false);
      });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: '20px 24px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>
            Locations, Postal Codes & Serviceability Perimeter
          </h2>
          <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
            Validated zone perimeters, postal code directory, dispatch hubs, slot capacity limits & weather surge
          </p>
        </div>

        <button
          onClick={fetchLocationsList}
          title="Refresh Locations"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F8FAFC',
            color: '#475569',
            border: '1px solid #CBD5E1',
            borderRadius: 8,
            padding: '10px',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Address Serviceability Validator Console */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: '18px 20px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <ShieldAlert size={18} color="#6E42E5" />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
            Live Address Serviceability Tester (Strict Address Rejection)
          </span>
        </div>

        <form onSubmit={handleTestServiceability} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 4 }}>Select City:</label>
            <select
              value={testCity}
              onChange={e => setTestCity(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, backgroundColor: '#FFFFFF' }}
            >
              <option value="Mumbai">Mumbai</option>
              <option value="Krishnagiri">Krishnagiri</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Delhi NCR">Delhi NCR</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 4 }}>Postal Code (Pincode):</label>
            <input
              type="text"
              required
              placeholder="e.g. 400050 or 635001"
              value={testPincode}
              onChange={e => setTestPincode(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, width: 180 }}
            />
          </div>

          <button
            type="submit"
            disabled={testingService}
            style={{
              padding: '8px 18px',
              borderRadius: 6,
              border: 'none',
              backgroundColor: '#6E42E5',
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {testingService ? 'Verifying...' : 'Validate Pincode'}
          </button>
        </form>

        {/* Verification Result Feedback */}
        {testResult && (
          <div style={{
            marginTop: 14,
            padding: '12px 16px',
            borderRadius: 8,
            backgroundColor: testResult.serviceable ? '#F0FDF4' : '#FEF2F2',
            border: testResult.serviceable ? '1px solid #BBF7D0' : '1px solid #FECACA',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {testResult.serviceable ? <CheckCircle2 size={16} color="#16A34A" /> : <AlertTriangle size={16} color="#DC2626" />}
              <span style={{ color: testResult.serviceable ? '#166534' : '#991B1B', fontWeight: 600 }}>
                {testResult.serviceable
                  ? `✓ Pincode ${testResult.pincode} (${testResult.area}) is fully serviceable in ${testResult.city}.`
                  : testResult.message || `Pincode ${testPincode} rejected: outside operational perimeter.`}
              </span>
            </div>

            {testResult.serviceable && testResult.activeSurge && (
              <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                Monsoon Rain Surge Active (+₹{testResult.surgeAmount})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Cities Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 16
      }}>
        {locations.map(loc => {
          const isSelected = selectedCity?.id === loc.id;

          return (
            <div
              key={loc.id}
              onClick={() => setSelectedCity(loc)}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: isSelected ? '2px solid #6E42E5' : '1px solid #E2E8F0',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={18} color="#6E42E5" />
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>{loc.city}</span>
                </div>

                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  backgroundColor: '#DCFCE7',
                  color: '#15803D',
                  padding: '2px 8px',
                  borderRadius: 12
                }}>
                  {loc.status}
                </span>
              </div>

              <div style={{ fontSize: 12, color: '#64748B', marginBottom: 14 }}>
                {loc.state} • {loc.coverageRadiusKm} km coverage radius • {loc.activePros} active technicians
              </div>

              {/* Slot Capacity & Hours */}
              <div style={{
                padding: '10px 12px',
                borderRadius: 8,
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                fontSize: 11,
                color: '#334155',
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 14
              }}>
                <div>
                  <span>Slot Limit: <strong>{loc.slotCapacityPerHour || 25} jobs/hr</strong></span>
                </div>
                <div>
                  <span>Hours: <strong>{loc.workingHours?.start || '08:00'} - {loc.workingHours?.end || '21:00'}</strong></span>
                </div>
              </div>

              {/* Weather Surge Toggle */}
              <div style={{
                padding: '10px 12px',
                borderRadius: 8,
                backgroundColor: loc.activeSurge ? '#FEF3C7' : '#F1F5F9',
                border: loc.activeSurge ? '1px solid #FDE68A' : '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CloudRain size={16} color={loc.activeSurge ? '#D97706' : '#64748B'} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: loc.activeSurge ? '#92400E' : '#334155' }}>
                      {loc.activeSurge ? `Weather Surge Active (+₹${loc.surgeAmount})` : 'Normal Operations'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleSurge(loc);
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: 'none',
                    backgroundColor: loc.activeSurge ? '#D97706' : '#6E42E5',
                    color: '#FFFFFF',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {loc.activeSurge ? 'Disable Surge' : 'Activate Surge'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected City Pincodes Directory and Hubs */}
      {selectedCity && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          padding: '20px 24px',
          border: '1px solid #E2E8F0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                {selectedCity.city} Postal Codes & Hub Stations
              </h3>
              <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0 0' }}>
                Addresses outside these verified postal codes are rejected automatically during booking checkout
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => {
                  setPincodeData({
                    cityId: selectedCity.id,
                    pincode: '',
                    area: '',
                    serviceable: true,
                    activeCategories: 'AC Repair, Cleaning, Salon, Electrical'
                  });
                  setShowPincodeModal(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 6,
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#334155',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Plus size={14} /> Add Postal Code
              </button>

              <button
                onClick={() => {
                  setCapacityData({
                    cityId: selectedCity.id,
                    slotCapacityPerHour: selectedCity.slotCapacityPerHour || 25,
                    startHour: selectedCity.workingHours?.start || '08:00',
                    endHour: selectedCity.workingHours?.end || '21:00'
                  });
                  setShowCapacityModal(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 6,
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#334155',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Sliders size={14} /> Capacity & Hours
              </button>
            </div>
          </div>

          {/* Postal Codes Table */}
          <div style={{ overflowX: 'auto', marginBottom: 20 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 14px', fontWeight: 600, color: '#475569' }}>Postal Code (Pincode)</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600, color: '#475569' }}>Service Area / Locality</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600, color: '#475569' }}>Perimeter Status</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600, color: '#475569' }}>Serviceable Categories</th>
                </tr>
              </thead>
              <tbody>
                {(selectedCity.postalCodes || [
                  { pincode: '400050', area: 'Bandra West', serviceable: true, activeCategories: ['AC Repair', 'Cleaning', 'Salon', 'Electrical'] },
                  { pincode: '400051', area: 'Bandra Kurla Complex (BKC)', serviceable: true, activeCategories: ['Cleaning', 'AC Repair'] }
                ]).map(p => (
                  <tr key={p.pincode} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0F172A' }}>
                      <code>{p.pincode}</code>
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 500, color: '#1E293B' }}>{p.area}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '2px 8px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        backgroundColor: p.serviceable ? '#DCFCE7' : '#FEE2E2',
                        color: p.serviceable ? '#15803D' : '#DC2626'
                      }}>
                        {p.serviceable ? '✓ Serviceable' : 'Unavailable'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#64748B' }}>
                      {(p.activeCategories || ['All Services']).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Operational Hub Stations */}
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>
              Physical Hub Depots & Coverage Stations
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {(selectedCity.hubs || [
                { name: 'Bandra West Central Hub', locality: 'Bandra West', address: 'Plot 14, Perry Road', activePros: 140 }
              ]).map((h, i) => (
                <div key={i} style={{
                  padding: '12px',
                  borderRadius: 8,
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  fontSize: 12
                }}>
                  <div style={{ fontWeight: 700, color: '#0F172A' }}>{h.name}</div>
                  <div style={{ color: '#64748B', marginTop: 2 }}>{h.address || h.locality}</div>
                  <div style={{ color: '#16A34A', fontWeight: 600, marginTop: 4 }}>{h.activePros || 20} technicians stationed</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ADD POSTAL CODE MODAL                                     */}
      {/* ======================================================== */}
      {showPincodeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            width: '100%',
            maxWidth: 480,
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: '0 0 16px 0' }}>
              Add / Update Serviceable Pincode
            </h3>

            <form onSubmit={handlePincodeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Postal Code (Pincode) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 400050"
                  value={pincodeData.pincode}
                  onChange={e => setPincodeData(prev => ({ ...prev, pincode: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Area / Locality Name</label>
                <input
                  type="text"
                  placeholder="e.g. Bandra West (Perry Cross Road)"
                  value={pincodeData.area}
                  onChange={e => setPincodeData(prev => ({ ...prev, area: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Active Categories (Comma separated)</label>
                <input
                  type="text"
                  value={pincodeData.activeCategories}
                  onChange={e => setPincodeData(prev => ({ ...prev, activeCategories: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
                <button
                  type="button"
                  onClick={() => setShowPincodeModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: 6,
                    border: 'none',
                    backgroundColor: '#6E42E5',
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Save Pincode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CAPACITY & HOURS MODAL                                    */}
      {/* ======================================================== */}
      {showCapacityModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            width: '100%',
            maxWidth: 480,
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: '0 0 16px 0' }}>
              Configure Slot Capacity & Operating Hours
            </h3>

            <form onSubmit={handleCapacitySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Max Bookings Per Hour (Slot Limit):</label>
                <input
                  type="number"
                  min={1}
                  value={capacityData.slotCapacityPerHour}
                  onChange={e => setCapacityData(prev => ({ ...prev, slotCapacityPerHour: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Opening Hour (Start)</label>
                  <input
                    type="time"
                    value={capacityData.startHour}
                    onChange={e => setCapacityData(prev => ({ ...prev, startHour: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Closing Hour (End)</label>
                  <input
                    type="time"
                    value={capacityData.endHour}
                    onChange={e => setCapacityData(prev => ({ ...prev, endHour: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
                <button
                  type="button"
                  onClick={() => setShowCapacityModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: 6,
                    border: 'none',
                    backgroundColor: '#6E42E5',
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Save Parameters
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
