import express from 'express';
import { AdminSetting } from '../models/AdminSetting.js';
import { Service } from '../models/Service.js';
import { Booking } from '../models/Booking.js';
import { WorkerApplication } from '../models/WorkerApplication.js';
import { PartnerApplication } from '../models/PartnerApplication.js';
import { User } from '../models/User.js';
import { Coupon } from '../models/Coupon.js';

import {
  requireAdminAuth,
  requirePermission,
  adminLoginLimiter
} from '../middleware/adminAuth.js';

import {
  adminLogin,
  adminLogout,
  adminMe,
  adminPasswordReset,
  getTeam,
  inviteTeamMember,
  updateTeamMemberStatus,
  revokeTeamMemberSessions,
  getPermissionMatrix,
  resetDemoData,
  seedInitialAdmins
} from '../controllers/adminAuthController.js';

import {
  getAuditLogs,
  exportAuditCsv
} from '../controllers/adminAuditController.js';

import {
  getPlatformSettings,
  updatePlatformSettings,
  toggleSurgeSetting
} from '../controllers/adminSettingsController.js';

import {
  getOverviewDashboardMetrics
} from '../controllers/adminOverviewController.js';

import {
  getBookings,
  getBookingDetail,
  createBookingOnBehalf,
  updateLifecycleStatus,
  assignProfessional,
  rescheduleBooking,
  cancelBooking,
  addInternalNote,
  initiateBookingRefund,
  getBookingInvoice
} from '../controllers/adminBookingController.js';

import {
  getCustomers,
  getCustomerDetail,
  updateCustomerStatus,
  anonymiseCustomerAccount,
  addCustomerNote
} from '../controllers/adminCustomerController.js';

import {
  getProfessionals,
  getProfessionalDetail,
  updateProfessionalStatus,
  verifyDocument,
  verifyBankDetails,
  assignSkillsAndCoverage,
  scheduleTraining,
  requestInformationCorrection,
  addProfessionalNote
} from '../controllers/adminProfessionalController.js';

import {
  getPartners,
  getPartnerDetail,
  createPartner,
  updatePartnerStatus,
  verifyPartnerDocument,
  updateSettlementMode,
  addPartnerNote
} from '../controllers/adminPartnerController.js';

import {
  getCatalogueServices,
  createCatalogueService,
  updateCatalogueService,
  archiveCatalogueService,
  restoreCatalogueService
} from '../controllers/adminCatalogueController.js';

import {
  getLocations,
  toggleSurge,
  updatePincodeCoverage,
  updateWorkingHoursCapacity,
  checkServiceability
} from '../controllers/adminLocationController.js';

import {
  getTransactions,
  getPayoutStatements,
  releasePayoutStatement,
  getRefundRequests,
  processRefundRequest,
  getReconciliationExceptions
} from '../controllers/adminPaymentController.js';

import {
  getSupportTickets,
  addTicketMessage,
  updateTicketStatus,
  getReviews,
  moderateReview,
  getRevisits,
  createRevisit
} from '../controllers/adminSupportController.js';

import {
  getTrainingModules,
  assignTraining,
  getInventory,
  adjustInventoryStock,
  getSupplyOrders,
  fulfillSupplyOrder
} from '../controllers/adminInventoryTrainingController.js';

import {
  getPromotions,
  createPromotion,
  validatePromotion,
  getContent,
  updateContent,
  getNotifications,
  sendNotification
} from '../controllers/adminPromotionsContentController.js';

import {
  getReports,
  exportReportCsv
} from '../controllers/adminReportingController.js';

const router = express.Router();

// Seed initial platform administrators if MongoDB is available
seedInitialAdmins().catch(() => {});

// ==========================================
// 1. AUTHENTICATION & ACCESS CONTROL
// ==========================================
router.post('/auth/login', adminLoginLimiter, adminLogin);
router.post('/auth/logout', requireAdminAuth, adminLogout);
router.get('/auth/me', requireAdminAuth, adminMe);
router.post('/auth/password-reset', adminPasswordReset);

// ==========================================
// 2. OVERVIEW DASHBOARD METRICS
// ==========================================
router.get('/overview', requireAdminAuth, requirePermission('overview', 'view'), getOverviewDashboardMetrics);

