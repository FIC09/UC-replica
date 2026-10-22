// Customer transactions with amounts stored in integer minor units (paise: 1 INR = 100 paise)
let mockTransactions = [
  {
    id: 'TXN-9021481',
    bookingId: 'ORD-9841',
    customerName: 'Aarav Mehta',
    amountPaise: 92200, // ₹922.00
    amountRupees: 922,
    currency: 'INR',
    paymentMethod: 'Google Pay (UPI)',
    gatewayRef: 'gpay_txn_8492019482',
    status: 'Settled',
    environment: 'Production Settled',
    commissionPaise: 18440, // 20% commission = ₹184.40
    proSharePaise: 73760, // 80% = ₹737.60
    taxPaise: 14064, // 18% GST allocation
    discountPaise: 0,
    netSettlementPaise: 73760,
    idempotencyKey: 'idem_9841_pay_prod_01',
    paidAt: new Date(Date.now() - 3600000),
    invoiceNumber: 'INV-2026-9841'
  },
  {
    id: 'TXN-9021482',
    bookingId: 'ORD-9842',
    customerName: 'Sneha Roy',
    amountPaise: 49900, // ₹499.00
    amountRupees: 499,
    currency: 'INR',
    paymentMethod: 'Credit Card (Visa)',
    gatewayRef: 'rzp_pay_9948201482',
    status: 'Settled',
    environment: 'Production Settled',
    commissionPaise: 9980,
    proSharePaise: 39920,
    taxPaise: 7611,
    discountPaise: 0,
    netSettlementPaise: 39920,
    idempotencyKey: 'idem_9842_pay_prod_02',
    paidAt: new Date(Date.now() - 7200000),
    invoiceNumber: 'INV-2026-9842'
  },
  {
    id: 'TXN-9021483',
    bookingId: 'ORD-9843',
    customerName: 'Vikram Merchant',
    amountPaise: 29900, // ₹299.00
    amountRupees: 299,
    currency: 'INR',
    paymentMethod: 'Paytm UPI',
    gatewayRef: 'ptm_txn_1029481923',
    status: 'Settled',
    environment: 'Production Settled',
    commissionPaise: 5980,
    proSharePaise: 23920,
    taxPaise: 4561,
    discountPaise: 0,
    netSettlementPaise: 23920,
    idempotencyKey: 'idem_9843_pay_prod_03',
    paidAt: new Date(Date.now() - 14400000),
    invoiceNumber: 'INV-2026-9843'
  },
  {
    id: 'TXN-9021484',
    bookingId: 'ORD-9844',
    customerName: 'Pooja Iyer',
    amountPaise: 277100, // ₹2,771.00
    amountRupees: 2771,
    currency: 'INR',
    paymentMethod: 'NetBanking (HDFC)',
    gatewayRef: 'hdfc_nb_4920194810',
    status: 'Settled',
    environment: 'Production Settled',
    commissionPaise: 55420,
    proSharePaise: 221680,
    taxPaise: 42269,
    discountPaise: 20000, // ₹200 discount coupon
    netSettlementPaise: 221680,
    idempotencyKey: 'idem_9844_pay_prod_04',
    paidAt: new Date(Date.now() - 86400000),
    invoiceNumber: 'INV-2026-9844'
  },
  {
    id: 'TXN-9021485',
    bookingId: 'ORD-9845',
    customerName: 'Rohan Mehra',
    amountPaise: 99200, // ₹992.00
    amountRupees: 992,
    currency: 'INR',
    paymentMethod: 'Cash After Service (COD)',
    gatewayRef: 'cod_ack_591024',
    status: 'Pending Collection',
    environment: 'Production Settled',
    commissionPaise: 19840,
    proSharePaise: 79360,
    taxPaise: 15132,
    discountPaise: 0,
    netSettlementPaise: 79360,
    idempotencyKey: 'idem_9845_pay_cod_05',
    paidAt: null,
    invoiceNumber: 'INV-2026-9845'
  },
  {
    id: 'TXN-SIM-01',
    bookingId: 'ORD-SIM-101',
    customerName: 'Demo Tester Sandbox',
    amountPaise: 50000,
    amountRupees: 500,
    currency: 'INR',
    paymentMethod: 'Razorpay Sandbox UPI',
    gatewayRef: 'rzp_test_sim_881920',
    status: 'Sandbox Simulation (Non-Real)',
    environment: 'Sandbox Simulation',
    commissionPaise: 10000,
    proSharePaise: 40000,
    taxPaise: 7627,
    discountPaise: 0,
    netSettlementPaise: 40000,
    idempotencyKey: 'idem_sim_test_01',
    paidAt: new Date(),
    invoiceNumber: 'SIM-INV-01'
  }
];

