import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { CITIES } from '../data/servicesData';

export function Footer({ 
  selectedCity = 'Mumbai',
  onSelectCity, 
  onOpenPartnerDashboard, 
  onOpenPartnerOnboarding,
  onOpenWorkerOnboarding
}) {
  return (
    <footer className="uc-footer official-uc">
      <div className="container-custom">
        {/* Brand Header: Logo + Urban Company */}
        <div className="footer-uc-brand-header">
          <div className="footer-uc-logo">UC</div>
          <span className="footer-uc-title">Urban Company</span>
        </div>

        {/* 4 Navigation Columns (Matches Screenshot 4) */}
        <div className="footer-uc-grid">
          {/* Column 1: Company */}
          <div className="footer-uc-col">
            <h5 className="footer-uc-heading">Company</h5>
            <ul className="footer-uc-list">
              <li><a href="#about" onClick={(e) => e.preventDefault()}>About us</a></li>
              <li><a href="#investor-relations" onClick={(e) => e.preventDefault()}>Investor Relations</a></li>
              <li><a href="#terms" onClick={(e) => e.preventDefault()}>Terms & conditions</a></li>
              <li><a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy policy</a></li>
              <li><a href="#anti-discrimination" onClick={(e) => e.preventDefault()}>Anti-discrimination policy</a></li>
              <li><a href="#careers" onClick={(e) => e.preventDefault()}>Careers</a></li>
            </ul>
          </div>

          {/* Column 2: For customers */}
          <div className="footer-uc-col">
            <h5 className="footer-uc-heading">For customers</h5>
            <ul className="footer-uc-list">
              <li><a href="#reviews" onClick={(e) => e.preventDefault()}>UC reviews</a></li>
              <li><a href="#categories" onClick={(e) => e.preventDefault()}>Categories near you</a></li>
              <li><a href="#contact" onClick={(e) => e.preventDefault()}>Contact us</a></li>
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
            </ul>
          </div>

          {/* Column 4: Social links */}
          <div className="footer-uc-col">
            <h5 className="footer-uc-heading">Social links</h5>
            <div className="footer-uc-social-row">
              {/* X / Twitter */}
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="footer-uc-social-circle" aria-label="X (Twitter)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* Facebook */}
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="footer-uc-social-circle" aria-label="Facebook">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="footer-uc-social-circle" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="footer-uc-social-circle" aria-label="LinkedIn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