// ==========================================
// 3. BOOKINGS MANAGEMENT (Full Lifecycle, Overlap Guard, Invoice)
// ==========================================
router.get('/bookings', requireAdminAuth, requirePermission('bookings', 'view'), getBookings);
router.post('/bookings', requireAdminAuth, requirePermission('bookings', 'create'), createBookingOnBehalf);
router.get('/bookings/:id', requireAdminAuth, requirePermission('bookings', 'view'), getBookingDetail);
router.put('/bookings/:id/lifecycle', requireAdminAuth, requirePermission('bookings', 'edit'), updateLifecycleStatus);
router.put('/bookings/:id/status', requireAdminAuth, requirePermission('bookings', 'edit'), updateLifecycleStatus);
router.put('/bookings/:id/assign', requireAdminAuth, requirePermission('bookings', 'edit'), assignProfessional);
router.put('/bookings/:id/reschedule', requireAdminAuth, requirePermission('bookings', 'edit'), rescheduleBooking);
router.put('/bookings/:id/cancel', requireAdminAuth, requirePermission('bookings', 'edit'), cancelBooking);
router.post('/bookings/:id/notes', requireAdminAuth, requirePermission('bookings', 'edit'), addInternalNote);
router.post('/bookings/:id/refund', requireAdminAuth, requirePermission('refunds', 'refund'), initiateBookingRefund);
router.get('/bookings/:id/invoice', requireAdminAuth, requirePermission('bookings', 'view'), getBookingInvoice);

// ==========================================
// 4. CUSTOMERS MANAGEMENT (Profile, LTV, History, Anonymisation)
// ==========================================
router.get('/customers', requireAdminAuth, requirePermission('customers', 'view'), getCustomers);
router.get('/customers/:id', requireAdminAuth, requirePermission('customers', 'view'), getCustomerDetail);
router.put('/customers/:id/status', requireAdminAuth, requirePermission('customers', 'suspend'), updateCustomerStatus);
router.post('/customers/:id/anonymise', requireAdminAuth, requirePermission('customers', 'suspend'), anonymiseCustomerAccount);
router.post('/customers/:id/notes', requireAdminAuth, requirePermission('customers', 'edit'), addCustomerNote);

// ==========================================
// 5. PROFESSIONALS MANAGEMENT (Documents, Bank Review, Training, Skills)
// ==========================================
router.get('/professionals', requireAdminAuth, requirePermission('professionals', 'view'), getProfessionals);
router.get('/professionals/:id', requireAdminAuth, requirePermission('professionals', 'view'), getProfessionalDetail);
router.put('/professionals/:id/status', requireAdminAuth, requirePermission('professionals', 'approve'), updateProfessionalStatus);
router.put('/professionals/:id/kyc', requireAdminAuth, requirePermission('professionals', 'approve'), (req, res) => {
  req.body.status = 'Approved';
  updateProfessionalStatus(req, res);
});
router.put('/professionals/:id/verify-document', requireAdminAuth, requirePermission('professionals', 'approve'), verifyDocument);
router.put('/professionals/:id/verify-bank', requireAdminAuth, requirePermission('payouts', 'edit'), verifyBankDetails);
router.put('/professionals/:id/skills-coverage', requireAdminAuth, requirePermission('professionals', 'edit'), assignSkillsAndCoverage);
router.post('/professionals/:id/schedule-training', requireAdminAuth, requirePermission('training', 'create'), scheduleTraining);
router.post('/professionals/:id/request-correction', requireAdminAuth, requirePermission('professionals', 'edit'), requestInformationCorrection);
router.post('/professionals/:id/notes', requireAdminAuth, requirePermission('professionals', 'edit'), addProfessionalNote);

