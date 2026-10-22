import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from './AdminLayout';
import { AdminLogin } from './AdminLogin';
import { adminClient } from './adminClient';

// Import All 21 Admin Views
import { OverviewView } from './views/OverviewView';
import { BookingsView } from './views/BookingsView';
import { CustomersView } from './views/CustomersView';
import { ProfessionalsView } from './views/ProfessionalsView';
import { PartnersView } from './views/PartnersView';
import { ServicesView } from './views/ServicesView';
import { LocationsView } from './views/LocationsView';
import { PaymentsView } from './views/PaymentsView';
import { PayoutsView } from './views/PayoutsView';
import { RefundsView } from './views/RefundsView';
import { SupportView } from './views/SupportView';
import { ReviewsView } from './views/ReviewsView';
import { TrainingView } from './views/TrainingView';
import { InventoryView } from './views/InventoryView';
import { PromotionsView } from './views/PromotionsView';
import { ContentView } from './views/ContentView';
import { NotificationsView } from './views/NotificationsView';
import { ReportsView } from './views/ReportsView';
import { TeamView } from './views/TeamView';
import { AuditLogsView } from './views/AuditLogsView';
import { SettingsView } from './views/SettingsView';

export function AdminRouter({ onExitToMarketplace }) {
  const [currentPath, setCurrentPath] = useState(() => {
    const path = window.location.pathname;
    return path.startsWith('/admin') ? path : '/admin';
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('uc_admin_auth') === 'true';
  });

  const [adminUser, setAdminUser] = useState(() => {
    try {
      const stored = localStorage.getItem('uc_admin_user');
      return stored ? JSON.parse(stored) : {
        id: 'ADM-01',
        name: 'Super Admin',
        email: 'admin@urbancompany.com',
        role: 'Super Administrator',
        department: 'Operations & Platform Control',
        avatarInitials: 'SA'
      };
    } catch {
      return {
        id: 'ADM-01',
        name: 'Super Admin',
        email: 'admin@urbancompany.com',
        role: 'Super Administrator',
        department: 'Operations & Platform Control',
        avatarInitials: 'SA'
      };
    }
  });

  const [weatherSurge, setWeatherSurge] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync with browser back/forward buttons
  useEffect(() => {
    function handlePopState() {
      const path = window.location.pathname;
      if (path.startsWith('/admin')) {
        setCurrentPath(path);
      }
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 3200);
  }, []);

  const handleNavigate = useCallback((path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
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

  const handleLogout = useCallback(async () => {
    try {
      await adminClient.logout();
    } catch {}
    sessionStorage.removeItem('uc_admin_auth');
    sessionStorage.removeItem('uc_admin_token');
    sessionStorage.removeItem('uc_admin_user');
    localStorage.removeItem('uc_admin_token');
    localStorage.removeItem('uc_admin_user');
    setIsAuthenticated(false);
    handleNavigate('/admin/login');
    showToast('Signed out of Operations Dashboard');
  }, [handleNavigate, showToast]);

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

  const handleExitToMarketplace = useCallback(() => {
    if (onExitToMarketplace) {
      onExitToMarketplace();
    } else {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }, [onExitToMarketplace]);

  // If path is specifically /admin/login or user is unauthenticated
  if (!isAuthenticated || currentPath === '/admin/login') {
    return (
      <AdminLogin
        onLoginSuccess={handleLoginSuccess}
        onNavigateToMarketplace={handleExitToMarketplace}
      />
    );
  }

  // Normalize path
  const normalizedPath = currentPath.replace(/\/+$/, '') || '/admin';

  // Render view router based on path
  function renderView() {
    switch (normalizedPath) {
      case '/admin':
      case '/admin/overview':
        return <OverviewView onNavigate={handleNavigate} onShowToast={showToast} />;
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
      case '/admin/locations':
        return <LocationsView onShowToast={showToast} />;
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
      case '/admin/training':
        return <TrainingView onShowToast={showToast} />;
      case '/admin/inventory':
        return <InventoryView onShowToast={showToast} />;
      case '/admin/promotions':
        return <PromotionsView onShowToast={showToast} />;
      case '/admin/content':
        return <ContentView onShowToast={showToast} />;
      case '/admin/notifications':
        return <NotificationsView onShowToast={showToast} />;
      case '/admin/reports':
        return <ReportsView onShowToast={showToast} />;
      case '/admin/team':
        return <TeamView onShowToast={showToast} />;
      case '/admin/audit-logs':
        return <AuditLogsView onShowToast={showToast} />;
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
