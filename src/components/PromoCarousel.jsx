import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Tag } from 'lucide-react';

export function PromoCarousel({ banners, onSelectBannerCategory }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const currentBanner = banners[currentIndex];

  return (
    <section className="promo-banner-section">
      <div className="container-custom">
        <div 
          className="banner-carousel-container" 
          style={{ background: currentBanner.bgGradient }}
        >
          <div className="banner-carousel-slide">
            <div className="banner-left-info">
              <span className="banner-tag-pill">{currentBanner.tag}</span>
              <h2 className="banner-title">{currentBanner.title}</h2>
              <p className="banner-subtitle">{currentBanner.subtitle}</p>

              <div className="banner-action-group">
                <button
                  type="button"
                  className="banner-cta-btn"
                  onClick={() => onSelectBannerCategory(currentBanner.categoryId)}
                >
                  <span>{currentBanner.cta}</span>
                  <ArrowRight size={16} />
                </button>

                <div className="banner-code-badge">
                  Use Code: <strong>{currentBanner.code}</strong> for {currentBanner.highlight}
                </div>
              </div>
            </div>

            <div className="banner-img-wrap">
              <img
                src={currentBanner.image}
                alt={currentBanner.title}
                className="banner-img"
              />
            </div>
          </div>

          {/* Dots Indicators */}
          <div className="banner-indicators">
            {banners.map((b, idx) => (
              <div
                key={b.id}
                className={`banner-dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
