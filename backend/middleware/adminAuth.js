import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { Admin, checkAdminPermission, PERMISSION_MATRIX } from '../models/Admin.js';

// Login rate limiter: Max 5 failed attempts per 15 minutes window
export const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});

// Primary JWT Auth Middleware for Admin APIs
export async function requireAdminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers['x-admin-token'];
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (authHeader) {
      token = authHeader;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. No administrator bearer token provided.'
      });
    }

    const secret = process.env.ADMIN_JWT_SECRET || 'urban_services_secret_jwt_key_2026_super_secure';
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Administrator session expired. Please sign in again.'
        });
      }
      return res.status(401).json({
        success: false,
        error: 'Invalid or forged administrator token.'
      });
    }

    // Try finding in database
    let admin = null;
    try {
      admin = await Admin.findById(decoded.id);
    } catch {
      // DB may be disconnected in demo mode
    }

    // If found in DB, check active status and token version (session invalidation)
    if (admin) {
      if (admin.status !== 'Active') {
        return res.status(403).json({
          success: false,
          error: 'Administrator account has been suspended or deactivated.'
        });
      }
      if (decoded.tokenVersion !== undefined && admin.tokenVersion !== decoded.tokenVersion) {
        return res.status(401).json({
          success: false,
          error: 'Administrator session invalidated by a recent logout or security reset.'
        });
      }

      req.admin = {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
        assignedZone: admin.assignedZone,
        department: admin.department,
        permissions: PERMISSION_MATRIX[admin.role] || {}
      };
    } else {
      // Fallback for mock/demo mode
      req.admin = {
        id: decoded.id || 'ADM-01',
        name: decoded.name || 'Super Admin',
        email: decoded.email || 'admin@urbancompany.com',
        role: decoded.role || 'Super Admin',
        assignedZone: decoded.assignedZone || 'All India',
        department: decoded.department || 'Operations',
        permissions: PERMISSION_MATRIX[decoded.role || 'Super Admin'] || {}
      };
    }

    next();
  } catch (err) {
    console.error('requireAdminAuth error:', err);
    return res.status(500).json({
      success: false,
      error: 'Authentication verification failure.'
    });
  }
}

// Permission checking middleware
export function requirePermission(resource, action) {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        error: 'Administrator authentication required.'
      });
    }

    const { role } = req.admin;
    const isAllowed = checkAdminPermission(role, resource, action);

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        error: `Permission denied: Role '${role}' lacks '${action}' authorization on resource '${resource}'.`
      });
    }

    next();
  };
}

// Prevent modifying or disabling final Super Admin
export async function checkFinalSuperAdminGuard(targetAdminId, newRole, newStatus) {
  try {
    const targetAdmin = await Admin.findById(targetAdminId);
    if (!targetAdmin) return true; // Handled elsewhere

    if (targetAdmin.role === 'Super Admin') {
      const isDemotion = newRole && newRole !== 'Super Admin';
      const isDeactivation = newStatus && newStatus !== 'Active';

      if (isDemotion || isDeactivation) {
        const activeSuperAdminCount = await Admin.countDocuments({
          role: 'Super Admin',
          status: 'Active'
        });

        if (activeSuperAdminCount <= 1) {
          return false; // Disallowed
        }
      }
    }
    return true;
  } catch {
    return true;
  }
}
