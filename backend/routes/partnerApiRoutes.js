import express from 'express';
import {
  loginPartner,
  registerPartner,
  getPartnerMe,
  requestPasswordReset,
  getPartnerOnboardingStatus,
  savePartnerOnboardingDraft,
  submitPartnerOnboarding,
  submitPartnerOnboardingCorrections,
  getDashboardSummary,
  getPartnerBookings,
  getPartnerBookingDetail,
  assignPartnerBooking,
  addBookingBusinessNote,
  requestBookingReschedule,
  requestBookingCancellation,
  overrideBookingCompletion,
  getPartnerCalendar,
  getPartnerTeam,
  addPartnerTeamMember,
  updatePartnerTeamMember,
  proposePartnerTeamMember,
  linkExistingProfessional,
  requestProSkillChange,
  updateProAvailability,
  removePartnerTeamMember,
  getPartnerServices,
  requestServiceCategory,
  toggleServiceParticipation,
  editGlobalService,
  getPartnerCoverage,
  requestCoverageChange,
  updateCapacityConfig,
  validateServiceability,
  getPartnerEarnings,
  getPartnerEarningsLedger,
  getPartnerSettlements,
  downloadSettlementStatement,
  requestSettlementCorrection,
  markSettlementPaid,
  requestBankChange,
  getPartnerInvoices,
  downloadPartnerInvoice,
  getPartnerReports,
  getPartnerPerformanceMetrics,
  getPartnerRefundsDisputes,
  getDisputeDetail,
  submitDispute,
  addDisputeMessage,
  approveRefund,
  getPartnerReviews,
  replyToReview,
  flagReview,
  deleteReview,
  editReviewRating,
  getPartnerTraining,
  requestTrainingSession,
  certifyTrainingCourse,
  getPartnerInventory,
  getPartnerSupplyOrders,
  createPartnerSupplyOrder,
  receiveSupplyOrderGoods,
  allocatePartnerInventory,
  adjustPartnerInventory,
  returnPartnerInventory,
  getPartnerInventoryMovements,
  orderInventorySupplies,
  getPartnerSupportTickets,
  getPartnerSupportTicketDetail,
  createPartnerSupportTicket,
  addSupportTicketMessage,
  getPartnerNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getPartnerDocuments,
  uploadPartnerDocument,
  exportPartnerReportCsv,
  getPartnerStaff,
  invitePartnerStaff,
  updatePartnerStaffStatus,
  deletePartnerStaff,
  getPartnerActivityLogs,
  blockAuditLogMutation,
  getPartnerSettings,
  updatePartnerSettings,
  resetPartnerDemoData
} from '../controllers/partnerController.js';
import { requirePartnerAuth, partnerLoginLimiter } from '../middleware/partnerAuth.js';

const router = express.Router();

// 1. Authentication & Onboarding
router.post('/login', partnerLoginLimiter, loginPartner);
router.post('/register', registerPartner);
router.post('/password-reset', requestPasswordReset);
router.get('/me', requirePartnerAuth('viewing'), getPartnerMe);
router.get('/onboarding/status', requirePartnerAuth('viewing'), getPartnerOnboardingStatus);
router.post('/onboarding/draft', requirePartnerAuth('viewing'), savePartnerOnboardingDraft);
router.post('/onboarding/submit', requirePartnerAuth('viewing'), submitPartnerOnboarding);
router.post('/onboarding/corrections', requirePartnerAuth('viewing'), submitPartnerOnboardingCorrections);

// 2. Dashboard
router.get('/dashboard-summary', requirePartnerAuth('viewing'), getDashboardSummary);

// 3. Bookings
router.get('/bookings', requirePartnerAuth('viewing'), getPartnerBookings);
router.get('/bookings/:id', requirePartnerAuth('viewing'), getPartnerBookingDetail);
router.post('/bookings/:id/assign', requirePartnerAuth('assigning_jobs'), assignPartnerBooking);
router.post('/bookings/:id/notes', requirePartnerAuth('editing'), addBookingBusinessNote);
router.post('/bookings/:id/reschedule-request', requirePartnerAuth('editing'), requestBookingReschedule);
router.post('/bookings/:id/cancel-request', requirePartnerAuth('editing'), requestBookingCancellation);
router.post('/bookings/:id/completion-override', requirePartnerAuth('managing_team'), overrideBookingCompletion);

