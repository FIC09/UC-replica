import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Banknote,
  Plus,
  Home,
  Briefcase
} from 'lucide-react';
import { MUMBAI_LOCALITIES, CITY_LOCALITIES } from '../data/servicesData';
import { getAvailableServiceDates } from '../utils/slotDates';

export function CheckoutModal({
  isOpen,
  onClose,
  cart,
  totalAmount,
  selectedCity = 'Mumbai',
  selectedLocality,
  user,
  savedAddresses = [],
  onConfirmOrder,
  onOpenManageAddresses
}) {
  const [step, setStep] = useState(1);

  // Address selection state
  const cityKey = Object.keys(CITY_LOCALITIES).find(
    k => k.toLowerCase() === (selectedCity || '').trim().toLowerCase()
  );
  const currentLocalities = (cityKey && CITY_LOCALITIES[cityKey]) || MUMBAI_LOCALITIES;

  const matchingSaved = savedAddresses.find(a => a.isDefault && a.city?.toLowerCase() === (selectedCity || '').toLowerCase())
    || savedAddresses.find(a => a.city?.toLowerCase() === (selectedCity || '').toLowerCase());
  const defaultAddr = matchingSaved || savedAddresses.find(a => a.isDefault) || savedAddresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState(matchingSaved ? matchingSaved.id : 'custom');

  // Custom address inputs (if not choosing existing saved address)
  const [flatNumber, setFlatNumber] = useState(matchingSaved?.flat || 'Flat 102, Main Road');
  const [locality, setLocality] = useState(matchingSaved?.locality || selectedLocality || currentLocalities[0] || 'Central');
  const [pincode, setPincode] = useState(matchingSaved?.pincode || (selectedCity === 'Krishnagiri' ? '635001' : '400050'));
  const [userName, setUserName] = useState(user?.name || 'Rahul Sharma');
  const [userPhone, setUserPhone] = useState(
    user?.phone ? user.phone.replace(/\D/g, '').slice(-10) : '9820144521'
  );
  const [deliveryNotes, setDeliveryNotes] = useState('');

  const availableDates = getAvailableServiceDates();

  // Slot state
  const [selectedDate, setSelectedDate] = useState(() => availableDates[0]?.label || 'Today');
  const [selectedTime, setSelectedTime] = useState('10:00 AM - 11:00 AM');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('upi');

  if (!isOpen) return null;

  const dates = availableDates.map(d => ({
    label: d.prefix,
    sub: d.sub
  }));

  const timeSlots = [
    '08:00 AM - 09:00 AM',
    '10:00 AM - 11:00 AM',
    '12:00 PM - 01:00 PM',
    '02:00 PM - 03:00 PM',
    '04:00 PM - 05:00 PM',
    '06:00 PM - 07:00 PM',
    '08:00 PM - 09:00 PM',
  ];

  function handleSubmit() {
    let finalAddressText = `${flatNumber}, ${locality}, ${selectedCity} - ${pincode}`;
    
    if (selectedAddressId !== 'custom') {
      const found = savedAddresses.find(a => a.id === selectedAddressId);
      if (found) {
        finalAddressText = found.formatted || `${found.flat}, ${found.locality}, ${found.city} - ${found.pincode}`;
      }
    }

    const bookingId = 'UC-' + Math.floor(100000 + Math.random() * 900000);
    const cartList = Object.values(cart);
    const firstItem = cartList[0] || {};
    const rawPhone = (userPhone || user?.phone || '9820144521').toString().trim();
    const formattedPhone = rawPhone.startsWith('+91') ? rawPhone : `+91 ${rawPhone.replace(/\D/g, '').slice(-10) || rawPhone}`;
    const custName = userName || user?.name || 'Customer';

    const bookingDetails = {
      id: bookingId,
      bookingReference: bookingId,
      customerId: user?._id || user?.id || '',
      userName: custName,
      userPhone: formattedPhone,
      userEmail: user?.email || '',
      city: selectedCity || 'Krishnagiri',
      serviceZone: locality || selectedLocality || 'Rayakottai Road',
      serviceName: firstItem.title || firstItem.name || 'Home Service',
      serviceCategory: firstItem.category || 'Home Services',
      items: cartList.map(item => ({
        id: item.id || `item-${Math.random()}`,
        title: item.title || item.name || 'Service',
        name: item.title || item.name || 'Service',
        price: item.price || 0,
        qty: item.qty || 1,
        image: item.image || ''
      })),
      totalAmount,
      pricingBreakdown: {
        subtotal: totalAmount,
        discount: 0,
        convenienceFee: 49,
        taxes: Math.round(totalAmount * 0.18),
        surgeFee: 0,
        total: totalAmount
      },
      address: finalAddressText,
      addressDetails: {
        fullAddress: finalAddressText,
        flat: flatNumber,
        locality: locality || selectedLocality || 'Rayakottai Road',
        city: selectedCity || 'Krishnagiri',
        pincode: pincode || '',
        contactPhone: formattedPhone
      },
      notes: deliveryNotes.trim() || undefined,
      slot: `${selectedDate}, ${selectedTime}`,
      contact: `${custName} (${formattedPhone})`,
      paymentMethod: paymentMethod.toUpperCase(),
      paymentStatus: 'Paid',
      createdAtFormatted: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      status: 'Confirmed',
    };

    onConfirmOrder(bookingDetails);
  }

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div className="checkout-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Step Indicator Header */}
        <div className="checkout-steps-bar">
          <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>
            <span className="step-num">1</span>
            <span>Address</span>
          </div>
          <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>
            <span className="step-num">2</span>
            <span>Slot</span>
          </div>
          <div className={`step-indicator ${step >= 3 ? 'active' : ''}`}>
            <span className="step-num">3</span>
            <span>Payment</span>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            style={{ marginLeft: 'auto', color: '#6B7280' }}
            aria-label="Close checkout"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div className="checkout-content-area">
          {/* STEP 1: Address */}
          {step === 1 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={20} color="#6E42E5" />
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                    Select Service Address
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={onOpenManageAddresses}
                  style={{ fontSize: 12, fontWeight: 700, color: '#6E42E5', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Plus size={14} />
                  <span>Manage / Add Address</span>
                </button>
              </div>

              {/* Saved Addresses List */}
              {savedAddresses.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        style={{
                          padding: 12,
                          borderRadius: 10,
                          border: `1.5px solid ${isSelected ? '#6E42E5' : '#E2E8F0'}`,
                          background: isSelected ? '#FCFAFF' : '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: addr.label === 'Home' ? '#EFF6FF' : '#FEF3C7',
                            color: addr.label === 'Home' ? '#1D4ED8' : '#B45309',
                            fontSize: 11,
                            fontWeight: 800
                          }}>
                            {addr.label || 'Home'}
                          </div>
                          <span style={{ fontSize: 13, color: '#1E293B', fontWeight: 600 }}>
                            {addr.formatted}
                          </span>
                        </div>
                        <div style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          border: `2px solid ${isSelected ? '#6E42E5' : '#D1D5DB'}`,
                          background: isSelected ? '#6E42E5' : 'transparent'
                        }} />
                      </div>
                    );
                  })}

                  {/* Option for custom address */}
                  <div
                    onClick={() => setSelectedAddressId('custom')}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      border: `1.5px solid ${selectedAddressId === 'custom' ? '#6E42E5' : '#E2E8F0'}`,
                      background: selectedAddressId === 'custom' ? '#FCFAFF' : '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#4B5563' }}>
                      ✍️ Enter a different address for this booking
                    </span>
                    <div style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      border: `2px solid ${selectedAddressId === 'custom' ? '#6E42E5' : '#D1D5DB'}`,
                      background: selectedAddressId === 'custom' ? '#6E42E5' : 'transparent'
                    }} />
                  </div>
                </div>
              )}

              {/* Custom Address Input Fields */}
              {(selectedAddressId === 'custom' || savedAddresses.length === 0) && (
                <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 16 }}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4 }}>
                      House / Flat Number & Building Name
                    </label>
                    <input
                      type="text"
                      className="form-input-control"
                      value={flatNumber}
                      onChange={(e) => setFlatNumber(e.target.value)}
                      placeholder="e.g. Flat 301, Sunshine Heights"
                    />
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4 }}>
                      Locality in {selectedCity}
                    </label>
                    <select
                      className="form-input-control"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      style={{ background: '#fff' }}
                    >
                      {currentLocalities.map((loc) => (
                        <option key={loc} value={loc}>{loc}, {selectedCity}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4 }}>
                        Pincode
                      </label>
                      <input
                        type="text"
                        className="form-input-control"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="400050"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4 }}>
                        City
                      </label>
                      <input
                        type="text"
                        className="form-input-control"
                        value={selectedCity}
                        disabled
                        style={{ background: '#F3F4F6' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Special Instructions */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4 }}>
                  Special Instructions / Landmark (Optional)
                </label>
                <input
                  type="text"
                  className="form-input-control"
                  placeholder="e.g. Near HDFC Bank, ring doorbell twice"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                />
              </div>

              {/* Contact info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4 }}>
                    Contact Name
                  </label>
                  <input
                    type="text"
                    className="form-input-control"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4 }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    className="form-input-control"
                    placeholder="Enter 10-digit mobile number"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    onKeyDown={(e) => {
                      if (
                        !/[0-9]/.test(e.key) &&
                        !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'].includes(e.key) &&
                        !e.ctrlKey &&
                        !e.metaKey
                      ) {
                        e.preventDefault();
                      }
                    }}
                    style={{ borderRadius: 0 }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: '#6B7280' }}>
                      Only 10 digits allowed
                    </span>
                    <span style={{ 
                      fontSize: 11, 
                      fontWeight: 600,
                      color: userPhone.replace(/\D/g, '').length === 10 ? '#059669' : '#6B7280' 
                    }}>
                      {userPhone.replace(/\D/g, '').length}/10
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="proceed-checkout-btn"
                onClick={() => {
                  if (userPhone.replace(/\D/g, '').length !== 10) {
                    alert('Please enter a valid 10-digit mobile number.');
                    return;
                  }
                  setStep(2);
                }}
              >
                <span>Continue to Select Time Slot</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* STEP 2: Slot Selection */}
          {step === 2 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Calendar size={20} color="#6E42E5" />
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                  Select Service Date & Time
                </h3>
              </div>

              {/* Date Pills */}
              <div className="slot-dates-row">
                {dates.map((d) => {
                  const val = `${d.label} (${d.sub})`;
                  const isSel = selectedDate === val;
                  return (
                    <div
                      key={d.label}
                      className={`slot-date-btn ${isSel ? 'active' : ''}`}
                      onClick={() => setSelectedDate(val)}
                    >
                      <div style={{ fontSize: 14, fontWeight: 800, color: isSel ? '#6E42E5' : '#0F172A' }}>
                        {d.label}
                      </div>
                      <div style={{ fontSize: 12, color: '#6B7280' }}>{d.sub}</div>
                    </div>
                  );
                })}
              </div>

              {/* Time Slots */}
              <div style={{ fontSize: 13, fontWeight: 700, color: '#4B5563', marginBottom: 10 }}>
                Available Arrival Slots (Mumbai Time)
              </div>
              <div className="slot-times-grid" style={{ marginBottom: 24 }}>
                {timeSlots.map((ts) => (
                  <div
                    key={ts}
                    className={`slot-time-pill ${selectedTime === ts ? 'active' : ''}`}
                    onClick={() => setSelectedTime(ts)}
                  >
                    {ts}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    padding: '12px 18px',
                    borderRadius: 10,
                    border: '1.5px solid #E5E7EB',
                    fontWeight: 700,
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: '#4B5563'
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  className="proceed-checkout-btn"
                  onClick={() => setStep(3)}
                  style={{ flex: 1 }}
                >
                  <span>Continue to Payment</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment */}
          {step === 3 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <CreditCard size={20} color="#6E42E5" />
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                  Choose Payment Method
                </h3>
              </div>

              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 12,
                padding: 14,
                marginBottom: 20
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
                  <span style={{ color: '#6B7280' }}>Total Amount to Pay:</span>
                  <span style={{ fontWeight: 800, color: '#0F172A', fontSize: 16 }}>₹{totalAmount}</span>
                </div>
                <div style={{ fontSize: 12, color: '#059669', marginTop: 4, fontWeight: 600 }}>
                  ✓ 100% Secure Checkout with 30-Day Money Back Guarantee
                </div>
              </div>

              {/* Payment Methods Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {/* UPI */}
                <div
                  onClick={() => setPaymentMethod('upi')}
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    border: `1.5px solid ${paymentMethod === 'upi' ? '#6E42E5' : '#E5E7EB'}`,
                    background: paymentMethod === 'upi' ? '#F4F0FF' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Smartphone size={22} color="#6E42E5" />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                        UPI (Google Pay, PhonePe, Paytm)
                      </div>
                      <div style={{ fontSize: 12, color: '#6B7280' }}>Instant QR & Intent payment</div>
                    </div>
                  </div>
                  <div style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    border: `2px solid ${paymentMethod === 'upi' ? '#6E42E5' : '#D1D5DB'}`,
                    background: paymentMethod === 'upi' ? '#6E42E5' : 'transparent'
                  }} />
                </div>

                {/* Cards */}
                <div
                  onClick={() => setPaymentMethod('card')}
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    border: `1.5px solid ${paymentMethod === 'card' ? '#6E42E5' : '#E5E7EB'}`,
                    background: paymentMethod === 'card' ? '#F4F0FF' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <CreditCard size={22} color="#0284C7" />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                        Credit or Debit Card
                      </div>
                      <div style={{ fontSize: 12, color: '#6B7280' }}>Visa, MasterCard, RuPay</div>
                    </div>
                  </div>
                  <div style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    border: `2px solid ${paymentMethod === 'card' ? '#6E42E5' : '#D1D5DB'}`,
                    background: paymentMethod === 'card' ? '#6E42E5' : 'transparent'
                  }} />
                </div>

                {/* Pay after service */}
                <div
                  onClick={() => setPaymentMethod('cash')}
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    border: `1.5px solid ${paymentMethod === 'cash' ? '#6E42E5' : '#E5E7EB'}`,
                    background: paymentMethod === 'cash' ? '#F4F0FF' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Banknote size={22} color="#059669" />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                        Pay After Service
                      </div>
                      <div style={{ fontSize: 12, color: '#6B7280' }}>Pay via Cash or UPI once work is completed</div>
                    </div>
                  </div>
                  <div style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    border: `2px solid ${paymentMethod === 'cash' ? '#6E42E5' : '#D1D5DB'}`,
                    background: paymentMethod === 'cash' ? '#6E42E5' : 'transparent'
                  }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={{
                    padding: '12px 18px',
                    borderRadius: 10,
                    border: '1.5px solid #E5E7EB',
                    fontWeight: 700,
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: '#4B5563'
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  className="proceed-checkout-btn"
                  onClick={handleSubmit}
                  style={{ flex: 1, background: '#059669' }}
                >
                  <span>Confirm Booking (₹{totalAmount})</span>
                  <CheckCircle2 size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
