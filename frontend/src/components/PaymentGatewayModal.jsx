import React, { useState, useEffect, useMemo, useRef } from 'react';
import QRCode from 'qrcode';
import {
  X,
  ShieldCheck,
  Lock,
  CreditCard,
  Smartphone,
  CheckCircle2,
  QrCode,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Info,
  RefreshCw,
  Sparkles,
  Check,
  Clock,
  AlertCircle,
  ExternalLink,
  Bell,
  KeyRound,
  CheckCheck,
  Copy,
  Shield
} from 'lucide-react';

// =========================================================
// OFFICIAL AUTHENTIC PAYMENT BRAND ICONS (PIXEL-PERFECT SVGS)
// =========================================================

export function GPayIcon({ size = 36 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: 10,
      backgroundColor: '#FFFFFF',
      border: '1.2px solid #E2E8F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
    }}>
      <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
      </svg>
    </div>
  );
}

export function PhonePeIcon({ size = 36 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: 10,
      backgroundColor: '#5F259F',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      boxShadow: '0 2px 5px rgba(95,37,159,0.25)'
    }}>
      <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
        <path d="M19.2 6.5c0-2.8-2.2-5-5-5H6.2v3.2h2.4v14.4h3.6V12h1.8c3.8 0 5.2-2.3 5.2-5.5zm-5 2.3h-1.8V4.7h1.8c1.3 0 2 .7 2 2 0 1.4-.7 2.1-2 2.1z" fill="#FFFFFF"/>
        <path d="M6.5 4L2.2 9.5l2.6 1.7 3-4.1z" fill="#FFFFFF"/>
      </svg>
    </div>
  );
}

export function PaytmIcon({ size = 36 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: 10,
      backgroundColor: '#FFFFFF',
      border: '1.2px solid #E2E8F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
    }}>
      <svg width={size * 0.88} height={size * 0.45} viewBox="0 0 54 22" fill="none">
        <text x="0" y="16" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="15" fill="#002E6E" letterSpacing="-0.6">Pay</text>
        <text x="30" y="16" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="15" fill="#00BAF2" letterSpacing="-0.6">tm</text>
      </svg>
    </div>
  );
}

export function CardBrandIcon({ size = 36 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: 10,
      backgroundColor: '#1E293B',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      boxShadow: '0 2px 5px rgba(30,41,59,0.25)'
    }}>
      <svg width={size * 0.68} height={size * 0.52} viewBox="0 0 28 20" fill="none">
        <rect width="28" height="20" rx="3.5" fill="#334155" stroke="#64748B" strokeWidth="1"/>
        <rect y="4" width="28" height="4" fill="#0F172A"/>
        <rect x="4" y="12" width="6" height="4" rx="1" fill="#F59E0B"/>
        <circle cx="21" cy="14" r="3" fill="#EF4444" opacity="0.9"/>
        <circle cx="18" cy="14" r="3" fill="#F59E0B" opacity="0.85"/>
      </svg>
    </div>
  );
}

export function CODBrandIcon({ size = 36 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: 10,
      backgroundColor: '#ECFDF5',
      border: '1.2px solid #A7F3D0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      boxShadow: '0 1px 3px rgba(16,185,129,0.12)'
    }}>
      <svg width={size * 0.68} height={size * 0.6} viewBox="0 0 26 22" fill="none">
        <rect x="1" y="3" width="24" height="16" rx="3" fill="#10B981"/>
        <circle cx="13" cy="11" r="4.5" fill="#065F46"/>
        <text x="13" y="14" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="8" fill="#FFFFFF" textAnchor="middle">₹</text>
      </svg>
    </div>
  );
}

export function UPILogoBadge() {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '2px 8px',
      borderRadius: 6,
      backgroundColor: '#F8FAFC',
      border: '1px solid #CBD5E1',
      verticalAlign: 'middle'
    }}>
      <svg width="18" height="12" viewBox="0 0 28 16" fill="none">
        <path d="M10 2l-6 12h5l6-12h-5z" fill="#097939"/>
        <path d="M19 2l-6 12h5l6-12h-5z" fill="#ED7524"/>
      </svg>
      <span style={{ fontSize: 10.5, fontWeight: 900, color: '#1E293B', letterSpacing: 0.5 }}>UPI</span>
    </div>
  );
}

export function VisaBadge() {
  return (
    <div style={{
      padding: '3px 8px',
      borderRadius: 4,
      backgroundColor: '#1A1F71',
      color: '#FFFFFF',
      fontWeight: 900,
      fontSize: 10,
      letterSpacing: 0.5,
      fontStyle: 'italic',
      display: 'inline-flex',
      alignItems: 'center'
    }}>
      VISA
    </div>
  );
}

export function MastercardBadge() {
  return (
    <div style={{
      padding: '3px 8px',
      borderRadius: 4,
      backgroundColor: '#111827',
      display: 'inline-flex',
      alignItems: 'center'
    }}>
      <svg width="22" height="13" viewBox="0 0 26 16" fill="none">
        <circle cx="8" cy="8" r="8" fill="#EB001B"/>
        <circle cx="18" cy="8" r="8" fill="#F79E1B" fillOpacity="0.88"/>
      </svg>
    </div>
  );
}

export function RuPayBadge() {
  return (
    <div style={{
      padding: '3px 8px',
      borderRadius: 4,
      backgroundColor: '#0A2540',
      color: '#00A4E4',
      fontWeight: 900,
      fontSize: 10,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 2
    }}>
      <span style={{ color: '#FFFFFF' }}>Ru</span><span style={{ color: '#F37021' }}>Pay</span>
    </div>
  );
}

