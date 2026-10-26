import React, { useState, useEffect, useCallback } from 'react';
import { professionalClient } from './professionalClient';
import { ProfessionalLayout } from './ProfessionalLayout';
import { ProfessionalLogin } from './ProfessionalLogin';
import { ProfessionalRegister } from './ProfessionalRegister';

// Core & Hub Views
import { OverviewView } from './views/OverviewView';
import { OnboardingStatusView } from './views/OnboardingStatusView';
import { AccountHubView } from './views/AccountHubView';
import { JobsView } from './views/JobsView';
import { JobDetailView } from './views/JobDetailView';
import { CalendarView } from './views/CalendarView';
import { AvailabilityView } from './views/AvailabilityView';
import { EarningsView } from './views/EarningsView';
import { PayoutsView } from './views/PayoutsView';
import { ReviewsView } from './views/ReviewsView';
import { PerformanceView } from './views/PerformanceView';
import { TrainingView } from './views/TrainingView';
import { InventoryView } from './views/InventoryView';
import { ShopView } from './views/ShopView';
import { SupportView } from './views/SupportView';
import { NotificationsView } from './views/NotificationsView';
import { DocumentsView } from './views/DocumentsView';
import { ProfileView } from './views/ProfileView';
import { SettingsView } from './views/SettingsView';

// State & Feedback Components
import { SuspendedState, SessionExpiredModal, PermissionDeniedState, PendingApprovalState } from './views/StateViews';

