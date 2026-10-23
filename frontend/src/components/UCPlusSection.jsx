import React from 'react';
import { Crown, Percent, Truck, ShieldCheck, Check } from 'lucide-react';
import { UC_PLUS_BENEFITS } from '../data/servicesData';

const ICON_MAP = {
  Percent,
  Crown,
  Truck,
  ShieldCheck,
};

export function UCPlusSection({ hasUCPlus, onToggleUCPlus }) {
  return (
    <section className="uc-plus-section">
      <div className="container-custom">
        <div className="uc-plus-card" style={{ borderRadius: 0 }}>
          <div>
            <span className="plus-badge-tag" style={{ borderRadius: 0 }}>UC PLUS MEMBERSHIP</span>
            <h2 className="plus-heading">
              Save up to ₹150 on every service
            </h2>
            <p className="plus-sub">
              Unlock VIP privileges with exclusive member discounts, top-rated master professionals, and zero convenience fees across your city.
            </p>

            <div className="plus-benefits-grid">
              {UC_PLUS_BENEFITS.map((b) => {
                const IconComponent = ICON_MAP[b.icon] || ShieldCheck;
                return (
                  <div key={b.title} className="plus-benefit-item">
                    <div className="benefit-icon-box" style={{ borderRadius: 0 }}>
                      <IconComponent size={18} />
                    </div>
                    <div>
                      <div className="benefit-text-title">{b.title}</div>
                      <div className="benefit-text-desc">{b.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="plus-cta-col" style={{ borderRadius: 0 }}>
            <div className="plus-price-tag">₹299</div>
            <div className="plus-term">6 Months Validity</div>
            <button
              type="button"
              className="join-plus-btn"
              style={{ borderRadius: 0 }}
              onClick={onToggleUCPlus}
            >
              {hasUCPlus ? '✓ UC Plus Activated' : 'Get UC Plus Now'}
            </button>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 10 }}>
              Average member saves ₹2,400/year
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
