import React, { useState, useEffect, useCallback } from 'react';
import { partnerClient } from './partnerClient';
import { PartnerLayout } from './PartnerLayout';
import { PartnerLogin } from './PartnerLogin';
import { PartnerRegister } from './PartnerRegister';
import { PartnerOnboarding } from './PartnerOnboarding';

// Views
import { OverviewView } from './views/OverviewView';
import { BookingsView } from './views/BookingsView';
import { CalendarView } from './views/CalendarView';
import { TeamView } from './views/TeamView';
import { ServicesView } from './views/ServicesView';
import { CoverageView } from './views/CoverageView';
import { EarningsView } from './views/EarningsView';
import { SettlementsView } from './views/SettlementsView';
import { InvoicesView } from './views/InvoicesView';
import { RefundsDisputesView } from './views/RefundsDisputesView';
import { ReviewsView } from './views/ReviewsView';
import { TrainingView } from './views/TrainingView';
import { InventoryView } from './views/InventoryView';
import { SupportView } from './views/SupportView';
import { NotificationsView } from './views/NotificationsView';
import { ReportsView } from './views/ReportsView';
import { DocumentsView } from './views/DocumentsView';
import { StaffView } from './views/StaffView';
import { ActivityView } from './views/ActivityView';
import { SettingsView } from './views/SettingsView';

// State views
import { PermissionDeniedState, SuspendedState, PendingApprovalState } from './views/StateViews';

