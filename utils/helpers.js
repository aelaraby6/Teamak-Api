export const setCookieToken = (res, token, req) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure:
      process.env.NODE_ENV === "production" &&
      (req.secure || req.headers["x-forwarded-proto"] === "https"),
    sameSite: "strict", // Added CSRF protection
  };

  res.cookie("jwt", token, cookieOptions);
};

export const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
