import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from './AdminLayout';
import { adminClient } from './adminClient';

// Import Admin Views
import { OverviewView } from './views/OverviewView';
import { OperationsView } from './views/OperationsView';
import { BookingsView } from './views/BookingsView';
import { CustomersView } from './views/CustomersView';
import { ProfessionalsView } from './views/ProfessionalsView';
import { PartnersView } from './views/PartnersView';
import { ServicesView } from './views/ServicesView';
import { PaymentsView } from './views/PaymentsView';
import { PayoutsView } from './views/PayoutsView';
import { RefundsView } from './views/RefundsView';
import { SupportView } from './views/SupportView';
import { ReviewsView } from './views/ReviewsView';
import { PromotionsView } from './views/PromotionsView';
import { SettingsView } from './views/SettingsView';

const REMOVED_ADMIN_PATHS = [
  '/admin/locations',
  '/admin/inventory',
  '/admin/training',
  '/admin/reports',
  '/admin/team',
  '/admin/audit-logs',
  '/admin/content',
  '/admin/notifications'
];

export function AdminRouter({ onExitToMarketplace, onLogout: onAppLogout }) {
  const [currentPath, setCurrentPath] = useState(() => {
    const path = window.location.pathname;
    if (REMOVED_ADMIN_PATHS.includes(path)) {
      window.history.replaceState({}, '', '/admin');
      return '/admin';
    }
    return path.startsWith('/admin') ? path : '/admin';
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('uc_admin_auth') === 'true' ||
           localStorage.getItem('uc_admin_auth') === 'true' ||
           Boolean(sessionStorage.getItem('uc_admin_token')) ||
           Boolean(localStorage.getItem('uc_admin_token'));
  });
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  const [adminUser, setAdminUser] = useState(() => {
    try {
      const stored = localStorage.getItem('uc_admin_user');
      return stored ? JSON.parse(stored) : {
        id: 'ADM-01',
        name: 'Admin',
        email: 'admin@urbancompany.com',
        role: 'Administrator',
        department: 'Operations & Platform Control',
        avatarInitials: 'AD'
      };
    } catch {
      return {
        id: 'ADM-01',
        name: 'Admin',
        email: 'admin@urbancompany.com',
        role: 'Administrator',
        department: 'Operations & Platform Control',
        avatarInitials: 'AD'
      };
    }
  });

  const [weatherSurge, setWeatherSurge] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync with browser back/forward buttons
  useEffect(() => {
    function handlePopState() {
      const path = window.location.pathname;
      if (REMOVED_ADMIN_PATHS.includes(path)) {
        window.history.replaceState({}, '', '/admin');
        setCurrentPath('/admin');
        return;
      }
      if (path.startsWith('/admin')) {
        setCurrentPath(path);
      }
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    function handleAuthSync() {
      const authed = sessionStorage.getItem('uc_admin_auth') === 'true';
      setIsAuthenticated(authed);
      try {
        const stored = localStorage.getItem('uc_admin_user');
        if (stored) setAdminUser(JSON.parse(stored));
      } catch {}
    }
    window.addEventListener('uc:auth-changed', handleAuthSync);
    window.addEventListener('storage', handleAuthSync);
    return () => {
      window.removeEventListener('uc:auth-changed', handleAuthSync);
      window.removeEventListener('storage', handleAuthSync);
    };
  }, []);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 3200);
  }, []);

  const handleNavigate = useCallback((path) => {
    const targetPath = REMOVED_ADMIN_PATHS.includes(path) ? '/admin' : path;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
      setCurrentPath(targetPath);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleLoginSuccess = useCallback((user) => {
    setIsAuthenticated(true);
    setAdminUser(user);
    sessionStorage.setItem('uc_admin_auth', 'true');
    handleNavigate('/admin');
    showToast(`Welcome back, ${user.name}`);
  }, [handleNavigate, showToast]);

  // Authenticated Admin Session Restoration & Persistence
  useEffect(() => {
    let isMounted = true;
    async function restoreAdminSession() {
      const hasAuth = sessionStorage.getItem('uc_admin_auth') === 'true' || localStorage.getItem('uc_admin_auth') === 'true';
      const token = sessionStorage.getItem('uc_admin_token') || localStorage.getItem('uc_admin_token');

      if (!hasAuth && !token) {
        if (isMounted) {
          setIsAuthenticated(false);
          setIsAuthInitialized(true);
        }
        return;
      }

      // Synchronize persistent tokens and flags across session & local storage
      try {
        sessionStorage.setItem('uc_admin_auth', 'true');
        localStorage.setItem('uc_admin_auth', 'true');
        if (token) {
          sessionStorage.setItem('uc_admin_token', token);
          localStorage.setItem('uc_admin_token', token);
        }
        const meRes = await adminClient.me();
        if (isMounted) {
          if (meRes && meRes.admin) {
            setAdminUser(meRes.admin);
            localStorage.setItem('uc_admin_user', JSON.stringify(meRes.admin));
            sessionStorage.setItem('uc_admin_user', JSON.stringify(meRes.admin));
          }
          setIsAuthenticated(true);
          setIsAuthInitialized(true);
        }
      } catch {
        if (isMounted) {
          setIsAuthenticated(true);
          setIsAuthInitialized(true);
        }
      }
    }
    restoreAdminSession();
    return () => { isMounted = false; };
  }, []);

  const handleExitToMarketplace = useCallback(() => {
    sessionStorage.removeItem('uc_admin_auth');
    localStorage.removeItem('uc_admin_auth');
    sessionStorage.removeItem('uc_admin_token');
    localStorage.removeItem('uc_admin_token');
    setIsAuthenticated(false);
    if (typeof onAppLogout === 'function') {
      try { onAppLogout(); } catch {}
    }
    if (typeof onExitToMarketplace === 'function') {
      try { onExitToMarketplace(); } catch {}
    }
    window.location.replace('/');
  }, [onAppLogout, onExitToMarketplace]);

  const handleLogout = useCallback(async () => {
    try {
      await adminClient.logout();
    } catch {}
    sessionStorage.removeItem('uc_admin_auth');
    sessionStorage.removeItem('uc_admin_token');
    sessionStorage.removeItem('uc_admin_user');
    localStorage.removeItem('uc_admin_token');
    localStorage.removeItem('uc_admin_user');
    localStorage.removeItem('uc_user');
    localStorage.removeItem('uc_open_portal');
    setIsAuthenticated(false);
    
    // Broadcast event across app
    window.dispatchEvent(new CustomEvent('uc:auth-changed', { detail: { user: null } }));

    if (typeof onAppLogout === 'function') {
      try { onAppLogout(); } catch {}
    }
    if (typeof onExitToMarketplace === 'function') {
      try { onExitToMarketplace(); } catch {}
    }

    // Unconditionally redirect straight to landing page
    window.location.replace('/');
  }, [onAppLogout, onExitToMarketplace]);

  const handleToggleWeatherSurge = useCallback((active) => {
    setWeatherSurge(active);
    adminClient.toggleSurge(active)
      .then(() => {
        showToast(active ? '⛈️ Weather surge active (+15% pro compensation)' : 'Weather surge disabled');
      })
      .catch(() => {
        showToast(active ? 'Weather surge activated (local)' : 'Weather surge cleared');
      });
  }, [showToast]);

  // Protected route check: only redirect AFTER authentication initialization has completed
  useEffect(() => {
    if (isAuthInitialized && (!isAuthenticated || currentPath === '/admin/login')) {
      handleExitToMarketplace();
    }
  }, [isAuthInitialized, isAuthenticated, currentPath, handleExitToMarketplace]);

  if (!isAuthInitialized) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0F172A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94A3B8',
        fontSize: '15px',
        fontWeight: 600,
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 20,
            height: 20,
            border: '2.5px solid #6366F1',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <span>Restoring Admin Session...</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated || currentPath === '/admin/login') {
    return null;
  }

  // Normalize path
  const normalizedPath = currentPath.replace(/\/+$/, '') || '/admin';

  // Render view router based on path
  function renderView() {
    switch (normalizedPath) {
      case '/admin':
      case '/admin/overview':
        return <OverviewView onNavigate={handleNavigate} onShowToast={showToast} />;
      case '/admin/operations':
        return <OperationsView onNavigate={handleNavigate} onShowToast={showToast} />;
      case '/admin/bookings':
        return <BookingsView onNavigate={handleNavigate} onShowToast={showToast} />;
      case '/admin/customers':
        return <CustomersView onNavigate={handleNavigate} onShowToast={showToast} />;
      case '/admin/professionals':
        return <ProfessionalsView onNavigate={handleNavigate} onShowToast={showToast} />;
      case '/admin/partners':
        return <PartnersView onShowToast={showToast} />;
      case '/admin/services':
        return <ServicesView onShowToast={showToast} />;
      case '/admin/payments':
        return <PaymentsView onShowToast={showToast} />;
      case '/admin/payouts':
        return <PayoutsView onShowToast={showToast} />;
      case '/admin/refunds':
        return <RefundsView onShowToast={showToast} />;
      case '/admin/support':
        return <SupportView onShowToast={showToast} />;
      case '/admin/reviews':
        return <ReviewsView onShowToast={showToast} />;
      case '/admin/promotions':
        return <PromotionsView onShowToast={showToast} />;
      case '/admin/settings':
        return <SettingsView onShowToast={showToast} />;
      default:
        return <OverviewView onNavigate={handleNavigate} onShowToast={showToast} />;
    }
  }

  return (
    <AdminLayout
      currentPath={normalizedPath}
      onNavigate={handleNavigate}
      adminUser={adminUser}
      onLogout={handleLogout}
      onNavigateToMarketplace={handleExitToMarketplace}
      weatherSurge={weatherSurge}
      onToggleWeatherSurge={handleToggleWeatherSurge}
    >
      {renderView()}

      {/* Floating Action Feedback Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 600,
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          zIndex: 99999,
          animation: 'slideIn 0.2s ease-out'
        }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' }} />
          <span>{toastMessage}</span>
        </div>
      )}
    </AdminLayout>
  );
}