// 4. Calendar
router.get('/calendar', requirePartnerAuth('viewing'), getPartnerCalendar);

// 5. Team
router.get('/team', requirePartnerAuth('viewing'), getPartnerTeam);
router.post('/team', requirePartnerAuth('managing_team'), addPartnerTeamMember);
router.post('/team/propose', requirePartnerAuth('managing_team'), proposePartnerTeamMember);
router.post('/team/link-existing', requirePartnerAuth('managing_team'), linkExistingProfessional);
router.put('/team/:proId', requirePartnerAuth('managing_team'), updatePartnerTeamMember);
router.post('/team/:proId/request-skill-change', requirePartnerAuth('managing_team'), requestProSkillChange);
router.put('/team/:proId/availability', requirePartnerAuth('managing_team'), updateProAvailability);
router.post('/team/:proId/remove-association', requirePartnerAuth('managing_team'), removePartnerTeamMember);

// 6. Services & Coverage
router.get('/services', requirePartnerAuth('viewing'), getPartnerServices);
router.post('/services/request-category', requirePartnerAuth('editing'), requestServiceCategory);
router.put('/services/participation', requirePartnerAuth('editing'), toggleServiceParticipation);
router.post('/services/toggle-participation', requirePartnerAuth('editing'), toggleServiceParticipation);
router.put('/services/:id/toggle-participation', requirePartnerAuth('editing'), toggleServiceParticipation);
router.put('/services/:id/global-price', requirePartnerAuth('viewing'), editGlobalService); // Guard 403
router.get('/coverage', requirePartnerAuth('viewing'), getPartnerCoverage);
router.post('/coverage/request-change', requirePartnerAuth('editing'), requestCoverageChange);
router.post('/coverage/request-expansion', requirePartnerAuth('editing'), requestCoverageChange);
router.put('/coverage/capacity', requirePartnerAuth('editing'), updateCapacityConfig);
router.post('/coverage/validate-serviceability', requirePartnerAuth('viewing'), validateServiceability);

// 7. Finances, Earnings & Settlements
router.get('/earnings', requirePartnerAuth('viewing_finances'), getPartnerEarnings);
router.get('/earnings/ledger', requirePartnerAuth('viewing_finances'), getPartnerEarningsLedger);
router.get('/settlements', requirePartnerAuth('viewing_finances'), getPartnerSettlements);
router.get('/settlements/:id/statement', requirePartnerAuth('exporting'), downloadSettlementStatement);
router.post('/settlements/:id/request-correction', requirePartnerAuth('viewing_finances'), requestSettlementCorrection);
router.post('/settlements/:id/mark-paid', requirePartnerAuth('viewing_finances'), markSettlementPaid); // Guard 403
router.post('/settlements/bank-change-request', requirePartnerAuth('requesting_bank_changes'), requestBankChange);

// 8. Invoices & Reports
router.get('/invoices', requirePartnerAuth('viewing_finances'), getPartnerInvoices);
router.get('/invoices/:id/download', requirePartnerAuth('exporting'), downloadPartnerInvoice);
router.get('/reports', requirePartnerAuth('exporting'), getPartnerReports);
router.get('/reports/export-csv', requirePartnerAuth('exporting'), exportPartnerReportCsv);
router.get('/reports/performance', requirePartnerAuth('exporting'), getPartnerPerformanceMetrics);

// 9. Refunds & Disputes
router.get('/refunds-disputes', requirePartnerAuth('viewing'), getPartnerRefundsDisputes);
router.get('/refunds-disputes/:id', requirePartnerAuth('viewing'), getDisputeDetail);
router.post('/refunds-disputes', requirePartnerAuth('viewing_finances'), submitDispute);
router.post('/refunds-disputes/:id/messages', requirePartnerAuth('viewing_finances'), addDisputeMessage);
router.post('/refunds/:bookingId/approve', requirePartnerAuth('viewing_finances'), approveRefund); // Guard 403

