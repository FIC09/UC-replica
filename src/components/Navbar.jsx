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
  onOpenWorkerOnboarding,
  onOpenPartnerOnboarding,
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
              <div className="uc-profile-dropdown">
                {user ? (
                  <div className="uc-profile-dropdown-user-header">
                    <div className="uc-dropdown-user-avatar">
                      {(user.name || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="uc-dropdown-user-name">{user.name || 'Valued Customer'}</div>
                      <div className="uc-dropdown-user-sub">{user.phone || 'Urban Company Member'}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
                      Welcome to Urban Company
                    </div>
                    <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 10px 0' }}>
                      Book services, track orders & manage addresses
                    </p>
                    <button
                      type="button"
                      className="uc-dropdown-login-btn"
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenAuth();
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

                  <button
                    type="button"
                    className="uc-profile-menu-item"
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (onOpenAdminCatalogue) onOpenAdminCatalogue();
                    }}
                  >
                    <Wrench size={16} color="#475569" />
                    <span style={{ flex: 1, textAlign: 'left' }}>Manage Services</span>
                    <span className="uc-menu-count-badge">{services?.length || 0}</span>
                  </button>

                  <button
                    type="button"
                    className="uc-profile-menu-item"
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (onOpenAdmin) onOpenAdmin();
                      else if (onOpenAdminDashboard) onOpenAdminDashboard();
                    }}
                  >
                    <ShieldCheck size={16} color="#6E42E5" />
                    <span style={{ flex: 1, textAlign: 'left' }}>Admin Portal</span>
                    {isAdminAuthenticated && (
                      <span style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: '#10B981'
                      }} title="Authenticated" />
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
                    <Briefcase size={16} color="#475569" />
                    <span style={{ flex: 1, textAlign: 'left' }}>Partner Dashboard</span>
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
                          if (window.confirm('Do you want to log out?')) {
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