export function ProfessionalRouter({ onExitToMarketplace, onLogout: onAppLogout }) {
  const [currentPath, setCurrentPath] = useState(() => {
    const p = window.location.pathname;
    return p.startsWith('/professional') ? p : '/professional';
  });

  const [professionalUser, setProfessionalUser] = useState(() => {
    return professionalClient.getStoredUser();
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (sessionStorage.getItem('uc_pro_token') || localStorage.getItem('uc_pro_token')) {
      return true;
    }
    try {
      const u = JSON.parse(localStorage.getItem('uc_user'));
      if (u && (u.role === 'professional' || (u.email && u.email.includes('pro')))) {
        const pro = professionalClient.getStoredUser();
        professionalClient.setAuth('simulated-pro-jwt-token', pro);
        return true;
      }
    } catch {}
    return false;
  });

  const [toastMessage, setToastMessage] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [isCheckingApproval, setIsCheckingApproval] = useState(false);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 3200);
  }, []);

  // Re-check application approval status against backend
  const handleCheckApprovalStatus = useCallback(async () => {
    setIsCheckingApproval(true);
    try {
      const res = await professionalClient.getProfile();
      if (res && res.success && res.profile) {
        setProfessionalUser(res.profile);
        localStorage.setItem('uc_pro_user', JSON.stringify(res.profile));
        if (res.profile.status === 'Approved' || res.profile.status === 'Active') {
          showToast(`🎉 Application APPROVED! Welcome to the Urban Company Professional Dashboard.`);
        } else {
          showToast(`Application status: "${res.profile.status || 'Pending Review'}". Awaiting Admin Approval.`);
        }
      } else {
        // Fallback: ping worker-applications endpoint directly
        const storedUser = professionalClient.getStoredUser();
        const targetId = storedUser?.id || professionalUser?.id;
        const targetEmail = (storedUser?.email || professionalUser?.email || '').toLowerCase().trim();
        const targetPhone = (storedUser?.phone || professionalUser?.phone || '').replace(/\D/g, '');

        if (targetId || targetEmail || targetPhone) {
          const directRes = await fetch(`/api/worker-applications`);
          const data = await directRes.json();
          const match = data.applications?.find(a => 
            (targetId && (a.id === targetId || a._id === targetId)) ||
            (targetEmail && a.email && a.email.toLowerCase() === targetEmail) ||
            (targetPhone && a.phone && a.phone.replace(/\D/g, '').includes(targetPhone))
          );
          if (match) {
            setProfessionalUser(prev => ({ ...prev, ...match }));
            localStorage.setItem('uc_pro_user', JSON.stringify({ ...storedUser, ...match }));
            if (match.status === 'Approved' || match.status === 'Active') {
              showToast(`🎉 Application APPROVED by Admin! Operational dashboard unlocked.`);
            } else {
              showToast(`Application status: "${match.status}". Awaiting Admin Approval.`);
            }
          }
        }
      }
    } catch (err) {
      showToast(err.message || 'Status check failed');
    } finally {
      setIsCheckingApproval(false);
    }
  }, [showToast, professionalUser?.id]);

  // Sync with browser back/forward buttons
  useEffect(() => {
    function handlePopState() {
      const p = window.location.pathname;
      if (p.startsWith('/professional')) {
        setCurrentPath(p);
      }
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
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
    setProfessionalUser(user);
    setSessionExpired(false);
    if (user.status === 'Under Review' || user.status === 'Changes Requested') {
      handleNavigate('/professional/onboarding');
      showToast(`Welcome! Review your onboarding checklist (${user.status}).`);
    } else {
      handleNavigate('/professional');
      showToast(`Welcome back, ${user.applicantName || user.name}!`);
    }
  }, [handleNavigate, showToast]);

  const handleLogout = useCallback(() => {
    professionalClient.logout();
    localStorage.removeItem('uc_user');
    setIsAuthenticated(false);
    window.dispatchEvent(new CustomEvent('uc:auth-changed', { detail: { user: null } }));
    if (onAppLogout) {
      onAppLogout();
    } else if (onExitToMarketplace) {
      onExitToMarketplace();
    } else {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }, [onAppLogout, onExitToMarketplace]);

  const handleToggleOnline = useCallback(async () => {
    const isApproved = !professionalUser?.status || professionalUser.status === 'Approved' || professionalUser.status === 'Active';
    if (!isApproved) {
      showToast(`Duty locked: Your account is "${professionalUser?.status || 'Pending'}". Must be verified by compliance.`);
      return;
    }
    const nextVal = !(professionalUser?.isOnline !== false);
    setProfessionalUser(prev => ({ ...prev, isOnline: nextVal }));
    showToast(nextVal ? 'Duty Started • You are now ONLINE' : 'Duty Paused • You are now OFFLINE');
    try {
      await professionalClient.updateAvailability({ isOnline: nextVal });
    } catch {
      // ignore
    }
  }, [professionalUser, showToast]);

  // Public unauthenticated routes
  if (!isAuthenticated) {
    if (currentPath === '/professional/register') {
      return (
        <ProfessionalRegister
          onNavigateToLogin={() => handleNavigate('/professional/login')}
          onExitToMarketplace={onExitToMarketplace}
          showToast={showToast}
        />
      );
    }
    if (currentPath === '/professional/onboarding') {
      return (
        <OnboardingStatusView
          profile={professionalUser}
          onNavigate={handleNavigate}
          onUpdateProfile={(up) => setProfessionalUser(p => ({ ...p, ...up }))}
          showToast={showToast}
          onLogout={handleLogout}
        />
      );
    }
    return (
      <ProfessionalLogin
        onLoginSuccess={handleLoginSuccess}
        onNavigateToRegister={() => handleNavigate('/professional/register')}
        onExitToMarketplace={onExitToMarketplace}
        showToast={showToast}
      />
    );
  }

  // Registration route while authenticated
  if (currentPath === '/professional/register') {
    return (
      <ProfessionalRegister
        onNavigateToLogin={() => handleNavigate('/professional/login')}
        onExitToMarketplace={onExitToMarketplace}
        showToast={showToast}
      />
    );
  }

  // View Router
  const renderView = () => {
    // 1. Check if Suspended
    if (professionalUser?.status === 'Suspended') {
      if (currentPath === '/professional' || currentPath === '/professional/' || currentPath === '/professional/jobs') {
        return (
          <SuspendedState
            profile={professionalUser}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );
      }
    }

    // 2. Check if Pending Admin Approval (Block operational dashboard until approved)
    const isApproved = professionalUser?.status === 'Approved' || professionalUser?.status === 'Active';
    const isPending = !isApproved && professionalUser?.status !== 'Suspended';

    if (isPending) {
      if (currentPath === '/professional/onboarding') {
        return (
          <OnboardingStatusView
            profile={professionalUser}
            onNavigate={handleNavigate}
            onUpdateProfile={(up) => setProfessionalUser(p => ({ ...p, ...up }))}
            showToast={showToast}
            onLogout={handleLogout}
          />
        );
      }
      return (
        <PendingApprovalState
          profile={professionalUser}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onRefreshStatus={handleCheckApprovalStatus}
          isChecking={isCheckingApproval}
        />
      );
    }

    // 3. Onboarding Status View (for approved pro visiting onboarding)
    if (currentPath === '/professional/onboarding') {
      return (
        <OnboardingStatusView
          profile={professionalUser}
          onNavigate={handleNavigate}
          onUpdateProfile={(up) => setProfessionalUser(p => ({ ...p, ...up }))}
          showToast={showToast}
          onLogout={handleLogout}
        />
      );
    }

    // 3. Account Hub View (5th bottom tab)
    if (currentPath === '/professional/account') {
      return (
        <AccountHubView
          profile={professionalUser}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onToggleOnline={handleToggleOnline}
          showToast={showToast}
          onUpdateProfile={(up) => {
            setProfessionalUser(prev => {
              const updated = { ...prev, ...up };
              localStorage.setItem('uc_pro_user', JSON.stringify(updated));
              return updated;
            });
          }}
        />
      );
    }

    // 4. Today / Overview (1st bottom tab)
    if (currentPath === '/professional' || currentPath === '/professional/') {
      return (
        <OverviewView
          professional={professionalUser}
          profile={professionalUser}
          onNavigate={handleNavigate}
          onToggleOnline={handleToggleOnline}
          showToast={showToast}
        />
      );
    }

    // 5. Jobs & Dispatches (2nd bottom tab)
    if (currentPath.startsWith('/professional/jobs/')) {
      const jobId = currentPath.split('/professional/jobs/')[1];
      return (
        <JobDetailView
          jobId={jobId}
          onNavigate={handleNavigate}
          showToast={showToast}
        />
      );
    }

    if (currentPath === '/professional/jobs') {
      return (
        <JobsView
          onNavigate={handleNavigate}
          showToast={showToast}
        />
      );
    }

    // Calendar & Slots (Removed - redirecting to Today Dashboard)
    if (currentPath === '/professional/calendar') {
      window.history.replaceState({}, '', '/professional');
      return (
        <OverviewView
          professional={professionalUser}
          profile={professionalUser}
          onNavigate={handleNavigate}
          onToggleOnline={handleToggleOnline}
          showToast={showToast}
        />
      );
    }

    // Money & Ledgers
    if (currentPath === '/professional/earnings') {
      return (
        <EarningsView
          onNavigate={handleNavigate}
          showToast={showToast}
        />
      );
    }

    if (currentPath === '/professional/payouts') {
      return (
        <PayoutsView
          profile={professionalUser}
          showToast={showToast}
        />
      );
    }

    // Secondary Modules
    if (currentPath === '/professional/availability') {
      return (
        <AvailabilityView
          profile={professionalUser}
          onToggleOnline={handleToggleOnline}
          showToast={showToast}
        />
      );
    }

    // Customer Ratings & Reviews (Removed - redirecting to Today Dashboard)
    if (currentPath === '/professional/reviews') {
      window.history.replaceState({}, '', '/professional');
      return (
        <OverviewView
          professional={professionalUser}
          profile={professionalUser}
          onNavigate={handleNavigate}
          onToggleOnline={handleToggleOnline}
          showToast={showToast}
        />
      );
    }

    if (currentPath === '/professional/performance') {
      return (
        <PerformanceView
          showToast={showToast}
        />
      );
    }

    // Academy & Safety SOPs (Removed - redirecting to Today Dashboard)
    if (currentPath === '/professional/training') {
      window.history.replaceState({}, '', '/professional');
      return (
        <OverviewView
          professional={professionalUser}
          profile={professionalUser}
          onNavigate={handleNavigate}
          onToggleOnline={handleToggleOnline}
          showToast={showToast}
        />
      );
    }

    // Inventory & Spare Parts (Removed - redirecting to Today Dashboard)
    if (currentPath === '/professional/inventory') {
      window.history.replaceState({}, '', '/professional');
      return (
        <OverviewView
          professional={professionalUser}
          profile={professionalUser}
          onNavigate={handleNavigate}
          onToggleOnline={handleToggleOnline}
          showToast={showToast}
        />
      );
    }

    if (currentPath === '/professional/shop') {
      return (
        <ShopView
          profile={professionalUser}
          showToast={showToast}
        />
      );
    }

    if (currentPath === '/professional/support') {
      return (
        <SupportView
          showToast={showToast}
        />
      );
    }

    if (currentPath === '/professional/notifications') {
      return (
        <NotificationsView
          showToast={showToast}
        />
      );
    }

    if (currentPath === '/professional/documents') {
      return (
        <DocumentsView
          profile={professionalUser}
          showToast={showToast}
        />
      );
    }

    if (currentPath === '/professional/profile') {
      return (
        <ProfileView
          profile={professionalUser}
          onUpdateProfile={(up) => setProfessionalUser(prev => ({ ...prev, ...up }))}
          showToast={showToast}
        />
      );
    }

    if (currentPath === '/professional/settings') {
      return (
        <SettingsView
          showToast={showToast}
        />
      );
    }

    // Fallback Overview
    return (
      <OverviewView
        professional={professionalUser}
        profile={professionalUser}
        onNavigate={handleNavigate}
        onToggleOnline={handleToggleOnline}
        showToast={showToast}
      />
    );
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          background: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 600,
          zIndex: 99999,
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
          animation: 'slideDown 0.2s ease-out'
        }}>
          {toastMessage}
        </div>
      )}

      {/* Session Expired Simulation Modal */}
      {sessionExpired && (
        <SessionExpiredModal
          onRelogin={() => {
            setSessionExpired(false);
            handleLogout();
          }}
        />
      )}

      <ProfessionalLayout
        currentPath={currentPath}
        onNavigate={handleNavigate}
        professional={professionalUser}
        profile={professionalUser}
        onLogout={handleLogout}
        onExitToMarketplace={onExitToMarketplace}
        onToggleOnline={handleToggleOnline}
      >
        {renderView()}
      </ProfessionalLayout>
    </>
  );
}
