import React, { useState, useEffect } from 'react';
import { professionalClient } from '../professionalClient';

export function SupportView({ showToast }) {
  const [tickets, setTickets] = useState([
    {
      id: 'TCK-4819',
      subject: 'Incentive bonus query for AC Festival Week',
      category: 'Payouts & Incentives',
      date: '21 Oct 2026',
      status: 'Resolved',
      reply: 'Bonus of ₹1,400 credited to your wallet balance on 21 Oct.'
    },
    {
      id: 'TCK-4752',
      subject: 'Customer location pin misplacement on Bandra West road',
      category: 'Navigation & Map',
      date: '15 Oct 2026',
      status: 'Resolved',
      reply: 'Coordinates updated in platform geo-database.'
    }
  ]);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Payouts & Incentives');
  const [description, setDescription] = useState('');

  useEffect(() => {
    professionalClient.getSupportTickets().then(data => {
      if (data.success && data.tickets) {
        setTickets(data.tickets);
      }
    }).catch(() => {});
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const res = await professionalClient.createSupportTicket({
        subject,
        category,
        description
      });
      showToast('Support ticket created. Hub support agent will respond shortly.');
      setTickets(prev => [
        {
          id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
          subject,
          category,
          date: 'Just now',
          status: 'Open',
          reply: 'Assigned to Partner Support Desk'
        },
        ...prev
      ]);
      setShowModal(false);
      setSubject('');
      setDescription('');
    } catch (err) {
      showToast(err.message || 'Failed to create ticket');
    }
  };

  const triggerSos = () => {
    showToast('🚨 SOS Emergency Triggered! Platform Safety Cell calling your mobile in 60 seconds.');
  };

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1000, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Partner Helpdesk & Safety Cell
          </h1>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            24x7 technician escalation assistance, billing inquiries, and on-site support
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            background: '#2563eb',
            color: '#ffffff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          + Raise Support Ticket
        </button>
      </div>

      {/* Emergency SOS Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #991b1b 0%, #b91c1c 100%)',
        borderRadius: 16,
        padding: '24px 28px',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24,
        boxShadow: '0 4px 12px rgba(153, 27, 27, 0.2)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🚨</span>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>
              On-Site Emergency SOS Button
            </h2>
          </div>
          <p style={{ fontSize: 13, opacity: 0.9, margin: '6px 0 0 0', maxWidth: 600 }}>
            Facing a safety hazard, customer altercation, or physical emergency at a customer premises? Press SOS for an immediate priority response from our Rapid Safety Cell.
          </p>
        </div>

        <button
          onClick={triggerSos}
          style={{
            background: '#ffffff',
            color: '#991b1b',
            border: 'none',
            padding: '12px 24px',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
          }}
        >
          TRIGGER EMERGENCY SOS
        </button>
      </div>

      {/* Direct Contact Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#ffffff', borderRadius: 14, padding: '20px 22px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>📞</div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
            Hub Dispatch Helpline
          </h3>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            Toll-Free for verified professionals:
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#2563eb', marginTop: 4 }}>
            1800-419-8800 (Ext 4)
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: 14, padding: '20px 22px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>💬</div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
            WhatsApp Partner Desk
          </h3>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            Instant photo & invoice query support:
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#059669', marginTop: 4 }}>
            +91 98200 99441
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: '24px 28px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>
          Support Tickets & Inquiries
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tickets.map(t => (
            <div
              key={t.id}
              style={{
                background: '#f8fafc',
                borderRadius: 12,
                padding: '16px 18px',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}>{t.id}</span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>• {t.category}</span>
                </div>
                <span style={{
                  background: t.status === 'Resolved' ? '#ecfdf5' : '#eff6ff',
                  color: t.status === 'Resolved' ? '#059669' : '#2563eb',
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700
                }}>
                  {t.status}
                </span>
              </div>

              <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                {t.subject}
              </div>

              {t.reply && (
                <div style={{
                  marginTop: 10,
                  background: '#ffffff',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  color: '#334155',
                  border: '1px solid #e2e8f0'
                }}>
                  <strong>Support Response:</strong> {t.reply}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showModal && (
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
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
              Create Support Inquiry
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0' }}>
              Our dedicated partner operations team responds within 2 hours.
            </p>

            <form onSubmit={handleCreateTicket}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Payouts & Incentives">Payouts & Incentives</option>
                  <option value="Booking & Customer Dispute">Booking & Customer Dispute</option>
                  <option value="App or Navigation Technical Bug">App or Navigation Technical Bug</option>
                  <option value="Safety & Policy Compliance">Safety & Policy Compliance</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="Brief summary of your query"
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
                  Description / Booking ID
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  required
                  placeholder="Provide all relevant details..."
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
                  onClick={() => setShowModal(false)}
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
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
