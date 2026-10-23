import React, { useState, useEffect } from 'react';
import { 
  MapPin, Navigation, Building, ShieldCheck, Compass, ArrowUpRight, 
  Clock, Calendar, Settings, Plus, Search, CheckCircle2, AlertCircle, X 
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
    maxConcurrentBookingsPerHour: 8,
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
            maxConcurrentBookingsPerHour: res.capacityConfig.maxConcurrentBookingsPerHour || 8,
            dailyMaxBookings: res.capacityConfig.dailyMaxBookings || 45,
            leadTimeHours: res.capacityConfig.leadTimeHours || 2,
            bufferMinutesBetweenJobs: res.capacityConfig.bufferMinutesBetweenJobs || 30
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

  const zones = coverage?.coverageZones || ['Bandra West', 'Khar West', 'Santacruz West', 'Pali Hill', 'Andheri West'];
  const pincodes = coverage?.pincodes || ['400050', '400052', '400053', '400054', '400058'];
  const hubs = coverage?.hubs || [];
  const operatingHours = coverage?.operatingHours || { start: '08:00', end: '20:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] };
  const holidays = coverage?.holidays || [];
  const capacityConfig = coverage?.capacityConfig || { maxConcurrentBookingsPerHour: 8, dailyMaxBookings: 45, leadTimeHours: 2, bufferMinutesBetweenJobs: 30 };
  const changeRequests = coverage?.coverageChangeRequests || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        padding: '20px 24px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16
      }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Operating Hubs, Working Hours & Coverage Territory
          </h1>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0 0' }}>
            Allocated urban cluster polygons, technician depots, operating shifts, and live serviceability engine
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setIsCapacityModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Settings size={15} /> Configure Capacity
          </button>

          <button
            onClick={() => setIsCoverageModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              background: '#7c3aed',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Plus size={15} /> Request Coverage Change
          </button>
        </div>
      </div>

      {/* Working Hours, Holidays & Capacity Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* Working Hours */}
        <div style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: 18,
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: '#7c3aed' }}>
            <Clock size={18} />
            <strong style={{ fontSize: 14, color: '#0f172a' }}>Business Operating Hours</strong>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
            {operatingHours.start} - {operatingHours.end}
          </div>
          <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 4 }}>
            Active Days: {operatingHours.days ? operatingHours.days.join(', ') : 'All 7 Days'}
          </div>
        </div>

        {/* Declared Holidays */}
        <div style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: 18,
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: '#d97706' }}>
            <Calendar size={18} />
            <strong style={{ fontSize: 14, color: '#0f172a' }}>Declared Business Holidays</strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {holidays.length === 0 ? (
              <span style={{ fontSize: 13, color: '#64748b' }}>No upcoming business holidays declared</span>
            ) : (
              holidays.map((h, i) => (
                <div key={i} style={{ fontSize: 13, color: '#334155' }}>
                  <strong>{h.date}:</strong> {h.occasion} ({h.type})
                </div>
              ))
            )}
          </div>
        </div>

        {/* Capacity Limits */}
        <div style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: 18,
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: '#059669' }}>
            <ShieldCheck size={18} />
            <strong style={{ fontSize: 14, color: '#0f172a' }}>Authorised Fleet Capacity</strong>
          </div>
          <div style={{ fontSize: 13, color: '#334155', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div>Max Concurrent / Hour: <strong>{capacityConfig.maxConcurrentBookingsPerHour} jobs</strong></div>
            <div>Daily Maximum Jobs: <strong>{capacityConfig.dailyMaxBookings} bookings</strong></div>
            <div>Travel Buffer Window: <strong>{capacityConfig.bufferMinutesBetweenJobs} minutes</strong></div>
          </div>
        </div>
      </div>

      {/* Main Split: Hubs & Coverage Polygons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 20 }}>
        {/* Left: Operational Hubs */}
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          padding: 20,
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>
            Authorized Operational Depots ({coverage?.city || 'Mumbai'})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {hubs.map((hub, idx) => (
              <div
                key={idx}
                style={{
                  padding: 16,
                  background: '#f8fafc',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Building size={16} color="#7c3aed" />
                    <strong style={{ fontSize: 14.5, color: '#0f172a' }}>{hub.name}</strong>
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={14} /> {hub.address}
                  </div>
                </div>
                <div style={{
                  padding: '6px 12px',
                  background: '#dcfce7',
                  color: '#16a34a',
                  borderRadius: 6,
                  fontSize: 12.5,
                  fontWeight: 700
                }}>
                  {hub.activeFleet} Technicians Stationed
                </div>
              </div>
            ))}
          </div>

          {/* Zones & Pincodes list */}
          <div style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginBottom: 10 }}>
              Authorized Service Zones & Postal Pincodes:
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {zones.map((z, i) => (
                <span
                  key={i}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 20,
                    background: '#f1f5f9',
                    color: '#334155',
                    fontSize: 12.5,
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5
                  }}
                >
                  <MapPin size={12} color="#7c3aed" /> {z} ({pincodes[i] || '400050'})
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Server-Side Serviceability Validation Engine */}
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          padding: 20,
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14
        }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Search size={18} color="#7c3aed" /> Server Serviceability Validator
            </h2>
            <p style={{ fontSize: 12.5, color: '#64748b', margin: '4px 0 0 0' }}>
              Test real-time platform serviceability checks against business coverage, operating hours, and capacity
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 3 }}>
                Customer Pincode
              </label>
              <input
                type="text"
                value={testPincode}
                onChange={e => setTestPincode(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 3 }}>
                Service Category
              </label>
              <input
                type="text"
                value={testCategory}
                onChange={e => setTestCategory(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 3 }}>
                  Booking Date
                </label>
                <input
                  type="date"
                  value={testDate}
                  onChange={e => setTestDate(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 3 }}>
                  Time Slot
                </label>
                <input
                  type="time"
                  value={testTime}
                  onChange={e => setTestTime(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>
            </div>

            <button
              onClick={handleValidateServiceability}
              disabled={validating}
              style={{
                marginTop: 6,
                padding: '9px 14px',
                background: '#7c3aed',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {validating ? 'Validating...' : 'Validate on Server'}
            </button>
          </div>

          {/* Validation Result Box */}
          {serviceabilityResult && (
            <div style={{
              padding: 12,
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
          )}
        </div>
      </div>

      {/* Submitted Coverage Expansion Requests */}
      {changeRequests.length > 0 && (
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          padding: '20px 24px',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 14px 0' }}>
            Submitted Coverage Expansion Requests
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {changeRequests.map(cr => (
              <div
                key={cr.id}
                style={{
                  padding: 14,
                  background: '#f8fafc',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12
                }}
              >
                <div>
                  <strong style={{ fontSize: 14, color: '#0f172a' }}>
                    {cr.requestedCity}: {Array.isArray(cr.requestedZones) ? cr.requestedZones.join(', ') : cr.requestedZones}
                  </strong>
                  <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>
                    Justification: "{cr.justification}"
                  </div>
                  <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>
                    Pincodes: {Array.isArray(cr.requestedPincodes) ? cr.requestedPincodes.join(', ') : cr.requestedPincodes} • Submitted: {new Date(cr.submittedAt).toLocaleDateString()}
                  </div>
                </div>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  background: '#fef3c7',
                  color: '#b45309'
                }}>
                  {cr.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coverage Request Modal */}
      {isCoverageModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(3px)',
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
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
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
                onClick={() => setIsCoverageModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
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
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
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
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
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
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
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
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5, resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsCoverageModalOpen(false)}
                  style={{ padding: '9px 16px', background: '#f1f5f9', border: 'none', borderRadius: 8, fontSize: 13.5, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '9px 18px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Capacity Settings Modal */}
      {isCapacityModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(3px)',
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
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
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
                onClick={() => setIsCapacityModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
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
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
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
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
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
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsCapacityModalOpen(false)}
                  style={{ padding: '9px 16px', background: '#f1f5f9', border: 'none', borderRadius: 8, fontSize: 13.5, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '9px 18px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}
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