// Payout Statements for Professionals and Business Partners
let mockPayoutStatements = [
  {
    id: 'PO-301',
    beneficiaryName: 'Vikram Salvi',
    beneficiaryType: 'Professional',
    settlementMode: 'Direct Freelance Pro',
    accountInfo: 'HDFC Bank •••• 4821 (IFSC: HDFC0001248)',
    period: '15 Oct - 21 Oct 2026',
    batchId: 'BATCH-W42',
    grossEarningsRupees: 18200,
    platformTakeRupees: 2750,
    tdsDeductionRupees: 182, // 1% Section 194O TDS
    netPayoutRupees: 15268,
    currency: 'INR',
    status: 'Ready for Release',
    payoutMethod: 'IMPS Bank Transfer',
    idempotencyKey: 'payout_idem_PO301_2026_w42',
    releasedAt: null,
    releasedBy: null
  },
  {
    id: 'PO-302',
    beneficiaryName: 'Apex Home Solutions LLP',
    beneficiaryType: 'Business Partner Agency',
    settlementMode: 'ThroughBusiness', // Agency payroll settles individual technicians
    accountInfo: 'ICICI Bank •••• 9012 (IFSC: ICIC0000002)',
    period: '01 Oct - 15 Oct 2026',
    batchId: 'BATCH-W41',
    grossEarningsRupees: 486500,
    platformTakeRupees: 97300,
    tdsDeductionRupees: 4865,
    netPayoutRupees: 384335,
    currency: 'INR',
    status: 'Processed',
    payoutMethod: 'NEFT Corporate Transfer',
    idempotencyKey: 'payout_idem_PO302_2026_w41',
    releasedAt: new Date('2026-10-16'),
    releasedBy: 'Finance Manager'
  },
  {
    id: 'PO-303',
    beneficiaryName: 'M. Selvam (Krishnagiri QuickFix Care)',
    beneficiaryType: 'Business Partner Agency',
    settlementMode: 'ThroughBusiness',
    accountInfo: 'State Bank of India •••• 6781',
    period: '01 Oct - 15 Oct 2026',
    batchId: 'BATCH-W41',
    grossEarningsRupees: 230625,
    platformTakeRupees: 46125,
    tdsDeductionRupees: 2306,
    netPayoutRupees: 182194,
    currency: 'INR',
    status: 'Processed',
    payoutMethod: 'NEFT Corporate Transfer',
    idempotencyKey: 'payout_idem_PO303_2026_w41',
    releasedAt: new Date('2026-10-16'),
    releasedBy: 'Finance Manager'
  },
  {
    id: 'PO-304',
    beneficiaryName: 'Anita Deshmukh',
    beneficiaryType: 'Professional',
    settlementMode: 'Direct Freelance Pro',
    accountInfo: 'SBI Bank •••• 1194 (IFSC: SBIN0000241)',
    period: '15 Oct - 21 Oct 2026',
    batchId: 'BATCH-W42',
    grossEarningsRupees: 26500,
    platformTakeRupees: 3700,
    tdsDeductionRupees: 265,
    netPayoutRupees: 22535,
    currency: 'INR',
    status: 'Ready for Release',
    payoutMethod: 'Instant UPI / IMPS',
    idempotencyKey: 'payout_idem_PO304_2026_w42',
    releasedAt: null,
    releasedBy: null
  }
];

