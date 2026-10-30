import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { partnerClient } from '../partnerClient';

export function InvoicesView({ showToast }) {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    setLoading(true);
    try {
      const res = await partnerClient.getInvoices();
      if (res && res.success) {
        setInvoices(res.invoices || []);
      }
    } catch (err) {
      showToast?.('Error loading invoices: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenInvoice(inv) {
    try {
      const res = await partnerClient.downloadInvoice(inv.id);
      if (res && res.success) {
        setSelectedInvoice(res.invoice);
      }
    } catch (err) {
      showToast?.('Error fetching invoice details: ' + err.message);
    }
  }

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
            GST Tax Invoices & Billing Statements
          </h1>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0 0' }}>
            Monthly B2B commission invoices issued by Urban Company Technologies India Pvt Ltd for input tax credit (ITC)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#16a34a', background: '#dcfce7', padding: '6px 14px', borderRadius: 8, fontWeight: 600 }}>
          <ShieldCheck size={16} /> GSTR-2B ITC Compatible
        </div>
      </div>

      {/* Invoices Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
            Loading monthly tax invoices...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Tax Invoice No.</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Billing Period</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Issue Date</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Customer Gross</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Platform Fee</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>GST Amount</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Total B2B Invoice</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>
                      {inv.invoiceNumber}
                      <div style={{ fontSize: 11.5, color: '#94a3b8', fontWeight: 400 }}>GSTIN: {inv.gstinPartner}</div>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#334155', fontWeight: 600 }}>
                      {inv.billingMonth}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#64748b' }}>
                      {new Date(inv.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#0f172a' }}>
                      ₹{inv.customerBillingGross.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#475569' }}>
                      ₹{inv.platformFee.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#64748b', fontSize: 12.5 }}>
                      ₹{(inv.cgst + inv.sgst).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#7c3aed', fontSize: 14 }}>
                      ₹{inv.totalInvoiceAmount.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <button
                        onClick={() => handleOpenInvoice(inv)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 12px',
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          borderRadius: 6,
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: '#334155',
                          cursor: 'pointer'
                        }}
                      >
                        <FileText size={14} /> View Tax Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 14,
            width: '100%',
            maxWidth: 620,
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Tax Invoice: {selectedInvoice.invoiceNumber}
                </h2>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  Period: {selectedInvoice.billingMonth}
                </span>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, fontSize: 13.5 }}>
              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0', lineHeight: 1.6 }}>
                <div><strong>Issuer:</strong> Urban Company Technologies India Pvt Ltd (GSTIN: {selectedInvoice.gstinSupplier})</div>
                <div><strong>Recipient:</strong> {selectedInvoice.partnerName || 'Business Partner'} (GSTIN: {selectedInvoice.gstinPartner || 'N/A'})</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Gross Customer Booking Billing:</span>
                  <strong>₹{selectedInvoice.customerBillingGross.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Platform Technology & Franchise Commission (18%):</span>
                  <strong>₹{selectedInvoice.platformFee.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>CGST (9%):</span>
                  <span>₹{selectedInvoice.cgst.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>SGST (9%):</span>
                  <span>₹{selectedInvoice.sgst.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6, fontSize: 15 }}>
                  <strong style={{ color: '#0f172a' }}>Total Invoice Payable:</strong>
                  <strong style={{ color: '#7c3aed' }}>₹{selectedInvoice.totalInvoiceAmount.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '10px 16px',
                    background: '#0f172a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Printer size={16} /> Print / Save PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
