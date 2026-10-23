import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  Smartphone, 
  Wallet, 
  Banknote, 
  CheckCircle2, 
  QrCode, 
  ArrowRight, 
  ChevronRight,
  Info,
  RefreshCw,
  Sparkles,
  Check
} from 'lucide-react';

export function PaymentGatewayModal({
  isOpen,
  onClose,
  amount = 0,
  initialMethod = 'gpay',
  user = null,
  slot = '',
  address = '',
  items = [],
  onPaymentSuccess,
  hideCOD = false
}) {
  const [activeTab, setActiveTab] = useState(initialMethod === 'cod' && hideCOD ? 'gpay' : initialMethod);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txnId, setTxnId] = useState('');

  // Form states
  const [gpayUpi, setGpayUpi] = useState(() => {
    const prefix = user?.email ? user.email.split('@')[0] : 'customer';
    return `${prefix}@okhdfcbank`;
  });
  const [phonePeNumber, setPhonePeNumber] = useState(() => user?.phone || '9876543210');
  const [paytmNumber, setPaytmNumber] = useState(() => user?.phone || '9876543210');
  const [cardNumber, setCardNumber] = useState('4532 8920 1142 8849');
  const [cardHolder, setCardHolder] = useState(() => user?.name || 'Customer Name');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('321');
  const [saveCard, setSaveCard] = useState(true);
  const [selectedWallet, setSelectedWallet] = useState('amazon_pay');
  const [showQrCode, setShowQrCode] = useState(false);

  // Sync initialMethod when opened
  useEffect(() => {
    if (isOpen) {
      if (initialMethod === 'upi') setActiveTab('gpay');
      else if (initialMethod === 'card') setActiveTab('card');
      else if (initialMethod === 'cod') setActiveTab(hideCOD ? 'gpay' : 'cod');
      else setActiveTab(initialMethod || 'gpay');
      setIsProcessing(false);
      setIsSuccess(false);
      setTxnId('');
      setShowQrCode(false);
    }
  }, [isOpen, initialMethod, hideCOD]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && !isProcessing && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen) return null;

  function handleExecutePayment() {
    setIsProcessing(true);

    const generatedTxn = 'UC_' + Math.floor(1000000000 + Math.random() * 9000000000);
    setTxnId(generatedTxn);

    // Realistic processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);

      setTimeout(() => {
        const methodLabels = {
          gpay: 'Google Pay (UPI)',
          phonepe: 'PhonePe (UPI)',
          paytm: 'Paytm Wallet & UPI',
          card: 'Credit / Debit Card',
          cod: 'Cash on Delivery (Pay After Service)',
          wallet: `Wallet (${selectedWallet.toUpperCase()})`
        };

        if (onPaymentSuccess) {
          onPaymentSuccess({
            method: activeTab,
            methodLabel: methodLabels[activeTab] || 'Online Payment',
            transactionId: generatedTxn,
            amount: amount,
            paidAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
          });
        }
      }, 1100);
    }, 1400);
  }

  return (
    <div 
      className="payment-gateway-overlay"
      onClick={() => {
        if (!isProcessing && !isSuccess) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        className="payment-gateway-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 740,
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          boxShadow: '0 25px 65px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
          animation: 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* ========================================================= */}
        {/* TOP HEADER: BRANDING, AMOUNT & CLOSE                      */}
        {/* ========================================================= */}
        <div style={{
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #1E293B'
        }}>
          {/* Left: Urban Company SafePay Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: '#6E42E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: 14
            }}>
              UC
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: -0.3 }}>
                  Urban Company SafePay
                </span>
                <span style={{
                  fontSize: 10,
                  fontWeight: 800,
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  padding: '1.5px 6px',
                  borderRadius: 4,
                  letterSpacing: 0.5
                }}>
                  VERIFIED
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Lock size={10} color="#10B981" />
                <span>256-Bit SSL Bank Encrypted Checkout</span>
              </div>
            </div>
          </div>

          {/* Right: Amount to Pay & Close Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>
                Amount to Pay
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#38BDF8', letterSpacing: -0.5 }}>
                ₹{amount.toLocaleString('en-IN')}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              title="Close payment gateway"
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                backgroundColor: '#1E293B',
                border: 'none',
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {
                if (!isProcessing) {
                  e.currentTarget.style.backgroundColor = '#334155';
                  e.currentTarget.style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1E293B';
                e.currentTarget.style.color = '#94A3B8';
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PROCESSING & SUCCESS ANIMATION OVERLAY                    */}
        {/* ========================================================= */}
        {isProcessing && (
          <div style={{
            padding: '60px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            minHeight: 380
          }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              border: '4px solid #F1F5F9',
              borderTopColor: '#6E42E5',
              animation: 'spin 0.8s linear infinite',
              marginBottom: 20
            }} />
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>
              Connecting to Secure Payment Gateway...
            </h3>
            <p style={{ fontSize: 13.5, color: '#64748B', maxWidth: 360, margin: 0 }}>
              Authorizing transaction of <strong>₹{amount.toLocaleString('en-IN')}</strong>. Please do not refresh or close this window.
            </p>
          </div>
        )}

        {isSuccess && (
          <div style={{
            padding: '60px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            minHeight: 380,
            animation: 'fadeIn 0.25s ease-out'
          }}>
            <div style={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              backgroundColor: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 18,
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)'
            }}>
              <CheckCircle2 size={42} strokeWidth={2.4} />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0' }}>
              {activeTab === 'cod' ? 'Booking Confirmed with Cash on Delivery!' : 'Payment Authorized Successfully!'}
            </h3>
            <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 14px 0' }}>
              Transaction ID: <strong style={{ color: '#0F172A', fontFamily: 'monospace' }}>{txnId}</strong>
            </p>
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: 12,
              padding: '10px 18px',
              border: '1px solid #E2E8F0',
              fontSize: 13,
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <Sparkles size={16} color="#6E42E5" />
              <span>Redirecting you to live booking tracking...</span>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MAIN GATEWAY INTERFACE (SIDEBAR TABS + PAYMENT PANEL)     */}
        {/* ========================================================= */}
        {!isProcessing && !isSuccess && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '260px 1fr',
            minHeight: 440,
            flex: 1,
            overflow: 'hidden'
          }}>
            {/* ------------------------------------------------------- */}
            {/* LEFT SIDEBAR: PAYMENT OPTIONS LIST                      */}
            {/* ------------------------------------------------------- */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRight: '1px solid #E2E8F0',
              padding: '16px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', padding: '4px 10px 8px', letterSpacing: 0.5 }}>
                Payment Options
              </div>

              {/* 1. Google Pay (GPay) */}
              <button
                type="button"
                onClick={() => { setActiveTab('gpay'); setShowQrCode(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 12px',
                  borderRadius: 12,
                  border: activeTab === 'gpay' ? '1.5px solid #6E42E5' : '1px solid transparent',
                  backgroundColor: activeTab === 'gpay' ? '#FFFFFF' : 'transparent',
                  boxShadow: activeTab === 'gpay' ? '0 3px 10px rgba(110, 66, 229, 0.1)' : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: 13,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}>
                    <span style={{ color: '#4285F4' }}>G</span>
                    <span style={{ color: '#EA4335' }}>P</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A' }}>Google Pay (GPay)</div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Instant UPI Pay</div>
                  </div>
                </div>
                {activeTab === 'gpay' && <ChevronRight size={16} color="#6E42E5" />}
              </button>

              {/* 2. PhonePe */}
              <button
                type="button"
                onClick={() => { setActiveTab('phonepe'); setShowQrCode(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 12px',
                  borderRadius: 12,
                  border: activeTab === 'phonepe' ? '1.5px solid #6E42E5' : '1px solid transparent',
                  backgroundColor: activeTab === 'phonepe' ? '#FFFFFF' : 'transparent',
                  boxShadow: activeTab === 'phonepe' ? '0 3px 10px rgba(110, 66, 229, 0.1)' : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: '#5F259F',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: 13
                  }}>
                    पे
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A' }}>PhonePe</div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>UPI &amp; Wallet</div>
                  </div>
                </div>
                {activeTab === 'phonepe' && <ChevronRight size={16} color="#6E42E5" />}
              </button>

              {/* 3. Paytm */}
              <button
                type="button"
                onClick={() => { setActiveTab('paytm'); setShowQrCode(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 12px',
                  borderRadius: 12,
                  border: activeTab === 'paytm' ? '1.5px solid #6E42E5' : '1px solid transparent',
                  backgroundColor: activeTab === 'paytm' ? '#FFFFFF' : 'transparent',
                  boxShadow: activeTab === 'paytm' ? '0 3px 10px rgba(110, 66, 229, 0.1)' : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: '#00BAF2',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: 10,
                    letterSpacing: -0.5
                  }}>
                    paytm
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A' }}>Paytm</div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Wallet &amp; UPI</div>
                  </div>
                </div>
                {activeTab === 'paytm' && <ChevronRight size={16} color="#6E42E5" />}
              </button>

              {/* 4. Credit / Debit Card */}
              <button
                type="button"
                onClick={() => { setActiveTab('card'); setShowQrCode(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 12px',
                  borderRadius: 12,
                  border: activeTab === 'card' ? '1.5px solid #6E42E5' : '1px solid transparent',
                  backgroundColor: activeTab === 'card' ? '#FFFFFF' : 'transparent',
                  boxShadow: activeTab === 'card' ? '0 3px 10px rgba(110, 66, 229, 0.1)' : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: '#F1F5F9',
                    color: '#1E293B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CreditCard size={17} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A' }}>Credit / Debit Card</div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Visa, Master, RuPay</div>
                  </div>
                </div>
                {activeTab === 'card' && <ChevronRight size={16} color="#6E42E5" />}
              </button>

              {/* 5. Cash on Delivery (COD) */}
              {!hideCOD && (
                <button
                  type="button"
                  onClick={() => { setActiveTab('cod'); setShowQrCode(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '11px 12px',
                    borderRadius: 12,
                    border: activeTab === 'cod' ? '1.5px solid #10B981' : '1px solid transparent',
                    backgroundColor: activeTab === 'cod' ? '#FFFFFF' : 'transparent',
                    boxShadow: activeTab === 'cod' ? '0 3px 10px rgba(16, 185, 129, 0.12)' : 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: '#ECFDF5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Banknote size={17} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A' }}>Cash on Delivery</div>
                      <div style={{ fontSize: 11, color: '#059669', fontWeight: 700 }}>COD (Pay after service)</div>
                    </div>
                  </div>
                  {activeTab === 'cod' && <ChevronRight size={16} color="#059669" />}
                </button>
              )}

              {/* 6. Wallets */}
              <button
                type="button"
                onClick={() => { setActiveTab('wallet'); setShowQrCode(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 12px',
                  borderRadius: 12,
                  border: activeTab === 'wallet' ? '1.5px solid #6E42E5' : '1px solid transparent',
                  backgroundColor: activeTab === 'wallet' ? '#FFFFFF' : 'transparent',
                  boxShadow: activeTab === 'wallet' ? '0 3px 10px rgba(110, 66, 229, 0.1)' : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: '#FEF3C7',
                    color: '#D97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Wallet size={17} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A' }}>Wallets</div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Amazon, Mobikwik</div>
                  </div>
                </div>
                {activeTab === 'wallet' && <ChevronRight size={16} color="#6E42E5" />}
              </button>

              <div style={{ marginTop: 'auto', padding: '12px 10px 4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748B' }}>
                  <ShieldCheck size={14} color="#10B981" />
                  <span>100% Refundable Guarantee</span>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------- */}
            {/* RIGHT PANEL: PAYMENT METHOD DETAILS & ACTION CTA        */}
            {/* ------------------------------------------------------- */}
            <div style={{
              padding: '24px 28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflowY: 'auto'
            }}>
              {/* ==================== 1. GPAY PANEL ==================== */}
              {activeTab === 'gpay' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        padding: '4px 10px',
                        borderRadius: 8,
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        fontSize: 16,
                        fontWeight: 900
                      }}>
                        <span style={{ color: '#4285F4' }}>G</span>
                        <span style={{ color: '#EA4335' }}>o</span>
                        <span style={{ color: '#FBBC05' }}>o</span>
                        <span style={{ color: '#4285F4' }}>g</span>
                        <span style={{ color: '#34A853' }}>l</span>
                        <span style={{ color: '#EA4335' }}>e</span>
                        <span style={{ color: '#5F6368', marginLeft: 4 }}>Pay</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: 999 }}>
                        Zero Gateway Surcharge
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowQrCode(!showQrCode)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#6E42E5',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <QrCode size={14} />
                      <span>{showQrCode ? 'Hide QR' : 'Show GPay QR'}</span>
                    </button>
                  </div>

                  {showQrCode ? (
                    <div style={{
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: 16,
                      padding: 20,
                      textAlign: 'center',
                      marginBottom: 20
                    }}>
                      <div style={{
                        width: 140,
                        height: 140,
                        backgroundColor: '#FFFFFF',
                        borderRadius: 12,
                        margin: '0 auto 12px',
                        padding: 10,
                        border: '1px solid #CBD5E1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 3 }}>
                          {[1,1,1,0,1, 1,0,1,1,1, 1,1,0,1,0, 0,1,1,0,1, 1,1,0,1,1].map((val, idx) => (
                            <div key={idx} style={{ backgroundColor: val ? '#0F172A' : 'transparent', borderRadius: 2 }} />
                          ))}
                        </div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                        Scan using Google Pay on any mobile
                      </div>
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                        UPI ID: urbancompany@okhdfcbank
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 8 }}>
                        Enter your Google Pay UPI ID
                      </label>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1.5px solid #CBD5E1',
                        borderRadius: 12,
                        padding: '10px 14px',
                        backgroundColor: '#FFFFFF',
                        marginBottom: 10
                      }}>
                        <input
                          type="text"
                          value={gpayUpi}
                          onChange={(e) => setGpayUpi(e.target.value)}
                          placeholder="yourname@okhdfcbank"
                          style={{
                            border: 'none',
                            outline: 'none',
                            width: '100%',
                            fontSize: 14,
                            fontWeight: 600,
                            color: '#0F172A'
                          }}
                        />
                        <CheckCircle2 size={18} color="#10B981" />
                      </div>

                      {/* Quick Bank UPI Suffix Buttons */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                        {['@okhdfcbank', '@okaxis', '@oksbi', '@okicici'].map(suffix => (
                          <button
                            key={suffix}
                            type="button"
                            onClick={() => {
                              const base = gpayUpi.includes('@') ? gpayUpi.split('@')[0] : gpayUpi;
                              setGpayUpi(`${base}${suffix}`);
                            }}
                            style={{
                              backgroundColor: '#F1F5F9',
                              border: '1px solid #E2E8F0',
                              borderRadius: 6,
                              padding: '4px 8px',
                              fontSize: 11,
                              fontWeight: 600,
                              color: '#475569',
                              cursor: 'pointer'
                            }}
                          >
                            {suffix}
                          </button>
                        ))}
                      </div>

                      <div style={{
                        backgroundColor: '#F0FDF4',
                        border: '1px solid #BBF7D0',
                        borderRadius: 12,
                        padding: '12px 14px',
                        fontSize: 12.5,
                        color: '#166534',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        marginBottom: 20
                      }}>
                        <Check size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                        <span>
                          A collect request of <strong>₹{amount}</strong> will be sent to your Google Pay app. Simply open GPay and approve the PIN.
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleExecutePayment}
                    style={{
                      width: '100%',
                      padding: '14px 20px',
                      backgroundColor: '#1E40AF',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 12,
                      fontSize: 15,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 14px rgba(30, 64, 175, 0.3)',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E40AF'}
                  >
                    <span>Pay ₹{amount.toLocaleString('en-IN')} with Google Pay</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* ==================== 2. PHONEPE PANEL ==================== */}
              {activeTab === 'phonepe' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        padding: '4px 12px',
                        borderRadius: 8,
                        backgroundColor: '#5F259F',
                        color: '#FFFFFF',
                        fontSize: 15,
                        fontWeight: 900
                      }}>
                        PhonePe
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: 999 }}>
                        Fast &amp; Secure
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowQrCode(!showQrCode)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#5F259F',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <QrCode size={14} />
                      <span>{showQrCode ? 'Hide QR' : 'Scan PhonePe QR'}</span>
                    </button>
                  </div>

                  <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 8 }}>
                    Enter PhonePe Mobile Number or UPI ID
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: 12,
                    padding: '10px 14px',
                    backgroundColor: '#FFFFFF',
                    marginBottom: 14
                  }}>
                    <input
                      type="text"
                      value={phonePeNumber}
                      onChange={(e) => setPhonePeNumber(e.target.value)}
                      placeholder="9876543210 or yourname@ybl"
                      style={{
                        border: 'none',
                        outline: 'none',
                        width: '100%',
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#0F172A'
                      }}
                    />
                    <Smartphone size={18} color="#5F259F" />
                  </div>

                  <div style={{
                    backgroundColor: '#FAF5FF',
                    border: '1px solid #E9D5FF',
                    borderRadius: 12,
                    padding: '12px 14px',
                    fontSize: 12.5,
                    color: '#6B21A8',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    marginBottom: 24
                  }}>
                    <Info size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                    <span>
                      Open your <strong>PhonePe app</strong> and check notification for <strong>₹{amount}</strong> from Urban Company.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleExecutePayment}
                    style={{
                      width: '100%',
                      padding: '14px 20px',
                      backgroundColor: '#5F259F',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 12,
                      fontSize: 15,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 14px rgba(95, 37, 159, 0.35)',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4C1D95'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#5F259F'}
                  >
                    <span>Pay ₹{amount.toLocaleString('en-IN')} with PhonePe</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* ==================== 3. PAYTM PANEL ==================== */}
              {activeTab === 'paytm' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div style={{
                      padding: '4px 12px',
                      borderRadius: 8,
                      backgroundColor: '#00BAF2',
                      color: '#FFFFFF',
                      fontSize: 15,
                      fontWeight: 900
                    }}>
                      paytm
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0369A1', backgroundColor: '#E0F2FE', padding: '2px 8px', borderRadius: 999 }}>
                      Paytm Wallet / UPI
                    </span>
                  </div>

                  <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 8 }}>
                    Paytm Registered Mobile Number or UPI ID
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: 12,
                    padding: '10px 14px',
                    backgroundColor: '#FFFFFF',
                    marginBottom: 16
                  }}>
                    <input
                      type="text"
                      value={paytmNumber}
                      onChange={(e) => setPaytmNumber(e.target.value)}
                      placeholder="9876543210 or yourname@paytm"
                      style={{
                        border: 'none',
                        outline: 'none',
                        width: '100%',
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#0F172A'
                      }}
                    />
                    <Wallet size={18} color="#00BAF2" />
                  </div>

                  <div style={{
                    backgroundColor: '#F0F9FF',
                    border: '1px solid #BAE6FD',
                    borderRadius: 12,
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 24
                  }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#0369A1', fontWeight: 600 }}>Linked Paytm Wallet</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#0C4A6E' }}>Available: ₹1,850.00</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: 999 }}>
                      Sufficient Balance
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleExecutePayment}
                    style={{
                      width: '100%',
                      padding: '14px 20px',
                      backgroundColor: '#002E6E',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 12,
                      fontSize: 15,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 14px rgba(0, 46, 110, 0.35)',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#001E4D'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#002E6E'}
                  >
                    <span>Pay ₹{amount.toLocaleString('en-IN')} with Paytm</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* ==================== 4. CARD PANEL ==================== */}
              {activeTab === 'card' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>
                      Credit or Debit Card
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {['VISA', 'MC', 'RuPay'].map(brand => (
                        <span key={brand} style={{ fontSize: 10, fontWeight: 900, backgroundColor: '#F1F5F9', color: '#334155', padding: '2px 6px', borderRadius: 4 }}>
                          {brand}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4532 8920 1142 8849"
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          padding: '9px 12px',
                          borderRadius: 8,
                          border: '1.5px solid #CBD5E1',
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: '#0F172A'
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="Name on card"
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '9px 12px',
                            borderRadius: 8,
                            border: '1.5px solid #CBD5E1',
                            fontSize: 13.5,
                            fontWeight: 600,
                            color: '#0F172A'
                          }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                            Expiry
                          </label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            style={{
                              width: '100%',
                              boxSizing: 'border-box',
                              padding: '9px 10px',
                              borderRadius: 8,
                              border: '1.5px solid #CBD5E1',
                              fontSize: 13.5,
                              fontWeight: 600,
                              color: '#0F172A',
                              textAlign: 'center'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                            CVV
                          </label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="•••"
                            style={{
                              width: '100%',
                              boxSizing: 'border-box',
                              padding: '9px 10px',
                              borderRadius: 8,
                              border: '1.5px solid #CBD5E1',
                              fontSize: 13.5,
                              fontWeight: 600,
                              color: '#0F172A',
                              textAlign: 'center'
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#475569', cursor: 'pointer', marginTop: 2 }}>
                      <input
                        type="checkbox"
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                        style={{ accentColor: '#6E42E5' }}
                      />
                      <span>Save card securely as per RBI guidelines</span>
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={handleExecutePayment}
                    style={{
                      width: '100%',
                      padding: '14px 20px',
                      backgroundColor: '#6E42E5',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 12,
                      fontSize: 15,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 14px rgba(110, 66, 229, 0.35)',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#582AD1'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6E42E5'}
                  >
                    <span>Pay ₹{amount.toLocaleString('en-IN')} Securely</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* ==================== 5. COD PANEL ==================== */}
              {activeTab === 'cod' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{
                      padding: '4px 12px',
                      borderRadius: 8,
                      backgroundColor: '#ECFDF5',
                      color: '#059669',
                      fontSize: 15,
                      fontWeight: 900
                    }}>
                      Cash on Delivery
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#047857', backgroundColor: '#D1FAE5', padding: '2px 8px', borderRadius: 999 }}>
                      Pay After Service
                    </span>
                  </div>

                  <div style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: 14,
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    marginBottom: 24
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <CheckCircle2 size={18} color="#10B981" style={{ marginTop: 2, flexShrink: 0 }} />
                      <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.4 }}>
                        <strong>Pay only after 100% satisfaction:</strong> Pay our verified professional using Cash, any UPI app (GPay/PhonePe), or Card when the service is completed.
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <CheckCircle2 size={18} color="#10B981" style={{ marginTop: 2, flexShrink: 0 }} />
                      <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.4 }}>
                        <strong>No advance deposit:</strong> Book your appointment risk-free with zero upfront payment required today.
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <CheckCircle2 size={18} color="#10B981" style={{ marginTop: 2, flexShrink: 0 }} />
                      <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.4 }}>
                        <strong>Urban Company 30-Day Warranty:</strong> Covers all spare parts and service quality.
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleExecutePayment}
                    style={{
                      width: '100%',
                      padding: '14px 20px',
                      backgroundColor: '#059669',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 12,
                      fontSize: 15,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                  >
                    <span>Confirm Booking with Cash on Delivery • ₹{amount.toLocaleString('en-IN')}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* ==================== 6. WALLETS PANEL ==================== */}
              {activeTab === 'wallet' && (
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 14 }}>
                    Select Digital Wallet
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                    {[
                      { id: 'amazon_pay', name: 'Amazon Pay', balance: '₹450.00', color: '#FF9900' },
                      { id: 'mobikwik', name: 'Mobikwik Wallet', balance: '₹210.00', color: '#0084FF' },
                      { id: 'airtel_money', name: 'Airtel Money', balance: '₹120.00', color: '#ED1C24' },
                      { id: 'jiomoney', name: 'JioMoney', balance: '₹80.00', color: '#0066A2' }
                    ].map(w => (
                      <label
                        key={w.id}
                        onClick={() => setSelectedWallet(w.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          borderRadius: 10,
                          border: selectedWallet === w.id ? '1.5px solid #6E42E5' : '1px solid #E2E8F0',
                          backgroundColor: selectedWallet === w.id ? '#FAF5FF' : '#FFFFFF',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <input
                            type="radio"
                            name="gatewayWallet"
                            checked={selectedWallet === w.id}
                            onChange={() => setSelectedWallet(w.id)}
                            style={{ accentColor: '#6E42E5' }}
                          />
                          <div>
                            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>{w.name}</div>
                            <div style={{ fontSize: 11, color: '#64748B' }}>Available Balance: {w.balance}</div>
                          </div>
                        </div>
                        <Wallet size={16} color={w.color} />
                      </label>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleExecutePayment}
                    style={{
                      width: '100%',
                      padding: '14px 20px',
                      backgroundColor: '#D97706',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 12,
                      fontSize: 15,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B45309'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D97706'}
                  >
                    <span>Pay ₹{amount.toLocaleString('en-IN')} via Wallet</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* Bottom Reassurance Footer */}
              <div style={{
                marginTop: 20,
                paddingTop: 12,
                borderTop: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 11,
                color: '#94A3B8'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={13} color="#10B981" />
                  <span>Safe &amp; Secure Payment</span>
                </div>
                <div>PCI-DSS Level 1 Compliant</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default PaymentGatewayModal;