// Refund Requests with Balance Validation & Approval History
let mockRefundRequests = [
  {
    id: 'REF-701',
    bookingId: 'ORD-9845',
    customerName: 'Rohan Mehra',
    totalOrderAmount: 992,
    alreadyRefunded: 0,
    maxRefundableBalance: 992, // Validates refund cannot exceed captured balance
    requestedAmount: 799,
    reasonCategory: 'Technician Delay / No Show',
    reasonNotes: 'Technician arrived 40 mins late; customer cancelled job before service started.',
    gatewayRef: 'rzp_refund_req_9921',
    status: 'Pending Review',
    requestedAt: new Date(Date.now() - 3600000 * 4),
    reviewedBy: null,
    reviewedAt: null,
    rejectionReason: null
  },
  {
    id: 'REF-702',
    bookingId: 'ORD-9838',
    customerName: 'Divya Bhat',
    totalOrderAmount: 499,
    alreadyRefunded: 499,
    maxRefundableBalance: 0,
    requestedAmount: 499,
    reasonCategory: 'Duplicate Payment Charge',
    reasonNotes: 'Double charged via UPI gateway timeout on mobile app.',
    gatewayRef: 'gpay_rf_84920',
    status: 'Approved & Processed',
    requestedAt: new Date(Date.now() - 86400000 * 2),
    reviewedBy: 'Finance Manager',
    reviewedAt: new Date(Date.now() - 86400000 * 1),
    rejectionReason: null
  },
  {
    id: 'REF-703',
    bookingId: 'ORD-9829',
    customerName: 'Naveen Kumar',
    totalOrderAmount: 299,
    alreadyRefunded: 0,
    maxRefundableBalance: 299,
    requestedAmount: 299,
    reasonCategory: 'Part Procured Independently',
    reasonNotes: 'Electrician socket part was already in home stock; customer requested complete diagnostic fee waiver.',
    gatewayRef: 'rzp_refund_req_9810',
    status: 'Rejected',
    requestedAt: new Date(Date.now() - 86400000 * 3),
    reviewedBy: 'Operations Lead',
    reviewedAt: new Date(Date.now() - 86400000 * 2),
    rejectionReason: 'Technician completed safety audit and 30-min doorstep inspection; diagnostic inspection fee applies.'
  }
];

// Reconciliation Exceptions (Gateway Webhooks, Discrepancies, Idempotency Checks)
let mockReconciliations = [
  {
    id: 'REC-EX-01',
    type: 'Webhook Delivery Latency',
    severity: 'Medium',
    gateway: 'Razorpay UPI',
    transactionRef: 'rzp_pay_9948201482',
    bookingRef: 'ORD-9842',
    issueDescription: 'Gateway captured event webhook delayed by 180 seconds due to network congestion.',
    reconciliationStatus: 'Auto-Resolved via Cron Polling',
    detectedAt: new Date(Date.now() - 7200000)
  },
  {
    id: 'REC-EX-02',
    type: 'Duplicate Payout Attempt Guard',
    severity: 'High',
    gateway: 'HDFC Corporate Direct API',
    transactionRef: 'BATCH-W41-PO302',
    bookingRef: 'PO-302',
    issueDescription: 'Idempotency key blocked second disbursement trigger on Apex Home Solutions statement.',
    reconciliationStatus: 'Blocked by Idempotency Key (Safe)',
    detectedAt: new Date(Date.now() - 86400000 * 5)
  },
  {
    id: 'REC-EX-03',
    type: 'Sandbox Simulation Label',
    severity: 'Info',
    gateway: 'Razorpay Test Sandbox',
    transactionRef: 'rzp_test_sim_881920',
    bookingRef: 'ORD-SIM-101',
    issueDescription: 'Explicitly flagged as Mock Sandbox test; excluded from statutory GST and real bank ledgers.',
    reconciliationStatus: 'Isolated to Sandbox Environment',
    detectedAt: new Date(Date.now() - 86400000)
  }
];

