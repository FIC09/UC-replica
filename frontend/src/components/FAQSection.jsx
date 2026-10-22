import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { FAQS } from '../data/servicesData';

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  function toggleFaq(index) {
    setOpenIndex(openIndex === index ? -1 : index);
  }

  return (
    <section className="faqs-section">
      <div className="container-custom">
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
          <span style={{
            fontSize: 12,
            fontWeight: 800,
            color: '#6E42E5',
            textTransform: 'uppercase',
            letterSpacing: 1
          }}>
            Got Questions?
          </span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 30,
            fontWeight: 800,
            color: '#0F172A',
            marginTop: 6
          }}>
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: 14.5, color: '#64748B', marginTop: 8 }}>
            Everything you need to know about booking doorstep services in Mumbai.
          </p>
        </div>

        <div className="faqs-accordion">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className={`faq-item ${isOpen ? 'open' : ''}`}>
                <div className="faq-header" onClick={() => toggleFaq(index)}>
                  <span className="faq-question">{faq.q}</span>
                  {isOpen ? <ChevronUp size={18} color="#6E42E5" /> : <ChevronDown size={18} color="#64748B" />}
                </div>
                {isOpen && (
                  <div className="faq-body">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
