import React from 'react';
import { 
  Sparkles, 
  Scissors, 
  User, 
  Wind, 
  ShieldCheck, 
  Wrench, 
  Droplets, 
  Paintbrush,
  PlusCircle
} from 'lucide-react';

const ICON_MAP = {
  Sparkles,
  Scissors,
  User,
  Wind,
  ShieldCheck,
  Wrench,
  Droplets,
  Paintbrush,
};

export function StickyCategoryNav({ categories, activeCategory, onSelectCategory, onOpenAdmin }) {
  return (
    <div className="uc-sticky-cat-nav">
      <div className="container-custom uc-sticky-nav-inner">
        {/* Category Pills List */}
        <div className="uc-sticky-pills-row">
          {categories.map((cat) => {
            const IconComponent = ICON_MAP[cat.icon] || Sparkles;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                className={`uc-cat-pill ${isActive ? 'active' : ''}`}
                style={{ borderRadius: 0 }}
                onClick={() => {
                  onSelectCategory(cat.id);
                  const el = document.getElementById('services-catalogue');
                  if (el) {
                    const offset = -76;
                    const topPos = el.getBoundingClientRect().top + window.pageYOffset + offset;
                    window.scrollTo({ top: topPos, behavior: 'smooth' });
                  }
                }}
              >
                <IconComponent size={14} />
                <span>{cat.shortName || cat.name}</span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