// 1. Get Customer Transactions
export async function getTransactions(req, res) {
  try {
    const { search = '', status = 'ALL', paymentMethod = 'ALL' } = req.query;

    let list = mockTransactions.filter(t => {
      if (status !== 'ALL' && t.status !== status) return false;
      if (paymentMethod !== 'ALL' && t.paymentMethod !== paymentMethod) return false;
      if (search) {
        const q = search.toLowerCase();
        const matches = (t.id || '').toLowerCase().includes(q) ||
          (t.bookingId || '').toLowerCase().includes(q) ||
          (t.customerName || '').toLowerCase().includes(q) ||
          (t.gatewayRef || '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });

    return res.json({
      success: true,
      count: list.length,
      transactions: list,
      currency: 'INR',
      formatNote: 'Amounts stored in integer minor units (paise) to eliminate floating point rounding errors'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 2. Get Payout Statements
export async function getPayoutStatements(req, res) {
  try {
    const { status = 'ALL', beneficiaryType = 'ALL' } = req.query;

    let list = mockPayoutStatements.filter(p => {
      if (status !== 'ALL' && p.status !== status) return false;
      if (beneficiaryType !== 'ALL' && p.beneficiaryType !== beneficiaryType) return false;
      return true;
    });

    return res.json({
      success: true,
      count: list.length,
      payouts: list
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 3. Release Payout (With Idempotency Protection against double disbursement)
export async function releasePayoutStatement(req, res) {
  try {
    const { id } = req.params;
    const { idempotencyKey } = req.body;

    const po = mockPayoutStatements.find(p => p.id === id);
    if (!po) {
      return res.status(404).json({ success: false, error: 'Payout statement not found' });
    }

    if (po.status === 'Processed') {
      return res.status(400).json({
        success: false,
        error: `Payout statement #${id} has ALREADY been released. Double disbursement prevented.`
      });
    }

    po.status = 'Processed';
    po.releasedAt = new Date();
    po.releasedBy = req.admin?.name || 'Finance Manager';

    return res.json({
      success: true,
      message: `Payout #${id} of ₹${po.netPayoutRupees} processed successfully to ${po.beneficiaryName} (${po.accountInfo})`,
      payout: po
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 4. Get Refund Requests
export async function getRefundRequests(req, res) {
  try {
    const { status = 'ALL' } = req.query;

    let list = mockRefundRequests.filter(r => {
      if (status !== 'ALL' && r.status !== status) return false;
      return true;
    });

    return res.json({
      success: true,
      count: list.length,
      refunds: list
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 5. Process / Approve or Reject Refund (With Maximum Refundable Balance Validation)
export async function processRefundRequest(req, res) {
  try {
    const { id } = req.params;
    const { action, approvedAmount, rejectionReason = '' } = req.body; // action: 'approve' | 'reject'

    const ref = mockRefundRequests.find(r => r.id === id);
    if (!ref) {
      return res.status(404).json({ success: false, error: 'Refund request not found' });
    }

    if (ref.status !== 'Pending Review') {
      return res.status(400).json({ success: false, error: `Refund request #${id} is already in state: ${ref.status}` });
    }

    if (action === 'approve') {
      const amt = parseFloat(approvedAmount) || ref.requestedAmount;

      // Validate Maximum Refundable Balance Guard
      if (amt > ref.maxRefundableBalance) {
        return res.status(400).json({
          success: false,
          error: `Requested refund of ₹${amt} exceeds maximum refundable balance of ₹${ref.maxRefundableBalance}.`
        });
      }

      ref.status = 'Approved & Processed';
      ref.requestedAmount = amt;
      ref.reviewedBy = req.admin?.name || 'Finance Lead';
      ref.reviewedAt = new Date();
      ref.alreadyRefunded += amt;
      ref.maxRefundableBalance -= amt;

      return res.json({
        success: true,
        message: `Refund of ₹${amt} approved and queued for bank reversal to customer ${ref.customerName}`,
        refund: ref
      });
    } else {
      ref.status = 'Rejected';
      ref.rejectionReason = rejectionReason || 'Dispute rejected upon operational review';
      ref.reviewedBy = req.admin?.name || 'Operations Lead';
      ref.reviewedAt = new Date();

      return res.json({
        success: true,
        message: `Refund request #${id} rejected`,
        refund: ref
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 6. Get Reconciliation Exceptions
export async function getReconciliationExceptions(req, res) {
  try {
    return res.json({
      success: true,
      count: mockReconciliations.length,
      exceptions: mockReconciliations
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
