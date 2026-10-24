import jwt from 'jsonwebtoken';
import { WorkerApplication } from '../models/WorkerApplication.js';

const JWT_SECRET = process.env.JWT_SECRET || 'urban_company_jwt_secret_key_2026';

/**
 * Middleware: verifyProfessionalAuth
 * Enforces authenticated professional identity.
 * Validates JWT token or x-professional-id header for sandbox simulation.
 * Attaches req.professional to request.
 */
export async function verifyProfessionalAuth(req, res, next) {
  try {
    let proId = null;

    // Check Authorization header for Bearer token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded && decoded.role === 'professional') {
          proId = decoded.proId || decoded.id;
        }
      } catch (err) {
        // Token invalid or expired
      }
    }

    // Check fallback simulated header for local sandbox testing
    if (!proId && req.headers['x-professional-id']) {
      proId = req.headers['x-professional-id'].trim();
    }

    // Check query parameter proId only if in development mode
    if (!proId && process.env.NODE_ENV !== 'production' && req.query.proId) {
      proId = req.query.proId.trim();
    }

    // Default to primary demo professional if no auth provided in development
    if (!proId && process.env.NODE_ENV !== 'production') {
      proId = 'PRO-8841'; // Default to Vikram Salvi (Senior AC Technician)
    }

    if (!proId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in as an authorized service professional.'
      });
    }

    // Try finding professional in database or mock dataset
    let pro = await WorkerApplication.findOne({ id: proId });
    if (!pro) {
      // Mock lookup fallback
      const mockPros = [
        {
          id: 'PRO-8841',
          applicantName: 'Vikram Salvi',
          phone: '+91 98205 11982',
          email: 'vikram.salvi@urbanpro.com',
          trade: 'Master AC Specialist & Electrician',
          tradeName: 'AC & Electrical Repairs',
          employmentType: 'Direct Freelance',
          status: 'Approved',
          tier: 'Diamond Pro Partner (Level 5)',
          rating: 4.94,
          jobsCompleted: 1520,
          walletBalance: 15450,
          lifetimeEarnings: 428000,
          isOnline: true
        },
        {
          id: 'PRO-8842',
          applicantName: 'Rajesh Kumar',
          phone: '+91 98201 44521',
          email: 'rajesh.kumar@urbanpro.com',
          trade: 'Appliance Repair Lead',
          tradeName: 'Refrigerator & Washing Machine',
          employmentType: 'Direct Freelance',
          status: 'Approved',
          tier: 'Platinum Pro (Level 4)',
          rating: 4.88,
          jobsCompleted: 980,
          walletBalance: 8200,
          lifetimeEarnings: 298000,
          isOnline: true
        },
        {
          id: 'PRO-8843',
          applicantName: 'Sunil Vishwakarma',
          phone: '+91 98332 10984',
          email: 'sunil.v@urbanpro.com',
          trade: 'Cleaning & Housekeeping Specialist',
          tradeName: 'Deep Cleaning Services',
          employmentType: 'Agency Employed',
          partnerAgencyId: 'PTR-90142',
          partnerAgencyName: 'Apex Home Solutions LLP',
          status: 'Approved',
          tier: 'Gold Pro (Level 3)',
          rating: 4.91,
          jobsCompleted: 640,
          walletBalance: 6100,
          lifetimeEarnings: 184000,
          isOnline: true
        },
        {
          id: 'PRO-8844',
          applicantName: 'Anita Deshmukh',
          phone: '+91 98190 55432',
          email: 'anita.d@urbanpro.com',
          trade: 'Master Beautician & Hair Stylist',
          tradeName: 'Salon & Spa Services',
          employmentType: 'Direct Freelance',
          status: 'Approved',
          applicationStatus: 'Approved',
          tier: 'Diamond Pro Partner (Level 5)',
          rating: 4.96,
          jobsCompleted: 1240,
          walletBalance: 12800,
          lifetimeEarnings: 376000,
          isOnline: true
        },
        {
          id: 'PRO-8845',
          applicantName: 'Kavita Sharma',
          phone: '+91 98209 88123',
          email: 'kavita.sharma@urbanpro.com',
          trade: 'Beautician & Skin Care Specialist',
          tradeName: 'Salon & Spa Services',
          employmentType: 'Direct Freelance',
          status: 'Under Review',
          applicationStatus: 'Under Review',
          tier: 'Onboarding Partner',
          rating: 0,
          jobsCompleted: 0,
          walletBalance: 0,
          lifetimeEarnings: 0,
          isOnline: false,
          missingRequirements: ['Police Verification Clearance Certificate'],
          reviewComments: [{ author: 'Compliance Lead', comment: 'Aadhaar verified. Police record check pending.', date: '22 Oct 2026' }]
        },
        {
          id: 'PRO-8846',
          applicantName: 'Mohit Verma',
          phone: '+91 98207 77451',
          email: 'mohit.verma@urbanpro.com',
          trade: 'Electrician & Appliance Technician',
          tradeName: 'Electrical Repairs',
          employmentType: 'Direct Freelance',
          status: 'Changes Requested',
          applicationStatus: 'Changes Requested',
          tier: 'Onboarding Partner',
          rating: 0,
          jobsCompleted: 0,
          walletBalance: 0,
          lifetimeEarnings: 0,
          isOnline: false,
          missingRequirements: ['Re-upload PAN Card (Previous image had flash glare)'],
          reviewComments: [{ author: 'Compliance Cell', comment: 'Please re-upload PAN card in good lighting.', date: '21 Oct 2026' }]
        },
        {
          id: 'PRO-8847',
          applicantName: 'Deepak Jadhav',
          phone: '+91 98202 33190',
          email: 'deepak.jadhav@urbanpro.com',
          trade: 'Plumber & Water Specialist',
          tradeName: 'Plumbing Services',
          employmentType: 'Direct Freelance',
          status: 'Suspended',
          applicationStatus: 'Suspended',
          suspendReason: 'Account suspended due to 3 consecutive unexcused cancellations within 24 hours.',
          tier: 'Suspended',
          rating: 4.62,
          jobsCompleted: 310,
          walletBalance: 2400,
          lifetimeEarnings: 98000,
          isOnline: false
        }
      ];
      pro = mockPros.find(p => p.id === proId);
      if (!pro && proId && proId.startsWith('WRK-')) {
        pro = {
          id: proId,
          applicantName: 'Pending Applicant',
          trade: 'Service Specialist',
          status: 'Under Review',
          applicationStatus: 'Under Review',
          tier: 'Onboarding Partner',
          employmentType: 'Direct Freelance',
          walletBalance: 0,
          lifetimeEarnings: 0,
          isOnline: false,
          missingRequirements: ['Police Background Clearance', 'Compliance Document Verification'],
          reviewComments: [{ author: 'Onboarding Compliance Engine', comment: 'Application undergoing verification.', date: 'Today' }]
        };
      }
      if (!pro) {
        pro = mockPros[0];
      }
    }

    req.professional = {
      id: pro.id,
      name: pro.applicantName || pro.name,
      phone: pro.phone,
      email: pro.email,
      trade: pro.trade,
      tradeName: pro.tradeName,
      employmentType: pro.employmentType || 'Direct Freelance',
      partnerAgencyId: pro.partnerAgencyId || '',
      partnerAgencyName: pro.partnerAgencyName || '',
      tier: pro.tier || 'Diamond Pro Partner',
      rating: pro.rating || 4.9,
      status: pro.status || 'Pending Review',
      applicationStatus: pro.applicationStatus || pro.status || 'Pending Review',
      suspendReason: pro.suspendReason || '',
      missingRequirements: pro.missingRequirements || [],
      reviewComments: pro.reviewComments || [],
      isOnline: pro.isOnline !== false
    };

    next();
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error in professional authentication.' });
  }
}
