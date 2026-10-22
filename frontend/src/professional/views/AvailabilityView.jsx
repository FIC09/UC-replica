import React, { useState, useEffect } from 'react';
import { professionalClient } from '../professionalClient';

export function AvailabilityView({ profile, onToggleOnline, showToast }) {
  const [isOnline, setIsOnline] = useState(profile?.isOnline !== false);
  const [workingHours, setWorkingHours] = useState({ start: '08:00', end: '20:00' });
  const [workingDays, setWorkingDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  const [leaves, setLeaves] = useState([
    { id: 'lv-1', date: '28 Oct 2026', reason: 'Family function & festival', status: 'Approved' }
  ]);

  // Leave Modal
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAvailability();
  }, []);

  async function loadAvailability() {
    try {
      const data = await professionalClient.getAvailability();
      if (data.success && data.availability) {
        setIsOnline(data.availability.isOnline);
        if (data.availability.workingHours) setWorkingHours(data.availability.workingHours);
        if (data.availability.workingDays) setWorkingDays(data.availability.workingDays);
        if (data.availability.leaves) setLeaves(data.availability.leaves);
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
    try {
      await professionalClient.updateAvailability({
        isOnline,
        workingHours,
        workingDays
      });
      showToast('Shift schedule and availability updated successfully');
    } catch (err) {
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
    try {
      const newLeave = {
        id: `lv-${Date.now()}`,
        date: leaveDate,
        reason: leaveReason,
        status: 'Pending'
      };
      const updatedLeaves = [...leaves, newLeave];
      setLeaves(updatedLeaves);
      await professionalClient.updateAvailability({
        leaves: updatedLeaves
      });
      showToast('Leave request submitted to Hub Manager for approval');
      setShowLeaveModal(false);
      setLeaveDate('');
      setLeaveReason('');
    } catch (err) {
      showToast(err.message || 'Failed to submit leave request');
    }
  };

  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1000, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Title */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
          Availability & Shift Management
        </h1>
        <div style={{ fontSize: 13, color: '#64748b' }}>
          Configure your operational hours, online dispatch readiness, and planned leave dates.
        </div>
      </div>

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
              {isOnline ? 'You Are Currently ONLINE' : 'You Are Currently OFFLINE'}
            </h2>
          </div>
          <p style={{ fontSize: 13, opacity: 0.9, margin: '6px 0 0 0' }}>
            {isOnline
              ? 'The dispatch engine is actively assigning customer bookings in Bandra & Western Suburbs.'
              : 'You will not receive any instant job dispatches while offline.'}
          </p>
        </div>

        <button
          onClick={async () => {
            const nextOnline = !isOnline;
            setIsOnline(nextOnline);
            onToggleOnline();
            await professionalClient.updateAvailability({ isOnline: nextOnline });
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

      {/* Shift Timings & Working Days */}
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: '24px 28px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        marginBottom: 24
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>
          Daily Operational Working Hours
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 500, marginBottom: 24 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>
              Shift Start Time
            </label>
            <input
              type="time"
              value={workingHours.start}
              onChange={(e) => setWorkingHours(prev => ({ ...prev, start: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 14,
                boxSizing: 'border-box'
              }}
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
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 14,
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 12px 0' }}>
          Weekly Working Days
        </h3>
        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0' }}>
          Select the days you are available to service bookings. Minimum 5 days recommended for Diamond tier eligibility.
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
          {allDays.map(day => {
            const active = workingDays.includes(day);
            return (
              <button
                key={day}
                onClick={() => handleToggleDay(day)}
                style={{
                  background: active ? '#2563eb' : '#f8fafc',
                  color: active ? '#ffffff' : '#64748b',
                  border: `1px solid ${active ? '#2563eb' : '#cbd5e1'}`,
                  padding: '10px 20px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {day} {active && '✓'}
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
          {saving ? 'Saving...' : 'Save Shift Settings'}
        </button>
      </div>

      {/* Leave Management */}
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
              Planned Leaves & Absence Requests
            </h3>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
              Apply for leave at least 48 hours in advance to avoid cancellation penalties.
            </div>
          </div>

          <button
            onClick={() => setShowLeaveModal(true)}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '9px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            + Apply for Leave
          </button>
        </div>

        {leaves.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: '#64748b', fontSize: 14 }}>
            No upcoming leaves recorded.
          </div>
        ) : (
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
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                    📅 {lv.date}
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                    Reason: {lv.reason}
                  </div>
                </div>

                <span style={{
                  background: lv.status === 'Approved' ? '#ecfdf5' : '#fef3c7',
                  color: lv.status === 'Approved' ? '#059669' : '#b45309',
                  padding: '3px 10px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700
                }}>
                  {lv.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
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
            maxWidth: 440,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
              Apply for Planned Leave
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0' }}>
              Your operational hub manager will be notified and dispatch slots will be blocked.
            </p>

            <form onSubmit={handleApplyLeave}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Leave Date
                </label>
                <input
                  type="date"
                  value={leaveDate}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Reason for Absence
                </label>
                <textarea
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  rows={3}
                  required
                  placeholder="e.g. Family festival, medical appointment, vehicle servicing..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  style={{
                    flex: 1,
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    padding: '11px 0',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1.5,
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    padding: '11px 0',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
