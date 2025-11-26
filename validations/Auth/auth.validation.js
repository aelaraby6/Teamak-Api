import Joi from "joi";
import { ROLES, DEFAULT_ROLE } from "../../utils/constants.js";

// Signup
export const SignUpSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().required().messages({
    "string.base": "Name must be a string",
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name must be less than or equal to 100 characters",
    "any.required": "Name is required",
  }),

  email: Joi.string().email().trim().lowercase().required().messages({
    "string.email": "Email must be a valid email",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),

  phone: Joi.string()
    .pattern(/^01[0125][0-9]{8}$/)
    .trim()
    .required()
    .messages({
      "string.base": "Phone must be a string",
      "string.pattern.base":
        "Phone must be a valid Egyptian phone number (e.g., 01012345678)",
      "string.empty": "Phone is required",
      "any.required": "Phone is required",
    }),
  password: Joi.string()
    .min(8)
    .max(40)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/
    )
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.max": "Password must be less than or equal to 40 characters",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)",
      "string.empty": "Password is required",
      "any.required": "Password is required",
    }),

  role: Joi.string()
    .valid(...ROLES)
    .default(DEFAULT_ROLE)
    .messages({
      "any.only": "Role must be either 'user' or 'admin'",
      "string.base": "Role must be a string",
    }),
});

// login
export const LoginSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please enter a valid email",
    "any.required": "Email is mandatory",
  }),
  password: Joi.string().min(8).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 8 characters",
    "any.required": "Password is mandatory",
  }),
});

// Forget Password
export const ForgotPasswordSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required().messages({
    "string.email": "Email must be a valid email",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
});

// Verify Reset Code
export const VerifyResetCodeSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required().messages({
    "string.email": "Email must be a valid email",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),

  code: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      "string.length": "Verification code must be 6 digits",
      "string.pattern.base": "Verification code must contain only numbers",
      "string.empty": "Verification code is required",
      "any.required": "Verification code is required",
    }),
});

// Reset Password
export const ResetPasswordSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required().messages({
    "string.email": "Email must be a valid email",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),

  code: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      "string.length": "Verification code must be 6 digits",
      "string.pattern.base": "Verification code must contain only numbers",
      "string.empty": "Verification code is required",
      "any.required": "Verification code is required",
    }),

  password: Joi.string()
    .min(8)
    .max(40)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/
    )
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.max": "Password must be less than or equal to 40 characters",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)",
      "string.empty": "Password is required",
      "any.required": "Password is required",
    }),

  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
    "string.empty": "Confirm password is required",
    "any.required": "Confirm password is required",
  }),
});
