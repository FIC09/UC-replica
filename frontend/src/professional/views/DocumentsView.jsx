import React, { useState, useEffect } from 'react';
import { professionalClient } from '../professionalClient';

export function DocumentsView({ profile, showToast }) {
  const [documents, setDocuments] = useState({});
  const [protectionNotice, setProtectionNotice] = useState('');
  const [loading, setLoading] = useState(true);

  // Upload modal
  const [showModal, setShowModal] = useState(false);
  const [docType, setDocType] = useState('Govt Trade Certificate');
  const [docNumber, setDocNumber] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSizeKb, setFileSizeKb] = useState(1200);
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [uploading, setUploading] = useState(false);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const res = await professionalClient.getDocuments();
      if (res.success && res.documents) {
        setDocuments(res.documents);
        if (res.protectionNotice) setProtectionNotice(res.protectionNotice);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (uploading) return;
    setUploading(true);

    try {
      const res = await professionalClient.uploadDocument({
        docType,
        docNumber,
        mimeType,
        fileSizeKb
      });
      showToast(res.message || `${docType} uploaded successfully.`);
      setShowModal(false);
      setDocNumber('');
      setFileName('');
      loadDocuments();
    } catch (err) {
      showToast(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const docEntries = Object.entries(documents).map(([key, doc]) => ({
    key,
    ...doc
  }));

  return (
    <div style={{ padding: '24px 20px', maxWidth: 980, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Compliance Documents & KYC Vault
          </h1>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            Statutory identification, trade credentials, background checks, and expiry schedules
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
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          + Upload Compliance Document
        </button>
      </div>

      {/* Restricted Access & Privacy Banner */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #cbd5e1',
        borderRadius: 14,
        padding: '16px 20px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 14
      }}>
        <span style={{ fontSize: 24 }}>🔐</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
            Restricted Access Protection (DPDP Act 2023)
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
            {protectionNotice || 'Verification documents contain encrypted statutory credentials. Download and raw inspection are restricted to authenticated compliance officers under DPDP Act 2023 regulations. Document numbers are masked.'}
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0', color: '#64748b' }}>
          Loading compliance vault...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 18 }}>
          {docEntries.map(doc => {
            const isApproved = doc.status === 'Approved' || doc.status === 'Verified';
            const isCorrection = doc.status === 'Needs Correction' || doc.status === 'Changes Requested';
            const isReview = doc.status === 'Under Review' || doc.status === 'Under Verification';

            return (
              <div
                key={doc.key}
                style={{
                  background: '#ffffff',
                  borderRadius: 14,
                  padding: '20px 22px',
                  border: isCorrection ? '2px solid #f87171' : isApproved ? '1px solid #e2e8f0' : '1px solid #93c5fd',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                      {doc.docType || doc.name}
                    </span>
                    <span style={{
                      background: isApproved ? '#ecfdf5' : isCorrection ? '#fee2e2' : '#eff6ff',
                      color: isApproved ? '#059669' : isCorrection ? '#b91c1c' : '#2563eb',
                      padding: '3px 9px',
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 700
                    }}>
                      {doc.status}
                    </span>
                  </div>

                  <div style={{ fontSize: 14, fontWeight: 700, color: '#334155', letterSpacing: '0.04em', marginBottom: 8 }}>
                    {doc.docNumber || '••••••••'}
                  </div>

                  {/* Expiry Date */}
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>
                    Validity / Expiry:{' '}
                    <strong style={{ color: doc.expiryDate && new Date(doc.expiryDate) < new Date() ? '#b91c1c' : '#0f172a' }}>
                      {doc.expiryDate ? doc.expiryDate : 'Permanent / No Expiry'}
                    </strong>
                    {doc.expiryDate && new Date(doc.expiryDate) < new Date() && (
                      <span style={{ color: '#b91c1c', fontWeight: 700, marginLeft: 6 }}>⚠️ Expired</span>
                    )}
                  </div>

                  {/* Verified By */}
                  {doc.verifiedBy && (
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                      Verified by: {doc.verifiedBy} {doc.verifiedAt ? `on ${doc.verifiedAt}` : ''}
                    </div>
                  )}

                  {/* Correction Request Note */}
                  {doc.correctionReason && (
                    <div style={{
                      marginTop: 12,
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: 8,
                      padding: '10px 12px',
                      fontSize: 12,
                      color: '#991b1b',
                      lineHeight: 1.4
                    }}>
                      <strong>Correction Required:</strong> {doc.correctionReason}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>
                    🔒 Restricted Download
                  </span>
                  {isCorrection && (
                    <button
                      onClick={() => {
                        setDocType(doc.docType);
                        setShowModal(true);
                      }}
                      style={{
                        background: '#b91c1c',
                        color: '#ffffff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Re-Upload
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Document Modal */}
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
            padding: 26,
            width: '100%',
            maxWidth: 460,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Upload Compliance Document
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0' }}>
              Files are encrypted and submitted to the platform compliance officer.
            </p>

            <form onSubmit={handleUpload}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Document Type *
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                >
                  <option value="Commercial Two-Wheeler Insurance">Commercial Two-Wheeler Insurance</option>
                  <option value="Govt ITI Wireman Endorsement">Govt ITI Wireman Endorsement</option>
                  <option value="Police Verification Record">Police Verification Record</option>
                  <option value="Aadhaar Card (Back Side)">Aadhaar Card (Back Side)</option>
                  <option value="PAN Card (Clear Scan)">PAN Card (Clear Scan)</option>
                </select>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Document / Policy Number *
                </label>
                <input
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  required
                  placeholder="e.g. POL-99214 or ICICI-MOTO-99012"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  File Format & Size Validation
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <select
                    value={mimeType}
                    onChange={(e) => setMimeType(e.target.value)}
                    style={{ padding: '9px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }}
                  >
                    <option value="image/jpeg">JPG / JPEG Image</option>
                    <option value="image/png">PNG Image</option>
                    <option value="application/pdf">PDF Document</option>
                  </select>
                  <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center' }}>
                    Size: <strong>1.4 MB</strong> (Max 5MB)
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', padding: '11px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  style={{
                    flex: 1.5,
                    background: uploading ? '#94a3b8' : '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    padding: '11px 0',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: uploading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {uploading ? 'Uploading...' : 'Submit Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
