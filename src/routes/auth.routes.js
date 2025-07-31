import { Router } from 'express';
import validate from '../middlewares/validation.js';
import { authValidation } from '../validations/index.js';
import { authController } from '../controllers/index.js';
import auth from '../middlewares/auth.js';

const router = Router();

router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', validate(authValidation.logout), authController.logout);
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);
router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);
router.post('/send-verification-email', auth(), authController.sendVerificationEmail);
router.get('/verify-email', validate(authValidation.verifyEmail), authController.verifyEmail);

export default router;
