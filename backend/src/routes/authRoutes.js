import express from 'express'
import {
  registerAdmin,
  registerCustomer,
  registerSeller,
  verifyEmail,
  approveSeller,
  login,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js'
import { requestLogger } from '../middlewares/loggerMiddleware.js'
import {
  authenticateUser,
  authorizeRoles,
} from '../middlewares/authMiddleware.js'

const router = express.Router()

// ✅ Admin Registration (Only accessible to admins)
router.post('/register/admin', requestLogger, registerAdmin)

// ✅ Customer Registration
router.post('/register/customer', requestLogger, registerCustomer)

// ✅ Seller Registration
router.post('/register/seller', requestLogger, registerSeller)

// ✅ Verify Email
router.get('/verify-email', requestLogger, verifyEmail)

// ✅ Approve Seller (Admin Only)
router.patch(
  '/approve-seller', 
  requestLogger,
  authenticateUser,
  authorizeRoles('ADMIN'),
  approveSeller
);


// ✅ Login
router.post('/login', requestLogger, login)

// ✅ Forgot Password
router.post('/forgot-password', requestLogger, forgotPassword)

// ✅ Reset Password
router.post('/reset-password', requestLogger, resetPassword)

export default router