// ==========================================
// 6. BUSINESS PARTNERS (Franchise Agencies)
// ==========================================
router.get('/partners', requireAdminAuth, requirePermission('partners', 'view'), getPartners);
router.get('/partners/:id', requireAdminAuth, requirePermission('partners', 'view'), getPartnerDetail);
router.post('/partners', requireAdminAuth, requirePermission('partners', 'create'), createPartner);
router.put('/partners/:id/status', requireAdminAuth, requirePermission('partners', 'approve'), updatePartnerStatus);
router.put('/partners/:id/verify-document', requireAdminAuth, requirePermission('partners', 'approve'), verifyPartnerDocument);
router.put('/partners/:id/settlement-mode', requireAdminAuth, requirePermission('payouts', 'edit'), updateSettlementMode);
router.post('/partners/:id/notes', requireAdminAuth, requirePermission('partners', 'edit'), addPartnerNote);

// ==========================================
// 7. SERVICE CATALOGUE & SPECIFICATIONS
// ==========================================
router.get('/services', requireAdminAuth, requirePermission('services', 'view'), getCatalogueServices);
router.post('/services', requireAdminAuth, requirePermission('services', 'create'), createCatalogueService);
router.put('/services/:id', requireAdminAuth, requirePermission('services', 'edit'), updateCatalogueService);
router.delete('/services/:id', requireAdminAuth, requirePermission('services', 'edit'), archiveCatalogueService);
router.put('/services/:id/archive', requireAdminAuth, requirePermission('services', 'edit'), archiveCatalogueService);
router.put('/services/:id/restore', requireAdminAuth, requirePermission('services', 'edit'), restoreCatalogueService);

// ==========================================
// 8. LOCATIONS & SERVICEABILITY
// ==========================================
router.get('/locations', requireAdminAuth, requirePermission('locations', 'view'), getLocations);
router.post('/locations/surge', requireAdminAuth, requirePermission('locations', 'edit'), toggleSurge);
router.put('/locations/pincode', requireAdminAuth, requirePermission('locations', 'edit'), updatePincodeCoverage);
router.put('/locations/operating-parameters', requireAdminAuth, requirePermission('locations', 'edit'), updateWorkingHoursCapacity);
router.get('/locations/check-serviceability', checkServiceability);

// ==========================================
// 9. PAYMENTS & TRANSACTIONS (Integer Minor Units)
// ==========================================
router.get('/payments', requireAdminAuth, requirePermission('payments', 'view'), getTransactions);
router.get('/payments/transactions', requireAdminAuth, requirePermission('payments', 'view'), getTransactions);
router.get('/payments/reconciliation', requireAdminAuth, requirePermission('payments', 'view'), getReconciliationExceptions);

// ==========================================
// 10. PAYOUTS & SETTLEMENT STATEMENTS
// ==========================================
router.get('/payouts', requireAdminAuth, requirePermission('payouts', 'view'), getPayoutStatements);
router.post('/payouts/:id/release', requireAdminAuth, requirePermission('payouts', 'payout'), releasePayoutStatement);

// ==========================================
// 11. REFUNDS & DISPUTES (Max Balance Guard & Audit)
// ==========================================
router.get('/refunds', requireAdminAuth, requirePermission('refunds', 'view'), getRefundRequests);
router.put('/refunds/:id/process', requireAdminAuth, requirePermission('refunds', 'refund'), processRefundRequest);
router.put('/refunds/:id/approve', requireAdminAuth, requirePermission('refunds', 'refund'), (req, res) => {
  req.body.action = 'approve';
  processRefundRequest(req, res);
});
router.put('/refunds/:id/reject', requireAdminAuth, requirePermission('refunds', 'refund'), (req, res) => {
  req.body.action = 'reject';
  processRefundRequest(req, res);
});

// ==========================================
// 12. CUSTOMER & PRO SUPPORT
// ==========================================
router.get('/support', requireAdminAuth, requirePermission('support', 'view'), getSupportTickets);
router.post('/support/:id/messages', requireAdminAuth, requirePermission('support', 'edit'), addTicketMessage);
router.put('/support/:id/status', requireAdminAuth, requirePermission('support', 'edit'), updateTicketStatus);

// ==========================================
// 13. REVIEWS & RATINGS MODERATION
// ==========================================
router.get('/reviews', requireAdminAuth, requirePermission('reviews', 'view'), getReviews);
router.put('/reviews/:id/visibility', requireAdminAuth, requirePermission('reviews', 'edit'), moderateReview);
router.put('/reviews/:id/moderate', requireAdminAuth, requirePermission('reviews', 'edit'), moderateReview);