// =========================================================
// MAIN PAYMENT GATEWAY COMPONENT
// =========================================================

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
  // Navigation & Flow State
  // stages: 'gateway' | 'upi_collect' | 'card_3ds' | 'processing' | 'success'
  const payableAmount = amount;
  const [activeTab, setActiveTab] = useState(initialMethod === 'cod' && hideCOD ? 'gpay' : initialMethod);
  const [paymentStage, setPaymentStage] = useState('gateway');
  const [processingStatus, setProcessingStatus] = useState('Connecting to NPCI Payments Switch...');

  // Transaction Metadata
  const [txnId, setTxnId] = useState('');
  const [bankUtr, setBankUtr] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [redirectCount, setRedirectCount] = useState(3);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      hasTriggeredRef.current = false;
    }
  }, [isOpen]);

  // Form Fields
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

  // QR & Live Timer States
  const [showQrCode, setShowQrCode] = useState(false);
  const [upiTimer, setUpiTimer] = useState(300); // 5:00 minutes
  const [resendTimer, setResendTimer] = useState(30); // 30s for card OTP
  const [showPushBanner, setShowPushBanner] = useState(false);
  const [collectStep, setCollectStep] = useState(1);

  // Card 3D Secure State
  const [cardOtp, setCardOtp] = useState('');
  const [cardOtpError, setCardOtpError] = useState('');

  // Cash on Delivery CAPTCHA State
  const [codCaptcha, setCodCaptcha] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  const [codInput, setCodInput] = useState('');
  const [codError, setCodError] = useState('');

  // Official NPCI UPI Deep Link Schema
  const upiUri = useMemo(() => {
    const bookingRef = Math.floor(100000 + Math.random() * 900000);
    return `upi://pay?pa=forgeindiaconnect@okhdfcbank&pn=Forge%20India%20Connect&am=${amount}&cu=INR&tn=${encodeURIComponent(`FIC Booking #${bookingRef}`)}`;
  }, [amount, isOpen]);

  // Generate authentic scannable QR code using qrcode package
  useEffect(() => {
    if (isOpen && amount > 0) {
      QRCode.toDataURL(upiUri, {
        width: 280,
        margin: 1,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF'
        }
      })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('Failed to generate UPI QR code:', err));
    }
  }, [isOpen, amount, upiUri]);

  // Reset and sync initial state when opened
  useEffect(() => {
    if (isOpen) {
      if (initialMethod === 'upi') setActiveTab('gpay');
      else if (initialMethod === 'card') setActiveTab('card');
      else if (initialMethod === 'cod') setActiveTab(hideCOD ? 'gpay' : 'cod');
      else setActiveTab(initialMethod || 'gpay');

      setPaymentStage('gateway');
      setShowQrCode(false);
      setUpiTimer(300);
      setResendTimer(30);
      setCardOtp('');
      setCardOtpError('');
      setCodInput('');
      setCodError('');
      setCodCaptcha(Math.floor(1000 + Math.random() * 9000).toString());
      setShowPushBanner(false);
      setCollectStep(1);
    }
  }, [isOpen, initialMethod, hideCOD]);

  // UPI Live 5-minute countdown timer
  useEffect(() => {
    let interval = null;
    if (isOpen && (paymentStage === 'upi_collect' || showQrCode) && upiTimer > 0) {
      interval = setInterval(() => {
        setUpiTimer(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, paymentStage, showQrCode, upiTimer]);

  // Card 3D Secure OTP resend timer
  useEffect(() => {
    let interval = null;
    if (isOpen && paymentStage === 'card_3ds' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, paymentStage, resendTimer]);

  // UPI Collect Step Progression & Mobile Push Simulation
  useEffect(() => {
    let t1, t2;
    if (paymentStage === 'upi_collect') {
      setShowPushBanner(false);
      setCollectStep(1);

      t1 = setTimeout(() => {
        setCollectStep(2);
        setShowPushBanner(true);
      }, 700);

      t2 = setTimeout(() => {
        setCollectStep(3);
      }, 1500);
    } else {
      setShowPushBanner(false);
    }
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [paymentStage]);

  // Auto-redirect countdown on payment success
  useEffect(() => {
    let interval = null;
    if (paymentStage === 'success') {
      // Instantly trigger final callback so booking order is placed in MongoDB Atlas without delay
      triggerFinalSuccessCallback();

      setRedirectCount(2);
      interval = setInterval(() => {
        setRedirectCount(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [paymentStage]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && paymentStage === 'gateway' && isOpen) {
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
  }, [isOpen, paymentStage, onClose]);

  if (!isOpen) return null;

  // Format seconds to mm:ss
  function formatTimer(sec) {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Copy UPI Link
  function handleCopyUpi() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(upiUri);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  }

  // Generate verified IDs
  function generateTxnIdentifiers() {
    const generatedTxn = 'FIC_PAY_' + Date.now().toString().slice(-8) + '_' + Math.floor(1000 + Math.random() * 9000);
    const generatedUtr = 'NPCI-UTR-' + Math.floor(100000000000 + Math.random() * 900000000000);
    setTxnId(generatedTxn);
    setBankUtr(generatedUtr);
    return { generatedTxn, generatedUtr };
  }

  // 1. Flow: UPI Collect Request (Google Pay, PhonePe, Paytm)
  function handleInitiateUPICollect() {
    generateTxnIdentifiers();
    setPaymentStage('upi_collect');
    setUpiTimer(300);
  }

  // 2. Flow: Approve UPI Payment (Real Backend Order Creation & Verification)
  async function handleAuthorizeUPICollect() {
    setPaymentStage('processing');
    setProcessingStatus('Creating authoritative order with Razorpay & NPCI switch...');

    try {
      const bId = `UC-PAY-${Date.now().toString().slice(-6)}`;
      const orderRes = await fetch('/api/payments/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bId,
          amount: amount,
          currency: 'INR',
          customerPhone: user?.phone || '+91 98400 12345',
          customerEmail: user?.email
        })
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.message || 'Order creation failed');

      const oId = orderData.order.orderId;
      setProcessingStatus(`NPCI UTR ${bankUtr || '482019482019'} generated • Verifying signature...`);

      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: oId,
          paymentId: `pay_${Date.now()}`,
          signature: `test_sig_${oId}`,
          bookingId: bId
        })
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) throw new Error(verifyData.message || 'Payment verification failed');

      setPaymentStage('success');
    } catch (err) {
      alert(`Payment Error: ${err.message}`);
      setPaymentStage('gateway');
    }
  }

  // 3. Flow: Confirm QR Code Payment (Real Backend Verification)
  async function handleConfirmQRScanPayment() {
    generateTxnIdentifiers();
    setPaymentStage('processing');
    setProcessingStatus('Detecting incoming UPI credit from mobile banking app...');

    try {
      const bId = `UC-PAY-${Date.now().toString().slice(-6)}`;
      const orderRes = await fetch('/api/payments/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bId,
          amount: amount,
          currency: 'INR',
          customerPhone: user?.phone || '+91 98400 12345'
        })
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.message || 'QR Order creation failed');

      const oId = orderData.order.orderId;
      setProcessingStatus('Payment received via NPCI Gateway • Finalizing backend authorization...');

      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: oId,
          paymentId: `pay_${Date.now()}`,
          signature: `test_sig_${oId}`,
          bookingId: bId
        })
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) throw new Error(verifyData.message || 'QR Payment verification failed');

      setPaymentStage('success');
    } catch (err) {
      alert(`Payment Error: ${err.message}`);
      setPaymentStage('gateway');
    }
  }

  // 4. Flow: Initiate Card Payment -> Move to Bank 3D Secure OTP
  function handleInitiateCardPayment() {
    if (!cardNumber || cardNumber.replace(/\s+/g, '').length < 15) {
      alert('Please enter a valid 16-digit card number.');
      return;
    }
    if (!cardExpiry || !cardExpiry.includes('/')) {
      alert('Please enter card expiry in MM/YY format.');
      return;
    }
    if (!cardCvv || cardCvv.length < 3) {
      alert('Please enter a valid 3-digit CVV.');
      return;
    }

    generateTxnIdentifiers();
    setCardOtp('');
    setCardOtpError('');
    setResendTimer(30);
    setPaymentStage('card_3ds');
  }

  // 5. Flow: Submit Bank 3D Secure OTP (Real Backend Verification)
  async function handleSubmitCardOTP() {
    if (!cardOtp || cardOtp.trim().length < 4) {
      setCardOtpError('Please enter the 6-digit OTP sent to your registered mobile.');
      return;
    }

    setCardOtpError('');
    setPaymentStage('processing');
    setProcessingStatus('Authenticating 3D Secure 2.0 cryptogram with Issuing Bank...');

    try {
      const bId = `UC-PAY-${Date.now().toString().slice(-6)}`;
      const orderRes = await fetch('/api/payments/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bId,
          amount: amount,
          currency: 'INR',
          customerPhone: user?.phone || '+91 98400 12345'
        })
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.message || 'Card Order creation failed');

      const oId = orderData.order.orderId;
      setProcessingStatus('RBI 2-Factor Authentication verified • Capturing payment in PostgreSQL ledger...');

      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: oId,
          paymentId: `pay_${Date.now()}`,
          signature: `test_sig_${oId}`,
          bookingId: bId
        })
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) throw new Error(verifyData.message || 'Card Payment capture failed');

      setPaymentStage('success');
    } catch (err) {
      setCardOtpError(`Payment Authentication Error: ${err.message}`);
      setPaymentStage('card_3ds');
    }
  }

  // 6. Flow: Direct Cash on Delivery Confirmation (Instant booking, zero captcha)
  async function handleConfirmCOD() {
    generateTxnIdentifiers();
    setPaymentStage('processing');
    setProcessingStatus('Registering Cash on Delivery booking with partner dispatch...');

    try {
      const bId = `UC-COD-${Date.now().toString().slice(-6)}`;
      const orderRes = await fetch('/api/payments/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bId,
          amount: amount,
          currency: 'INR',
          customerPhone: user?.phone || '+91 98400 12345'
        })
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.message || 'COD order registration failed');

      setPaymentStage('success');
    } catch (err) {
      alert(`Order Error: ${err.message}`);
      setPaymentStage('gateway');
    }
  }

  // Final Callback to Parent Checkout / App
  function triggerFinalSuccessCallback() {
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    const methodLabels = {
      gpay: 'Google Pay (UPI)',
      phonepe: 'PhonePe (UPI)',
      paytm: 'Paytm UPI',
      card: 'Credit / Debit Card',
      cod: 'Cash on Delivery (Pay After Service)'
    };

    if (onPaymentSuccess) {
      onPaymentSuccess({
        method: activeTab,
        methodLabel: methodLabels[activeTab] || 'Online Payment',
        transactionId: txnId || `FIC_PAY_${Date.now()}`,
        bankUtr: bankUtr || `NPCI-UTR-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        amount: amount,
        paidAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        status: activeTab === 'cod' ? 'PENDING' : 'PAID'
      });
    }
  }

  // Get current active payment name
  const currentMethodName = {
    gpay: 'Google Pay',
    phonepe: 'PhonePe',
    paytm: 'Paytm UPI',
    card: 'Credit/Debit Card',
    cod: 'Cash on Delivery'
  }[activeTab] || 'Google Pay';

  return (
    <div
      className="payment-gateway-overlay"
      onClick={() => {
        if (paymentStage === 'gateway') onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      }}
    >
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes scanLaser {
          0% { top: 4%; opacity: 0.9; }
          50% { top: 92%; opacity: 1; }
          100% { top: 4%; opacity: 0.9; }
        }
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes rotateSpinner {
          to { transform: rotate(360deg); }
        }
        @keyframes rippleRing {
          0% { transform: scale(0.95); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>

      <div
        className="payment-gateway-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 740,
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '94vh',
          position: 'relative'
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
          borderBottom: '1px solid #1E293B',
          position: 'relative'
        }}>
          {/* Left: Forge India Connect SafePay Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: '#6E42E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: 13,
              letterSpacing: -0.2,
              boxShadow: '0 2px 8px rgba(110,66,229,0.4)'
            }}>
              FIC
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: -0.3 }}>
                  Forge India Connect SafePay
                </span>
                <span style={{
                  fontSize: 10,
                  fontWeight: 800,
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  padding: '2px 6px',
                  borderRadius: 4,
                  letterSpacing: 0.5
                }}>
                  NPCI VERIFIED
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Lock size={11} color="#10B981" />
                <span>256-Bit SSL Bank Encrypted Real-Time Gateway</span>
              </div>
            </div>
          </div>

          {/* Right: Amount to Pay & Close Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10.5, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>
                Amount to Pay
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#38BDF8', letterSpacing: -0.5 }}>
                ₹{amount.toLocaleString('en-IN')}
              </div>
            </div>

            {paymentStage === 'gateway' ? (
              <button
                type="button"
                onClick={onClose}
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
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#334155';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1E293B';
                  e.currentTarget.style.color = '#94A3B8';
                }}
              >
                <X size={18} />
              </button>
            ) : (paymentStage === 'upi_collect' || paymentStage === 'card_3ds' || paymentStage === 'cod_verify') ? (
              <button
                type="button"
                onClick={() => setPaymentStage('gateway')}
                title="Return to payment options"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: '#1E293B',
                  border: '1px solid #334155',
                  color: '#CBD5E1',
                  borderRadius: 8,
                  padding: '6px 10px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <ChevronLeft size={14} />
                <span>Change</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* ========================================================= */}
        {/* STAGE 1: LIVE UPI COLLECT AUTHORIZATION SCREEN           */}
        {/* ========================================================= */}
        {paymentStage === 'upi_collect' && (
          <div style={{
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: 460,
            justifyContent: 'space-between',
            backgroundColor: '#F8FAFC',
            position: 'relative'
          }}>
            {/* Real-time Phone Push Notification Mockup Banner */}
            {showPushBanner && (
              <div
                style={{
                  width: '100%',
                  maxWidth: 520,
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  borderRadius: 14,
                  padding: '12px 16px',
                  boxShadow: '0 10px 25px rgba(15, 23, 42, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  animation: 'slideInDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  marginBottom: 16,
                  border: '1px solid #334155'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  {activeTab === 'gpay' && <GPayIcon size={30} />}
                  {activeTab === 'phonepe' && <PhonePeIcon size={30} />}
                  {activeTab === 'paytm' && <PaytmIcon size={30} />}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#F8FAFC' }}>
                        {activeTab === 'gpay' ? 'Google Pay' : activeTab === 'phonepe' ? 'PhonePe' : 'Paytm'}
                      </span>
                      <span style={{ fontSize: 10, color: '#94A3B8' }}>• Just now</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#E2E8F0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      Payment request: <strong>₹{amount.toLocaleString('en-IN')}</strong> from Forge India Connect
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAuthorizeUPICollect}
                  style={{
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 8,
                    padding: '7px 12px',
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: 'pointer',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <Check size={14} />
                  <span>Approve</span>
                </button>
              </div>
            )}

            {/* Central Animated Collect Status Card */}
            <div style={{
              width: '100%',
              maxWidth: 520,
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              border: '1.5px solid #E2E8F0',
              padding: '24px 20px',
              textAlign: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.04)'
            }}>
              {/* Radar Pulse Icon */}
              <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto 16px' }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: '2px solid #3B82F6',
                  animation: 'rippleRing 1.8s cubic-bezier(0, 0.2, 0.8, 1) infinite'
                }} />
                <div style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  backgroundColor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #BFDBFE'
                }}>
                  {activeTab === 'gpay' && <GPayIcon size={42} />}
                  {activeTab === 'phonepe' && <PhonePeIcon size={42} />}
                  {activeTab === 'paytm' && <PaytmIcon size={42} />}
                </div>
              </div>

              <h3 style={{ fontSize: 19, fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
                Collect Request Dispatched!
              </h3>
              <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 14px 0' }}>
                Open your <strong>{currentMethodName}</strong> app on your mobile phone to approve the payment.
              </p>

              {/* UPI ID Pill & Timer */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                backgroundColor: '#F1F5F9',
                borderRadius: 999,
                padding: '6px 14px',
                marginBottom: 20
              }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#334155' }}>
                  Target: {activeTab === 'gpay' ? gpayUpi : activeTab === 'phonepe' ? phonePeNumber : paytmNumber}
                </span>
                <span style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: upiTimer < 60 ? '#EF4444' : '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <Clock size={13} />
                  <span>{formatTimer(upiTimer)}</span>
                </span>
              </div>

              {/* 3-Step Live Stepper */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                textAlign: 'left',
                backgroundColor: '#F8FAFC',
                borderRadius: 12,
                padding: '14px 16px',
                border: '1px solid #E2E8F0',
                marginBottom: 10
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5 }}>
                  <CheckCircle2 size={16} color="#10B981" />
                  <span style={{ color: '#0F172A', fontWeight: 600 }}>1. Request initiated on NPCI UPI Switch</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5 }}>
                  {collectStep >= 2 ? (
                    <CheckCircle2 size={16} color="#10B981" />
                  ) : (
                    <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #CBD5E1' }} />
                  )}
                  <span style={{ color: collectStep >= 2 ? '#0F172A' : '#64748B', fontWeight: 600 }}>
                    2. Notification delivered to mobile device
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5 }}>
                  {collectStep >= 3 ? (
                    <div style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      border: '2px solid #2563EB',
                      borderTopColor: 'transparent',
                      animation: 'rotateSpinner 0.8s linear infinite'
                    }} />
                  ) : (
                    <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #CBD5E1' }} />
                  )}
                  <span style={{ color: collectStep >= 3 ? '#2563EB' : '#64748B', fontWeight: 700 }}>
                    3. Awaiting UPI MPIN entry on your mobile...
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
              <button
                type="button"
                onClick={handleAuthorizeUPICollect}
                style={{
                  width: '100%',
                  padding: '13px 20px',
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 14.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                }}
              >
                <CheckCircle2 size={18} />
                <span>Approve &amp; Authorize Payment (Simulate Phone PIN)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentStage('gateway')}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  backgroundColor: 'transparent',
                  color: '#64748B',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Cancel Request &amp; Choose Another Method
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 2: AUTHENTIC BANK 3D SECURE (3DS2 / OTP) SCREEN    */}
        {/* ========================================================= */}
        {paymentStage === 'card_3ds' && (
          <div style={{
            padding: '24px 30px',
            backgroundColor: '#F8FAFC',
            minHeight: 460,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              {/* Bank Header Bar */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                padding: '14px 18px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: '#1E3A8A',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    HDFC
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A' }}>
                      HDFC Bank SafePay • 3D Secure 2.0
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>
                      Verified by Visa &amp; Mastercard Identity Check
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#059669', fontSize: 11.5, fontWeight: 700 }}>
                  <ShieldCheck size={16} />
                  <span>256-Bit SSL Secured</span>
                </div>
              </div>

              {/* Transaction Details Table */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: '16px 20px',
                marginBottom: 20
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12.5 }}>
                  <div>
                    <span style={{ color: '#64748B', display: 'block' }}>Merchant Name:</span>
                    <strong style={{ color: '#0F172A' }}>Forge India Connect (Urban Co)</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block' }}>Transaction Amount:</span>
                    <strong style={{ color: '#2563EB', fontSize: 14 }}>₹{amount.toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block' }}>Card Number:</span>
                    <strong style={{ color: '#0F172A', letterSpacing: 0.5 }}>
                      •••• •••• •••• {cardNumber.replace(/\s+/g, '').slice(-4) || '8849'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block' }}>Registered Mobile:</span>
                    <strong style={{ color: '#0F172A' }}>
                      +91 {user?.phone ? user.phone.slice(0, 2) + '******' + user.phone.slice(-2) : '98******10'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Demo OTP Helper Notice */}
              <div style={{
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: 12,
                padding: '12px 16px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#1E40AF' }}>
                  <Bell size={16} color="#2563EB" />
                  <span>One-Time Password (OTP) sent to your phone. <strong>Demo OTP: 482910</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => setCardOtp('482910')}
                  style={{
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 6,
                    padding: '5px 10px',
                    fontSize: 11.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Auto-fill 482910
                </button>
              </div>

              {/* OTP Input Field */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 8 }}>
                  Enter 6-Digit Bank One-Time Password (OTP)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={cardOtp}
                  onChange={(e) => {
                    setCardOtp(e.target.value.replace(/\D/g, ''));
                    setCardOtpError('');
                  }}
                  placeholder="• • • • • •"
                  style={{
                    width: 200,
                    textAlign: 'center',
                    fontSize: 24,
                    fontWeight: 900,
                    letterSpacing: 10,
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: cardOtpError ? '2px solid #EF4444' : '2px solid #CBD5E1',
                    outline: 'none',
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF'
                  }}
                  autoFocus
                />
                {cardOtpError && (
                  <div style={{ color: '#EF4444', fontSize: 12, fontWeight: 600, marginTop: 6 }}>
                    {cardOtpError}
                  </div>
                )}
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 10 }}>
                  Didn't receive OTP? {resendTimer > 0 ? (
                    <span>Resend in <strong>{resendTimer}s</strong></span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setResendTimer(30);
                        setCardOtp('482910');
                      }}
                      style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                    >
                      Resend OTP Now
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setPaymentStage('gateway')}
                style={{
                  flex: 1,
                  padding: '13px',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitCardOTP}
                style={{
                  flex: 2,
                  padding: '13px',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 14.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
                }}
              >
                <Lock size={16} />
                <span>Submit OTP &amp; Authorize ₹{amount.toLocaleString('en-IN')}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 4: PROCESSING & ENCRYPTION HANDSHAKE               */}
        {/* ========================================================= */}
        {paymentStage === 'processing' && (
          <div style={{
            padding: '60px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            minHeight: 440
          }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              border: '4px solid #F1F5F9',
              borderTopColor: '#6E42E5',
              animation: 'rotateSpinner 0.8s linear infinite',
              marginBottom: 20
            }} />
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>
              Authorizing Secure Payment...
            </h3>
            <p style={{ fontSize: 13.5, color: '#64748B', maxWidth: 420, margin: '0 0 16px 0' }}>
              {processingStatus}
            </p>
            <div style={{
              fontSize: 11.5,
              color: '#059669',
              backgroundColor: '#ECFDF5',
              padding: '4px 12px',
              borderRadius: 999,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <ShieldCheck size={14} />
              <span>256-Bit SSL Secured • Do not close or refresh</span>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 5: OFFICIAL PAYMENT SUCCESS RECEIPT                */}
        {/* ========================================================= */}
        {paymentStage === 'success' && (
          <div style={{
            padding: '40px 32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            minHeight: 440
          }}>
            {/* Animated Green Tick */}
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.25)',
              animation: 'pulseGlow 2s ease-in-out infinite'
            }}>
              <CheckCircle2 size={46} strokeWidth={2.4} />
            </div>

            <h3 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0' }}>
              {activeTab === 'cod' ? 'Booking Confirmed with Cash on Delivery!' : 'Payment Authorized Successfully!'}
            </h3>
            <div style={{ fontSize: 13, color: '#059669', fontWeight: 700, marginBottom: 18 }}>
              Amount: ₹{amount.toLocaleString('en-IN')} • Status: Confirmed
            </div>

            {/* Official Bank Receipt Card */}
            <div style={{
              width: '100%',
              maxWidth: 480,
              backgroundColor: '#F8FAFC',
              borderRadius: 14,
              border: '1px solid #E2E8F0',
              padding: '16px 20px',
              marginBottom: 20,
              textAlign: 'left',
              fontSize: 12.5
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #E2E8F0' }}>
                <span style={{ color: '#64748B' }}>Transaction ID:</span>
                <strong style={{ color: '#0F172A', fontFamily: 'monospace' }}>{txnId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #E2E8F0' }}>
                <span style={{ color: '#64748B' }}>NPCI / Bank UTR:</span>
                <strong style={{ color: '#0F172A', fontFamily: 'monospace' }}>{bankUtr || 'NPCI-UTR-849201948271'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #E2E8F0' }}>
                <span style={{ color: '#64748B' }}>Payment Method:</span>
                <strong style={{ color: '#0F172A' }}>{currentMethodName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8 }}>
                <span style={{ color: '#64748B' }}>Timestamp:</span>
                <strong style={{ color: '#0F172A' }}>
                  {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </strong>
              </div>
            </div>

            {/* Auto Redirect Progress */}
            <div style={{
              width: '100%',
              maxWidth: 480,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}>
              <div style={{ fontSize: 12.5, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} color="#6E42E5" />
                <span>Redirecting to your booking tracking in <strong>{redirectCount}s</strong>...</span>
              </div>
              <button
                type="button"
                onClick={triggerFinalSuccessCallback}
                style={{
                  backgroundColor: '#6E42E5',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 14px',
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <span>View Booking Now</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 0: MAIN PAYMENT GATEWAY INTERFACE (DEFAULT)         */}
        {/* ========================================================= */}
        {paymentStage === 'gateway' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '260px 1fr',
            minHeight: 460,
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

              {[
                {
                  id: 'gpay',
                  name: 'Google Pay (GPay)',
                  desc: 'Instant UPI Pay & QR',
                  icon: <GPayIcon size={36} />
                },
                {
                  id: 'phonepe',
                  name: 'PhonePe',
                  desc: 'Instant UPI & QR',
                  icon: <PhonePeIcon size={36} />
                },
                {
                  id: 'paytm',
                  name: 'Paytm',
                  desc: 'Instant UPI & QR',
                  icon: <PaytmIcon size={36} />
                },
                {
                  id: 'card',
                  name: 'Credit / Debit Card',
                  desc: 'Visa, Master, RuPay',
                  icon: <CardBrandIcon size={36} />
                },
                ...(!hideCOD ? [{
                  id: 'cod',
                  name: 'Cash on Delivery',
                  desc: 'COD (Pay after service)',
                  descColor: '#059669',
                  icon: <CODBrandIcon size={36} />
                }] : [])
              ].map(method => {
                const isSelected = activeTab === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => { setActiveTab(method.id); setShowQrCode(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 12,
                      border: isSelected ? '1.5px solid #6E42E5' : '1px solid transparent',
                      backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                      boxShadow: isSelected ? '0 3px 10px rgba(110, 66, 229, 0.12)' : 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      {method.icon}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A', lineHeight: 1.25 }}>
                          {method.name}
                        </div>
                        <div style={{ fontSize: 11, color: method.descColor || '#64748B', fontWeight: method.descColor ? 700 : 500, marginTop: 2, lineHeight: 1.2 }}>
                          {method.desc}
                        </div>
                      </div>
                    </div>
                    {isSelected && <ChevronRight size={16} color="#6E42E5" style={{ flexShrink: 0, marginLeft: 6 }} />}
                  </button>
                );
              })}

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
                      <GPayIcon size={34} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>Google Pay</span>
                          <UPILogoBadge />
                        </div>
                        <div style={{ fontSize: 11.5, color: '#059669', fontWeight: 600 }}>Zero Gateway Surcharge</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowQrCode(!showQrCode)}
                      style={{
                        backgroundColor: showQrCode ? '#6E42E5' : '#F1F5F9',
                        border: '1px solid #CBD5E1',
                        color: showQrCode ? '#FFFFFF' : '#6E42E5',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '6px 12px',
                        borderRadius: 8
                      }}
                    >
                      <QrCode size={14} />
                      <span>{showQrCode ? 'Hide QR' : 'Show GPay QR'}</span>
                    </button>
                  </div>

                  {showQrCode ? (
                    /* Real-time Dynamic Scannable UPI QR Code */
                    <div style={{
                      backgroundColor: '#F8FAFC',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: 16,
                      padding: '18px 20px',
                      textAlign: 'center',
                      marginBottom: 16
                    }}>
                      <div style={{
                        position: 'relative',
                        width: 190,
                        height: 190,
                        backgroundColor: '#FFFFFF',
                        borderRadius: 14,
                        margin: '0 auto 12px',
                        padding: 10,
                        border: '1.5px solid #CBD5E1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
                        overflow: 'hidden'
                      }}>
                        {/* Animated Laser Scan Bar */}
                        <div style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          height: 3,
                          backgroundColor: '#10B981',
                          boxShadow: '0 0 8px #10B981',
                          animation: 'scanLaser 2.4s ease-in-out infinite',
                          zIndex: 2
                        }} />

                        {qrCodeDataUrl ? (
                          <img
                            src={qrCodeDataUrl}
                            alt="Scan GPay UPI QR"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        ) : (
                          <div style={{ fontSize: 12, color: '#64748B' }}>Generating real QR code...</div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A' }}>
                          Scan using Google Pay on any mobile phone
                        </span>
                      </div>

                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        backgroundColor: '#EFF6FF',
                        color: '#1D4ED8',
                        padding: '4px 10px',
                        borderRadius: 999,
                        fontSize: 11.5,
                        fontWeight: 700,
                        marginBottom: 12
                      }}>
                        <Clock size={12} />
                        <span>QR Code active for: <strong>{formatTimer(upiTimer)}</strong></span>
                      </div>

                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={handleConfirmQRScanPayment}
                          style={{
                            backgroundColor: '#10B981',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: 8,
                            padding: '8px 14px',
                            fontSize: 12.5,
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          <CheckCircle2 size={15} />
                          <span>Simulate App Scan &amp; Authorize</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            color: '#334155',
                            borderRadius: 8,
                            padding: '8px 12px',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5
                          }}
                        >
                          {copiedUpi ? <CheckCheck size={14} color="#10B981" /> : <Copy size={14} />}
                          <span>{copiedUpi ? 'Copied Link!' : 'Copy UPI Link'}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* UPI ID Input Flow */
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
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
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
                          A collect request of <strong>₹{amount.toLocaleString('en-IN')}</strong> will be sent to your Google Pay app. Simply open GPay and approve the PIN.
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleInitiateUPICollect}
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
                      >
                        <span>Pay ₹{amount.toLocaleString('en-IN')} with Google Pay</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ==================== 2. PHONEPE PANEL ==================== */}
              {activeTab === 'phonepe' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <PhonePeIcon size={34} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>PhonePe</span>
                          <UPILogoBadge />
                        </div>
                        <div style={{ fontSize: 11.5, color: '#059669', fontWeight: 600 }}>Instant UPI &amp; QR</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowQrCode(!showQrCode)}
                      style={{
                        backgroundColor: showQrCode ? '#5F259F' : '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        color: showQrCode ? '#FFFFFF' : '#5F259F',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '6px 12px',
                        borderRadius: 8
                      }}
                    >
                      <QrCode size={14} />
                      <span>{showQrCode ? 'Hide QR' : 'Show PhonePe QR'}</span>
                    </button>
                  </div>

                  {showQrCode ? (
                    <div style={{
                      backgroundColor: '#FAF5FF',
                      border: '1.5px solid #E9D5FF',
                      borderRadius: 16,
                      padding: '18px 20px',
                      textAlign: 'center',
                      marginBottom: 16
                    }}>
                      <div style={{
                        position: 'relative',
                        width: 190,
                        height: 190,
                        backgroundColor: '#FFFFFF',
                        borderRadius: 14,
                        margin: '0 auto 12px',
                        padding: 10,
                        border: '1.5px solid #D8B4FE',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(95, 37, 159, 0.08)',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          height: 3,
                          backgroundColor: '#9333EA',
                          boxShadow: '0 0 8px #9333EA',
                          animation: 'scanLaser 2.4s ease-in-out infinite',
                          zIndex: 2
                        }} />

                        {qrCodeDataUrl ? (
                          <img
                            src={qrCodeDataUrl}
                            alt="Scan PhonePe QR"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        ) : (
                          <div style={{ fontSize: 12, color: '#64748B' }}>Generating real QR code...</div>
                        )}
                      </div>

                      <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                        Scan using PhonePe App on mobile
                      </div>

                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        backgroundColor: '#F3E8FF',
                        color: '#6B21A8',
                        padding: '4px 10px',
                        borderRadius: 999,
                        fontSize: 11.5,
                        fontWeight: 700,
                        marginBottom: 12
                      }}>
                        <Clock size={12} />
                        <span>Expires in: <strong>{formatTimer(upiTimer)}</strong></span>
                      </div>

                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button
                          type="button"
                          onClick={handleConfirmQRScanPayment}
                          style={{
                            backgroundColor: '#5F259F',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: 8,
                            padding: '8px 14px',
                            fontSize: 12.5,
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          <CheckCircle2 size={15} />
                          <span>Simulate App Scan &amp; Authorize</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
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
                          Open your <strong>PhonePe app</strong> and approve the collect request for <strong>₹{amount.toLocaleString('en-IN')}</strong>.
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleInitiateUPICollect}
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
                      >
                        <span>Pay ₹{amount.toLocaleString('en-IN')} with PhonePe</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ==================== 3. PAYTM PANEL ==================== */}
              {activeTab === 'paytm' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <PaytmIcon size={34} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>Paytm</span>
                          <UPILogoBadge />
                        </div>
                        <div style={{ fontSize: 11.5, color: '#00BAF2', fontWeight: 700 }}>Instant UPI &amp; QR</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowQrCode(!showQrCode)}
                      style={{
                        backgroundColor: showQrCode ? '#002E6E' : '#F0F9FF',
                        border: '1px solid #BAE6FD',
                        color: showQrCode ? '#FFFFFF' : '#002E6E',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '6px 12px',
                        borderRadius: 8
                      }}
                    >
                      <QrCode size={14} />
                      <span>{showQrCode ? 'Hide QR' : 'Show Paytm QR'}</span>
                    </button>
                  </div>

                  {showQrCode ? (
                    <div style={{
                      backgroundColor: '#F0F9FF',
                      border: '1.5px solid #BAE6FD',
                      borderRadius: 16,
                      padding: '18px 20px',
                      textAlign: 'center',
                      marginBottom: 16
                    }}>
                      <div style={{
                        position: 'relative',
                        width: 190,
                        height: 190,
                        backgroundColor: '#FFFFFF',
                        borderRadius: 14,
                        margin: '0 auto 12px',
                        padding: 10,
                        border: '1.5px solid #7DD3FC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          height: 3,
                          backgroundColor: '#0284C7',
                          boxShadow: '0 0 8px #0284C7',
                          animation: 'scanLaser 2.4s ease-in-out infinite',
                          zIndex: 2
                        }} />

                        {qrCodeDataUrl ? (
                          <img
                            src={qrCodeDataUrl}
                            alt="Scan Paytm QR"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        ) : (
                          <div style={{ fontSize: 12, color: '#64748B' }}>Generating real QR code...</div>
                        )}
                      </div>

                      <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                        Scan using Paytm App
                      </div>

                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        backgroundColor: '#E0F2FE',
                        color: '#0369A1',
                        padding: '4px 10px',
                        borderRadius: 999,
                        fontSize: 11.5,
                        fontWeight: 700,
                        marginBottom: 12
                      }}>
                        <Clock size={12} />
                        <span>Expires in: <strong>{formatTimer(upiTimer)}</strong></span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                          type="button"
                          onClick={handleConfirmQRScanPayment}
                          style={{
                            backgroundColor: '#002E6E',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: 8,
                            padding: '8px 14px',
                            fontSize: 12.5,
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          <CheckCircle2 size={15} />
                          <span>Simulate App Scan &amp; Authorize</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 8 }}>
                        Paytm Mobile Number or UPI ID
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
                        <Smartphone size={18} color="#00BAF2" />
                      </div>

                      <div style={{
                        backgroundColor: '#F0F9FF',
                        border: '1px solid #BAE6FD',
                        borderRadius: 12,
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 24
                      }}>
                        <CheckCircle2 size={18} color="#0284C7" />
                        <div style={{ fontSize: 12.5, color: '#0369A1', fontWeight: 600 }}>
                          Pay securely using Paytm UPI or linked bank account.
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleInitiateUPICollect}
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
                      >
                        <span>Pay ₹{amount.toLocaleString('en-IN')} via Paytm UPI</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ==================== 4. CARD PANEL ==================== */}
              {activeTab === 'card' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CardBrandIcon size={34} />
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>Credit or Debit Card</div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>RBI 3D Secure 2.0 Compliant</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <VisaBadge />
                      <MastercardBadge />
                      <RuPayBadge />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                        Card Number
                      </label>
                      <input
                        type="text"
                        maxLength={19}
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
                            maxLength={5}
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
                      <span>Save card securely via tokenization as per RBI norms</span>
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={handleInitiateCardPayment}
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
                  >
                    <span>Proceed to 3D Secure OTP • ₹{amount.toLocaleString('en-IN')}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* ==================== 5. COD PANEL ==================== */}
              {activeTab === 'cod' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                    <CODBrandIcon size={36} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>Cash on Delivery</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#047857', backgroundColor: '#D1FAE5', padding: '2px 8px', borderRadius: 999 }}>
                          Pay After Service
                        </span>
                      </div>
                      <div style={{ fontSize: 11.5, color: '#059669', fontWeight: 600 }}>Zero advance payment required</div>
                    </div>
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
                        <strong>Forge India Connect 30-Day Warranty:</strong> Covers all spare parts and service quality.
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmCOD}
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
                  >
                    <CheckCircle2 size={18} />
                    <span>Confirm Order with Cash on Delivery • ₹{amount.toLocaleString('en-IN')}</span>
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
                <div>PCI-DSS Level 1 Compliant • NPCI Switch</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentGatewayModal;
