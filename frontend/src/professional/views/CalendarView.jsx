import React, { useState } from 'react';

export function CalendarView({ onNavigate, showToast }) {
  const [activeDate, setActiveDate] = useState('2026-10-22');
  const [viewMode, setViewMode] = useState('week'); // 'week' | 'day'

  const weekDays = [
    { day: 'Mon', date: '19 Oct', full: '2026-10-19', count: 3 },
    { day: 'Tue', date: '20 Oct', full: '2026-10-20', count: 4 },
    { day: 'Wed', date: '21 Oct', full: '2026-10-21', count: 5 },
    { day: 'Thu', date: '22 Oct (Today)', full: '2026-10-22', count: 3, isToday: true },
    { day: 'Fri', date: '23 Oct', full: '2026-10-23', count: 4 },
    { day: 'Sat', date: '24 Oct', full: '2026-10-24', count: 6 },
    { day: 'Sun', date: '25 Oct', full: '2026-10-25', count: 0, isOff: true }
  ];

  const todaySlots = [
    {
      id: 'SL-01',
      time: '09:00 AM - 10:30 AM',
      title: 'Powerjet AC Servicing (Split)',
      customer: 'Suresh Raina',
      locality: 'Khar West',
      status: 'Completed',
      color: '#059669',
      jobId: 'JOB-9408'
    },
    {
      id: 'SL-02',
      time: '11:30 AM - 01:00 PM',
      title: 'AC Foam Jet Deep Cleaning',
      customer: 'Deepika Rao',
      locality: 'Santacruz West',
      status: 'Completed',
      color: '#059669',
      jobId: 'JOB-9409'
    },
    {
      id: 'SL-03',
      time: '02:00 PM - 03:30 PM',
      title: 'Powerjet AC Servicing + Deep Coil Cleaning',
      customer: 'Rohan Kapoor',
      locality: 'Pali Hill, Bandra West',
      status: 'Assigned',
      color: '#2563eb',
      jobId: 'JOB-9410'
    },
    {
      id: 'SL-04',
      time: '04:30 PM - 06:00 PM',
      title: 'AC Gas Leak Check & R32 Top-Up',
      customer: 'Meera Sen',
      locality: 'Andheri West',
      status: 'Assigned',
      color: '#2563eb',
      jobId: 'JOB-9411'
    },
    {
      id: 'SL-05',
      time: '06:30 PM - 08:00 PM',
      title: 'Inverter AC PCB Diagnosis',
      customer: 'Karan Mehra',
      locality: 'Juhu Tara Road',
      status: 'Confirmed',
      color: '#d97706',
      jobId: 'JOB-9412'
    }
  ];

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1200, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Work Calendar & Slots
          </h1>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            October 2026 • Weekly technician dispatch timeline
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ display: 'flex', background: '#f1f5f9', padding: 3, borderRadius: 8 }}>
            <button
              onClick={() => setViewMode('week')}
              style={{
                background: viewMode === 'week' ? '#ffffff' : 'none',
                color: viewMode === 'week' ? '#0f172a' : '#64748b',
                border: 'none',
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: viewMode === 'week' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              Week View
            </button>
            <button
              onClick={() => setViewMode('day')}
              style={{
                background: viewMode === 'day' ? '#ffffff' : 'none',
                color: viewMode === 'day' ? '#0f172a' : '#64748b',
                border: 'none',
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: viewMode === 'day' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              Day View
            </button>
          </div>

          <button
            onClick={() => onNavigate('/professional/availability')}
            style={{
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ⚙️ Shift & Leave Settings
          </button>
        </div>
      </div>

      {/* Week Day Picker Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 10,
        marginBottom: 24
      }}>
        {weekDays.map(item => (
          <div
            key={item.full}
            onClick={() => setActiveDate(item.full)}
            style={{
              background: activeDate === item.full ? '#eff6ff' : '#ffffff',
              border: activeDate === item.full ? '2px solid #2563eb' : '1px solid #e2e8f0',
              borderRadius: 12,
              padding: '14px 10px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: item.isToday ? '#2563eb' : '#64748b' }}>
              {item.day}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
              {item.date.split(' ')[0]}
            </div>
            <div style={{
              fontSize: 11,
              fontWeight: 600,
              color: item.isOff ? '#94a3b8' : item.count > 0 ? '#059669' : '#64748b',
              background: item.isOff ? '#f1f5f9' : item.count > 0 ? '#ecfdf5' : '#f8fafc',
              padding: '2px 6px',
              borderRadius: 6,
              display: 'inline-block'
            }}>
              {item.isOff ? 'Off Day' : `${item.count} Jobs`}
            </div>
          </div>
        ))}
      </div>

      {/* Daily Slot Timeline */}
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: '24px 28px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Timeline for Thursday, 22 October 2026
          </h3>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            5 bookings scheduled • Operational hours: 08:00 - 20:00
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {todaySlots.map(slot => (
            <div
              key={slot.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '180px 1fr 140px',
                alignItems: 'center',
                gap: 16,
                padding: '16px 20px',
                borderRadius: 12,
                background: '#f8fafc',
                border: `1px solid ${slot.status === 'Assigned' ? '#bfdbfe' : '#e2e8f0'}`,
                borderLeft: `5px solid ${slot.color}`
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                ⏱️ {slot.time}
              </div>

              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                  {slot.title}
                </div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                  Customer: <strong>{slot.customer}</strong> • {slot.locality}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{
                  background: slot.status === 'Completed' ? '#ecfdf5' :
                    slot.status === 'Assigned' ? '#eff6ff' : '#fef3c7',
                  color: slot.color,
                  padding: '4px 10px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700
                }}>
                  {slot.status}
                </span>

                <div style={{ marginTop: 6 }}>
                  <button
                    onClick={() => onNavigate(`/professional/jobs/${slot.jobId}`)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    View Job →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
