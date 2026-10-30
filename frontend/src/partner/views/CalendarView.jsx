import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, HardHat, ChevronLeft, ChevronRight, UserCheck, AlertCircle } from 'lucide-react';
import { partnerClient } from '../partnerClient';

export function CalendarView({ showToast, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [timelineSlots, setTimelineSlots] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedSlotBooking, setSelectedSlotBooking] = useState(null);

  useEffect(() => {
    loadCalendar();
  }, []);

  async function loadCalendar() {
    setLoading(true);
    try {
      const res = await partnerClient.getCalendar();
      if (res && res.success) {
        setTimelineSlots(res.timelineSlots || []);
        setSchedules(res.schedules || []);
      }
    } catch (err) {
      showToast?.('Error loading calendar schedule: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header */}
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
            Fleet Dispatch Calendar & Slots
          </h1>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0 0' }}>
            Daily scheduling board showing technician timeline commitments and availability
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 8,
            fontSize: 13.5,
            fontWeight: 600,
            color: '#0f172a'
          }}>
            <CalendarIcon size={16} color="#7c3aed" />
            <span>Today, {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Dispatch Board Grid */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
            Loading fleet dispatch schedule...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 800 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '14px 18px', width: 220, fontSize: 13, fontWeight: 700, color: '#475569' }}>
                    Technician Fleet
                  </th>
                  {timelineSlots.map(slot => (
                    <th key={slot} style={{ padding: '14px 14px', fontSize: 12.5, fontWeight: 600, color: '#64748b', textAlign: 'center' }}>
                      <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                      {slot}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schedules.length === 0 ? (
                  <tr>
                    <td colSpan={timelineSlots.length + 1} style={{ padding: '40px 18px', textAlign: 'center', color: '#94a3b8' }}>
                      No technicians scheduled or assigned to fleet today.
                    </td>
                  </tr>
                ) : (
                  schedules.map(({ technician, slots }) => (
                  <tr key={technician.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {/* Technician Name & Trade */}
                    <td style={{ padding: '14px 18px', background: '#fcfcfd', borderRight: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: '#ede9fe',
                          color: '#7c3aed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 12
                        }}>
                          {technician.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13.5 }}>
                            {technician.name}
                          </div>
                          <div style={{ fontSize: 11.5, color: '#64748b' }}>
                            {technician.trade.split('&')[0]} • ★ {technician.rating}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Timeline Slot Blocks */}
                    {slots.map(s => {
                      const hasJob = !!s.booking;
                      return (
                        <td
                          key={s.timeSlot}
                          style={{
                            padding: '10px 8px',
                            textAlign: 'center',
                            verticalAlign: 'top',
                            borderRight: '1px solid #f8fafc'
                          }}
                        >
                          {hasJob ? (
                            <div
                              onClick={() => onNavigate(`/partner/bookings?id=${s.booking.id}`)}
                              style={{
                                background: '#f3e8ff',
                                border: '1px solid #d8b4fe',
                                borderRadius: 8,
                                padding: '8px 10px',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'transform 0.15s ease',
                                boxShadow: '0 2px 4px rgba(124, 58, 237, 0.08)'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#7c3aed' }}>
                                  #{s.booking.id}
                                </span>
                                <span style={{ fontSize: 10, fontWeight: 600, color: '#6b21a8', background: '#e9d5ff', padding: '1px 5px', borderRadius: 4 }}>
                                  {s.booking.status}
                                </span>
                              </div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {s.booking.serviceName}
                              </div>
                              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                                📍 {s.booking.serviceZone}
                              </div>
                            </div>
                          ) : (
                            <div style={{
                              background: technician.status === 'Active' ? '#f8fafc' : '#f1f5f9',
                              border: '1px dashed #e2e8f0',
                              borderRadius: 8,
                              padding: '12px 6px',
                              color: technician.status === 'Active' ? '#94a3b8' : '#cbd5e1',
                              fontSize: 12
                            }}>
                              {technician.status === 'Active' ? 'Free Slot' : 'Off Duty'}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend & SOP Notice */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        background: '#ffffff',
        borderRadius: 10,
        border: '1px solid #e2e8f0',
        fontSize: 12.5,
        color: '#64748b',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: '#f3e8ff', border: '1px solid #d8b4fe' }}></span>
            Booked & Dispatched
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: '#f8fafc', border: '1px dashed #cbd5e1' }}></span>
            Open for Allocation
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: '#f1f5f9' }}></span>
            Leave / Unavailable
          </span>
        </div>
        <div>
          Platform policy: Minimum 30 min travel buffer between appointments in Mumbai West.
        </div>
      </div>
    </div>
  );
}
