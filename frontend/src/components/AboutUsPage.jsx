import React, { useEffect } from 'react';
import { ArrowRight, ChevronRight, CheckCircle2, ShieldCheck, MapPin, Sparkles, Building2, Users, Award } from 'lucide-react';
import { Footer } from './Footer';

export function AboutUsPage({
  onBackHome,
  onOpenWorkerOnboarding,
  onOpenPartnerOnboarding,
  onOpenAuth,
  onOpenContact,
  user,
  selectedCity = 'Mumbai',
  onSelectCity,
  onOpenPartnerDashboard,
  onOpenProfessionalPortal,
  onOpenAdminPortal
}) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'About Us | Urban Company';
    return () => {
      document.title = 'Urban Company - Expert Doorstep Home Services';
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', color: '#111827', fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* ============================================================ */}
      {/* 1. TOP NAVBAR (Dark Theme matching Screenshot 1)           */}
      {/* ============================================================ */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          backgroundColor: '#111111',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          height: 68,
          display: 'flex',
          alignItems: 'center',
          padding: '0 32px'
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Logo */}
          <div
            onClick={onBackHome}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              userSelect: 'none'
            }}
            title="Return to Urban Company Home"
          >
            <div
              style={{
                width: 34,
                height: 34,
                backgroundColor: '#FFFFFF',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000000',
                fontWeight: 900,
                fontSize: 14,
                letterSpacing: -0.5
              }}
            >
              UC
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
              <span style={{ color: '#FFFFFF', fontWeight: 800, fontSize: 15, letterSpacing: -0.2 }}>Urban</span>
              <span style={{ color: '#FFFFFF', fontWeight: 800, fontSize: 15, letterSpacing: -0.2 }}>Company</span>
            </div>
          </div>

          {/* Right Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {/* Active About Us Link */}
            <div
              style={{
                position: 'relative',
                padding: '22px 0 20px 0',
                borderBottom: '2.5px solid #FFFFFF',
                cursor: 'pointer'
              }}
            >
              <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: 14 }}>
                About Us
              </span>
            </div>

            {/* Register as a Professional */}
            <button
              type="button"
              onClick={() => {
                if (onOpenWorkerOnboarding) {
                  onOpenWorkerOnboarding();
                } else if (onOpenPartnerOnboarding) {
                  onOpenPartnerOnboarding();
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                opacity: 0.88,
                transition: 'opacity 0.15s ease',
                padding: 0
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.88')}
            >
              Register as a Professional
            </button>

            {/* Help */}
            <button
              type="button"
              onClick={() => {
                if (onOpenContact) onOpenContact();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                opacity: 0.88,
                transition: 'opacity 0.15s ease',
                padding: 0
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.88')}
            >
              Help
            </button>

            {/* Login / Signup */}
            <button
              type="button"
              onClick={() => {
                if (onOpenAuth) onOpenAuth('login');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                opacity: 0.95,
                transition: 'opacity 0.15s ease',
                padding: 0
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.95')}
            >
              {user ? `Hi, ${user.name?.split(' ')[0] || 'User'}` : 'Login/Signup'}
            </button>
          </nav>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. HERO SECTION (Dark Background matching Screenshot 1)     */}
      {/* ============================================================ */}
      <section
        style={{
          backgroundColor: '#111111',
          padding: '72px 32px 84px 32px',
          color: '#FFFFFF',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1.05fr 1fr',
            gap: 48,
            alignItems: 'center'
          }}
        >
          {/* Left Text Column */}
          <div>
            <h1
              style={{
                fontSize: '48px',
                fontWeight: 800,
                letterSpacing: '-1.2px',
                marginBottom: '26px',
                lineHeight: 1.12,
                color: '#FFFFFF'
              }}
            >
              About Us
            </h1>

            <p
              style={{
                fontSize: '16.5px',
                lineHeight: 1.65,
                color: '#E2E8F0',
                marginBottom: '24px',
                fontWeight: 400,
                maxWidth: 520
              }}
            >
              Urban Company is a technology-driven platform that connects you with trusted professionals for all your home and beauty needs — from cleaning and repairs to salon and spa services.
            </p>

            <p
              style={{
                fontSize: '16.5px',
                lineHeight: 1.65,
                color: '#CBD5E1',
                margin: 0,
                fontWeight: 400,
                maxWidth: 520
              }}
            >
              We're simplifying urban living by ensuring reliable, high-quality and transparent services, every single time.
            </p>
          </div>

          {/* Right Blueprint Isometric Graphic (Matching Image 1) */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 340,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12
            }}
          >
            {/* Cropped exact blueprint vector art from screenshot */}
            <div
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <img
                src="/images/about/about_hero.png"
                alt="Urban Company Service Tech Blueprint"
                style={{
                  position: 'absolute',
                  width: '215%',
                  maxWidth: 'none',
                  left: '-114%',
                  top: '-27%',
                  filter: 'contrast(1.08) brightness(1.03)',
                  pointerEvents: 'none'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. OUR BUSINESS SECTION (Matching Screenshot 2)              */}
      {/* ============================================================ */}
      <section
        style={{
          backgroundColor: '#FFFFFF',
          padding: '80px 32px 90px 32px'
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Section Heading */}
          <h2
            style={{
              fontSize: '40px',
              fontWeight: 800,
              color: '#111827',
              marginBottom: '8px',
              letterSpacing: '-0.8px'
            }}
          >
            Our Business
          </h2>

          {/* Company Overview Link */}
          <div
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 900, behavior: 'smooth' });
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: '#7C3AED',
              fontSize: '16.5px',
              fontWeight: 700,
              cursor: 'pointer',
              marginBottom: '48px',
              userSelect: 'none'
            }}
          >
            <span>Company Overview</span>
            <ArrowRight size={18} />
          </div>

          {/* 2-Column Content: Left 4 Verticals, Right Visual Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.05fr 1.25fr',
              gap: 56,
              alignItems: 'start'
            }}
          >
            {/* Left 4 Business Verticals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
              {/* 1. India Consumer Services */}
              <div>
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#111827',
                    marginBottom: '8px'
                  }}
                >
                  India Consumer Services
                </h3>
                <p
                  style={{
                    fontSize: '15px',
                    lineHeight: 1.62,
                    color: '#4B5563',
                    margin: 0,
                    maxWidth: 460
                  }}
                >
                  Delivering trusted, high-quality home services across Beauty & Wellness and Home Repairs, empowering consumers with convenience, reliability, and care.
                </p>
              </div>

              {/* 2. Insta Help */}
              <div>
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#111827',
                    marginBottom: '8px'
                  }}
                >
                  Insta Help
                </h3>
                <p
                  style={{
                    fontSize: '15px',
                    lineHeight: 1.62,
                    color: '#4B5563',
                    margin: 0,
                    maxWidth: 460
                  }}
                >
                  Bringing convenience to your doorstep with instant, verified household help — ensuring care, trust, and efficiency in every task.
                </p>
              </div>

              {/* 3. Native */}
              <div>
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#111827',
                    marginBottom: '8px'
                  }}
                >
                  Native
                </h3>
                <p
                  style={{
                    fontSize: '15px',
                    lineHeight: 1.62,
                    color: '#4B5563',
                    margin: 0,
                    maxWidth: 460
                  }}
                >
                  Our devices under the "Native" brand create holistic, tech-enabled living experiences — combining smart design, and quality assurance.
                </p>
              </div>

              {/* 4. International */}
              <div>
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#111827',
                    marginBottom: '8px'
                  }}
                >
                  International
                </h3>
                <p
                  style={{
                    fontSize: '15px',
                    lineHeight: 1.62,
                    color: '#4B5563',
                    margin: 0,
                    maxWidth: 460
                  }}
                >
                  Bringing Urban Company's promise of safe, reliable and dignified services to homes across UAE, Singapore and KSA.
                </p>
              </div>
            </div>

            {/* Right Visual Showcase Collage (Official Urban Company Verticals Grid) */}
            <div
              style={{
                width: '100%',
                aspectRatio: '1.65 / 1',
                borderRadius: 18,
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0'
              }}
            >
              <img
                src="/images/about/about_business.jpg"
                alt="Urban Company Business Verticals & Showcase"
                style={{
                  position: 'absolute',
                  width: '201%',
                  maxWidth: 'none',
                  left: '-94.5%',
                  top: '-85.8%',
                  display: 'block',
                  pointerEvents: 'none'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. FULL BOTTOM FOOTER                                        */}
      {/* ============================================================ */}
      <Footer
        selectedCity={selectedCity}
        onSelectCity={onSelectCity}
        onOpenPartnerDashboard={onOpenPartnerDashboard}
        onOpenPartnerOnboarding={onOpenPartnerOnboarding}
        onOpenWorkerOnboarding={onOpenWorkerOnboarding}
        onOpenProfessionalPortal={onOpenProfessionalPortal}
        onOpenAdminPortal={onOpenAdminPortal}
        onOpenAbout={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}

