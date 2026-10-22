import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Search, 
  ShoppingCart, 
  CircleUserRound, 
  X, 
  ChevronDown, 
  Calendar, 
  Home, 
  Star, 
  Briefcase, 
  Building2, 
  ShieldCheck,
  LogOut,
  UserCheck,
  Wrench,
  PlusCircle
} from 'lucide-react';

export function Navbar({
  selectedCity,
  selectedLocality,
  onOpenLocationModal,
  cart,
  cartTotal,
  onOpenCart,
  onOpenAuth,
  user,
  onOpenBookings,
  bookingsCount,
  onOpenAddresses,
  addressesCount,
  onOpenAdminCatalogue,
  onOpenAdminDashboard,
  onOpenAdmin,
  isAdminAuthenticated,
  onOpenPartnerDashboard,
  onOpenProfessionalDashboard,
  onOpenWorkerOnboarding,
  onOpenPartnerOnboarding,
  onLogout,
  onSelectService,
  services,
  onSelectCategory,
  activeNavTab = 'homes',
  onSelectNavTab
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const searchRef = useRef(null);
  const profileRef = useRef(null);

  // Close search dropdown and profile menu on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const queryTokens = trimmedQuery.split(/\s+/).filter(Boolean);

  const filteredServices = trimmedQuery
    ? services.filter(s => {
        const title = (s.title || '').toLowerCase();
        const subcategory = (s.subcategory || '').toLowerCase();
        const category = (s.category || '').toLowerCase();
        const description = (s.description || '').toLowerCase();
        const tag = (s.tag || '').toLowerCase();
        const inclusions = Array.isArray(s.inclusions) ? s.inclusions.join(' ').toLowerCase() : '';
        const combined = `${title} ${subcategory} ${category} ${description} ${tag} ${inclusions}`;

        // 1. Direct full substring match
        if (combined.includes(trimmedQuery)) return true;

        // 2. All typed words present in service details
        if (queryTokens.every(token => combined.includes(token))) return true;

        // 3. Any query word present in title, subcategory, or category
        if (queryTokens.some(token => title.includes(token) || subcategory.includes(token) || category.includes(token))) {
          return true;
        }

        return false;
      }).slice(0, 6)
    : [];

  const cartItemCount = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);

  return (
    <header className="uc-navbar-exact">
      <div className="container-custom uc-nav-row">
        {/* Left: UC Logo + Exact Stacked Text + Header Nav Tabs (Matches Screenshot) */}
        <div className="uc-nav-left">
          <div 
            className="uc-exact-logo" 
            onClick={() => {
              if (onSelectNavTab) onSelectNavTab('homes');
              onSelectCategory('all');
            }}
          >
            <div className="uc-square-badge">UC</div>
            <div className="uc-text-wrap">
              <span className="uc-exact-name">Urban</span>
              <span className="uc-exact-sub">Company</span>
            </div>
          </div>

          {/* Exact Header Nav Tabs: Homes, Native, Beauty */}
          <nav className="uc-sublinks">
            <span 
              className={`uc-sublink-item ${activeNavTab === 'homes' ? 'active' : ''}`} 
              onClick={() => onSelectNavTab ? onSelectNavTab('homes') : onSelectCategory('all')}
            >
              Homes
            </span>
            <span 
              className={`uc-sublink-item ${activeNavTab === 'native' ? 'active' : ''}`} 
              onClick={() => onSelectNavTab ? onSelectNavTab('native') : onSelectCategory('native-ro')}
            >
              Native
            </span>
            <span 
              className={`uc-sublink-item ${activeNavTab === 'beauty' ? 'active' : ''}`} 
              onClick={() => onSelectNavTab ? onSelectNavTab('beauty') : onSelectCategory('womens-salon')}
            >
              Beauty
            </span>
          </nav>
        </div>

        {/* Right / Center Controls: Location, Search, Cart, Profile (Exact layout from screenshot) */}
        <div className="uc-nav-right">
          {/* Location Selector Box (Rounded rectangle with pin and chevron) */}
          <div 
            className="uc-exact-loc-box" 
            onClick={onOpenLocationModal} 
            title="Change Delivery Location"
          >
            <MapPin size={16} color="#4B5563" />
            <span className="uc-loc-text" title={`${selectedLocality || ''}, ${selectedCity}`}>
              4744+HMQ, {selectedLocality || selectedCity}
            </span>
            <ChevronDown size={14} color="#6B7280" />
          </div>

          {/* Search Box (Rounded box with "Search for 'Electricians'") */}
          <div className="uc-exact-search-container" ref={searchRef}>
            <div className="uc-exact-search-box">
              <Search size={16} color="#6B7280" />
              <input
                type="text"
                className="uc-search-bare-input"
                placeholder={
                  activeNavTab === 'beauty' 
                    ? "Search for 'Ayurvedic massage'" 
                    : activeNavTab === 'native' 
                      ? "Search for 'Water Purifier'" 
                      : "Search for 'Electricians'"
                }
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery('')} 
                  style={{ color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Live Autocomplete Dropdown */}
            {showSearchDropdown && (
              <div className="search-results-dropdown">
                {searchQuery.trim() ? (
                  filteredServices.length > 0 ? (
                    <div>
                      <div className="search-section-header">Services matching "{searchQuery}"</div>
                      {filteredServices.map(service => (
                        <div 
                          key={service.id} 
                          className="search-result-item"
                          onClick={() => {
                            onSelectService(service);
                            setShowSearchDropdown(false);
                            setSearchQuery('');
                          }}
                        >
                          <div className="search-result-info">
                            <img src={service.image} alt={service.title} className="search-item-thumb" />
                            <div>
                              <div className="search-item-title">{service.title}</div>
                              <div className="search-item-meta">
                                <span style={{ color: '#059669', fontWeight: 700 }}>₹{service.price}</span>
                                <span>•</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#D97706' }}>
                                  <Star size={11} fill="#D97706" /> {service.rating}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#6E42E5' }}>View</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '24px 16px', textAlign: 'center', color: '#6B7280', fontSize: 13 }}>
                      No matching service found for "{searchQuery}".
                    </div>
                  )
                ) : (
                  <div>
                    <div className="search-section-header">Trending Searches in {selectedCity || 'your city'}</div>
                    <div style={{ padding: '8px 16px 14px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {['Kitchen Cleaning', 'Powerjet AC', 'Rica Waxing', 'Men Haircut', 'Water Purifier RO'].map(trend => (
                        <span 
                          key={trend}
                          onClick={() => setSearchQuery(trend)}
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            padding: '6px 12px',
                            background: '#F3F4F6',
                            borderRadius: 6,
                            cursor: 'pointer',
                            color: '#374151'
                          }}
                        >
                          🔥 {trend}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>



          {/* Cart Icon in Circular Border Button (Exact match from screenshot) */}
          <button 
            type="button" 
            className="uc-cart-circle-btn"
            onClick={onOpenCart}
            title="Shopping Cart"
          >
            <ShoppingCart size={19} color="#111827" strokeWidth={1.8} />
            {cartItemCount > 0 && (
              <span className="uc-cart-badge">{cartItemCount}</span>
            )}
          </button>

          {/* Profile Icon in Circle + Floating "Login" Pill (Exact match from screenshot) */}
          <div className="uc-profile-wrap" ref={profileRef}>
            <button 
              type="button" 
              className="uc-profile-btn" 
              onClick={() => {
                if (!user) {
                  onOpenAuth();
                } else {
                  setShowProfileMenu(prev => !prev);
                }
              }}
              title={user ? (user.name || "My Profile") : "Login / Sign up"}
            >
              <CircleUserRound size={26} color="#111827" strokeWidth={1.5} />
            </button>

            {/* Floating "Login" Pill Tooltip underneath Profile Icon matching Screenshot */}
            {!user && (
              <div 
                className="uc-login-pill-tooltip"
                onClick={onOpenAuth}
              >
                Login
              </div>
            )}

            {/* Interactive User & Services Dropdown */}
            {showProfileMenu && (
              <div className="uc-profile-dropdown" style={{ width: 280 }}>
                {user ? (
                  <div>
                    <div className="uc-profile-dropdown-user-header">
                      <div 
                        className="uc-dropdown-user-avatar"
                        style={{
                          background: user.role === 'admin' ? '#7C3AED'
                            : user.role === 'professional' ? '#059669'
                            : user.role === 'partner' ? '#2563EB'
                            : '#1E293B'
                        }}
                      >
                        {(user.name || 'U')[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="uc-dropdown-user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user.name || 'Valued User'}
                        </div>
                        <div style={{ marginTop: 3 }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            fontSize: 10.5,
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: 9999,
                            background: user.role === 'admin' ? '#F5F3FF' : user.role === 'professional' ? '#ECFDF5' : user.role === 'partner' ? '#EFF6FF' : '#F1F5F9',
                            color: user.role === 'admin' ? '#7C3AED' : user.role === 'professional' ? '#047857' : user.role === 'partner' ? '#1D4ED8' : '#475569',
                            border: `1px solid ${user.role === 'admin' ? '#DDD6FE' : user.role === 'professional' ? '#A7F3D0' : user.role === 'partner' ? '#BFDBFE' : '#E2E8F0'}`
                          }}>
                            {user.role === 'admin' && '🛡️ Administrator'}
                            {user.role === 'professional' && '⚡ Professional Pro'}
                            {user.role === 'partner' && '🏢 Partner Agency'}
                            {(!user.role || user.role === 'customer') && '👤 Customer'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dedicated Quick Action Card for Active Role */}
                    {user.role === 'admin' && (
                      <div style={{ margin: '8px 10px 4px', padding: '10px 12px', background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)', borderRadius: 8, border: '1px solid #DDD6FE' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#6D28D9', marginBottom: 6 }}>
                          ADMIN SESSION ACTIVE
                        </div>
                        <button
                          type="button"
                          style={{
                            width: '100%',
                            padding: '7px 12px',
                            background: '#7C3AED',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: 6,
                            fontSize: 12.5,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6
                          }}
                          onClick={() => {
                            setShowProfileMenu(false);
                            if (onOpenAdminDashboard) onOpenAdminDashboard();
                          }}
                        >
                          <ShieldCheck size={14} /> Open Admin Operations
                        </button>
                      </div>
                    )}

                    {user.role === 'professional' && (
                      <div style={{ margin: '8px 10px 4px', padding: '10px 12px', background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', borderRadius: 8, border: '1px solid #A7F3D0' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#047857', marginBottom: 6 }}>
                          TECHNICIAN COMPANION ACTIVE
                        </div>
                        <button
                          type="button"
                          style={{
                            width: '100%',
                            padding: '7px 12px',
                            background: '#059669',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: 6,
                            fontSize: 12.5,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6
                          }}
                          onClick={() => {
                            setShowProfileMenu(false);
                            if (onOpenProfessionalDashboard) onOpenProfessionalDashboard();
                          }}
                        >
                          <Wrench size={14} /> Open Professional Hub
                        </button>
                      </div>
                    )}

                    {user.role === 'partner' && (
                      <div style={{ margin: '8px 10px 4px', padding: '10px 12px', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', borderRadius: 8, border: '1px solid #BFDBFE' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#1D4ED8', marginBottom: 6 }}>
                          AGENCY FLEET ACTIVE
                        </div>
                        <button
                          type="button"
                          style={{
                            width: '100%',
                            padding: '7px 12px',
                            background: '#2563EB',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: 6,
                            fontSize: 12.5,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6
                          }}
                          onClick={() => {
                            setShowProfileMenu(false);
                            if (onOpenPartnerDashboard) onOpenPartnerDashboard();
                          }}
                        >
                          <Briefcase size={14} /> Open Partner Fleet Portal
                        </button>
                      </div>
                    )}

                    {/* Switch Role Quick Button */}
                    <div style={{ padding: '6px 10px 4px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false);
                          onOpenAuth('login');
                        }}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          background: '#F8FAFC',
                          border: '1px dashed #CBD5E1',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#475569',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6
                        }}
                      >
                        🔑 Switch Account / Role Login
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
                      Welcome to Urban Company
                    </div>
                    <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 10px 0' }}>
                      Login as Admin, Pro, Partner, or Customer
                    </p>
                    <button
                      type="button"
                      className="uc-dropdown-login-btn"
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenAuth('login');
                      }}
                    >
                      Login / Sign up
                    </button>
                  </div>
                )}

                <div className="uc-profile-menu-list">
                  <button
                    type="button"
                    className="uc-profile-menu-item"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenBookings();
                    }}
                  >
                    <Calendar size={16} color="#475569" />
                    <span style={{ flex: 1, textAlign: 'left' }}>My Bookings</span>
                    {bookingsCount > 0 && (
                      <span className="uc-menu-count-badge">{bookingsCount}</span>
                    )}
                  </button>

                  <button
                    type="button"
                    className="uc-profile-menu-item"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenAddresses();
                    }}
                  >
                    <Home size={16} color="#475569" />
                    <span style={{ flex: 1, textAlign: 'left' }}>Saved Addresses</span>
                    {addressesCount > 0 && (
                      <span className="uc-menu-count-badge">{addressesCount}</span>
                    )}
                  </button>

                  {/* Dashboard Shortcuts */}
                  <button
                    type="button"
                    className="uc-profile-menu-item"
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (onOpenAdminDashboard) onOpenAdminDashboard();
                      else if (onOpenAdmin) onOpenAdmin();
                    }}
                  >
                    <ShieldCheck size={16} color="#7C3AED" />
                    <span style={{ flex: 1, textAlign: 'left', fontWeight: user?.role === 'admin' ? 700 : 600 }}>
                      Admin Operations Portal
                    </span>
                    {user?.role === 'admin' && (
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#7C3AED', background: '#F5F3FF', padding: '1px 6px', borderRadius: 4 }}>
                        CURRENT
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    className="uc-profile-menu-item"
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (onOpenProfessionalDashboard) onOpenProfessionalDashboard();
                    }}
                  >
                    <Wrench size={16} color="#059669" />
                    <span style={{ flex: 1, textAlign: 'left', fontWeight: user?.role === 'professional' ? 700 : 600 }}>
                      Professional Service Hub
                    </span>
                    {user?.role === 'professional' && (
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#059669', background: '#ECFDF5', padding: '1px 6px', borderRadius: 4 }}>
                        CURRENT
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    className="uc-profile-menu-item"
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (onOpenPartnerDashboard) onOpenPartnerDashboard();
                    }}
                  >
                    <Briefcase size={16} color="#2563EB" />
                    <span style={{ flex: 1, textAlign: 'left', fontWeight: user?.role === 'partner' ? 700 : 600 }}>
                      Partner Fleet Portal
                    </span>
                    {user?.role === 'partner' && (
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#2563EB', background: '#EFF6FF', padding: '1px 6px', borderRadius: 4 }}>
                        CURRENT
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    className="uc-profile-menu-item"
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (onOpenAdminCatalogue) onOpenAdminCatalogue();
                    }}
                  >
                    <PlusCircle size={16} color="#475569" />
                    <span style={{ flex: 1, textAlign: 'left' }}>Manage Services Catalogue</span>
                    <span className="uc-menu-count-badge">{services?.length || 0}</span>
                  </button>

                  <button
                    type="button"
                    className="uc-profile-menu-item"
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (onOpenPartnerOnboarding) onOpenPartnerOnboarding();
                    }}
                  >
                    <Building2 size={16} color="#475569" />
                    <span style={{ flex: 1, textAlign: 'left' }}>Register as a Professional</span>
                  </button>

                  {user && (
                    <div style={{ borderTop: '1px solid #F1F5F9', marginTop: 4, paddingTop: 4 }}>
                      <button
                        type="button"
                        className="uc-profile-menu-item logout"
                        onClick={() => {
                          setShowProfileMenu(false);
                          if (onLogout) {
                            onLogout();
                          } else {
                            localStorage.removeItem('uc_user');
                            window.location.reload();
                          }
                        }}
                      >
                        <LogOut size={16} color="#EF4444" />
                        <span style={{ flex: 1, textAlign: 'left', color: '#EF4444' }}>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
