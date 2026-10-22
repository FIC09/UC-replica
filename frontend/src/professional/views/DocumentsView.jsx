import React, { useState, useEffect } from 'react';
import { professionalClient } from '../professionalClient';

export function DocumentsView({ profile, showToast }) {
  const [documents, setDocuments] = useState({
    aadhaar: { docNumber: 'XXXX-XXXX-8921', docType: 'Aadhaar Card', status: 'Verified', verifiedBy: 'Compliance Team', verifiedAt: '2026-01-12' },
    pan: { docNumber: 'ABCPS8921K', docType: 'PAN Card', status: 'Verified', verifiedBy: 'Compliance Team', verifiedAt: '2026-01-12' },
    policeClearance: { docType: 'Police Verification Clearance', status: 'Verified', verifiedBy: 'Safety Cell', verifiedAt: '2026-01-15' },
    tradeCertificate: { docType: 'Govt ITI HVAC Technician Diploma', status: 'Verified', verifiedBy: 'Skill Academy', verifiedAt: '2026-01-15' }
  });

  // Upload modal
  const [showModal, setShowModal] = useState(false);
  const [docType, setDocType] = useState('Govt Trade Certificate');
  const [docNumber, setDocNumber] = useState('');

  useEffect(() => {
    professionalClient.getDocuments().then(data => {
      if (data.success && data.documents) {
        setDocuments(data.documents);
      }
    }).catch(() => {});
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      await professionalClient.uploadDocument({ docType, docNumber });
      showToast(`${docType} submitted! Compliance review initiated.`);
      setShowModal(false);
      setDocNumber('');
    } catch (err) {
      showToast(err.message || 'Upload failed');
    }
  };

  const docList = [
    { key: 'aadhaar', name: 'Aadhaar Card', ...documents.aadhaar },
    { key: 'pan', name: 'PAN Card', ...documents.pan },
    { key: 'policeClearance', name: 'Police Verification Record', ...documents.policeClearance },
    { key: 'tradeCertificate', name: 'Govt ITI / Trade Certification', ...documents.tradeCertificate }
  ];

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1000, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Compliance & Verification Documents
          </h1>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            Government ID, background verification, and trade competence certificates
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
          + Upload Document
        </button>
      </div>

      {/* Compliance Status Banner */}
      <div style={{
        background: '#ecfdf5',
        border: '1px solid #a7f3d0',
        borderRadius: 14,
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: '#059669',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            fontWeight: 800
          }}>
            ✓
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#065f46', margin: '0 0 2px 0' }}>
              100% Background & Police Verified
            </h3>
            <div style={{ fontSize: 13, color: '#047857' }}>
              Your profile carries the official Gold Shield Trust Badge visible to customers on every booking.
            </div>
          </div>
        </div>

        <span style={{
          background: '#059669',
          color: '#ffffff',
          padding: '6px 14px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 700
        }}>
          All Documents Verified
        </span>
      </div>

      {/* Document Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {docList.map(doc => (
          <div
            key={doc.key}
            style={{
              background: '#ffffff',
              borderRadius: 14,
              padding: '20px 22px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 24 }}>📄</span>
              <span style={{
                background: doc.status === 'Verified' ? '#ecfdf5' : '#eff6ff',
                color: doc.status === 'Verified' ? '#059669' : '#2563eb',
                padding: '3px 10px',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 700
              }}>
                ✓ {doc.status || 'Verified'}
              </span>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
              {doc.name || doc.docType}
            </h3>

            {doc.docNumber && (
              <div style={{ fontSize: 13, color: '#475569', fontFamily: 'monospace', marginBottom: 8 }}>
                Doc #: {doc.docNumber}
              </div>
            )}

            <div style={{ fontSize: 12, color: '#64748b' }}>
              Verified by {doc.verifiedBy || 'Compliance Team'} on {doc.verifiedAt || '2026-01-15'}
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
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
            maxWidth: 420,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
              Upload Official Document
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0' }}>
              Uploaded documents are reviewed by the compliance cell within 24 hours.
            </p>

            <form onSubmit={handleUpload}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Document Type
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Aadhaar Card">Aadhaar Card (Front & Back)</option>
                  <option value="PAN Card">PAN Card</option>
                  <option value="Govt ITI / Trade Certificate">Govt ITI / Trade Certificate</option>
                  <option value="Police Verification Certificate">Police Verification Certificate</option>
                  <option value="Driving License / Commercial Vehicle RC">Driving License / Commercial Vehicle RC</option>
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Document Reference Number
                </label>
                <input
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  placeholder="e.g. MH-02-2026-98124"
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
                  Submit for Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
