import React, { useState, useEffect } from 'react';
import { professionalClient } from '../professionalClient';

export function AvailabilityView({ profile, onToggleOnline, showToast }) {
  const [isOnline, setIsOnline] = useState(profile?.isOnline !== false);
  const [dispatchState, setDispatchState] = useState('Available');
  const [activeBookingId, setActiveBookingId] = useState(null);
  const [workingHours, setWorkingHours] = useState({ start: '08:00', end: '20:00' });
  const [workingDays, setWorkingDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  const [shiftBreaks, setShiftBreaks] = useState([
    { start: '13:00', end: '14:00', title: 'Lunch & Transit Recharge Break' }
  ]);
  const [workingSlots, setWorkingSlots] = useState([
    '08:00 - 10:00',
    '10:30 - 12:30',
    '14:00 - 16:00',
    '16:30 - 18:30'
  ]);
  const [serviceAreas, setServiceAreas] = useState([
    'Bandra West',
    'Khar',
    'Santacruz West',
    'Pali Hill'
  ]);
  const [leaves, setLeaves] = useState([
    { id: 'lv-1', date: '28 Oct 2026', reason: 'Family function & festival', status: 'Approved' }
  ]);

  // Leave Modal
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadAvailability();
  }, []);

  async function loadAvailability() {
    try {
      const data = await professionalClient.getAvailability();
      if (data.success) {
        setIsOnline(data.isOnline);
        if (data.dispatchState) setDispatchState(data.dispatchState);
        if (data.activeBookingId) setActiveBookingId(data.activeBookingId);
        if (data.workingHours) setWorkingHours(data.workingHours);
        if (data.workingDays) setWorkingDays(data.workingDays);
        if (data.shiftBreaks) setShiftBreaks(data.shiftBreaks);
        if (data.workingSlots) setWorkingSlots(data.workingSlots);
        if (data.serviceAreas) setServiceAreas(data.serviceAreas);
        if (data.leaves) setLeaves(data.leaves);
      }
    } catch (err) {
      console.warn('Availability load error:', err);
    }
  }

  const handleToggleDay = (day) => {
    setWorkingDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSaveHours = async () => {
    setSaving(true);
    setErrorMessage('');
    try {
      if (workingHours.start >= workingHours.end) {
        throw new Error('Shift Start Time must precede Shift End Time.');
      }

      await professionalClient.updateAvailability({
        isOnline,
        workingHours,
        workingDays,
        shiftBreaks,
        workingSlots,
        serviceAreas
      });
      showToast('Shift schedule, breaks, and buffer slots updated successfully.');
      loadAvailability();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update schedule');
      showToast(err.message || 'Failed to update schedule');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!leaveDate || !leaveReason) {
      showToast('Please provide both date and reason for leave');
      return;
    }
    setSaving(true);
    setErrorMessage('');
    try {
      await professionalClient.updateAvailability({
        newLeave: {
          date: leaveDate,
          reason: leaveReason
        }
      });
      showToast('Leave request submitted and validated against active dispatch schedule.');
      setShowLeaveModal(false);
      setLeaveDate('');
      setLeaveReason('');
      loadAvailability();
    } catch (err) {
      setErrorMessage(err.message || 'Leave declaration conflict');
      showToast(err.message || 'Failed to submit leave request');
    } finally {
      setSaving(false);
    }
  };

  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1050, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Title & Timezone Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Calendar, Availability & Shift Buffers
          </h1>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            Operating Timezone: <strong>Asia/Kolkata (IST)</strong> • Consistent ISO 8601 scheduling
          </div>
        </div>

        {/* 5 Distinct Availability States Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', padding: '6px 14px', borderRadius: 20, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Dispatch Status:
          </span>
          <span style={{
            background: dispatchState === 'Available' ? '#ecfdf5' :
              dispatchState === 'Busy on Booking' ? '#dbeafe' :
              dispatchState === 'Suspended' ? '#fee2e2' : '#f1f5f9',
            color: dispatchState === 'Available' ? '#059669' :
              dispatchState === 'Busy on Booking' ? '#1e40af' :
              dispatchState === 'Suspended' ? '#991b1b' : '#475569',
            padding: '4px 10px',
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 800
          }}>
            {dispatchState === 'Available' ? '⚡ Currently Available for Assignment' :
              dispatchState === 'Busy on Booking' ? `🔴 Busy on Booking (${activeBookingId || 'In Progress'})` :
              dispatchState === 'Suspended' ? '⛔ Suspended / Ineligible' : '⚪ Offline (Duty Paused)'}
          </span>
        </div>
      </div>

      {/* Prominent Legal/Policy Notice */}
      <div style={{
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        padding: '12px 16px',
        borderRadius: 12,
        fontSize: 13,
        color: '#1e40af',
        lineHeight: 1.5,
        marginBottom: 20
      }}>
        ℹ️ <strong>Platform Dispatch Policy:</strong> Declared working availability indicates readiness for dispatch but <strong>does not guarantee booking assignment</strong>. Allocation algorithms evaluate existing bookings, travel/buffer times (30 min minimum), working hours, declared leave, qualifications, and operational service zones. Confirmed bookings are never removed silently when availability changes.
      </div>

      {errorMessage && (
        <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Live Online / Offline Card */}
      <div style={{
        background: isOnline ? 'linear-gradient(135deg, #065f46 0%, #047857 100%)' : '#334155',
        borderRadius: 16,
        padding: '24px 28px',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: isOnline ? '#34d399' : '#94a3b8'
            }} />
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
              {isOnline ? 'You Are Currently ONLINE (Ready for Auto-Dispatch)' : 'You Are Currently OFFLINE'}
            </h2>
          </div>
          <p style={{ fontSize: 13, opacity: 0.9, margin: '6px 0 0 0' }}>
            {isOnline
              ? 'The dispatch engine actively matches new customer requests across your authorized service areas.'
              : 'You will not receive any instant job dispatches while duty switch is off.'}
          </p>
        </div>

        <button
          onClick={async () => {
            const nextOnline = !isOnline;
            setIsOnline(nextOnline);
            onToggleOnline();
            await professionalClient.updateAvailability({ isOnline: nextOnline });
            loadAvailability();
          }}
          style={{
            background: isOnline ? '#ffffff' : '#10b981',
            color: isOnline ? '#065f46' : '#ffffff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {isOnline ? 'Go Offline (Pause Duty)' : 'Go Online (Start Duty)'}
        </button>
      </div>

      {/* Grid: Shift Timings, Breaks & Buffer Slots */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, marginBottom: 24, alignItems: 'start' }}>
        
        {/* Working Hours & Working Days */}
        <div style={{
          background: '#ffffff',
          borderRadius: 16,
          padding: '24px 28px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>
            Daily Working Hours (Declared Availability)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>
                Shift Start Time
              </label>
              <input
                type="time"
                value={workingHours.start}
                onChange={(e) => setWorkingHours(prev => ({ ...prev, start: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>
                Shift End Time
              </label>
              <input
                type="time"
                value={workingHours.end}
                onChange={(e) => setWorkingHours(prev => ({ ...prev, end: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
            Weekly Working Days & Days Off
          </h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 14px 0' }}>
            Highlighted days represent declared availability. Unselected days are treated as scheduled off-days.
          </p>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {allDays.map(day => {
              const active = workingDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleToggleDay(day)}
                  style={{
                    background: active ? '#2563eb' : '#f8fafc',
                    color: active ? '#ffffff' : '#64748b',
                    border: `1px solid ${active ? '#2563eb' : '#cbd5e1'}`,
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {day} {active ? '✓' : '(Off)'}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSaveHours}
            disabled={saving}
            style={{
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              padding: '11px 24px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {saving ? 'Saving...' : 'Save Shift Settings ✓'}
          </button>
        </div>

        {/* Shift Breaks, Buffer Slots & Service Areas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Shift Breaks */}
          <div style={{ background: '#ffffff', borderRadius: 16, padding: '22px 24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 10px 0' }}>
              🥪 Shift Breaks & Recharge Windows
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {shiftBreaks.map((brk, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}>
                  <div>
                    <strong style={{ color: '#0f172a' }}>{brk.title}</strong>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>No dispatches scheduled during break</div>
                  </div>
                  <span style={{ fontWeight: 700, color: '#2563eb' }}>{brk.start} - {brk.end}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Working Dispatch Slots (With Travel Buffers) */}
          <div style={{ background: '#ffffff', borderRadius: 16, padding: '22px 24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                ⏱️ Dispatch Slots (30-min Travel Buffers)
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {workingSlots.map((slot, idx) => (
                <div key={idx} style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600, color: '#334155', textAlign: 'center' }}>
                  {slot}
                </div>
              ))}
            </div>
          </div>

          {/* Operational Service Areas */}
          <div style={{ background: '#ffffff', borderRadius: 16, padding: '22px 24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 10px 0' }}>
              📍 Operational Service Areas
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {serviceAreas.map((area, idx) => (
                <span key={idx} style={{ background: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: 14, fontSize: 12, fontWeight: 600 }}>
                  📍 {area}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Planned Leaves & Declared Off-Days */}
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: '24px 28px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Planned Leaves & Shift Declarations
            </h3>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              Submitted leaves are checked against active dispatches. Conflicts require reassignment prior to approval.
            </div>
          </div>

          <button
            onClick={() => setShowLeaveModal(true)}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            + Declare New Leave
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {leaves.map(lv => (
            <div
              key={lv.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: 10,
                background: '#f8fafc',
                border: '1px solid #e2e8f0'
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{lv.date}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{lv.reason}</div>
              </div>
              <span style={{
                background: lv.status === 'Approved' ? '#ecfdf5' : '#fffbeb',
                color: lv.status === 'Approved' ? '#059669' : '#d97706',
                padding: '4px 10px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700
              }}>
                {lv.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Leave Application Modal */}
      {showLeaveModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: 24,
            width: '100%',
            maxWidth: 420,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
              Declare Planned Leave
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0' }}>
              System checks for existing booking appointments on this date before approval.
            </p>

            <form onSubmit={handleApplyLeave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Leave Date</label>
                <input
                  type="date"
                  value={leaveDate}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, marginTop: 4, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Reason for Absence</label>
                <textarea
                  rows={3}
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="e.g. Family function / Vehicle periodic maintenance..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, marginTop: 4, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ flex: 1.5, background: '#2563eb', color: '#ffffff', border: 'none', padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  {saving ? 'Validating...' : 'Submit Leave Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
