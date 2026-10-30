import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  Upload,
  ShieldCheck,
  Download,
  AlertCircle,
  FileCheck,
  AlertTriangle,
  Lock,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { partnerClient } from '../partnerClient';

export function DocumentsView({ showToast, staff }) {
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState([]);
  const [businessName, setBusinessName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    docType: 'Maharashtra Municipal Trade License',
    title: '',
    file: null,
    fileName: '',
    fileSize: 0,
    fileType: 'application/pdf'
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadDocs();
  }, []);

  async function loadDocs() {
    setLoading(true);
    try {
      const res = await partnerClient.getDocuments();
      if (res && res.success) {
        setDocs(res.documents || []);
        setBusinessName(res.businessName || 'Business Partner');
      }
    } catch (err) {
      showToast?.('Error loading compliance documents: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleFileSelection(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Allowed extensions check (PDF, PNG, JPEG)
    const allowed = ['.pdf', '.png', '.jpg', '.jpeg'];
    const name = file.name.toLowerCase();
    const isAllowed = allowed.some(ext => name.endsWith(ext));

    if (!isAllowed) {
      showToast?.('Invalid file type. Only PDF, PNG, and JPEG documents are permitted.');
      e.target.value = '';
      return;
    }

    // 5MB limit check
    if (file.size > 5 * 1024 * 1024) {
      showToast?.('File size exceeds the 5MB maximum limit.');
      e.target.value = '';
      return;
    }

    setUploadForm(prev => ({
      ...prev,
      file,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type || 'application/pdf',
      title: prev.title || file.name.replace(/\.[^/.]+$/, '')
    }));
  }

  async function handleConfirmUpload(e) {
    e.preventDefault();
    if (!uploadForm.fileName) {
      showToast?.('Please choose a valid file to upload.');
      return;
    }

    setUploading(true);
    try {
      const payload = {
        docType: uploadForm.docType,
        title: uploadForm.title || uploadForm.docType,
        fileName: uploadForm.fileName,
        fileType: uploadForm.fileType,
        fileSize: uploadForm.fileSize
      };

      const res = await partnerClient.uploadDocument(payload);
      if (res && res.success) {
        showToast?.('Document uploaded. Status set to Under Review.');
        setUploadModalOpen(false);
        setUploadForm({
          docType: 'Maharashtra Municipal Trade License',
          title: '',
          file: null,
          fileName: '',
          fileSize: 0,
          fileType: 'application/pdf'
        });
        loadDocs();
      }
    } catch (err) {
      showToast?.(err.message || 'Document upload failed');
    } finally {
      setUploading(false);
    }
  }

  const canEdit = staff?.permissions?.editing !== false;

  const categories = ['ALL', 'Business Verification', 'Agreements', 'Invoices & Statements'];

  const filteredDocs = docs.filter(d => {
    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'Business Verification') {
      return d.category === 'Statutory Registration' || d.category === 'Municipal Compliance' || d.category === 'Financial KYC' || d.docType?.includes('License') || d.docType?.includes('GST');
    }
    if (selectedCategory === 'Agreements') {
      return d.category === 'Franchise Governance' || d.docType?.includes('Agreement');
    }
    if (selectedCategory === 'Invoices & Statements') {
      return d.docType?.includes('Invoice') || d.docType?.includes('Statement');
    }
    return true;
  });

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
            Corporate KYC, Compliance & Statutory Documents
          </h1>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0 0' }}>
            Protected repository of business verification files, executed agreements, tax invoices, and expiry tracking
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setUploadModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 18px',
              background: '#7c3aed',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 13.5,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Upload size={16} /> Upload Compliance Document
          </button>
        )}
      </div>

      {/* Critical Platform Verification Policy Disclaimer Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        borderRadius: 12,
        padding: '16px 20px',
        border: '1px solid #fde68a',
        display: 'flex',
        alignItems: 'center',
        gap: 14
      }}>
        <AlertTriangle size={22} color="#d97706" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: 13, color: '#92400e', lineHeight: 1.5 }}>
          <strong>Compliance Verification Rule:</strong> Uploading a document registers the statutory file into the compliance queue. <em>Uploading does NOT complete verification.</em> All corporate verification files remain in <strong>Under Review</strong> status until audited and verified by Platform Compliance Desk evaluators.
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '7px 14px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: selectedCategory === cat ? 700 : 500,
              background: selectedCategory === cat ? '#7c3aed' : '#ffffff',
              color: selectedCategory === cat ? '#ffffff' : '#64748b',
              border: '1px solid #cbd5e1',
              cursor: 'pointer'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Documents List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
            Loading statutory compliance repository...
          </div>
        ) : filteredDocs.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', color: '#64748b' }}>
            No compliance documents found in this section.
          </div>
        ) : (
          filteredDocs.map(doc => {
            const isExpiring = doc.daysUntilExpiry !== undefined && doc.daysUntilExpiry <= 30 && doc.daysUntilExpiry > 0;
            const isExpired = doc.daysUntilExpiry !== undefined && doc.daysUntilExpiry <= 0;

            return (
              <div
                key={doc.id}
                style={{
                  background: '#ffffff',
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 16,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: '#ede9fe',
                    color: '#7c3aed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <FileText size={24} />
                  </div>

                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 2px 0' }}>
                      {doc.title || doc.docType}
                    </h3>
                    <div style={{ fontSize: 12.5, color: '#64748b' }}>
                      File: <strong>{doc.fileName}</strong> • Type: {doc.fileType || 'PDF'} • Size: {doc.fileSize || '1.8 MB'}
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
                      Uploaded: {doc.uploadedAt} • Expiry: <strong style={{ color: isExpired ? '#dc2626' : isExpiring ? '#d97706' : '#334155' }}>{doc.expiryDate || 'Perpetual'}</strong>
                      {doc.daysUntilExpiry !== undefined && doc.daysUntilExpiry < 999 && (
                        <span> ({doc.daysUntilExpiry > 0 ? `${doc.daysUntilExpiry} days remaining` : 'Expired'})</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    background: doc.status === 'Verified' ? '#dcfce7' : doc.status === 'Under Review' ? '#e0f2fe' : '#fef3c7',
                    color: doc.status === 'Verified' ? '#16a34a' : doc.status === 'Under Review' ? '#0284c7' : '#b45309',
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 12.5,
                    fontWeight: 700
                  }}>
                    {doc.status === 'Verified' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                    {doc.status}
                  </span>

                  {canEdit && (
                    <button
                      onClick={() => {
                        setUploadForm(prev => ({
                          ...prev,
                          docType: doc.docType || prev.docType,
                          title: doc.title || ''
                        }));
                        setUploadModalOpen(true);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      <Upload size={13} /> Re-upload
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* UPLOAD DOCUMENT MODAL WITH TYPE & SIZE GUARDS                     */}
      {/* ----------------------------------------------------------------- */}
      {uploadModalOpen && (
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
            borderRadius: 16,
            width: '100%',
            maxWidth: 520,
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Upload Statutory Compliance File
              </h2>
              <button onClick={() => setUploadModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmUpload} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Document Classification *
                </label>
                <select
                  value={uploadForm.docType}
                  onChange={e => setUploadForm({ ...uploadForm, docType: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                >
                  <option value="Maharashtra Municipal Trade License">Maharashtra Municipal Trade License</option>
                  <option value="Commercial General Liability Insurance Policy">Commercial General Liability Insurance Policy</option>
                  <option value="GST Registration Certificate (REG-06)">GST Registration Certificate (REG-06)</option>
                  <option value="Company PAN Card">Company PAN Card</option>
                  <option value="Bank Account Cancelled Cheque">Bank Account Cancelled Cheque</option>
                  <option value="Master Franchise Agreement SLA">Master Franchise Agreement SLA</option>
                  <option value="Annual Safety Standards Audit">Annual Safety Standards Audit</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Document Title / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Municipal Trade License Renewal 2026-2027"
                  value={uploadForm.title}
                  onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Choose File (PDF, PNG, JPEG, Max 5MB) *
                </label>
                <input
                  type="file"
                  accept=".pdf,image/png,image/jpeg"
                  required
                  onChange={handleFileSelection}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
                {uploadForm.fileName && (
                  <span style={{ fontSize: 12, color: '#059669', marginTop: 4, display: 'block' }}>
                    Selected: {uploadForm.fileName} ({(uploadForm.fileSize / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                )}
              </div>

              {/* Crucial Verification Notice */}
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12.5, color: '#475569', lineHeight: 1.5 }}>
                <strong style={{ color: '#0f172a' }}>Platform Audit Notice:</strong> Uploading will queue this document in <strong>Under Review</strong> status with platform compliance auditors. Uploading does not imply or grant automatic verification.
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  style={{ flex: 1, padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: 8, color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  style={{ flex: 1, padding: '10px', background: '#7c3aed', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  {uploading ? 'Uploading...' : 'Submit for Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
