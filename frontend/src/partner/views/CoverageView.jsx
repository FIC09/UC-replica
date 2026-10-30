import React, { useState, useEffect } from 'react';
import { 
  MapPin, Navigation, Building, ShieldCheck, Compass, ArrowUpRight, 
  Clock, Calendar, Settings, Plus, Search, CheckCircle2, AlertCircle, X,
  Briefcase, Check, Sparkles, Layers
} from 'lucide-react';
import { partnerClient } from '../partnerClient';

export function CoverageView({ showToast }) {
  const [loading, setLoading] = useState(true);
  const [coverage, setCoverage] = useState(null);
  const [isCoverageModalOpen, setIsCoverageModalOpen] = useState(false);
  const [isCapacityModalOpen, setIsCapacityModalOpen] = useState(false);

  // Coverage change form
  const [ccrForm, setCcrForm] = useState({
    requestedCity: 'Mumbai',
    requestedZones: '',
    requestedPincodes: '',
    justification: ''
  });

  // Capacity form
  const [capacityForm, setCapacityForm] = useState({
    maxConcurrentBookingsPerHour: 12,
    dailyMaxBookings: 45,
    leadTimeHours: 2,
    bufferMinutesBetweenJobs: 30
  });

  // Serviceability testing tool state
  const [testPincode, setTestPincode] = useState('400050');
  const [testCategory, setTestCategory] = useState('AC & Appliance Care');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [testTime, setTestTime] = useState('14:00');
  const [serviceabilityResult, setServiceabilityResult] = useState(null);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCoverage();
  }, []);

  async function loadCoverage() {
    setLoading(true);
    try {
      const res = await partnerClient.getCoverage();
      if (res && res.success) {
        setCoverage(res);
        if (res.capacityConfig) {
          setCapacityForm({
            maxConcurrentBookingsPerHour: res.capacityConfig.maxConcurrentBookingsPerHour || 0,
            dailyMaxBookings: res.capacityConfig.dailyMaxBookings || 0,
            leadTimeHours: res.capacityConfig.leadTimeHours || 0,
            bufferMinutesBetweenJobs: res.capacityConfig.bufferMinutesBetweenJobs || 0
          });
        }
      }
    } catch (err) {
      showToast?.('Error loading coverage zones: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCoverageRequest(e) {
    e.preventDefault();
    if (!ccrForm.requestedCity || !ccrForm.requestedZones || !ccrForm.justification) {
      showToast?.('City, zones, and justification are mandatory.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await partnerClient.requestCoverageChange({
        requestedCity: ccrForm.requestedCity,
        requestedZones: ccrForm.requestedZones.split(',').map(z => z.trim()),
        requestedPincodes: ccrForm.requestedPincodes.split(',').map(p => p.trim()),
        justification: ccrForm.justification
      });
      if (res && res.success) {
        showToast?.('Coverage change request submitted for platform geographic review.');
        setIsCoverageModalOpen(false);
        setCcrForm({ requestedCity: 'Mumbai', requestedZones: '', requestedPincodes: '', justification: '' });
        loadCoverage();
      }
    } catch (err) {
      showToast?.(err.message || 'Failed to submit coverage change request');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCapacitySave(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await partnerClient.updateCapacityConfig(capacityForm);
      if (res && res.success) {
        showToast?.('Operational capacity settings updated successfully.');
        setIsCapacityModalOpen(false);
        loadCoverage();
      }
    } catch (err) {
      showToast?.('Failed to update capacity: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleValidateServiceability() {
    setValidating(true);
    setServiceabilityResult(null);
    try {
      const res = await partnerClient.validateServiceability({
        pincode: testPincode,
        serviceCategory: testCategory,
        bookingDate: testDate,
        bookingTime: testTime
      });
      setServiceabilityResult(res);
    } catch (err) {
      showToast?.('Validation error: ' + err.message);
    } finally {
      setValidating(false);
    }
  }

  const zones = coverage?.coverageZones && coverage.coverageZones.length > 0
    ? coverage.coverageZones
    : [];

  const pincodes = coverage?.pincodes && coverage.pincodes.length > 0
    ? coverage.pincodes
    : [];

  const hubs = coverage?.hubs || [];

  const operatingHours = coverage?.operatingHours || { 
    start: '08:00', 
    end: '20:00', 
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] 
  };

  const holidays = coverage?.holidays || [];

  const capacityConfig = coverage?.capacityConfig || { 
    maxConcurrentBookingsPerHour: 0, 
    dailyMaxBookings: 0, 
    leadTimeHours: 2, 
    bufferMinutesBetweenJobs: 30 
  };

  const changeRequests = coverage?.coverageChangeRequests && coverage.coverageChangeRequests.length > 0
    ? coverage.coverageChangeRequests
    : [
      {
        id: 'CCR-201',
        partnerId: 'PTR-90142',
        requestedCity: 'Mumbai',
        requestedZones: ['Powai', 'Vikhroli West'],
        requestedPincodes: ['400076', '400079'],
        justification: 'Opening satellite service depot at Hiranandani Business Park to reduce travel buffer.',
        status: 'Pending Platform Review',
        submittedAt: '2026-10-26T05:23:29.461Z'
      }
    ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Page Header Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        padding: '20px 24px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
            border: '1px solid #e9d5ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#7c3aed',
            flexShrink: 0
          }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: 19, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>
              Operating Hubs, Working Hours & Coverage Territory
            </h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0', lineHeight: 1.4 }}>
              Allocated urban cluster polygons, technician depots, operating shifts, and live serviceability engine
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={() => setIsCapacityModalOpen(true)}
            style={{
              height: 38,
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '0 15px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.color = '#7c3aed'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#334155'; }}
          >
            <Settings size={15} /> Configure Capacity
          </button>

          <button
            type="button"
            onClick={() => setIsCoverageModalOpen(true)}
            style={{
              height: 38,
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '0 16px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(124, 58, 237, 0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(124, 58, 237, 0.25)'; }}
          >
            <Plus size={15} /> Request Coverage Change
          </button>
        </div>
      </div>

      {/* 2. Working Hours, Holidays & Capacity Overview Cards (Symmetrical 3-Tier Grid) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* Working Hours */}
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          padding: '18px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 140
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#f5f3ff',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Clock size={16} />
              </div>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>Operating Hours</span>
            </div>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 6,
              background: '#f5f3ff',
              color: '#7c3aed',
              border: '1px solid #ede9fe'
            }}>
              Daily Shift
            </span>
          </div>

          <div style={{ margin: '10px 0 6px' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {operatingHours.start} – {operatingHours.end}
            </div>
          </div>

          <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={13} color="#94a3b8" />
            <span>Active Days: {operatingHours.days ? operatingHours.days.join(', ') : 'All 7 Days'}</span>
          </div>
        </div>

        {/* Declared Holidays */}
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          padding: '18px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 140
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#fffbeb',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Calendar size={16} />
              </div>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>Declared Holidays</span>
            </div>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 6,
              background: '#fffbeb',
              color: '#b45309',
              border: '1px solid #fef3c7'
            }}>
              {holidays.length} Scheduled
            </span>
          </div>

          <div style={{ margin: '10px 0 6px' }}>
            {holidays.length > 0 ? (
              <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                {holidays[0].occasion}
                <span style={{ fontSize: 11.5, fontWeight: 600, color: '#b45309', marginLeft: 8, background: '#fef3c7', padding: '1px 6px', borderRadius: 4 }}>
                  {holidays[0].type}
                </span>
              </div>
            ) : (
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                Full Schedule Active
              </div>
            )}
          </div>

          <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={13} color="#94a3b8" />
            <span>
              {holidays.length > 0
                ? `Next Date: ${holidays[0].date} ${holidays.length > 1 ? `(+${holidays.length - 1} more)` : ''}`
                : 'No upcoming business holiday closures'}
            </span>
          </div>
        </div>

        {/* Capacity Limits */}
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          padding: '18px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 140
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={16} />
              </div>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>Authorised Capacity</span>
            </div>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 6,
              background: '#ecfdf5',
              color: '#059669',
              border: '1px solid #d1fae5'
            }}>
              Verified Tier
            </span>
          </div>

          <div style={{ margin: '10px 0 6px' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {capacityConfig.maxConcurrentBookingsPerHour || 0} <span style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>Jobs / Hour</span>
            </div>
          </div>

          <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>Max Daily: <strong style={{ color: '#334155' }}>{capacityConfig.dailyMaxBookings || 0} jobs</strong></span>
            <span>•</span>
            <span>Buffer: <strong style={{ color: '#334155' }}>{capacityConfig.bufferMinutesBetweenJobs || 0}m</strong></span>
          </div>
        </div>
      </div>

      {/* 3. Main Split: Hubs & Coverage Polygons on Left, Validator on Right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)',
        gap: 20,
        alignItems: 'stretch'
      }}>
        {/* Left: Operational Hubs & Service Zones */}
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          padding: 24,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Building size={18} color="#7c3aed" />
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Authorized Operational Depots ({coverage?.city || 'Mumbai'})
                </h2>
              </div>
              <span style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#64748b',
                background: '#f1f5f9',
                padding: '3px 10px',
                borderRadius: 6
              }}>
                {hubs.length} Registered Hubs
              </span>
            </div>

            {/* Hubs Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {hubs.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                  No regional hubs registered for this coverage area.
                </div>
              ) : (
                hubs.map((hub, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '14px 16px',
                      background: '#f8fafc',
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <strong style={{ fontSize: 14, color: '#0f172a' }}>{hub.name}</strong>
                      </div>
                      <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <MapPin size={13} color="#94a3b8" />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{hub.address}</span>
                      </div>
                    </div>
                    <div style={{
                      padding: '5px 12px',
                      background: '#ecfdf5',
                      border: '1px solid #d1fae5',
                      color: '#059669',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                      {hub.activeFleet} Techs Stationed
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Zones & Pincodes list */}
          <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 13.5, fontWeight: 700, color: '#334155', margin: 0 }}>
                Authorized Service Zones & Postal Pincodes
              </h3>
              <span style={{ fontSize: 12, color: '#7c3aed', fontWeight: 600 }}>
                {zones.length} Active Territories
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {zones.length === 0 ? (
                <div style={{ padding: '16px 0', color: '#94a3b8', fontSize: 13 }}>
                  No coverage zones assigned. Submit an expansion request below.
                </div>
              ) : (
                zones.map((z, i) => (
                  <span
                    key={i}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      color: '#334155',
                      fontSize: 12.5,
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <MapPin size={12} color="#7c3aed" />
                    <span>{z}</span>
                    {pincodes[i] && (
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        background: '#ede9fe',
                        color: '#7c3aed',
                        padding: '1px 6px',
                        borderRadius: 4
                      }}>
                        {pincodes[i]}
                      </span>
                    )}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Server-Side Serviceability Validation Engine */}
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          padding: 24,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#f5f3ff',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Search size={16} />
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Serviceability Validator
              </h2>
            </div>
            <p style={{ fontSize: 12.5, color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.4 }}>
              Test real-time platform serviceability checks against business coverage, operating hours, and capacity
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>
                  Customer Pincode
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={14} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
                  <input
                    type="text"
                    value={testPincode}
                    onChange={e => setTestPincode(e.target.value)}
                    placeholder="Enter 6-digit PIN"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      height: 38,
                      padding: '0 12px 0 34px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      color: '#0f172a'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>
                  Service Category
                </label>
                <input
                  type="text"
                  value={testCategory}
                  onChange={e => setTestCategory(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    height: 38,
                    padding: '0 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    color: '#0f172a'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>
                    Booking Date
                  </label>
                  <input
                    type="date"
                    value={testDate}
                    onChange={e => setTestDate(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      height: 38,
                      padding: '0 10px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 12.5,
                      color: '#0f172a'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>
                    Time Slot
                  </label>
                  <input
                    type="time"
                    value={testTime}
                    onChange={e => setTestTime(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      height: 38,
                      padding: '0 10px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 12.5,
                      color: '#0f172a'
                    }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleValidateServiceability}
                disabled={validating}
                style={{
                  marginTop: 4,
                  height: 38,
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: validating ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 6px rgba(124,58,237,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.15s ease'
                }}
              >
                {validating ? (
                  <>Checking Serviceability...</>
                ) : (
                  <>Run Server Validation</>
                )}
              </button>
            </div>
          </div>

          {/* Validation Result Box / Idle Helper Box */}
          <div style={{ marginTop: 16 }}>
            {serviceabilityResult ? (
              <div style={{
                padding: '12px 14px',
                borderRadius: 8,
                background: serviceabilityResult.serviceable ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${serviceabilityResult.serviceable ? '#bbf7d0' : '#fecaca'}`,
                fontSize: 12.5,
                color: serviceabilityResult.serviceable ? '#166534' : '#991b1b'
              }}>
                <div style={{ fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {serviceabilityResult.serviceable ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {serviceabilityResult.serviceable ? 'Serviceable by Your Agency' : 'Unserviceable / Slot Unavailable'}
                </div>
                <div>{serviceabilityResult.message || serviceabilityResult.reason}</div>
                {serviceabilityResult.details && (
                  <div style={{ marginTop: 6, fontSize: 11.5, color: '#334155' }}>
                    Nearest Depot: {serviceabilityResult.details.nearestHub} (Travel Buffer: {serviceabilityResult.details.estimatedTravelBufferMinutes} mins)
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                padding: '10px 12px',
                borderRadius: 8,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: 12,
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <ShieldCheck size={16} color="#7c3aed" style={{ flexShrink: 0 }} />
                <span>Validates dispatch eligibility against franchise polygon borders, active technician shifts, and buffer travel times.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Submitted Coverage Expansion Requests */}
      {changeRequests.length > 0 && (
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          padding: '20px 24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Submitted Coverage Expansion Requests
            </h2>
            <span style={{ fontSize: 12, color: '#64748b', background: '#f1f5f9', padding: '3px 10px', borderRadius: 6, fontWeight: 600 }}>
              {changeRequests.length} Active Platform Submissions
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {changeRequests.map(cr => (
              <div
                key={cr.id}
                style={{
                  padding: '14px 18px',
                  background: '#f8fafc',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      background: '#ede9fe',
                      color: '#7c3aed',
                      padding: '2px 7px',
                      borderRadius: 4
                    }}>
                      {cr.id}
                    </span>
                    <strong style={{ fontSize: 14, color: '#0f172a' }}>
                      {cr.requestedCity}: {Array.isArray(cr.requestedZones) ? cr.requestedZones.join(', ') : cr.requestedZones}
                    </strong>
                  </div>
                  <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 4 }}>
                    Justification: "{cr.justification}"
                  </div>
                  <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 3 }}>
                    Pincodes: {Array.isArray(cr.requestedPincodes) ? cr.requestedPincodes.join(', ') : cr.requestedPincodes} • Submitted: {new Date(cr.submittedAt).toLocaleDateString()}
                  </div>
                </div>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  color: '#b45309'
                }}>
                  {cr.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Coverage Request Modal */}
      {isCoverageModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            maxWidth: 520,
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Request Coverage Territory Expansion
              </h2>
              <button
                type="button"
                onClick={() => setIsCoverageModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCoverageRequest} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Target City *
                </label>
                <input
                  type="text"
                  value={ccrForm.requestedCity}
                  onChange={e => setCcrForm({ ...ccrForm, requestedCity: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Requested Zones (comma separated) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Powai, Vikhroli West, Kanjurmarg"
                  value={ccrForm.requestedZones}
                  onChange={e => setCcrForm({ ...ccrForm, requestedZones: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Postal Pincodes (comma separated) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 400076, 400079"
                  value={ccrForm.requestedPincodes}
                  onChange={e => setCcrForm({ ...ccrForm, requestedPincodes: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Logistical Justification & Satellite Hub readiness *
                </label>
                <textarea
                  rows="3"
                  placeholder="Explain new technician depot location, travel buffer reductions, and fleet readiness..."
                  value={ccrForm.justification}
                  onChange={e => setCcrForm({ ...ccrForm, justification: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5, resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsCoverageModalOpen(false)}
                  style={{ height: 38, padding: '0 16px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ height: 38, padding: '0 18px', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 6px rgba(124,58,237,0.25)' }}
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Capacity Settings Modal */}
      {isCapacityModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            maxWidth: 480,
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Configure Authorised Capacity
              </h2>
              <button
                type="button"
                onClick={() => setIsCapacityModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCapacitySave} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Max Concurrent Bookings Per Hour
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={capacityForm.maxConcurrentBookingsPerHour}
                  onChange={e => setCapacityForm({ ...capacityForm, maxConcurrentBookingsPerHour: Number(e.target.value) })}
                  style={{ width: '100%', boxSizing: 'border-box', height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Daily Maximum Bookings Limit
                </label>
                <input
                  type="number"
                  min="5"
                  max="200"
                  value={capacityForm.dailyMaxBookings}
                  onChange={e => setCapacityForm({ ...capacityForm, dailyMaxBookings: Number(e.target.value) })}
                  style={{ width: '100%', boxSizing: 'border-box', height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Travel Buffer Window Between Appointments (Minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  max="60"
                  step="5"
                  value={capacityForm.bufferMinutesBetweenJobs}
                  onChange={e => setCapacityForm({ ...capacityForm, bufferMinutesBetweenJobs: Number(e.target.value) })}
                  style={{ width: '100%', boxSizing: 'border-box', height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsCapacityModalOpen(false)}
                  style={{ height: 38, padding: '0 16px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ height: 38, padding: '0 18px', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 6px rgba(124,58,237,0.25)' }}
                >
                  {submitting ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
