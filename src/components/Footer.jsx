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

          {/* Column 4: Social links & App Store Download Badges */}
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

            {/* App Badges: Apple App Store & Google Play */}
            <div className="footer-uc-badges-col">
              <a href="#appstore" onClick={(e) => e.preventDefault()} className="footer-uc-store-btn" aria-label="Download on App Store">
                <svg width="18" height="22" viewBox="0 0 170 170" fill="currentColor">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.66-7.81-11.91-14.3-5.74-8.8-10.28-18.77-13.62-29.9-3.34-11.13-5.01-21.73-5.01-31.81 0-15.42 3.84-28.09 11.53-38.02 7.69-9.93 17.51-14.98 29.46-15.15 4.35 0 9.4 1.16 15.15 3.48 5.75 2.32 9.5 3.53 11.26 3.63 1.37-.1 5.37-1.37 12-3.8 6.64-2.43 11.94-3.48 15.91-3.17 11.85.95 21.2 5.07 28.07 12.35-10.37 6.27-15.42 15.02-15.15 26.24.27 8.8 3.59 16.2 9.97 22.2 6.38 6 13.9 9.55 22.56 10.65-2.23 6.78-4.99 13.97-8.27 21.57zM119.22 32.64c0-7.23 2.65-13.98 7.95-20.25 5.3-6.27 11.75-10.24 19.35-11.91.8 3.48 1.2 6.84 1.2 10.09 0 7.37-2.73 14.33-8.19 20.88-5.46 6.55-12.06 10.57-19.8 12.07-.35-3.69-.51-7.31-.51-10.88z"/>
                </svg>
                <div className="footer-uc-store-text">
                  <span className="store-sub">Download on the</span>
                  <span className="store-main">App Store</span>
                </div>
              </a>

              <a href="#googleplay" onClick={(e) => e.preventDefault()} className="footer-uc-store-btn" aria-label="Get it on Google Play">
                <svg width="18" height="20" viewBox="0 0 512 512" fill="currentColor">
                  <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 59.8zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
                </svg>
                <div className="footer-uc-store-text">
                  <span className="store-sub">GET IT ON</span>
                  <span className="store-main">Google Play</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Cities Directory Strip */}
        <div className="footer-uc-cities-strip">
          <span className="footer-uc-cities-label">Serving 50+ Cities:</span>
          <div className="footer-uc-cities-tags">
            {CITIES.map((c) => {
              const isSelected = (c.name || '').trim().toLowerCase() === (selectedCity || '').trim().toLowerCase();
              return (
                <span
                  key={c.id}
                  onClick={() => onSelectCity && onSelectCity(c.name)}
                  className={`footer-uc-city-chip ${isSelected ? 'active' : ''}`}
                >
                  {c.name}
                </span>
              );
            })}
          </div>
        </div>

        {/* Disclaimer & Copyright (Matches Screenshot 4) */}
        <div className="footer-uc-bottom">
          <div className="footer-uc-disclaimer">
            * As on December 31, 2024
          </div>
          <div className="footer-uc-copyright">
            © Copyright 2026 Urban Company Limited (formerly known as UrbanClap Technologies India Limited and UrbanClap Technologies India Private Limited) All rights reserved. | CIN: L74140DL2014PLC274413
          </div>
        </div>
      </div>
    </footer>
  );
}

