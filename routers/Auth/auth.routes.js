import { Router } from "express";
// import {
//   signupLimiter,
//   loginLimiter,
// } from "../../middlewares/rate_limiter.middleware.js";
import {
  SignUpController,
  LoginController,
  LogoutController,
  RefreshTokenController,
  ForgotPasswordController,
  VerifyResetCodeController,
  ResetPasswordController,
} from "../../controllers/Auth/auth.controller.js";
import {
  SignUpSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  VerifyResetCodeSchema,
} from "../../validations/Auth/auth.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";

const router = Router();

router.post("/signup", validate(SignUpSchema), SignUpController);
router.post("/login", validate(LoginSchema), LoginController);
router.get("/logout", LogoutController);
router.post("/refresh-token", RefreshTokenController);
router.post("/forgot-password", validate(ForgotPasswordSchema), ForgotPasswordController);
router.post("/verify-reset-code",validate(VerifyResetCodeSchema),VerifyResetCodeController);
router.post("/reset-password",validate(ResetPasswordSchema), ResetPasswordController);

export { router as AuthRouter };
