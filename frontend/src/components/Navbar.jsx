import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Search,
  ShoppingCart,
  CircleUserRound,
  User,
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
  PlusCircle,
  Settings
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
  onOpenProfile,
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
  onOpenChat,
  isLandingSearchOpen = false,
  onToggleLandingSearch
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

  const handleExecuteSearch = (overrideQuery) => {
    const q = (typeof overrideQuery === 'string' ? overrideQuery : searchQuery).trim();
    if (!q) {
      setShowSearchDropdown(true);
      return;
    }
    const qTokens = q.toLowerCase().split(/\s+/).filter(Boolean);
    const matches = services.filter(s => {
      const title = (s.title || '').toLowerCase();
      const subcategory = (s.subcategory || '').toLowerCase();
      const category = (s.category || '').toLowerCase();
      const description = (s.description || '').toLowerCase();
      const combined = `${title} ${subcategory} ${category} ${description}`;
      if (combined.includes(q.toLowerCase())) return true;
      if (qTokens.every(token => combined.includes(token))) return true;
      return false;
    });

    if (matches.length > 0) {
      if (onSelectService) {
        onSelectService(matches[0]);
      }
      setShowSearchDropdown(false);
    } else {
      setShowSearchDropdown(true);
    }
  };

  return (
    <header className="uc-navbar-exact">
      <div className="container-custom uc-nav-row">
        {/* Left: UC Logo + Delivery Location directly beneath project name */}
        <div className="uc-nav-left">
          <div className="uc-brand-location-col">
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

            {/* Delivery Location Selector Box (Positioned directly below the project name) */}
            <div
              className="uc-exact-loc-box"
              onClick={onOpenLocationModal}
              title="Change Delivery Location"
            >
              <MapPin size={13} color="#0B57D0" />
              <span className="uc-loc-text" title={`${selectedLocality || ''}, ${selectedCity}`}>
                4744+HMQ, {selectedLocality || selectedCity}
              </span>
              <ChevronDown size={13} color="#6B7280" />
            </div>
          </div>
        </div>

        {/* Center: Exact Header Nav Tabs: Homes, Native, Beauty (Center-Aligned Desktop View) */}
        <nav className="uc-sublinks uc-sublinks-desktop uc-nav-center">
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

        {/* Right / Center Controls: Search, Cart, Profile */}
        <div className="uc-nav-right">
          {/* Search Icon Button - Strictly only icon, no placeholder and no text */}
          <button
            type="button"
            id="landing-search-btn"
            className={`uc-cart-circle-btn uc-search-circle-btn ${isLandingSearchOpen ? 'active' : ''}`}
            onClick={() => {
              if (onToggleLandingSearch) {
                onToggleLandingSearch();
              }
            }}
            title="Search for services"
            aria-label="Search"
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              border: isLandingSearchOpen ? '1.5px solid #0B57D0' : '1px solid #E4E7EC',
              backgroundColor: isLandingSearchOpen ? '#E8F1FF' : '#FFFFFF',
              color: isLandingSearchOpen ? '#0B57D0' : '#152238',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
          >
            <Search size={18} strokeWidth={2} />
          </button>



          {/* Quick Live Chat Button when an active service is underway */}
          {activeBooking && onOpenChat && (
            <button
              type="button"
              className="uc-nav-live-chat-btn"
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
                transition: 'all 0.15s',
                flexShrink: 0
              }}
              title="Open Live Chat with assigned professional (Rapido Style)"
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              <span className="uc-live-chat-label">💬 Live Chat</span>
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
                  minWidth: user ? '210px' : '140px',
                  background: '#FFFFFF',
                  borderRadius: '10px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                  border: '1px solid #E4E7EC',
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
                      background: '#0B57D0',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '7px',
                      fontSize: '13.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0849B1'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0B57D0'}
                  >
                    Login
                  </button>
                ) : (
                  <>
                    {(() => {
                      const isAdmin = Boolean(
                        user && (
                          user.role === 'admin' ||
                          user.role === 'Super Admin' ||
                          user.role === 'Administrator' ||
                          user.role === 'Super Administrator' ||
                          user.name === 'Super Admin' ||
                          user.name === 'Admin' ||
                          user.email === 'admin@urbancompany.com' ||
                          String(user.role || '').toLowerCase().includes('admin')
                        )
                      );
                      const rawName = user.name || user.phone || 'My Account';
                      const displayName = (rawName === 'Super Admin' || rawName === 'Executive Admin (Ops Lead)' || isAdmin) ? 'Admin' : rawName;
                      const displayEmail = user.email || (user.phone ? `+91 ${user.phone.replace(/\D/g, '').slice(-10)}` : 'customer@forgeindia.in');

                      return (
                        <>
                          {/* 1. User Name and Email */}
                          <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid #E4E7EC' }}>
                            <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#152238', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {displayName}
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#667085', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {displayEmail}
                            </div>
                          </div>

                          {/* 2. My Bookings */}
                          <button
                            type="button"
                            onClick={() => {
                              setShowProfileMenu(false);
                              if (onOpenBookings) onOpenBookings();
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              background: 'none',
                              color: '#152238',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              textAlign: 'left',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              transition: 'background 0.15s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F7FC'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Calendar size={14} color="#0B57D0" />
                              <span>My Bookings</span>
                            </div>
                            {bookingsCount > 0 && (
                              <span style={{
                                background: '#0B57D0',
                                color: '#FFFFFF',
                                borderRadius: '999px',
                                padding: '1px 7px',
                                fontSize: '10.5px',
                                fontWeight: '700'
                              }}>
                                {bookingsCount}
                              </span>
                            )}
                          </button>

                          {/* 3. Manage Addresses */}
                          <button
                            type="button"
                            onClick={() => {
                              setShowProfileMenu(false);
                              if (onOpenAddresses) onOpenAddresses();
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              background: 'none',
                              color: '#152238',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              textAlign: 'left',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              transition: 'background 0.15s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F7FC'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <MapPin size={14} color="#0B57D0" />
                            <span>Manage Addresses</span>
                          </button>

                          {/* 4. Profile Settings */}
                          <button
                            type="button"
                            onClick={() => {
                              setShowProfileMenu(false);
                              if (onOpenProfile) onOpenProfile();
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              background: 'none',
                              color: '#152238',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              textAlign: 'left',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              transition: 'background 0.15s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F7FC'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <Settings size={14} color="#0B57D0" />
                            <span>Profile Settings</span>
                          </button>

                          {/* Admin Dashboard if Admin */}
                          {isAdmin && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowProfileMenu(false);
                                  if (onOpenAdmin) onOpenAdmin();
                                  else if (onOpenAdminDashboard) onOpenAdminDashboard();
                                  else window.location.href = '/admin';
                                }}
                                style={{
                                  width: '100%',
                                  padding: '8px 10px',
                                  background: 'none',
                                  color: '#152238',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  transition: 'background 0.15s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F7FC'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <ShieldCheck size={14} color="#0B57D0" />
                                <span>Admin Dashboard</span>
                              </button>

                              {onOpenAdminCatalogue && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowProfileMenu(false);
                                    onOpenAdminCatalogue();
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    background: 'none',
                                    color: '#152238',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'background 0.15s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F7FC'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                  <Wrench size={14} color="#667085" />
                                  <span>Services Catalogue</span>
                                </button>
                              )}
                            </>
                          )}
                        </>
                      );
                    })()}

                    {/* 5. Log Out */}
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
                        padding: '8px 10px',
                        background: 'none',
                        color: '#DC2626',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        textAlign: 'left',
                        borderTop: '1px solid #E4E7EC',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginTop: '4px',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <LogOut size={14} color="#DC2626" />
                      <span>Log Out</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Category Navigation Bar (Homes | Native | Beauty) */}
      <nav className="uc-sublinks-mobile" aria-label="Main Category Navigation">
        <button
          type="button"
          className={`uc-mobile-sublink-btn ${activeNavTab === 'homes' ? 'active' : ''}`}
          onClick={() => {
            if (onSelectNavTab) onSelectNavTab('homes');
            if (onSelectCategory) onSelectCategory('all');
          }}
        >
          Homes
        </button>
        <button
          type="button"
          className={`uc-mobile-sublink-btn ${activeNavTab === 'native' ? 'active' : ''}`}
          onClick={() => {
            if (onSelectNavTab) onSelectNavTab('native');
            if (onSelectCategory) onSelectCategory('native-ro');
          }}
        >
          Native
        </button>
        <button
          type="button"
          className={`uc-mobile-sublink-btn ${activeNavTab === 'beauty' ? 'active' : ''}`}
          onClick={() => {
            if (onSelectNavTab) onSelectNavTab('beauty');
            if (onSelectCategory) onSelectCategory('womens-salon');
          }}
        >
          Beauty
        </button>
      </nav>
    </header>
  );
}
