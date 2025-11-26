import {
  BadRequestError,
  NotFoundError,
  UnAuthorizedError,
} from "../../Errors/error.js";
import { generateToken, verifyToken } from "../../services/jwt.service.js";
import User from "../../models/User/user.model.js";
import {
  ComparePassword,
  hashPassword,
} from "../../services/password.service.js";
import { generateResetCode, setCookieToken } from "../../utils/helpers.js";
import Email from "../../utils/email.js";
import crypto from "crypto";

// Signup Controller
export const SignUpController = async (req, res, next) => {
  try {
    const data = req.body;
    const email = data.email.toLowerCase();

    if (!data.name || !data.email || !data.password) {
      throw new BadRequestError("All fields are required");
    }

    const existingUser = await User.findOne({ email });

    if (
      existingUser &&
      existingUser.is_deleted === false &&
      existingUser.is_active === true
    ) {
      throw new BadRequestError("user already exists");
    }

    const hashedPassword = await hashPassword(data.password);

    let newUser;

    if (existingUser && existingUser.is_deleted === true) {
      existingUser.name = data.name;
      existingUser.password = hashedPassword;
      existingUser.phone = data.phone;
      existingUser.role = data.role || "user";
      existingUser.is_deleted = false;
      existingUser.is_active = true;

      await existingUser.save();
      newUser = existingUser;
    } else {
      newUser = new User({
        ...data,
        email,
        password: hashedPassword,
        role: data.role || "user",
      });
      await newUser.save();
    }

    const token = generateToken(
      newUser.name,
      newUser.email,
      newUser.phone,
      newUser._id,
      newUser.role
    );

    const userResponse = {
      ...newUser.toObject(),
      password: undefined,
      __v: undefined,
      is_deleted: undefined,
      is_active: undefined,
    };

    setCookieToken(res, token, req);

    res.status(201).json({
      message:
        existingUser && existingUser.is_deleted
          ? "User reactivated successfully"
          : "User registered successfully",
      data: userResponse,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Login Controller
export const LoginController = async (req, res, next) => {
    console.log("Login body:", req.body);

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError("Email and password are required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || user.is_deleted || !user.is_active) {
      throw new UnAuthorizedError("Invalid credentials");
    }

    const isPasswordValid = await ComparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new UnAuthorizedError("Invalid credentials");
    }

    const token = generateToken(
      user.name,
      user.email,
      user.phone,
      user._id,
      user.role
    );

    const userResponse = {
      ...user.toObject(),
      password: undefined,
      __v: undefined,
      is_deleted: undefined,
      is_active: undefined,
    };

    setCookieToken(res, token, req);

    res.status(200).json({
      message: "Login successful",
      data: userResponse,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Refresh Token Controller
export const RefreshTokenController = async (req, res, next) => {
  try {
    const oldToken = req.cookies.jwt;

    if (!oldToken || oldToken === "loggedout") {
      throw new UnAuthorizedError("No token found. Please login again");
    }

    const decoded = verifyToken(oldToken);

    if (!decoded) {
      throw new UnAuthorizedError("Invalid or expired token");
    }

    const user = await User.findById(decoded.id);

    if (!user || user.is_deleted || !user.is_active) {
      throw new UnAuthorizedError("User no longer exists or is inactive");
    }

    const newToken = generateToken(
      user.name,
      user.email,
      user.phone,
      user._id,
      user.role
    );

    setCookieToken(res, newToken, req);

    res.status(200).json({
      status: "success",
      message: "Token refreshed successfully",
      token: newToken,
    });
  } catch (error) {
    next(error);
  }
};

// Logout Controller
export const LogoutController = async (req, res, next) => {
  try {
    res.cookie("jwt", "loggedout", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      status: "success",
      message: "User has been logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Forget Password
export const ForgotPasswordController = async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({
    email: email,
    is_deleted: false,
    is_active: true,
  });

  if (!user) {
    throw new NotFoundError("No user found with this email");
  }

  const resetCode = generateResetCode();

  const hashedCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  user.resetPasswordCode = hashedCode;
  user.resetPasswordCodeExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  user.resetPasswordCodeVerified = false;

  await user.save({ validateBeforeSave: false });

  const emailMessage = `
    <h2>Password Reset Request</h2>
    <p>Hi ${user.name},</p>
    <p>You requested to reset your password. Please use the following verification code:</p>
    <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px;">${resetCode}</h1>
    <p>This code will expire in 10 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  try {
    const emailSender = new Email(user);
    await emailSender.sendPasswordResetCode(resetCode);

    res.status(200).json({
      status: "success",
      message: "Verification code sent to your email",
    });
  } catch (error) {
    user.resetPasswordCode = undefined;
    user.resetPasswordCodeExpires = undefined;
    user.resetPasswordCodeVerified = undefined;
    await user.save({ validateBeforeSave: false });
    next(error);
  }
};

// Verify Reset Code
export const VerifyResetCodeController = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    const hashedCode = crypto.createHash("sha256").update(code).digest("hex");

    const user = await User.findOne({
      email: email,
      is_deleted: false,
      is_active: true,
    }).select(
      "+resetPasswordCode +resetPasswordCodeExpires +resetPasswordCodeVerified"
    );

    if (!user) {
      throw new NotFoundError("No user found with this email");
    }

    if (!user.resetPasswordCode || !user.resetPasswordCodeExpires) {
      throw new BadRequestError(
        "No reset code found. Please request a new one"
      );
    }

    if (user.resetPasswordCode !== hashedCode) {
      throw new BadRequestError("Invalid verification code");
    }

    if (Date.now() > user.resetPasswordCodeExpires) {
      throw new BadRequestError(
        "Verification code has expired. Please request a new one"
      );
    }

    user.resetPasswordCodeVerified = true;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: "success",
      message: "Code verified successfully. You can now reset your password",
    });
  } catch (error) {
    next(error);
  }
};

// Reset Password
export const ResetPasswordController = async (req, res, next) => {
  try {
    const { email, code, password } = req.body;

    const hashedCode = crypto.createHash("sha256").update(code).digest("hex");

    const user = await User.findOne({
      email: email,
      is_deleted: false,
      is_active: true,
    }).select(
      "+resetPasswordCode +resetPasswordCodeExpires +resetPasswordCodeVerified +password"
    );

    if (!user) {
      throw new NotFoundError("No user found with this email");
    }

    if (!user.resetPasswordCode || !user.resetPasswordCodeExpires) {
      throw new BadRequestError(
        "No reset code found. Please request a new one"
      );
    }

    if (user.resetPasswordCode !== hashedCode) {
      throw new BadRequestError("Invalid verification code");
    }

    if (Date.now() > user.resetPasswordCodeExpires) {
      throw new BadRequestError(
        "Verification code has expired. Please request a new one"
      );
    }

    const hashedPassword = await hashPassword(password);

    user.password = hashedPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordCodeExpires = undefined;
    user.resetPasswordCodeVerified = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: "success",
      message:
        "Password reset successful. You can now login with your new password",
    });
  } catch (error) {
    next(error);
  }
};