export function PartnerRouter({ onExitToMarketplace }) {
  const [currentPath, setCurrentPath] = useState(() => {
    const p = window.location.pathname;
    return p.startsWith('/partner') ? p : '/partner';
  });

  const [partnerUser, setPartnerUser] = useState(() => {
    return partnerClient.getStoredPartner();
  });

  const [staffUser, setStaffUser] = useState(() => {
    return partnerClient.getStoredStaff();
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!sessionStorage.getItem('uc_partner_token') || !!localStorage.getItem('uc_partner_token');
  });

  const [toastMessage, setToastMessage] = useState(null);

  // Sync with browser back/forward buttons
  useEffect(() => {
    function handlePopState() {
      const p = window.location.pathname;
      if (p.startsWith('/partner')) {
        setCurrentPath(p);
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

  const handleLoginSuccess = useCallback((partner, staff) => {
    setIsAuthenticated(true);
    setPartnerUser(partner);
    setStaffUser(staff);
    if (partner.status === 'Pending Review') {
      handleNavigate('/partner/onboarding');
      showToast(`Welcome! Business application status: Under Review.`);
    } else {
      handleNavigate('/partner');
      showToast(`Welcome back to ${partner.businessName}!`);
    }
  }, [handleNavigate, showToast]);

  const handleRegisterSuccess = useCallback((partner, staff) => {
    setIsAuthenticated(true);
    setPartnerUser(partner);
    setStaffUser(staff);
    handleNavigate('/partner/onboarding');
    showToast(`Enterprise application submitted! Tracking onboarding.`);
  }, [handleNavigate, showToast]);

  const handleLogout = useCallback(() => {
    partnerClient.logout();
    setIsAuthenticated(false);
    handleNavigate('/partner/login');
    showToast('Signed out of partner portal.');
  }, [handleNavigate, showToast]);

  const handleSwitchDemoRole = useCallback(async (account) => {
    try {
      const res = await partnerClient.login({
        emailOrPhone: account.email,
        password: 'Partner@2026'
      });
      if (res && res.success) {
        setPartnerUser(res.partner);
        setStaffUser(res.staff);
        showToast(`Simulating active role as: ${res.staff.role} (${res.staff.name})`);
      }
    } catch (err) {
      showToast('Could not switch demo role: ' + err.message);
    }
  }, [showToast]);

  // Public unauthenticated routes
  if (currentPath === '/partner/login') {
    return (
      <PartnerLogin
        onLoginSuccess={handleLoginSuccess}
        onNavigate={handleNavigate}
        onExitToMarketplace={onExitToMarketplace}
      />
    );
  }

  if (currentPath === '/partner/register') {
    return (
      <PartnerRegister
        onRegisterSuccess={handleRegisterSuccess}
        onNavigate={handleNavigate}
        onExitToMarketplace={onExitToMarketplace}
      />
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return (
      <PartnerLogin
        onLoginSuccess={handleLoginSuccess}
        onNavigate={handleNavigate}
        onExitToMarketplace={onExitToMarketplace}
      />
    );
  }

  const isPending = ['Draft', 'Submitted', 'Under Review', 'Changes Requested', 'Rejected'].includes(partnerUser?.status);
  const isSuspended = partnerUser?.status === 'Suspended';

  // Helper to verify staff permission for route
  function renderWithPermission(requiredPermission, Component) {
    if (requiredPermission && staffUser?.permissions && !staffUser.permissions[requiredPermission]) {
      return (
        <PermissionDeniedState
          requiredPermission={requiredPermission}
          userRole={staffUser.role}
          onBack={() => handleNavigate('/partner')}
        />
      );
    }
    return <Component onNavigate={handleNavigate} showToast={showToast} staff={staffUser} partner={partnerUser} />;
  }

  // Operational privileges guard: pending businesses can access onboarding, profile/settings, and support,
  // but cannot access live operational dispatch, bookings, team, or finances until approved.
  function renderOperationalModule(requiredPermission, Component) {
    if (isPending) {
      return (
        <PendingApprovalState
          partner={partnerUser}
          onNavigate={handleNavigate}
          onRefresh={async () => {
            try {
              const res = await partnerClient.getMe();
              if (res && res.success) {
                setPartnerUser(res.partner);
                showToast(`Partner status: ${res.partner.status}`);
              }
            } catch (e) {
              showToast(e.message);
            }
          }}
        />
      );
    }
    return renderWithPermission(requiredPermission, Component);
  }

  // Route Dispatcher
  let viewContent = null;
  const path = currentPath.split('?')[0];

  if (isSuspended && path !== '/partner/support') {
    viewContent = <SuspendedState partner={partnerUser} onNavigate={handleNavigate} />;
  } else {
    switch (path) {
      case '/partner':
        viewContent = isPending
          ? <PartnerOnboarding partner={partnerUser} onNavigate={handleNavigate} showToast={showToast} />
          : <OverviewView onNavigate={handleNavigate} showToast={showToast} staff={staffUser} />;
        break;
      case '/partner/onboarding':
        viewContent = <PartnerOnboarding partner={partnerUser} onNavigate={handleNavigate} showToast={showToast} />;
        break;
      case '/partner/bookings':
        viewContent = renderOperationalModule('viewing', BookingsView);
        break;
      case '/partner/calendar':
        viewContent = renderOperationalModule('viewing', CalendarView);
        break;
      case '/partner/team':
        viewContent = renderOperationalModule('viewing', TeamView);
        break;
      case '/partner/services':
        viewContent = renderOperationalModule('viewing', ServicesView);
        break;
      case '/partner/coverage':
        viewContent = renderOperationalModule('viewing', CoverageView);
        break;
      case '/partner/earnings':
        viewContent = renderOperationalModule('viewing_finances', EarningsView);
        break;
      case '/partner/settlements':
        viewContent = renderOperationalModule('viewing_finances', SettlementsView);
        break;
      case '/partner/invoices':
        viewContent = renderOperationalModule('viewing_finances', InvoicesView);
        break;
      case '/partner/refunds-disputes':
        viewContent = renderWithPermission('viewing', RefundsDisputesView);
        break;
      case '/partner/reviews':
        viewContent = renderWithPermission('viewing', ReviewsView);
        break;
      case '/partner/training':
        viewContent = renderWithPermission('viewing', TrainingView);
        break;
      case '/partner/inventory':
        viewContent = renderWithPermission('viewing', InventoryView);
        break;
      case '/partner/support':
        viewContent = renderWithPermission('viewing', SupportView);
        break;
      case '/partner/notifications':
        viewContent = renderWithPermission('viewing', NotificationsView);
        break;
      case '/partner/reports':
        viewContent = renderWithPermission('exporting', ReportsView);
        break;
      case '/partner/documents':
        viewContent = renderWithPermission('viewing', DocumentsView);
        break;
      case '/partner/staff':
        viewContent = renderWithPermission('viewing', StaffView);
        break;
      case '/partner/activity':
        viewContent = renderWithPermission('viewing', ActivityView);
        break;
      case '/partner/settings':
        viewContent = renderWithPermission('viewing', SettingsView);
        break;
      default:
        viewContent = <OverviewView onNavigate={handleNavigate} showToast={showToast} staff={staffUser} />;
        break;
    }
  }

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 99999,
          background: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: 8,
          fontSize: 13.5,
          fontWeight: 600,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          animation: 'slideDown 0.2s ease-out'
        }}>
          <span>{toastMessage}</span>
        </div>
      )}

      <PartnerLayout
        currentPath={currentPath}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        partner={partnerUser}
        staff={staffUser}
        onSwitchRole={handleSwitchDemoRole}
        onExitToMarketplace={onExitToMarketplace}
      >
        {viewContent}
      </PartnerLayout>
    </>
  );
}
