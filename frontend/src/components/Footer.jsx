import React, { useState } from 'react';
import { ShieldCheck, MapPin, Sparkles, ChevronRight } from 'lucide-react';
import { FooterModals } from './FooterModals';

export function Footer({ 
  selectedCity = 'Mumbai',
  onSelectCity, 
  onOpenPartnerDashboard, 
  onOpenPartnerOnboarding,
  onOpenWorkerOnboarding,
  onOpenProfessionalPortal,
  onOpenAdminPortal
}) {
  const [activeModal, setActiveModal] = useState(null);

  // Smooth scroll to categories section when "Categories near you" is clicked
  function handleScrollToCategories(e) {
    e.preventDefault();
    const candidates = ['services-catalogue', 'categories', 'native-water-purifier', 'quick-service-cards'];
    for (const id of candidates) {
      const el = document.getElementById(id);
      if (el) {
        const offset = -76;
        const topPos = el.getBoundingClientRect().top + window.pageYOffset + offset;
        window.scrollTo({ top: topPos, behavior: 'smooth' });
        return;
      }
    }
    // Fallback scroll up smoothly
    window.scrollTo({ top: 500, behavior: 'smooth' });
  }

  return (
    <>
      <footer className="uc-footer official-uc" style={{ paddingBottom: 84 }}>
        <div className="container-custom">
          {/* Brand Header: Logo + Forge India Connect */}
          <div className="footer-uc-brand-header">
            <div className="footer-uc-logo" style={{ fontSize: 13, letterSpacing: -0.2 }}>FIC</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="footer-uc-title">Forge India Connect</span>
              <span style={{ fontSize: 11.5, color: '#64748B', fontWeight: 500, marginTop: -2 }}>
                India's Verified Doorstep Home Services Platform
              </span>
            </div>
          </div>

          {/* 4 Navigation Columns (Matching the Layout) */}
          <div className="footer-uc-grid">
            {/* Column 1: Company */}
            <div className="footer-uc-col">
              <h5 className="footer-uc-heading">Company</h5>
              <ul className="footer-uc-list">
                <li>
                  <a href="#about" onClick={(e) => { e.preventDefault(); setActiveModal('about'); }}>
                    About us
                  </a>
                </li>
                <li>
                  <a href="#investor-relations" onClick={(e) => { e.preventDefault(); setActiveModal('investor'); }}>
                    Investor Relations
                  </a>
                </li>
                <li>
                  <a href="#terms" onClick={(e) => { e.preventDefault(); setActiveModal('terms'); }}>
                    Terms & conditions
                  </a>
                </li>
                <li>
                  <a href="#privacy" onClick={(e) => { e.preventDefault(); setActiveModal('privacy'); }}>
                    Privacy policy
                  </a>
                </li>
                <li>
                  <a href="#anti-discrimination" onClick={(e) => { e.preventDefault(); setActiveModal('anti-discrimination'); }}>
                    Anti-discrimination policy
                  </a>
                </li>
                <li>
                  <a href="#careers" onClick={(e) => { e.preventDefault(); setActiveModal('careers'); }}>
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2: For customers */}
            <div className="footer-uc-col">
              <h5 className="footer-uc-heading">For customers</h5>
              <ul className="footer-uc-list">
                <li>
                  <a href="#reviews" onClick={(e) => { e.preventDefault(); setActiveModal('reviews'); }}>
                    FIC reviews
                  </a>
                </li>
                <li>
                  <a 
                    href="#categories" 
                    onClick={handleScrollToCategories}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    title="Browse verified service categories available near you"
                  >
                    <span>Categories near you</span>
                    <span style={{ fontSize: 11, background: '#E0E7FF', color: '#4338CA', padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>
                      {selectedCity}
                    </span>
                  </a>
                </li>
                <li>
                  <a href="#contact" onClick={(e) => { e.preventDefault(); setActiveModal('contact'); }}>
                    Contact us
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: For professionals */}
            <div className="footer-uc-col">
              <h5 className="footer-uc-heading">For professionals</h5>
              <ul className="footer-uc-list">
                <li>
                  <a 
                    href="#register-pro" 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      if (onOpenPartnerOnboarding) onOpenPartnerOnboarding(); 
                    }}
                    style={{ fontWeight: 600, color: '#0F172A' }}
                  >
                    Register as a professional
                  </a>
                </li>
                <li>
                  <a 
                    href="#worker-onboarding" 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      if (onOpenWorkerOnboarding) onOpenWorkerOnboarding(); 
                    }}
                    style={{ color: '#64748B' }}
                  >
                    Worker Onboarding
                  </a>
                </li>
                <li>
                  <a 
                    href="#partner-portal" 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      if (onOpenPartnerDashboard) onOpenPartnerDashboard(); 
                    }}
                    style={{ color: '#64748B' }}
                  >
                    Partner Pro Portal
                  </a>
                </li>
                <li>
                  <a 
                    href="#professional-portal" 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      if (onOpenProfessionalPortal) {
                        onOpenProfessionalPortal();
                      } else {
                        window.location.href = '/professional';
                      }
                    }}
                    style={{ color: '#64748B' }}
                  >
                    Urban Pro Worker Portal
                  </a>
                </li>
                <li>
                  <a 
                    href="#admin-portal" 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      if (onOpenAdminPortal) {
                        onOpenAdminPortal();
                      } else {
                        window.location.href = '/admin';
                      }
                    }}
                    style={{ color: '#94A3B8', fontSize: 13 }}
                  >
                    Admin Operations Hub
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Social links & Official App Downloads */}
            <div className="footer-uc-col">
              <h5 className="footer-uc-heading">Social links</h5>
              <div className="footer-uc-social-row">
                {/* X / Twitter */}
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="footer-uc-social-circle" 
                  aria-label="X (Twitter)"
                  title="Follow FIC on X"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                {/* Facebook */}
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="footer-uc-social-circle" 
                  aria-label="Facebook"
                  title="Follow FIC on Facebook"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                </a>
                {/* Instagram */}
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="footer-uc-social-circle" 
                  aria-label="Instagram"
                  title="Follow FIC on Instagram"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
                {/* LinkedIn */}
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="footer-uc-social-circle" 
                  aria-label="LinkedIn"
                  title="Follow FIC on LinkedIn"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                </a>
              </div>

              {/* Official App Store & Google Play Badges */}
              <div className="footer-uc-badges-col">
                <a 
                  href="#download-ios" 
                  onClick={(e) => { e.preventDefault(); setActiveModal('app-download'); }}
                  className="footer-uc-store-btn"
                  title="Download on Apple App Store"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 1.01-2.87-1 .04-2.17.67-2.84 1.44-.57.65-1.07 1.71-.94 2.74 1.13.09 2.21-.57 2.77-1.31z"/>
                  </svg>
                  <div className="footer-uc-store-text">
                    <span className="store-sub">Download on the</span>
                    <span className="store-main">App Store</span>
                  </div>
                </a>

                <a 
                  href="#download-android" 
                  onClick={(e) => { e.preventDefault(); setActiveModal('app-download'); }}
                  className="footer-uc-store-btn"
                  title="Get it on Google Play Store"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a1.996 1.996 0 0 1-1.61-.954V2.768c0-.39.117-.75.32-1.054l1.289.1zM15.207 13.414l2.122 2.122-12.72 7.234 10.598-9.356zm0-2.828L4.61 1.23l12.72 7.234-2.123 2.122zM16.621 12l4.89-2.772c.983-.557.983-1.464 0-2.02L16.621 12z"/>
                  </svg>
                  <div className="footer-uc-store-text">
                    <span className="store-sub">GET IT ON</span>
                    <span className="store-main">Google Play</span>
                  </div>
                </a>
              </div>
            </div>
          </div>



          {/* Bottom Legal, Disclaimer & Certified Standards */}
          <div className="footer-uc-bottom">
            <p className="footer-uc-disclaimer">
              Forge India Connect is India's premier verified home services platform. Every professional is certified, 
              background-checked via Aadhaar KYC, and equipped with standard-grade tools and protective gear. 
              All bookings are covered under our 30-Day Service Guarantee and ₹10,000 Property Damage Protection.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div className="footer-uc-copyright">
                © 2026 Forge India Connect Technologies India Pvt. Ltd. All rights reserved. • ISO 9001:2015 Quality Assured • CIN: U74999KA2024PTC184920
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11.5, color: '#64748B' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <ShieldCheck size={13} color="#059669" /> 100% Safe Payments
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Sparkles size={13} color="#2563EB" /> 30-Day Free Rework
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={13} color="#D97706" /> Live GPS Dispatch
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Render Active Informational / Action Modal */}
      <FooterModals 
        activeModal={activeModal} 
        onClose={() => setActiveModal(null)} 
        selectedCity={selectedCity}
        onSelectCity={onSelectCity}
      />
    </>
  );
}
export default Footer;
