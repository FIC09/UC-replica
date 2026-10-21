import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  ShoppingBag,
  Edit3,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Check,
  FileText
} from 'lucide-react';

export function MyBookingsModal({
  isOpen,
  onClose,
  bookings,
  onTrackBooking,
  onUpdateBookingSlot,
  onUpdateBookingAddress,
  onCancelBooking,
  onDeleteBookingHistory
}) {
  const [filter, setFilter] = useState('all'); // all, active, completed, cancelled

  // Reschedule Sub-modal state
  const [reschedulingBooking, setReschedulingBooking] = useState(null);
  const [newDate, setNewDate] = useState('Tomorrow (14 Oct)');
  const [newTime, setNewTime] = useState('10:00 AM - 11:00 AM');

  // Edit Address / Instructions Sub-modal state
  const [editingAddressBooking, setEditingAddressBooking] = useState(null);
  const [updatedAddressText, setUpdatedAddressText] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');

  // Cancel Confirmation state
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('Change of plans');

  if (!isOpen) return null;

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'all') return true;
    if (filter === 'active') return b.status === 'Confirmed' || b.status === 'In Progress';
    if (filter === 'completed') return b.status === 'Completed';
    if (filter === 'cancelled') return b.status === 'Cancelled';
    return true;
  });

  const timeSlots = [
    '08:00 AM - 09:00 AM',
    '10:00 AM - 11:00 AM',
    '12:00 PM - 01:00 PM',
    '02:00 PM - 03:00 PM',
    '04:00 PM - 05:00 PM',
    '06:00 PM - 07:00 PM',
    '08:00 PM - 09:00 PM',
  ];

  function handleSaveReschedule(e) {
    e.preventDefault();
    if (reschedulingBooking) {
      onUpdateBookingSlot(reschedulingBooking.id, `${newDate}, ${newTime}`);
      setReschedulingBooking(null);
    }
  }

  function handleSaveAddressNotes(e) {
    e.preventDefault();
    if (editingAddressBooking) {
      onUpdateBookingAddress(editingAddressBooking.id, updatedAddressText, specialNotes);
      setEditingAddressBooking(null);
    }
  }

  function handleConfirmCancel() {
    if (cancellingBooking) {
      onCancelBooking(cancellingBooking.id, cancelReason);
      setCancellingBooking(null);
    }
  }

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div 
        className="cart-drawer-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 520 }}
      >
        {/* Header */}
        <div className="cart-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Calendar size={22} color="#6E42E5" />
            <div>
              <h3 className="cart-header-title">My Bookings</h3>
              <div style={{ fontSize: 12, color: '#64748B' }}>
                Full CRUD management: View, Reschedule, Edit & Cancel
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ color: '#6B7280' }}>
            <X size={20} />
          </button>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: 6,
          padding: '12px 20px',
          background: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
          overflowX: 'auto'
        }}>
          {[
            { id: 'all', label: 'All Bookings' },
            { id: 'active', label: 'Active' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                border: '1px solid',
                borderColor: filter === tab.id ? '#6E42E5' : '#E2E8F0',
                background: filter === tab.id ? '#6E42E5' : '#fff',
                color: filter === tab.id ? '#fff' : '#64748B',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="cart-drawer-body">
          {/* READ: List of Bookings */}
          {filteredBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6B7280' }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#F4F0FF',
                color: '#6E42E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Calendar size={28} />
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                No {filter !== 'all' ? filter : ''} bookings found
              </h4>
              <p style={{ fontSize: 13 }}>
                You have no orders in this category.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {filteredBookings.map((b) => {
                const isActive = b.status === 'Confirmed' || b.status === 'In Progress';
                const isCancelled = b.status === 'Cancelled';

                return (
                  <div
                    key={b.id}
                    style={{
                      background: '#fff',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: 14,
                      padding: 16,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      opacity: isCancelled ? 0.75 : 1
                    }}
                  >
                    {/* Booking Top */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>
                        {b.id}
                      </span>
                      <span style={{
                        background: isCancelled ? '#FEE2E2' : isActive ? '#EFF6FF' : '#ECFDF5',
                        color: isCancelled ? '#DC2626' : isActive ? '#2563EB' : '#059669',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 9px',
                        borderRadius: 999
                      }}>
                        {b.status || 'Confirmed'}
                      </span>
                    </div>

                    {/* Services Items */}
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B', marginBottom: 8 }}>
                      {b.items?.map(i => `${i.title} (${i.qty}x)`).join(', ')}
                    </div>

                    {/* Slot */}
                    <div style={{ fontSize: 12.5, color: '#4B5563', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                      <Clock size={14} color="#6E42E5" />
                      <span>{b.slot}</span>
                    </div>

                    {/* Address */}
                    <div style={{ fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <MapPin size={14} />
                      <span>{b.address}</span>
                    </div>

                    {/* Notes if any */}
                    {b.notes && (
                      <div style={{
                        fontSize: 11.5,
                        color: '#64748B',
                        background: '#F8FAFC',
                        padding: '6px 10px',
                        borderRadius: 6,
                        marginBottom: 10,
                        fontStyle: 'italic'
                      }}>
                        📝 Note: {b.notes}
                      </div>
                    )}

                    {/* Pricing Row */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: 10,
                      borderTop: '1px dashed #E2E8F0',
                      marginBottom: 12
                    }}>
                      <span style={{ fontSize: 14.5, fontWeight: 800, color: '#0F172A' }}>
                        ₹{b.totalAmount}
                      </span>
                      <span style={{ fontSize: 11.5, color: '#64748B' }}>
                        {b.paymentMethod || 'ONLINE'}
                      </span>
                    </div>

                    {/* CRUD Actions Bar */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {isActive && (
                        <>
                          {/* Live Track */}
                          <button
                            type="button"
                            onClick={() => {
                              onTrackBooking(b);
                              onClose();
                            }}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              borderRadius: 8,
                              background: '#F4F0FF',
                              color: '#6E42E5',
                              fontSize: 12,
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 4
                            }}
                          >
                            <span>Live Tracker</span>
                            <ChevronRight size={13} />
                          </button>

                          {/* UPDATE: Reschedule Slot */}
                          <button
                            type="button"
                            onClick={() => {
                              setReschedulingBooking(b);
                            }}
                            style={{
                              padding: '8px 12px',
                              borderRadius: 8,
                              background: '#F1F5F9',
                              color: '#334155',
                              fontSize: 12,
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                            title="Update service time slot"
                          >
                            <RotateCcw size={13} />
                            <span>Reschedule</span>
                          </button>

                          {/* UPDATE: Edit Address & Instructions */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAddressBooking(b);
                              setUpdatedAddressText(b.address);
                              setSpecialNotes(b.notes || '');
                            }}
                            style={{
                              padding: '8px 12px',
                              borderRadius: 8,
                              background: '#F1F5F9',
                              color: '#334155',
                              fontSize: 12,
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                            title="Edit delivery address or instructions"
                          >
                            <Edit3 size={13} />
                            <span>Edit</span>
                          </button>

                          {/* DELETE: Cancel Booking */}
                          <button
                            type="button"
                            onClick={() => setCancellingBooking(b)}
                            style={{
                              padding: '8px 12px',
                              borderRadius: 8,
                              background: '#FEE2E2',
                              color: '#DC2626',
                              fontSize: 12,
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                            title="Cancel service booking"
                          >
                            <Trash2 size={13} />
                            <span>Cancel</span>
                          </button>
                        </>
                      )}

                      {/* If Cancelled or Completed: Allow permanently deleting history record */}
                      {!isActive && (
                        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: isCancelled ? '#DC2626' : '#059669', fontWeight: 600 }}>
                            {isCancelled ? 'Booking was cancelled' : 'Service completed'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Delete this record from your booking history?')) {
                                onDeleteBookingHistory(b.id);
                              }
                            }}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 6,
                              background: '#FEE2E2',
                              color: '#DC2626',
                              fontSize: 11.5,
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <Trash2 size={12} />
                            <span>Delete Record</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* --- SUB-MODAL 1: RESCHEDULE TIME SLOT (UPDATE) --- */}
        {reschedulingBooking && (
          <div className="modal-backdrop-overlay" style={{ zIndex: 1200 }} onClick={() => setReschedulingBooking(null)}>
            <div className="checkout-modal-card" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
              <div style={{ padding: 18, borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <RotateCcw size={18} color="#6E42E5" />
                  <h4 style={{ fontSize: 16, fontWeight: 800 }}>Reschedule Booking</h4>
                </div>
                <button type="button" onClick={() => setReschedulingBooking(null)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveReschedule} style={{ padding: 20 }}>
                <div style={{ fontSize: 12.5, color: '#64748B', marginBottom: 14 }}>
                  Current Slot: <strong>{reschedulingBooking.slot}</strong>
                </div>

                {/* Date options */}
                <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 6 }}>
                  Choose New Date
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
                  {['Today (13 Oct)', 'Tomorrow (14 Oct)', 'Wednesday (15 Oct)'].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setNewDate(d)}
                      style={{
                        padding: '8px 6px',
                        borderRadius: 8,
                        fontSize: 11.5,
                        fontWeight: 700,
                        border: `1.5px solid ${newDate === d ? '#6E42E5' : '#E2E8F0'}`,
                        background: newDate === d ? '#F4F0FF' : '#fff',
                        color: newDate === d ? '#6E42E5' : '#4B5563'
                      }}
                    >
                      {d.split(' ')[0]}
                      <div style={{ fontSize: 10, color: '#64748B' }}>{d.split(' ')[1]}</div>
                    </button>
                  ))}
                </div>

                {/* Time options */}
                <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 6 }}>
                  Choose New Arrival Time
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxHeight: 160, overflowY: 'auto', marginBottom: 20 }}>
                  {timeSlots.map(ts => (
                    <button
                      key={ts}
                      type="button"
                      onClick={() => setNewTime(ts)}
                      style={{
                        padding: '8px',
                        borderRadius: 8,
                        fontSize: 11.5,
                        fontWeight: 700,
                        border: `1.5px solid ${newTime === ts ? '#6E42E5' : '#E2E8F0'}`,
                        background: newTime === ts ? '#6E42E5' : '#fff',
                        color: newTime === ts ? '#fff' : '#4B5563'
                      }}
                    >
                      {ts}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setReschedulingBooking(null)}
                    style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13, fontWeight: 700 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="proceed-checkout-btn"
                    style={{ flex: 1, padding: 10, fontSize: 13.5, justifyContent: 'center' }}
                  >
                    <span>Update Slot</span>
                    <Check size={16} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- SUB-MODAL 2: EDIT ADDRESS & INSTRUCTIONS (UPDATE) --- */}
        {editingAddressBooking && (
          <div className="modal-backdrop-overlay" style={{ zIndex: 1200 }} onClick={() => setEditingAddressBooking(null)}>
            <div className="checkout-modal-card" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
              <div style={{ padding: 18, borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Edit3 size={18} color="#6E42E5" />
                  <h4 style={{ fontSize: 16, fontWeight: 800 }}>Edit Delivery Address & Notes</h4>
                </div>
                <button type="button" onClick={() => setEditingAddressBooking(null)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveAddressNotes} style={{ padding: 20 }}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4 }}>
                    Delivery Address
                  </label>
                  <textarea
                    rows={3}
                    className="form-input-control"
                    value={updatedAddressText}
                    onChange={(e) => setUpdatedAddressText(e.target.value)}
                    required
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4 }}>
                    Special Instructions for Partner (e.g. Ring bell, gate code)
                  </label>
                  <input
                    type="text"
                    className="form-input-control"
                    placeholder="e.g. Please call before arrival, flat is on 4th floor"
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setEditingAddressBooking(null)}
                    style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13, fontWeight: 700 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="proceed-checkout-btn"
                    style={{ flex: 1, padding: 10, fontSize: 13.5, justifyContent: 'center' }}
                  >
                    <span>Save Changes</span>
                    <Check size={16} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- SUB-MODAL 3: CANCEL BOOKING CONFIRMATION (DELETE) --- */}
        {cancellingBooking && (
          <div className="modal-backdrop-overlay" style={{ zIndex: 1200 }} onClick={() => setCancellingBooking(null)}>
            <div className="checkout-modal-card" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
              <div style={{ padding: 20, textAlign: 'center' }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: '#FEE2E2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <AlertTriangle size={26} />
                </div>
                <h4 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                  Cancel Booking {cancellingBooking.id}?
                </h4>
                <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
                  Zero cancellation fee. Any paid amount will be instantly credited to your original payment mode.
                </p>

                <div style={{ textAlign: 'left', marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 6 }}>
                    Reason for Cancellation
                  </label>
                  <select
                    className="form-input-control"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  >
                    <option value="Change of plans">Change of plans</option>
                    <option value="Found a different time slot">Need a different day/time</option>
                    <option value="Booked by mistake">Booked by mistake</option>
                    <option value="Personal emergency">Personal emergency</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setCancellingBooking(null)}
                    style={{
                      flex: 1,
                      padding: 10,
                      borderRadius: 8,
                      border: '1.5px solid #E2E8F0',
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#4B5563'
                    }}
                  >
                    Keep Booking
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmCancel}
                    style={{
                      flex: 1,
                      padding: 10,
                      borderRadius: 8,
                      background: '#DC2626',
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 700
                    }}
                  >
                    Confirm Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