// 10. Reviews
router.get('/reviews', requirePartnerAuth('viewing'), getPartnerReviews);
router.post('/reviews/:id/reply', requirePartnerAuth('editing'), replyToReview);
router.post('/reviews/:id/flag', requirePartnerAuth('editing'), flagReview);
router.delete('/reviews/:id', requirePartnerAuth('editing'), deleteReview); // Guard 403
router.put('/reviews/:id/rating', requirePartnerAuth('editing'), editReviewRating); // Guard 403

// 11. Training & Compliance
router.get('/training', requirePartnerAuth('viewing'), getPartnerTraining);
router.post('/training/request-session', requirePartnerAuth('editing'), requestTrainingSession);
router.post('/training/courses/:id/certify', requirePartnerAuth('viewing'), certifyTrainingCourse); // Guard 403

// 12. Inventory & Supply Orders
router.get('/inventory', requirePartnerAuth('viewing'), getPartnerInventory);
router.get('/inventory/orders', requirePartnerAuth('viewing'), getPartnerSupplyOrders);
router.post('/inventory/orders', requirePartnerAuth('editing'), createPartnerSupplyOrder);
router.post('/inventory/orders/:id/goods-received', requirePartnerAuth('editing'), receiveSupplyOrderGoods);
router.post('/inventory/orders/:id/confirm-receipt', requirePartnerAuth('editing'), receiveSupplyOrderGoods);
router.post('/inventory/allocate', requirePartnerAuth('editing'), allocatePartnerInventory);
router.post('/inventory/adjust', requirePartnerAuth('editing'), adjustPartnerInventory);
router.post('/inventory/returns', requirePartnerAuth('editing'), returnPartnerInventory);
router.post('/inventory/return', requirePartnerAuth('editing'), returnPartnerInventory);
router.get('/inventory/movements', requirePartnerAuth('viewing'), getPartnerInventoryMovements);
router.post('/inventory/order', requirePartnerAuth('editing'), orderInventorySupplies);

// 13. Support & Helpdesk
router.get('/support', requirePartnerAuth('viewing'), getPartnerSupportTickets);
router.get('/support/tickets', requirePartnerAuth('viewing'), getPartnerSupportTickets);
router.get('/support/tickets/:id', requirePartnerAuth('viewing'), getPartnerSupportTicketDetail);
router.post('/support/tickets', requirePartnerAuth('viewing'), createPartnerSupportTicket);
router.post('/support/tickets/:id/messages', requirePartnerAuth('viewing'), addSupportTicketMessage);

// 14. Notifications
router.get('/notifications', requirePartnerAuth('viewing'), getPartnerNotifications);
router.put('/notifications/:id/read', requirePartnerAuth('viewing'), markNotificationRead);
router.put('/notifications/mark-all-read', requirePartnerAuth('viewing'), markAllNotificationsRead);

// 15. Documents & Compliance
router.get('/documents', requirePartnerAuth('viewing'), getPartnerDocuments);
router.post('/documents/upload', requirePartnerAuth('editing'), uploadPartnerDocument);

// 16. Staff Management
router.get('/staff', requirePartnerAuth('viewing'), getPartnerStaff);
router.post('/staff', requirePartnerAuth('managing_staff'), invitePartnerStaff);
router.put('/staff/:id/status', requirePartnerAuth('managing_staff'), updatePartnerStaffStatus);
router.delete('/staff/:id', requirePartnerAuth('managing_staff'), deletePartnerStaff);

// 17. Activity Audit Log
router.get('/activity', requirePartnerAuth('viewing'), getPartnerActivityLogs);
router.post('/activity', requirePartnerAuth('viewing'), blockAuditLogMutation); // Guard 403
router.put('/activity', requirePartnerAuth('viewing'), blockAuditLogMutation); // Guard 403
router.delete('/activity', requirePartnerAuth('viewing'), blockAuditLogMutation); // Guard 403

// 18. Settings
router.get('/settings', requirePartnerAuth('viewing'), getPartnerSettings);
router.put('/settings', requirePartnerAuth('editing'), updatePartnerSettings);

// 19. Demo Sandbox Reset
router.post('/demo/reset', resetPartnerDemoData);

export default router;
