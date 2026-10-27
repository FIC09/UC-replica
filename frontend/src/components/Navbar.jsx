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
  onSelectNavTab,
  activeBooking = null,
  onOpenChat
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
            <div className="uc-square-badge">FIC</div>
            <div className="uc-text-wrap">
              <span className="uc-exact-name">Forge</span>
              <span className="uc-exact-sub">India Connect</span>
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



          {/* Quick Live Chat Button when an active service is underway */}
          {activeBooking && onOpenChat && (
            <button
              type="button"
              onClick={onOpenChat}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#ECFDF5',
                color: '#059669',
                border: '1.5px solid #A7F3D0',
                padding: '6px 13px',
                borderRadius: 20,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.15)',
                transition: 'all 0.15s'
              }}
              title="Open Live Chat with assigned professional (Rapido Style)"
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              <span>💬 Live Chat</span>
            </button>
          )}

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

          {/* Profile Icon in Circle */}
          <div className="uc-profile-wrap" ref={profileRef} style={{ position: 'relative' }}>
            <button
              type="button"
              className="uc-profile-btn"
              onClick={() => {
                if (!user) {
                  onOpenAuth('login');
                } else {
                  setShowProfileMenu(prev => !prev);
                }
              }}
              title={user ? (user.name || "My Account") : "Login"}
              aria-label="Profile Menu"
            >
              <CircleUserRound size={26} color="#111827" strokeWidth={1.5} />
            </button>

            {/* Profile Dropdown: strictly conditional on user state */}
            {showProfileMenu && (
              <div
                className="uc-profile-dropdown"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  minWidth: user ? '170px' : '140px',
                  background: '#FFFFFF',
                  borderRadius: '10px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                  border: '1px solid #E2E8F0',
                  padding: '6px',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                {!user ? (
                  <button
                    type="button"
                    className="uc-dropdown-login-btn"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenAuth('login');
                    }}
                    style={{
                      width: '100%',
                      padding: '9px 14px',
                      background: '#000000',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '7px',
                      fontSize: '13.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1F2937'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#000000'}
                  >
                    Login
                  </button>
                ) : (
                  <>
                    <div style={{ padding: '6px 8px 8px', borderBottom: '1px solid #F1F5F9' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.name || user.phone || 'My Account'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6B7280', textTransform: 'capitalize' }}>
                        {user.role || 'Customer'}
                      </div>
                    </div>

                    {onOpenBookings && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false);
                          onOpenBookings();
                        }}
                        style={{
                          width: '100%',
                          padding: '7px 8px',
                          background: 'none',
                          color: '#111827',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12.5px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <span>My Bookings</span>
                        {bookingsCount > 0 && (
                          <span style={{
                            background: '#000000',
                            color: '#FFFFFF',
                            borderRadius: '999px',
                            padding: '1px 6px',
                            fontSize: '10.5px',
                            fontWeight: '700'
                          }}>
                            {bookingsCount}
                          </span>
                        )}
                      </button>
                    )}

                    {onOpenAddresses && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false);
                          onOpenAddresses();
                        }}
                        style={{
                          width: '100%',
                          padding: '7px 8px',
                          background: 'none',
                          color: '#111827',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12.5px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        Manage Addresses
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        if (onLogout) {
                          onLogout();
                        } else {
                          localStorage.removeItem('uc_user');
                          window.location.reload();
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '7px 8px',
                        background: 'none',
                        color: '#EF4444',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        textAlign: 'left',
                        borderTop: '1px solid #F1F5F9',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '2px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <LogOut size={13} color="#EF4444" />
                      <span>Log Out</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
