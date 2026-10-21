import React from 'react';
import { ShieldCheck, UserCheck, DollarSign, Sparkles } from 'lucide-react';

export function UCPromiseSection() {
  const promises = [
    {
      icon: ShieldCheck,
      title: '30-Day Service Guarantee',
      desc: 'Free rework or full refund if you are not 100% satisfied with our service in Mumbai.',
    },
    {
      icon: UserCheck,
      title: 'Verified & Police Checked',
      desc: 'All service partners undergo rigorous 5-level background checks and master skill training.',
    },
    {
      icon: DollarSign,
      title: 'Transparent Standard Pricing',
      desc: 'No hidden charges or unexpected surges. You pay only what you see on the app.',
    },
    {
      icon: Sparkles,
      title: 'Sealed & Single-Use Toolkits',
      desc: 'Branded authentic products, sterilized tools, and mess-free cleanup after every job.',
    },
  ];

  return (
    <section className="uc-promise-section">
      <div className="container-custom">
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
          <span style={{
            fontSize: 12,
            fontWeight: 800,
            color: '#6E42E5',
            textTransform: 'uppercase',
            letterSpacing: 1
          }}>
            Why Urban Company
          </span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 30,
            fontWeight: 800,
            color: '#0F172A',
            marginTop: 6
          }}>
            The Urban Company Promise
          </h2>
          <p style={{ fontSize: 14.5, color: '#64748B', marginTop: 8 }}>
            Setting the highest standards of safety, quality, and reliability for home services across India.
          </p>
        </div>

        <div className="promise-grid">
          {promises.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="promise-card">
                <div className="promise-icon-box">
                  <Icon size={24} />
                </div>
                <h4 className="promise-title">{p.title}</h4>
                <p className="promise-desc">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