// ==========================================
// 13B. REVISITS & WARRANTY DISPUTES
// ==========================================
router.get('/revisits', requireAdminAuth, requirePermission('support', 'view'), getRevisits);
router.post('/revisits', requireAdminAuth, requirePermission('support', 'edit'), createRevisit);

// ==========================================
// 14. TRAINING & COMPLIANCE
// ==========================================
router.get('/training', requireAdminAuth, requirePermission('training', 'view'), getTrainingModules);
router.post('/training/:id/assign', requireAdminAuth, requirePermission('training', 'create'), assignTraining);

// ==========================================
// 15. INVENTORY & SPARE PARTS
// ==========================================
router.get('/inventory', requireAdminAuth, requirePermission('inventory', 'view'), getInventory);
router.put('/inventory/:id/stock', requireAdminAuth, requirePermission('inventory', 'edit'), adjustInventoryStock);
router.get('/inventory/supply-orders', requireAdminAuth, requirePermission('inventory', 'view'), getSupplyOrders);
router.post('/inventory/supply-orders/:id/fulfill', requireAdminAuth, requirePermission('inventory', 'edit'), fulfillSupplyOrder);

// ==========================================
// 16. PROMOTIONS & VOUCHERS
// ==========================================
router.get('/promotions', requireAdminAuth, requirePermission('promotions', 'view'), getPromotions);
router.post('/promotions', requireAdminAuth, requirePermission('promotions', 'create'), createPromotion);
router.post('/promotions/validate', validatePromotion);

// ==========================================
// 17. HOMEPAGE CONTENT & CMS
// ==========================================
router.get('/content', requireAdminAuth, requirePermission('content', 'view'), getContent);
router.put('/content', requireAdminAuth, requirePermission('content', 'edit'), updateContent);

// ==========================================
// 18. NOTIFICATIONS & BROADCASTS
// ==========================================
router.get('/notifications', requireAdminAuth, requirePermission('notifications', 'view'), getNotifications);
router.post('/notifications/send', requireAdminAuth, requirePermission('notifications', 'create'), sendNotification);

// ==========================================
// 19. BUSINESS INTELLIGENCE REPORTS
// ==========================================
router.get('/reports', requireAdminAuth, requirePermission('reports', 'view'), getReports);
router.get('/reports/export', requireAdminAuth, requirePermission('reports', 'export'), exportReportCsv);

// ==========================================
// 20. TEAM & ROLE ACCESS CONTROL
// ==========================================
router.get('/team', requireAdminAuth, requirePermission('team', 'view'), getTeam);
router.get('/team/permissions', requireAdminAuth, requirePermission('team', 'view'), getPermissionMatrix);
router.post('/team/invite', requireAdminAuth, requirePermission('team', 'create'), inviteTeamMember);
router.put('/team/:id/status', requireAdminAuth, requirePermission('team', 'edit'), updateTeamMemberStatus);
router.post('/team/:id/revoke-sessions', requireAdminAuth, requirePermission('team', 'edit'), revokeTeamMemberSessions);

// ==========================================
// 21. AUDIT LOGS (Immutable, Sanitized, CSV Protected)
// ==========================================
router.get('/audit-logs', requireAdminAuth, requirePermission('audit_logs', 'view'), getAuditLogs);
router.get('/audit-logs/export', requireAdminAuth, requirePermission('audit_logs', 'export'), exportAuditCsv);

// ==========================================
// 22. SETTINGS & PLATFORM GOVERNANCE
// ==========================================
router.get('/settings', requireAdminAuth, requirePermission('settings', 'view'), getPlatformSettings);
router.put('/settings', requireAdminAuth, requirePermission('settings', 'edit'), updatePlatformSettings);
router.post('/surge', requireAdminAuth, requirePermission('locations', 'edit'), toggleSurgeSetting);

// ==========================================
// 23. DEMO SANDBOX CONTROLS
// ==========================================
router.post('/demo/reset', requireAdminAuth, resetDemoData);

export default router;
