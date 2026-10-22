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
  addProfessionalNote,
  getEarnings,
  getPayouts,
  requestWithdrawal,
  getReviews,
  getPerformance,
  getTrainings,
  completeTraining,
  getInventory,
  requestRestock,
  getShopItems,
  getSupportTickets,
  createSupportTicket,
  getNotifications,
  markNotificationRead,
  getDocuments,
  uploadDocument
} from '../controllers/professionalController.js';

const router = express.Router();

// Public auth & onboarding routes
router.post('/login', professionalLogin);
router.post('/auth/send-otp', sendProfessionalOtp);
router.post('/auth/verify-otp', verifyProfessionalOtp);
router.post('/register', registerApplication);

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
router.post('/jobs/:id/notes', addProfessionalNote);

// Earnings & Payouts
router.get('/earnings', getEarnings);
router.get('/payouts', getPayouts);
router.post('/payouts/withdraw', requestWithdrawal);

// Performance & Reviews
router.get('/reviews', getReviews);
router.get('/performance', getPerformance);

// Training & Academy
router.get('/trainings', getTrainings);
router.post('/trainings/:id/complete', completeTraining);

// Inventory & Consumables
router.get('/inventory', getInventory);
router.post('/inventory/restock', requestRestock);

// Professional Equipment & Uniform Shop
router.get('/shop', getShopItems);

// Support & SOS
router.get('/support', getSupportTickets);
router.post('/support', createSupportTicket);

// Notifications & Dispatch Broadcasts
router.get('/notifications', getNotifications);
router.post('/notifications/read-all', markNotificationRead);

// Documents & Compliance
router.get('/documents', getDocuments);
router.post('/documents/upload', uploadDocument);

export default router;
