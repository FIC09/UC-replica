import express from 'express';
import { verifyProfessionalAuth } from '../middleware/professionalAuth.js';
import {
  professionalLogin,
  sendProfessionalOtp,
  verifyProfessionalOtp,
  registerApplication,
  getOnboardingStatus,
  resubmitOnboardingCorrections,
  getProfessionalProfile,
  updateProfessionalProfile,
  getAvailability,
  updateAvailability,
  getTodayDashboard,
  getJobOffers,
  acceptJobOffer,
  declineJobOffer,
  getAssignedJobs,
  getJobDetail,
  updateJobStatus,
  verifyJobOtp,
  requestReassignment,
  updateJobChecklist,
  getJobChecklists,
  updateJobChecklistSection,
  uploadJobPhotoEvidence,
  getExtraWorkCatalogue,
  getExtraWorkRequests,
  proposeExtraWork,
  handleCustomerExtraWorkApproval,
  getJobMessages,
  sendJobMessage,
  getCancellationPolicy,
  reportJobIncident,
  addProfessionalNote,
  getEarnings,
  getPayouts,
  submitBankChangeRequest,
  getBankChangeHistory,
  getFinancialDisputes,
  submitFinancialDispute,
  requestWithdrawal,
  getReviews,
  flagReview,
  getPerformance,
  submitPerformanceAppeal,
  getTrainings,
  getTrainingAssessment,
  submitTrainingAssessment,
  completeTraining,
  bookTrainingSession,
  getInventory,
  requestRestock,
  reportDamagedItemOrReturn,
  getShopItems,
  placeShopOrder,
  getSupportTickets,
  createSupportTicket,
  addTicketMessage,
  escalateSafetyIncident,
  getNotifications,
  markNotificationRead,
  deleteNotification,
  getDocuments,
  uploadDocument,
  getProfileChangeHistory,
  getSettings,
  updateSettings,
  revokeOtherSessions,
  updateSecurityPin,
  requestAccountClosure,
  getAuditHistory,
  rejectAuditMutation,
  resetDemoData
} from '../controllers/professionalController.js';

const router = express.Router();

// Public auth & onboarding routes
router.post('/login', professionalLogin);
router.post('/auth/send-otp', sendProfessionalOtp);
router.post('/auth/verify-otp', verifyProfessionalOtp);
router.post('/register', registerApplication);
router.post('/demo/reset', resetDemoData);

// Protected routes (require professional token or x-professional-id)
router.use(verifyProfessionalAuth);

// Today Dashboard (Aggregated real-time metrics for signed-in professional)
router.get('/today', getTodayDashboard);

// Job Offers (Offer-and-Accept allocation mode)
router.get('/offers', getJobOffers);
router.post('/offers/:id/accept', acceptJobOffer);
router.post('/offers/:id/decline', declineJobOffer);

// Onboarding Status & Corrections
router.get('/onboarding-status', getOnboardingStatus);
router.post('/onboarding/resubmit', resubmitOnboardingCorrections);

// Profile
router.get('/profile', getProfessionalProfile);
router.put('/profile', updateProfessionalProfile);
router.get('/profile/change-history', getProfileChangeHistory);

// Availability & Schedule
router.get('/availability', getAvailability);
router.put('/availability', updateAvailability);

// Jobs & Dispatch (Strictly guarded by ownership and approval status)
router.get('/jobs', getAssignedJobs);
router.get('/jobs/:id', getJobDetail);
router.put('/jobs/:id/status', updateJobStatus);
router.post('/jobs/:id/verify-otp', verifyJobOtp);
router.post('/jobs/:id/reassign', requestReassignment);
router.post('/jobs/:id/checklist', updateJobChecklist);
router.put('/jobs/:id/checklist', updateJobChecklist);
router.get('/jobs/:id/checklists', getJobChecklists);
router.put('/jobs/:id/checklists', updateJobChecklistSection);
router.post('/jobs/:id/photos', uploadJobPhotoEvidence);
router.get('/jobs/:id/extra-work/catalog', getExtraWorkCatalogue);
router.get('/jobs/:id/extra-work', getExtraWorkRequests);
router.post('/jobs/:id/extra-work', proposeExtraWork);
router.post('/jobs/:id/extra-work/:workId/approval', handleCustomerExtraWorkApproval);
router.get('/jobs/:id/messages', getJobMessages);
router.post('/jobs/:id/messages', sendJobMessage);
router.get('/cancellation-policy', getCancellationPolicy);
router.post('/jobs/:id/incident-report', reportJobIncident);
router.post('/jobs/:id/notes', addProfessionalNote);

// Earnings & Payouts
router.get('/earnings', getEarnings);
router.get('/payouts', getPayouts);
router.post('/payouts/withdraw', requestWithdrawal);
router.post('/payouts/bank-change-request', submitBankChangeRequest);
router.get('/payouts/bank-change-history', getBankChangeHistory);
router.get('/payouts/disputes', getFinancialDisputes);
router.post('/payouts/disputes', submitFinancialDispute);

// Performance & Reviews
router.get('/reviews', getReviews);
router.post('/reviews/:id/flag', flagReview);
router.get('/performance', getPerformance);
router.post('/performance/appeal', submitPerformanceAppeal);

// Training & Academy
router.get('/trainings', getTrainings);
router.get('/trainings/:id/assessment', getTrainingAssessment);
router.post('/trainings/:id/assessment', submitTrainingAssessment);
router.post('/trainings/:id/complete', completeTraining);
router.post('/trainings/book-session', bookTrainingSession);

// Inventory & Consumables
router.get('/inventory', getInventory);
router.post('/inventory/restock', requestRestock);
router.post('/inventory/return-report', reportDamagedItemOrReturn);

// Professional Equipment & Uniform Shop
router.get('/shop', getShopItems);
router.post('/shop/order', placeShopOrder);

// Support & Safety
router.get('/support', getSupportTickets);
router.post('/support', createSupportTicket);
router.post('/support/safety-escalation', escalateSafetyIncident);
router.post('/support/:id/messages', addTicketMessage);

// Notifications & Dispatch Broadcasts
router.get('/notifications', getNotifications);
router.post('/notifications', markNotificationRead);
router.post('/notifications/read-all', markNotificationRead);
router.delete('/notifications/:id', deleteNotification);

// Documents & Compliance
router.get('/documents', getDocuments);
router.post('/documents', uploadDocument);
router.post('/documents/upload', uploadDocument);

// Application Settings, Sessions & Account Closure
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.get('/settings/notifications', getSettings);
router.put('/settings/notifications', updateSettings);
router.post('/settings/sessions/revoke-others', revokeOtherSessions);
router.post('/settings/security-pin', updateSecurityPin);
router.post('/settings/account-closure-request', requestAccountClosure);

// Immutable Audit History Trail (Strictly Append-Only)
router.get('/audit-history', getAuditHistory);
router.post('/audit-history', rejectAuditMutation);
router.put('/audit-history', rejectAuditMutation);
router.delete('/audit-history', rejectAuditMutation);

export default router;
